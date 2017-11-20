/**
 *
 *  This module handles creating and manipulating our MongoDB database which we use to store the Bacon tree.
 *
 *  Our database is composed of 8 collections:
 *	actorReference - indexed by nconst and name, holds general information about the actors and which ordinal table they are found in
 *  movieReference - indexed by tconst, holds general information about the movies
 *
 *  ordinal tables: first, second, third, fourth, fifth, sixth
 *  These tables are indexed by nconst and for each nconst record the parent actor and movie they were both in.
 *  Think of these tables as the different depths of the Bacon tree.
 *
 *	Collection formats:
 *
 *   i. actorReference - {
 *			  nconst: int,           -  their numerical index as specified in the IMDb dataset
 *			  name: str,				     -  name of the actor
 *        number: int,           -  the ordinal table in which their path to Kevin Bacon begins
 *			  dob: int,              -  birth year (0 if not in dataset)
 *        dod: int,              -  death year (0 if not in dataset or actor is still alive)
 *        jobs: str, 						 -  comma separated string of their three top professions as according to IMDb dataset
 *        imgUrl: str,					 -  url to the image generated for them (null if image not yet generated, empty string if no image could be found)
 * 				imgInfo: str 					 -  url to the wikimedia commons page for the image (null if image not yet generated, empty string if no image could be found)
 *		  }
 *
 *
 *   ii. movieReference - {
 *			  tconst: int,           -  numerical index as specified in the IMDb dataset
 *			  title: str,				     -  primary title of the movie
 *        year: int              -  year the movie was released (0 if not in dataset)
 *		  }
 *
 *
 *   iii. <ordinalNumber> - {
 *			  nconst: int,				   -  nconst of the actor on this level of the Bacon tree
 *			  parent: int,           -  nconst of their parent in the Bacon tree
 *        tconst: int            -  tconst of the movie in which both appeared
 *		  }
 *
**/


const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = require('./dbLogin');
const ordinalCollections = [
	'first',
	'second',
	'third',
	'fourth',
	'fifth',
	'sixth'
];


// Connects to the database and executes a callback. It returns a promise that resolves/rejects according to the callback.
function connectToDb(cb) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, db) => {
			assert.equal(null, err);
			cb(db, resolve, reject);
		});
	});
}


// Use this to clear the database and recreate our collections and insert Kevin Bacon
function resetDb() {
	return connectToDb((db, resolve, reject) => {
		db.dropDatabase()
			.then(() => {
				db.collection('movieReference').createIndex({ tconst: 1 }, { unique: true });
				db.collection('actorReference').createIndex({ nconst: 1 }, { unique: true });
				db.collection('actorReference').createIndex({name: 'text'});
				db.collection('first').createIndex({ nconst: 1 }, { unique: true });
				db.collection('second').createIndex({ nconst: 1 }, { unique: true });
				db.collection('third').createIndex({ nconst: 1 }, { unique: true });
				db.collection('fourth').createIndex({ nconst: 1 }, { unique: true });
				db.collection('fifth').createIndex({ nconst: 1 }, { unique: true });
				db.collection('sixth').createIndex({ nconst: 1 }, { unique: true });

				db.collection('actorReference')
					.insertOne({
						name:'Kevin Bacon',
						nconst: 102,
						number: 0,
						dob: 1958,
						dod: 0,
						jobs: 'actor,producer,soundtrack',
						imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Kevinbacongfdl.PNG/400px-Kevinbacongfdl.PNG',
						imgInfo: 'https://commons.wikimedia.org/wiki/File:Kevinbacongfdl.PNG'
					})
					.then(result => db.close(false, resolve.bind(null, result)))
					.catch(error => {
						console.log('error inserting Kevin Bacon:\n', error.message);			
						db.close(false, reject.bind(null, error));
					});
			})
			.catch(error => {
				console.log('error dropping database:\n', error.message);	
				db.close(false, reject.bind(null, error));
			});
	});
}


function resetImages() {
	return connectToDb((db, resolve, reject) => {
		db.collection('actorReference')
			.updateMany(
				{ nconst: { $ne: 102 }},
				{ $set: { imgUrl: null, imgInfo: null }}
			)
			.then(() => {
				console.log('Reset images');
				db.close(false, resolve);
			})
			.catch(error => {
				console.log('Error resetting images:\n', error);
				db.close(false, reject);
			});
	});
}


/**
 *
 *		SECTION - SETTERS
 *
 *			i. addActorReferences  -  add documents to collection actorReference
 *		 ii. addActorImageUrls   -  add imgage urls to documents specified by nconst in actorReference
 *    iii. addMovieReferences  -  add documents to collection movieReference
 *     iv. addTreeLevel				 -  add documents to an ordinal collection
 *
 */


function addActorReferences(documents) {
	return connectToDb((db, resolve, reject) => {
		db.collection('actorReference')
			.insertMany(documents)
			.then(result => db.close(false, resolve.bind(null, result)))
			.catch(error => {
				console.log('failed to send actor references:\n', error.message);
				db.close(false, reject.bind(null, error));
			});
	});
}


function addActorImageUrls(nconstToUrl) {
	return connectToDb((db, resolve) => {
		const updates = [];

		for (let nconst in nconstToUrl) {
			updates.push(db.collection('actorReference')
				.updateOne(
					{ nconst: Number(nconst) },
					{ $set: {
						imgUrl: nconstToUrl[nconst].imgUrl,
						imgInfo: nconstToUrl[nconst].imgInfo 
					}}
				)
			);
		}

		Promise.all(updates)
			.catch(error => console.log('error adding urls to database:\n', error.message));
			
		db.close(false, resolve);
	});
}


function addMovieReferences(documents) {
	return connectToDb((db, resolve, reject) => {
		db.collection('movieReference')
			.insertMany(documents)
			.then(result => db.close(false, resolve.bind(null, result)))
			.catch(error => {
				console.log('failed to send movie references:\n', error.message);
				db.close(false, reject.bind(null, error));
			});
	});
}


function addTreeLevel(documents, number) {
	return connectToDb((db, resolve, reject) => {
		db.collection(ordinalCollections[number - 1])
			.insertMany(documents)
			.then(result => db.close(false, resolve.bind(null, result)))
			.catch(error => {
				console.log('failed to send actor tree:\n', error.message);
				db.close(false, reject.bind(null, error));
			});
	});
}


/**
 *
 *		SECTION - GETTERS
 *
 *			i. getActorReferences  -  retreive all documents in actorReference that match the given name (case insensitive)
 *		 ii. getActorNames       -  retreive all documents in actorReference whose nconst is in the supplied array
 *    iii. getBaconPath        -  given an nconst and number of the ordinal collection containg the nconst return the bacon path
 *     iv. getMovieNames			 -  retreive all documents in movieReference whose tconst is in the supplied array
 *
 */


function getActorReferences(name) {
	return connectToDb((db, resolve, reject) => {
		db.collection('actorReference')
			.find({ name: { $regex: '^' + name + '$', $options: 'i' }})
			.toArray()
			.then(result => db.close(false, resolve.bind(null, result)))
			.catch(error => {
				console.log('error finding ', name, ':\n', error.message);
				db.close(false, reject.bind(null, error.message));
			});
	}); 
}


function getActorNames(nconsts) {
	return connectToDb((db, resolve, reject) => {
		db.collection('actorReference')
			.find({ nconst: { $in: nconsts }})
			.toArray()
			.then(result => db.close(false, resolve.bind(null, result)))
			.catch(error => {
				console.log('error in getActorNames:\n', error.message);
				db.close(false, reject.bind(null, error.message));
			});
	});
}


function getBaconPath(nconst, number) {
	return connectToDb((db, resolve, reject) => {
		getParent(nconst, number, []);

		function getParent(nconst, number, path) {
			db.collection(ordinalCollections[number - 1])
				.findOne({ nconst })
				.then(result => {
					if (result) {
						path.push({ nconst, tconst: result.tconst });
						
						if (number == 1) {
							db.close(false, resolve.bind(null, path));
						} else {
							getParent(result.parent, number - 1, path);
						}
					} else {
						db.close(false, reject.bind(null, `nconst ${nconst} does not exist in the db`));
					}
				})
				.catch(error => {
					console.log('error in getBaconPath finding ', nconst, ':\n', error.message);
					db.close(false, reject.bind(null, error.message));
				});
		}
	});
}


function getMovieNames(tconsts) {
	return connectToDb((db, resolve, reject) => {
		db.collection('movieReference')
			.find({ tconst: { $in: tconsts }})
			.toArray()
			.then(result => db.close(false, resolve.bind(null, result)))
			.catch(error => {
				console.log('error in getMovieNames:\n', error.message);
				db.close(false, reject.bind(null, error.message));
			});
	});
}


module.exports = {
	resetDb,
	resetImages,
	addActorReferences,
	addActorImageUrls,
	addMovieReferences,
	addTreeLevel,
	getActorReferences,
	getActorNames,
	getBaconPath,
	getMovieNames
};

