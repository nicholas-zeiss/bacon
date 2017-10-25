/**
 *
 *	This module provides us utilities for reading and writing tsv files. IMDb's dataset comes in such files and we use these utilities
 *	to format that dataset into a more useable form as well as use said form to generate our Bacon tree.
 *
**/


const fs = require('fs');
const path = require('path');


/**
 *
 *	This function lets us read a tsv file as well as optionally write an output file. It takes an input and optional output object.
 *	It reads a tsv file line by line and supplies that line to input's callback. If output exists that row is also
 *	supplied to output's callback, as well as a reference to the WriteStream of the output file.
 *
 *	inputs:
 *	input: { file: str fileToTraverse, matches: no restriction, cb: function(str row) }
 *	output: { file: str fileToWriteTo, cb: function(str row, Object WriteStream) }
 *
 *	return: a Promise resolving to input.matches
 *
**/
exports.traverseTSV = function(input, output) {
	return new Promise((resolve, reject) => {

		let inStream = fs.createReadStream(path.join(__dirname, 'data/' + input.file), 'utf8');
		let outStream = null;
		
		if (output) {
			outStream = fs.createWriteStream(path.join(__dirname, 'data/' + output.file), 'utf8');
		}


		inStream.on('readable', () => {
			let row = '';
			let char = '';

			while (null != (char = inStream.read(1))) {
				row += char;
				
				if (char == '\n') {
					input.cb(row);
					
					if (output) {
						output.cb(row, outStream);
					}

					row = '';
				}
			}
		});


		inStream.on('end', () => {
			if (output) {
				outStream.end();
			}

			resolve(input.matches);
		});
	});
};


// regex for the rows in names.tsv, parentheses correspond to nconst, name, birth year, death year, professions
const NAME_ROW = /^(nm\d{7})\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t\n]+)\n$/;


// given a set of names to search for (exact match), return a map of str nconst => str name
exports.getActorsNconsts = function(names) {
	return exports.traverseTSV({
		file: 'names.tsv',
		matches: new Map(),
		cb: function(row) {
			let actor = row.match(NAME_ROW);
			
			if (actor && names.has(actor[2])) {
				this.matches.set(actor[1], actor[2]);
			}
		}
	});
};


// given a set of nconsts to search for, return a map of str nconst => { name: str, dob: number, dod: number, jobs: str}
exports.getActorNames = function(nconsts) {
	return exports.traverseTSV({
		file: 'names.tsv',
		matches: new Map(),
		cb(row) {
			let actor = row.match(NAME_ROW);

			if (actor && nconsts.has(actor[1])) {
				// if dob or dod is undefined by dataset, record it as 0
				let dob = actor[3] == '\\N' ? 0 : actor[3];
				let dod = actor[4] == '\\N' ? 0 : actor[4];

				this.matches.set(actor[1], { 
					name: actor[2],
					dob: Number(dob),
					dod: Number(dod),
					jobs: actor[5]
				});
			}
		}
	});
};


/**
 *
 *	This function is used by baconTree.js to get the costars of the parents set of nconsts, so long as they are not in alreadyIndexed.
 *	It searches movie.principals.tsv where each row has a tconst and corresponding CSV list of the nconsts for principal actors.
 *
 *	inputs:
 *	parents: Set( str nconst)
 *	alreadyIndexed: Set( str nconst )
 *
 *	return: a Promise resolving to matches, where
 *	matches: { actorMap: Map(str costarNconst => [ str parentNconst, str tconst]), actorSet: Set(str costarNconst), movieSet: Set(str tconst)}
 *
**/
exports.getCostars = function(parents, alreadyIndexed) {
	return exports.traverseTSV({
		file: 'movie.principals.tsv',
		matches: {
			actorMap: new Map(),
			actorSet: new Set(),
			movieSet: new Set()
		},
		cb(row) {
			let movie = row.match(/^(tt\d{7})\t([^\t\n]+)\n$/);

			if (movie) { 
				let parentActors = [];
				let childActors = [];
				let actors = movie[2].split(',');
				
				actors.forEach(actor => {	
					if (parents.has(actor)) {
						parentActors.push(actor);
					
					} else if (!alreadyIndexed.has(actor)) {
						childActors.push(actor);
					}
				});

				if (parentActors.length && childActors.length) {
					childActors.forEach(child => {
						alreadyIndexed.add(child);

						this.matches.actorSet.add(child);
						this.matches.movieSet.add(movie[1]);
						this.matches.actorMap.set(child, [ parentActors[0], movie[1] ]);
					});
				}
			}
		}
	});
};


// given a set of tconsts to search for, return a map of str tconst => { title: str, year: number }
exports.getMoviesByTconsts = function(tconsts) {
	return exports.traverseTSV({
		file: 'movie.basics.tsv',
		matches: new Map(),
		cb(row) {
			let movie = row.match(/^(tt\d{7})\t([^\t]+)\t([^\t\n]+)\n$/);

			if (movie && tconsts.has(movie[1])) {
				// set year to 0 if dataset lacks that info
				let year = movie[3] == '\\N' ? '0' : movie[3];
				
				this.matches.set(movie[1], {
					title: movie[2],
					year: Number(year)
				});
			} 
		}
	});
};

