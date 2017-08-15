const fs = require('fs');
const path = require('path');


exports.traverseTSV = function(input, output) {

	return new Promise((resolve, reject) => {
		console.log('beggining of search for ', input.file);

		let inStream, outStream;
		inStream = fs.createReadStream(path.join(__dirname, 'data/' + input.file), 'utf8');
		
		if (output) {
			outStream = fs.createWriteStream(path.join(__dirname, 'data/' + output.file), 'utf8');
		}

		inStream.on('readable', () => {
			let row = '', char = '';

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
			console.log('end of search for ', input.file);
			resolve(input.matches);
		});
	});
}


//Set(name) => Map(name, nconst)
//first found match of name wins
exports.getActorsNconsts = function(names) {

	let input = {
		file: 'names.tsv',
		names: names,
		matches: new Map(),
		cb: function(row) {
			let actor = row.match(/^(nm\d{7})\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t\n]+)\n$/);
		
			if (actor && this.names.has(actor[2])) {
				this.matches.set(actor[1], actor[2]);
			} 
		}
	};
	
	return exports.traverseTSV(input);
}


//Set(nconst) => Map(nconst, name)
exports.getActorNames = function(nconsts) {
	console.log('getting actor names');

	let input = {
		file: 'names.tsv',
		nconsts: nconsts,
		matches: new Map(),
		cb: function(row) {
			let actor = row.match(/^(nm\d{7})\t([^\t]+)\t([^\t]+)\t([^\t]+)\t([^\t\n]+)\n$/);

			if (actor && this.nconsts.has(actor[1])) {
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
	};
	
	return exports.traverseTSV(input);
}


//parents Set(nconst), alreadyIndexed Set(nconst), movies Set(tconst) => Map(nconst, { parent: nconst, tconst: tconst })	key is child of someone in parents
//children guaranteed not to be already be in the bacon tree
exports.getCostars = function(parents, alreadyIndexed) {
	console.log('getting costars');

	let input = {
		file: 'movie.principals.tsv',
		parents: parents,
		alreadyIndexed: alreadyIndexed,
		matches: {
			actorMap: new Map(),
			actorSet: new Set(),
			movieSet: new Set()
		},
		cb: function(row) {
			let movie = row.match(/^(tt\d{7})\t([^\t\n]+)\n$/);

			if (movie) { 
				let actors = movie[2].split(','), parentActors = [], childActors = [];
				
				actors.forEach(actor => {	
					if (this.parents.has(actor)) {
						parentActors.push(actor);
					
					} else if (!this.alreadyIndexed.has(actor)) {
						childActors.push(actor);
					}
				});

				if (parentActors.length && childActors.length) {

					childActors.forEach(child => {
						this.alreadyIndexed.add(child);

						this.matches.actorMap.set(child, [ parentActors[0], movie[1] ]);
						this.matches.actorSet.add(child);
						this.matches.movieSet.add(movie[1]);
					});
				}
			} 
		}
	};
	
	return exports.traverseTSV(input);
}


//Set(tconst) => Map(tconst, title)
exports.getMoviesByTconsts = function(tconsts) {
// function getMoviesByTconsts(tconsts) {
	console.log('getting movie titles');

	let input = {
		file: 'movie.basics.tsv',
		tconsts: tconsts,
		matches: new Map(),
		cb: function(row) {
			let movie = row.match(/^(tt\d{7})\t([^\t]+)\t([^\t\n]+)\n$/);

			if (movie && this.tconsts.has(movie[1])) { 
				let year = movie[3] == '\\N' ? '0' : movie[3];
				
				this.matches.set(movie[1], {
					title: movie[2],
					year: Number(year)
				});
			} 
		}
	};

	return exports.traverseTSV(input);
}

function readRows(consts, file) {

	let input = {
		file: file,
		matches: 0,
		cb: function(row) {
			this.matches++;
			// let parsed = row.match(/^([nmt]{2}\d{7})\t([^\t\n]+)/);

			// if (parsed && parsed[2].includes(this.consts)) {
			// 	console.log(row); 
			// 	this.matches.add(row);
			// } 
		}
	};

	return exports.traverseTSV(input);
}

// readRows('nm0000102', 'names.tsv')
// .then(res => {
// // 	let n = 0;
// // 	for (let foo of res) n++;
// 	console.log(res);
// });
// exports.getActorsNconsts(new Set(['Tom Holland'])).then(res => console.log(res));




