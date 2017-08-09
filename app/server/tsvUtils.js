const fs = require('fs');
const path = require('path');


function searchTSV(file, processor) {

	return new Promise((resolve, reject) => {
		let matches = new Map();
		let stream = fs.createReadStream(path.join(__dirname, 'data/' + file), 'utf8');
		
		stream.on('readable', () => {
			let row = '';
			let char = '';

			while (null != (char = stream.read(1))) {
				row += char;
				
				if (char == '\n') {
					processor(row, matches);
					row = '';
				}
			}
		});

		stream.on('end', () => {
			console.log('end of search');
			resolve(matches);
			return;
		})
	});
};


//Set(name) => Map(name, nconsts)
//first found match of name wins
exports.getActorsNconsts = function(names) {
	
	return searchTSV('name.basics.tsv', (row, matches) => {
		let actor = row.match(/^([^\t]+)\t([^\t]+)/);
		
		if (actor && names.has(actor[2]) && !matches.has(actor[2])) {
			matches.set(actor[2], actor[1]);
		} 
	});
}


//Set(nconst) => Map(nconst, name)
exports.getActorsNames = function(nconsts) {
	console.log('getting actor names');
	return searchTSV('name.basics.tsv', (row, matches) => {
		let actor = row.match(/^([^\t]+)\t([^/t]+)/);

		if (actor && nconsts.has(actor[1])) {
			console.log('found a name');
			matches.set(actor[1], actor[2])
		} 
	});
}


//parents Set(nconst), alreadyIndexed Set(nconst) => Map(nconst, { parent: nconst, tconst: tconst })	key is child of someone in parents
//children guaranteed not to be already be in the bacon tree
exports.getCostars = function(parents, alreadyIndexed, movies) {
	console.log('getting costars');
	return searchTSV('title.principals.tsv', (row, matches) => {
		let movie = row.match(/^([^\t]+)\t([^\t]+)/);

		if (movie) { 
			let actors = movie[2].split(','), parentActors = [], childActors = [];
			
			actors.forEach(actor => {	
				if (parents.has(actor)) {
					parentActors.push(actor);
				
				} else if (!alreadyIndexed.has(actor)) {
					childActors.push(actor);
				}
			});

			if (parentActors.length && childActors.length) {
				console.log('found some costars');
				childActors.forEach(child => {
					alreadyIndexed.add(child);
					movies.add(movie[1]);
					matches.set(child, [ parentActors[0], movie[1] ]);
				});
			}
		} 
	});
}


//Set(tconst) => Map(tconst, title)
exports.getMoviesByTconsts = function(tconsts) {
	console.log('getting movie titles');
	return searchTSV('title.basics.tsv', (row, matches) => {
		let movie = row.match(/^([^\t]+)\t([^\t]+)\t([^\t]+)/);

		if (movie && movie[2] == 'movie' && tconsts.has(movie[1])) { 
			console.log('found a title');
			matches.set(movie[1], movie[3]);
		} 
	});
}




// getActorsNconsts(new Set(['Kevin Bacon'])).then(res => res.forEach((name,nconst) => console.log(nconst, '------', name)));
