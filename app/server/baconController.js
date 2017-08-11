const db = require('./db');


function getNamesTitles(path) {

	return new Promise((resolve, reject) => {
		let nconsts = [];
		let tconsts = [];

		path.forEach(node => {
			nconsts.push(node.nconst);
			tconsts.push(node.tconst);
		});

		Promise.all([ db.getActorNames(nconsts), db.getMovieNames(tconsts) ])
		.then(([names, titles]) => {
			let nameMap = new Map();
			let titleMap = new Map();

			names.forEach(actor => {
				nameMap.set(actor.nconst, [ actor.name, actor.dob ]);
			});

			titles.forEach(title => {
				titleMap.set(title.tconst, [ title.title, title.year ]);
			});

			// console.log(titles);


			resolve(path.map(node => {
				// console.log(node.nconst, node.tconst);
				return [ nameMap.get(node.nconst), titleMap.get(node.tconst) ]
			}));



			// resolve(path.map(node => [ nameMap.get(node.nconst), titleMap.get(node.tconst) ]));
		})
		.catch(error => {
			console.log('error generating tree in getNamesTitles');
			reject(error);
		});
	});
}


function traverseTree(nconst, number, path) {
	let collection = [ 'first', 'second', 'third', 'fourth', 'fifth', 'sixth' ];

	return new Promise((resolve, reject) => {
		
		if (number == 0) {
			getNamesTitles(path)
			.then(path => resolve(path))
			.catch(error => {
				console.log('error generating tree in traverseTree');
				reject(error);
			});

		} else {
			db.getActorParent(nconst, collection[number - 1])
			.then(result => {
				path.push({ 
					nconst: nconst, 
					tconst: result.tconst
				});
				
				traverseTree(result.parent, number - 1, path)
				.then(path => resolve(path));
			})
			.catch(error => {
				console.log('error generating tree in traverseTree');
				reject(error);
			});
		}
	});
}



function getBaconPath(name) {

	return new Promise((resolve, reject) => {		
		db.getActorReference(name)
		.then(result => {
			
			if (result) {
				traverseTree(result.nconst, result.number, [])
				.then(path => resolve(path));
			
			} else {
				console.log('couldn\'t find ', name);
				reject(null);
			}
		})
		.catch(err => {
			console.log('error generating tree in getBaconPath');
			
			reject(null);
		});
	});
}

getBaconPath('Paul asdfRudd').then(res => console.log(res));

// db.getActorReference('asdf').then(res => console.log(res));

module.exports = getBaconPath;




