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
 *        imgUrl: str,					 -  url to the image generated for them (empty str if image not yet generated, null if no image could be found)
 * 				imgPage: str 					 -  url to the wikimedia commons page for the image (empty str if image not yet generated, null if no image could be found)
 *		  }
 *
 *
 *   ii. movieReference - {
 *			  tconst: int,           -  numerical index as specified in the IMDb dataset
 *			  tile: str,				     -  primary title of the movie
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
exports.resetDb = function() {
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
						imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Kevinbacongfdl.PNG/428px-Kevinbacongfdl.PNG',
						imgInfo: 'https://commons.wikimedia.org/wiki/File:Kevinbacongfdl.PNG'
					})
					.then(result => {
						db.close(false, resolve.bind(null, result));
					})
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
};


/**
 *
 *		SECTION - SETTERS
 *
 *			i. addActorReferences  -  add documents to collection actorReference
 *		 ii. addActorImageUrl    -  add imgUrlto a document specified by nconst in actorReference
 *    iii. addMovieReferences  -  add documents to collection movieReference
 *     iv. addTreeLevel				 -  add documents to an ordinal collection
 *
 */


exports.addActorReferences = function(documents) {
	return connectToDb((db, resolve, reject) => {

		db.collection('actorReference')
			.insertMany(documents)
			.then(result => {				
				db.close(false, resolve.bind(null, result));
			})
			.catch(error => {
				console.log('failed to send actor references:\n', error.message);
				db.close(false, reject.bind(null, error));
			});

	});
};


exports.addActorImageUrl = function(nconst, { imgUrl, imgInfo }) {
	return connectToDb((db, resolve, reject) => {
		
		db.collection('actorReference')
			.updateOne(
				{ nconst },
				{ $set: { imgUrl, imgInfo }}
			)
			.then(result => {
				db.close(false, resolve.bind(null, result));
			})
			.catch(error => {
				console.log('error adding url to database for ', nconst, ':\n', error.message);
				db.close(false, reject.bind(null, error));
			});

	});
};


exports.addMovieReferences = function(documents) {
	return connectToDb((db, resolve, reject) => {
		
		db.collection('movieReference')
			.insertMany(documents)
			.then(result => {
				db.close(false, resolve.bind(null, result));
			})
			.catch(error => {
				console.log('failed to send movie references:\n', error.message);
				db.close(false, reject.bind(null, error));
			});

	});
};


exports.addTreeLevel = function(documents, number) {
	let collection = [ 'first', 'second', 'third', 'fourth', 'fifth', 'sixth' ][number];

	return connectToDb((db, resolve, reject) => {
		
		db.collection(collection)
			.insertMany(documents)
			.then(result => {
				db.close(false, resolve.bind(null, result));
			})
			.catch(error => {
				console.log('failed to send actor tree:\n', error.message);
				db.close(false, reject.bind(null, error));
			});

	});
};


/**
 *
 *		SECTION - GETTERS
 *
 *			i. getActorReferences  -  retreive all documents in actorReference that match the given name (case insensitive)
 *		 ii. getActorNames       -  retreive all documents in actorReference whose nconst is in the supplied array
 *    iii. getActorParent      -  given an nconst and an ordinal collection return the document in that collection matching the nconst
 *     iv. getMovieNames			 -  retreive all documents in movieReference whose tconst is in the supplied array
 *
 */


exports.getActorReferences = function(name) {
	return connectToDb((db, resolve, reject) => {
		
		db.collection('actorReference')
			.find({ name: { $regex: '^' + name + '$', $options: 'i' }})
			.toArray()
			.then(result => {
				db.close(false, resolve.bind(null, result));
			})
			.catch(error => {
				console.log('error finding ', name, ':\n', error.message);
				db.close(false, reject.bind(null, error.message));
			});

	}); 
};


exports.getActorNames = function(nconsts) {
	return connectToDb((db, resolve, reject) => {
		
		db.collection('actorReference')
			.find({ nconst: { $in: nconsts }})
			.toArray()
			.then(result => {
				db.close(false, resolve.bind(null, result));
			})
			.catch(error => {
				console.log('error in getActorNames:\n', error.message);
				db.close(false, reject.bind(null, error.message));
			});

	});
};


exports.getActorParent = function(nconst, table) {
	return connectToDb((db, resolve, reject) => {
		
		db.collection(table)
			.findOne({ nconst })
			.then(result => {
				db.close(false, resolve.bind(null, result));
			})
			.catch(error => {
				console.log('error in getActorParent finding ', nconst, ':\n', error.message);
				db.close(false, reject.bind(null, error.message));
			});

	});
};


exports.getMovieNames = function(tconsts) {
	return connectToDb((db, resolve, reject) => {
		
		db.collection('movieReference')
			.find({ tconst: { $in: tconsts }})
			.toArray()
			.then(result => {
				db.close(false, resolve.bind(null, result));
			})
			.catch(error => {
				console.log('error in getMovieNames:\n', error.message);
				db.close(false, reject.bind(null, error.message));
			});

	});
};

