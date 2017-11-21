/**
 *
 *  This module handles creating and manipulating our MongoDB database which we use to store the Bacon tree.
 *
 *	Note: the IMDb dataset indexes actors by a number referred to as nconst and movies by a number referred to as tconst.
 *		We use those indices for our database as well.
 *
 *  Our database is composed of 3 collections:
 *		actors - indexed by name, holds general information about the actors
 *  	movies - holds general information about the movies
 *		childToParent - links a child actor to his parent actor and the movie linking them
 *
 *	Collection formats:
 *
 *   i. actors - {
 *			  _id: nconst (int),     -  their numerical index as specified in the IMDb dataset
 *			  name: str,				     -  name of the actor
 *			  birthDeath: str,       -  '' if no info, 'birthYear - deathYear' or 'birthYear - present' otherwise
 *        jobs: str, 						 -  top three professions according to dataset joined by ', '
 *        imgUrl: str,					 -  url to the image generated for them (null if image not yet generated, empty string if no image could be found)
 * 				imgInfo: str 					 -  url to the wikimedia commons page for the image (null if image not yet generated, empty string if no image could be found)
 *		  }
 *
 *
 *   ii. movies - {
 *			  _id: tconst (int),     -  numerical index as specified in the IMDb dataset
 *			  title: str,				     -  primary title of the movie
 *        year: int              -  year the movie was released (0 if not in dataset)
 *		  }
 *
 *
 *   iii. childToParent - {
 *			  _id: nconst (int),     		-  numerical index of child actor as specified in the IMDb dataset
 *			  movie_id: tconst (int), 	-  tconst of the movie linking child and parent
 *        parent_id: nconst(int)    -  numerical index of parent actor as specified in the IMDb dataset
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


function resetDb() {
	return connectToDb((db, resolve, reject) => {
		
		db.dropDatabase()
			.then(() => {
				
				db.collection('childToParent');
				db.collection('movies');
				db.collection('actors')
					.createIndex({ name: 'text' });

				db.collection('actors')
					.insertOne({
						_id: 102,
						name: 'Kevin Bacon',
						birthDeath: '1958 - present',
						jobs: 'actor, producer, soundtrack',
						imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Kevinbacongfdl.PNG/400px-Kevinbacongfdl.PNG',
						imgInfo: 'https://commons.wikimedia.org/wiki/File:Kevinbacongfdl.PNG'
					})
					.then(result => db.close(false, resolve.bind(null, result)))
					.catch(error => {
						console.log('Error inserting Kevin Bacon:\n', error.message);			
						db.close(false, reject.bind(null, error));
					});
			
			})
			.catch(error => {
				console.log('Error dropping database:\n', error.message);	
				db.close(false, reject.bind(null, error));
			});
	
	});
}


function resetImages() {
	return connectToDb((db, resolve, reject) => {
		
		db.collection('actors')
			.updateMany(
				{ _id: { $ne: 102 }},
				{ $set: { imgUrl: null, imgInfo: null }}
			)
			.then(() => db.close(false, resolve))
			.catch(error => {
				console.log('Error resetting images:\n', error);
				db.close(false, reject);
			});
	
	});
}


/**
 *
 *		SECTION - CREATE
 *
 *		 i. addActorImages   		-  add image urls to documents specified by nconst in actors
 *		ii. addActorInfo  			-  add documents to actors collection
 *   iii. addChildParent			-  add documents to an childToParent
 *    iv. addMovieInfo			  -  add documents to movies collection
 *
 */

function addActorImages(nconstToUrl) {
	return connectToDb((db, resolve) => {
		
		const updates = [];

		for (let nconst in nconstToUrl) {
			updates.push(db.collection('actors')
				.updateOne(
					{ _id: Number(nconst) },
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


function addActorInfo(documents) {
	return connectToDb((db, resolve, reject) => {
		
		console.log('Adding ' + documents.length + ' docs to actors');
		
		db.collection('actors')
			.insertMany(documents, { ordered: false })
			.then(result => {
				console.log('Added ' + result.insertedCount + ' docs to actors');
				db.close(false, resolve);
			})
			.catch(error => {
				error.writeErrors.forEach(err => console.log(String(err)));
				db.close(false, reject.bind(null, error));
			});

	});
}


function addChildParent(documents) {
	return connectToDb((db, resolve, reject) => {

		console.log('Adding ' + documents.length + ' docs to childToParent');
		
		db.collection('childToParent')
			.insertMany(documents, { ordered: false })
			.then(result => {
				console.log('Added ' + result.insertedCount + ' docs to childToParent');
				db.close(false, resolve);
			})
			.catch(error => {
				console.log('Error adding childToParent documents:\n', error.message);
				db.close(false, reject.bind(null, error));
			});
	
	});
}


function addMovieInfo(documents) {
	return connectToDb((db, resolve, reject) => {

		console.log('Adding ' + documents.length + ' docs to movies');
		
		db.collection('movies')
			.insertMany(documents, { ordered: false })
			.then(result => {
				console.log('Added ' + result.insertedCount + ' docs to movies');
				db.close(false, resolve);
			})
			.catch(error => {
				console.log('Error adding movie info:\n', error.message);
				db.close(false, reject.bind(null, error));
			});
	
	});
}



/**
 *
 *		 SECTION - GET
 *
 *			i. getActorInfoByName  			-  retreive all documents in collection actors that match the given name (case insensitive)
 *		 ii. getActorInfoByNconst     -  retreive all documents in collection actors whose nconst is in the supplied array
 *     iv. getMovieInfo			 				-  retreive all documents in collection movies whose tconst is in the supplied array
 *
 */

function getActorInfoByName(name) {
	return connectToDb((db, resolve, reject) => {
		
		// Searches actors collection for any documents where name contains the name argument, case insensitive.
		// As this includes actors whose name may have additional text before or after the name argument, we conduct
		// an additional filter.

		db.collection('actors')
			.find({
				$text: { $search: `"${name}"` }
			})
			.toArray()
			.filter(actor => (
				actor.name.toLowerCase() == name.toLowerCase()
			))
			.then(result => db.close(false, resolve.bind(null, result)))
			.catch(error => {
				console.log('Error finding ', name, ':\n', error.message);
				db.close(false, reject.bind(null, error.message));
			});
	
	}); 
}


function getActorInfoByNconst(nconsts) {
	return connectToDb((db, resolve, reject) => {
		
		db.collection('actors')
			.find({ 
				_id: { $in: nconsts }
			})
			.toArray()
			.then(result => db.close(false, resolve.bind(null, result)))
			.catch(error => {
				console.log('Error finding actors by nconsts:\n', error.message);
				db.close(false, reject.bind(null, error.message));
			});
	
	});
}


function getMovieInfo(tconsts) {
	return connectToDb((db, resolve, reject) => {
		
		db.collection('movies')
			.find({ 
				_id: { $in: tconsts }
			})
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
	addActorInfo,
	addActorImages,
	addMovieInfo,
	addChildParent,
	getActorInfoByName,
	getActorInfoByNconst,
	getMovieInfo
};

