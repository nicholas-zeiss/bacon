/**
 * This module handles the logic of finding the path of an actor to Kevin Bacon by reading the database.
 * It does not handle cases where it is supplied an actor outside of the database, this is verified elsewhere.
 */


const db = require('./db');


/**
 * This function takes the generated path to Kevin Bacon and decorates it with all the pertinent data in our db.
 *
 * inputs:
 * path: [ { nconst: nconst1, tconst: tconst1 }, ... ]		(nconst and tconst are numbers)
 *
 * return: [ [ actorInfo1, movieInfo1 ], ... ]
 */
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
					nconst: actor.nconst,
					name: actor.name,
					number: actor.number,
					dob: actor.dob,
					dod: actor.dod,
					jobs: actor.jobs,
					imgUrl: actor.imgUrl,
					imgOrientation: actor.imgOrientation
				});
			});

			titles.forEach(title => {
				titleMap.set(title.tconst, {
					tconst: title.tconst,
					title: title.title,
					year: title.year
				});
			});

			path = path.map(node => [ nameMap.get(node.nconst), titleMap.get(node.tconst) ]);

			path.push([{
				nconst: 102,
				name: "Kevin Bacon",
				number: 0,
				dob: 1958,
				dod: 0,
				jobs: 'actor,producer,soundtrack',
				imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Kevinbacongfdl.PNG/428px-Kevinbacongfdl.PNG",
				imgOrientation: 1
			}, null ]);

			resolve(path);
		})
		.catch(error => {
			console.log('error getting actor names or movie names from db:\n', error);
			reject(error);
		});
	});
}


/**
 * This function generates the path to Kevin Bacon, decorates it with pertinent data, and returns it.
 * Given the nconst input it looks it up in the table defined by number, adds itself to the path we 
 * eventually decorate and return, and then recurses on the parent nconst of that nconst. Kevin Bacon
 * himself is not included in this path.
 *
 * inputs:
 * nconst: number
 * tconst: number
 * path: [ { nconst: number nconst1, tconst: number tconst1 }, ... ]
 *
 * return: [  [ actorInfo1, movieInfo1 ], ... ]
 */
module.exports = function getBaconPath(nconst, number, path) {
	let collection = [ 'first', 'second', 'third', 'fourth', 'fifth', 'sixth' ];

	return new Promise((resolve, reject) => {	
		//base case
		if (number > 6 || number < 0) {
			
			reject('invalid bacon number');
		
		//base case
		} else if (number == 0) {
			getNamesTitles(path)
			.then(path => resolve(path))
			.catch(error => {
				console.log('error decorating path in getNamesTitles:\n', error);
				reject(error);
			});

		} else {
			db.getActorParent(nconst, collection[number - 1])
			.then(result => {		
				if (!result) {
					reject('nconst ', nconst, ' does not exist in the db');
				
				} else {
					path.push({ 
						nconst: nconst, 
						tconst: result.tconst
					});

					getBaconPath(result.parent, number - 1, path).then(path => resolve(path));
				}
			})
			.catch(error => {	
				console.log('error getting actor parent in db:\n', error);
				reject(error);
			});
		}
	});
}

