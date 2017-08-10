const fs = require('fs');
const path = require('path');


exports.traverseTSV = function(input, output) {

	return new Promise((resolve, reject) => {		
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
			let actor = row.match(/^([^\t]+)\t([^\t\n]+)/);
		
			if (actor && this.names.has(actor[2]) && !this.matches.has(actor[2])) {
				this.matches.set(actor[2], actor[1]);
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
			let actor = row.match(/^([^\t]+)\t([^\t\n]+)/);

			if (actor && this.nconsts.has(actor[1])) {
				this.matches.set(actor[1], actor[2]);
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
			let movie = row.match(/^([^\t]+)\t([^\t\n]+)/);

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
			let movie = row.match(/^([^\t]+)\t([^\t\n]+)/);

			if (movie && this.tconsts.has(movie[1])) { 
				this.matches.set(movie[1], movie[2]);
			} 
		}
	};

	return exports.traverseTSV(input);
}







