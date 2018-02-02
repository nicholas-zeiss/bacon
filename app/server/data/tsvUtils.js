/**
 *
 *	This module provides us utilities for reading and writing tsv files. IMDb's dataset comes in such files and we use these utilities
 *	to format that dataset into a more useable form as well as use said form to generate our Bacon tree.
 *
**/


const fs = require('fs');
const path = require('path');


const parseConst = str => Number(str.slice(2));


/**
 *
 *	This function lets us read a tsv file as well as optionally write an output file. It takes an input and optional output object.
 *	It reads a tsv file line by line and supplies that line to input's callback. If output exists that row is also
 *	supplied to output's callback, as well as a reference to the WriteStream of the output file.
 *
 *	inputs:
 *		input - { file: str fileToTraverse, matches: no restriction, cb: function(str row) }
 *		output - { file: str fileToWriteTo, cb: function(str row, Object WriteStream) }
 *
 *	return: a Promise resolving to input.matches
 *
**/
exports.traverseTSV = function(input, output) {
	return new Promise(resolve => {
		let outStream;
		const inStream = fs.createReadStream(path.join(__dirname, 'data/' + input.file), 'utf8');
		
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
					output ? output.cb(row, outStream) : null;
					row = '';
				}
			}
		});

		inStream.on('end', () => {
			output ? outStream.end() : null;
			resolve(input.matches);
		});
	});
};



// given a set of nconsts to search for, return a map of nconst to actor info
exports.getActorInfoByNconst = function(nconsts) {
	return exports.traverseTSV({
		file: 'names.tsv',
		matches: new Map(),
		cb(row) {

			// parentheses correspond to nconst, name, 'birth year - death year', professions
			const actor = row.match(/^(nm\d+)\t([^\t]+)\t([^\t]+)\t([^\t\n]+)\n$/);
			const nconst = actor ? parseConst(actor[1]) : null;

			if (actor && nconsts.has(nconst)) {		
				this.matches.set(
					nconst,
					{
						_id: nconst,
						birthDeath: actor[3] != 'null' ? actor[3] : '',
						imgUrl: '',
						imgInfo: '',
						jobs: actor[4],
						name: actor[2]
					}
				);
			}
		}
	});
};



// given a set of tconsts to search for, return a set of documents for the movies collection
exports.getMovieInfoByTconst = function(tconsts) {
	return exports.traverseTSV({
		file: 'movie.basics.tsv',
		matches: new Map(),
		cb(row) {

			// parentheses correspond to tconst, title, year released
			const movie = row.match(/^(tt\d+)\t([^\t]+)\t([^\t\n]+)\n$/);
			const tconst = movie ? parseConst(movie[1]) : null;

			if (movie && tconsts.has(tconst)) {			
				this.matches.set(
					tconst,
					{
						_id: tconst,
						title: movie[2],
						year: movie[3] == '\\N' ? 0 : Number(movie[3])
					}
				);
			} 
		}
	});
};



/**
 *
 *	This function is used to build our Bacon tree. It gets the all child actors of the parent actors in the parents map, so long as that
 *	child actor is not already in the indexedActors set (which holds nconsts of all actors already in the tree). If the movie linking them is not in
 *	the indexedMovies set, it is also returned in matches.
 *
 *	The parents map maps an actor by their nconst to their "bacon path", the array that will eventually become their "parents" attribute
 *	in their document in the actors collection. See dbController.js for more info.
 *
 *	return: a Promise resolving to the object matches, where
 *		matches.childActors - a map of nconsts to bacon paths
 *		matches.movies - a set of tconsts of movies that need to be added to the movies collection
 *
**/
exports.getChildActors = function(parents, indexedActors, indexedMovies) {
	return exports.traverseTSV({
		file: 'movie.principals.tsv',
		matches: {
			childActors: new Map(),
			movies: new Set()
		},
		cb(row) {

			// parentheses correspond to tconst, comma joined list of nconsts
			const movie = row.match(/^(tt\d+)\t([^\t\n]+)\n$/);
			const tconst = movie ? parseConst(movie[1]) : null;

			if (movie && !indexedMovies.has(tconst)) {	
				let parent = null;
				const children = [];
				
				movie[2]
					.split(',')
					.forEach(nconst => {
						nconst = parseConst(nconst);

						// we only need to record one parent per movie
						if (parent === null && parents.has(nconst)) {
							parent = nconst;
						} else if (!indexedActors.has(nconst) && !this.matches.childActors.has(nconst)) {
							children.push(nconst);
						}
					});

				if (parent !== null && children.length) {
					this.matches.movies.add(tconst);

					const path = parents.get(parent);

					children.forEach(nconst => {
						this.matches.childActors.set(
							nconst,
							[[parent, tconst], ...path]
						);
					});
				}
			}
		}
	});
};

