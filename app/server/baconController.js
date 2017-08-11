const db = require('./db');


function getNamesTitles(path) {

	return new Promise((resolve, reject) => {
		let nconsts = [];
		let tconsts = [];

		path.forEach(node => {
			nconsts.push(node.nconst);
			tconsts.push(node.tconst);
		});

		Promise.all([
			db.getActorNames(nconsts),
			db.getMovieNames(tconsts)
		])
		.then(([names, titles]) => {
			let nameMap = new Map();
			let titleMap = new Map();

			names.forEach(actor => {
				
				nameMap.set(actor.nconst, {
					name: actor.name,
					dob: actor.dob,
					dod: actor.dod,
					jobs: actor.jobs
				});
			
			});

			titles.forEach(title => {
				
				titleMap.set(title.tconst, {
					title: title.title,
					year: title.year
				});
			
			});

			resolve(path.map(node => 
				[ nameMap.get(node.nconst), titleMap.get(node.tconst) ]
			));
		})
		.catch(error => {
			console.log('error getting actor names or movie names from db');
			reject(error);
		});
	});
}


function getBaconPath(nconst, number, path) {
	let collection = [ 'first', 'second', 'third', 'fourth', 'fifth', 'sixth' ];

	return new Promise((resolve, reject) => {
		
		if (number > 6) {
			reject('invalid bacon number');

		} else if (number == 0) {			
			getNamesTitles(path)
			.then(path => {
				resolve(path)		
			})
			.catch(error => {
				console.log('error generating tree in getNamesTitles');
				reject(error);
			});

		} else {
			db.getActorParent(nconst, collection[number - 1])
			.then(result => {
				
				if (!result) {
					reject('no such nconst exists');
					return;
				}

				path.push({ 
					nconst: nconst, 
					tconst: result.tconst
				});

				getBaconPath(result.parent, number - 1, path).then(path => resolve(path));
			
			})
			.catch(error => {	
				console.log('error getting actor parent');
				console.log(error);
				reject(error);
			});
		}
	});
}

// db.getActorReferences('Fernandaddddd Negri Pouget').then(res => {
	// console.log(res)
	// getBaconPath(res[0].nconst, res[0].number, []).then(res => console.log(res));
// });


getBaconPath(11111111111, 7, []).then(res => console.log(res)).catch(err => console.log(err));


module.exports = getBaconPath;




