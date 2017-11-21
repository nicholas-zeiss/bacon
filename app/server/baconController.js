/**
 *
 *	This module handles the logic of finding the path of an actor to Kevin Bacon by reading the database.
 *
**/


const db = require('./dbController');


/**
 *
 *	This function takes the generated path to Kevin Bacon and decorates it with all the pertinent data in our db.
 *
 *	inputs:
 *	path: [ { nconst: nconst1, tconst: tconst1 }, ... ]		(nconst and tconst are numbers)
 *
 *	return: [ [ actorInfo1, movieInfo1 ], ... ]
 *
**/
function getNamesTitles(path) {
	return new Promise((resolve, reject) => {
		const nconsts = [];
		const tconsts = [];

		path.forEach(node => {
			nconsts.push(node.nconst);
			tconsts.push(node.tconst);
		});

		Promise.all([
			db.getActorNames(nconsts),
			db.getMovieNames(tconsts)
		])
			.then(([names, titles]) => {
				const nameMap = new Map();
				const titleMap = new Map();

				names.forEach(actor => {
					nameMap.set(actor.nconst, {
						nconst: actor.nconst,
						name: actor.name,
						number: actor.number,
						dob: actor.dob,
						dod: actor.dod,
						imgUrl: actor.imgUrl,
						imgInfo: actor.imgInfo,
						jobs: actor.jobs
					});
				});

				titles.forEach(title => {
					titleMap.set(title.tconst, {
						tconst: title.tconst,
						title: title.title,
						year: title.year
					});
				});

				path = path.map(node => ({ 
					actor: nameMap.get(node.nconst),
					movie: titleMap.get(node.tconst) 
				}));

				path.push({
					actor: {
						nconst: 102,
						name: 'Kevin Bacon',
						number: 0,
						dob: 1958,
						dod: 0,
						jobs: 'soundtrack,producer,actor',
						imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Kevinbacongfdl.PNG/428px-Kevinbacongfdl.PNG',
						imgInfo: 'https://commons.wikimedia.org/wiki/File:Kevinbacongfdl.PNG'
					},
					movie: null
				});

				resolve(path);
			})
			.catch(error => {
				console.log('error getting actor names or movie names from db:\n', error);
				reject(error);
			});
	});
}


/**
 *
 *	This function generates the path to Kevin Bacon, decorates it with pertinent data, and returns it.
 *	Given the nconst input it looks it up in the table defined by number, adds itself to the path we 
 *	eventually decorate and return, and then recurses on the parent nconst of that nconst.
 *
 *	inputs:
 *	nconst: number
 *
 *	return: [  { actor: actorInfo1, movie: movieInfo1 }, ... ]
 *
**/
module.exports = function getBaconPath(nconst, number) {
	return new Promise((resolve, reject) => {	
		if (number > 6 || number < 0) {			
			reject('invalid bacon number');
		
		} else {
			db.getBaconPath(nconst, number)
				.then(getNamesTitles)
				.then(path => resolve(path))
				.catch(error => {	
					console.log('error getting bacon path:\n', error);
					reject(error);
				});
		}
	});
};

