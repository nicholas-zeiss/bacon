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
 *        jobs: str, 						 -  top three professions according to IMDb joined by ', '
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


const KevinBaconInfo = {
	_id: 102,
	name: 'Kevin Bacon',
	birthDeath: '1958 - present',
	jobs: 'actor, producer, soundtrack',
	imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Kevinbacongfdl.PNG/400px-Kevinbacongfdl.PNG',
	imgInfo: 'https://commons.wikimedia.org/wiki/File:Kevinbacongfdl.PNG'
};

function success(db, resolve, result) {
	db.close(false, resolve.bind(null, result));
}

function failure(db, reject, error) {
	console.log('Error in db controller:\n', error.message);
	db.close(false, reject.bind(null, error));
}


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
				db.collection('actors').createIndex({ name: 'text' });
				db.collection('childToParent');
				db.collection('movies');

				db.collection('actors')
					.insertOne(KevinBaconInfo)
					.then(success.bind(null, db, resolve))
					.catch(failure.bind(null, db, reject));
			})
			.catch(failure.bind(null, db, reject));	
	});
}


function resetImages() {
	return connectToDb((db, resolve, reject) => {		
		db.collection('actors')
			.updateMany(
				{ _id: { $ne: 102 }},
				{ $set: { imgUrl: null, imgInfo: null }}
			)
			.then(success.bind(null, db, resolve))
			.catch(failure.bind(null, db, reject));	
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
**/

function addActorImages(nconstToUrl) {
	return connectToDb((db, resolve, reject) => {		
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
			.then(success.bind(null, db, resolve))
			.catch(failure.bind(null, db, reject));
	});
}


function addActorInfo(documents) {
	return connectToDb((db, resolve, reject) => {		
		db.collection('actors')
			.insertMany(documents, { ordered: false })
			.then(success.bind(null, db, resolve))
			.catch(failure.bind(null, db, reject));	
	});
}


function addChildParent(documents) {
	return connectToDb((db, resolve, reject) => {		
		db.collection('childToParent')
			.insertMany(documents, { ordered: false })
			.then(success.bind(null, db, resolve))
			.catch(failure.bind(null, db, reject));	
	});
}


function addMovieInfo(documents) {
	return connectToDb((db, resolve, reject) => {	
		db.collection('movies')
			.insertMany(documents, { ordered: false })
			.then(success.bind(null, db, resolve))
			.catch(failure.bind(null, db, reject));
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
**/

function getActorInfoByName(name) {
	return connectToDb((db, resolve, reject) => {
		
		// Searches actors collection for any documents where name contains the name argument, case insensitive.
		// As this includes actors whose name may have additional text before or after the name argument, we conduct
		// an additional filter.

		db.collection('actors')
			.find({ $text: { $search: `"${name}"` }})
			.toArray()
			.then(array => array.filter(actor => (
				actor.name.toLowerCase() == name.toLowerCase()
			)))
			.then(success.bind(null, db, resolve))
			.catch(failure.bind(null, db, reject));
	}); 
}


function getActorInfoByNconst(nconsts) {
	return connectToDb((db, resolve, reject) => {	
		db.collection('actors')
			.find({  _id: { $in: nconsts }})
			.toArray()
			.then(success.bind(null, db, resolve))
			.catch(failure.bind(null, db, reject));
	});
}


function getMovieInfo(tconsts) {
	return connectToDb((db, resolve, reject) => {	
		db.collection('movies')
			.find({ _id: { $in: tconsts }})
			.toArray()
			.then(success.bind(null, db, resolve))
			.catch(failure.bind(null, db, reject));
	});
}


/**
 *
 *		SECTION - Bacon Path
 *		
 *		This section contains the function we use to actually find a path from an actor to Kevin Bacon,
 *		along with some helper functions for it.	
 *			
**/

// given a nconst to start at this resolves to the path to bacon where every step on the path
// is a parent actor nconst and movie nconst
function findParents(nconst, db, path = []) {
	return db.collection('childToParent')
		.findOne({ _id: nconst })
		.then(result => {			
			path.push({
				actor: result._id,
				movie: result.movie_id
			});

			if (result.parent_id == 102) {
				return path;
			} else {
				return findParents(result.parent_id, db, path);
			}
		});
}


// given an array of nconsts find the actor info for each from the actors collecton
function findActorInfo(nconsts, db) {
	return db.collection('actors')
		.find({ _id: { $in: nconsts }})
		.toArray()
		.then(info => (
			info.reduce((info, actor) => (
				Object.assign(info, { [actor._id]: actor })
			), {})
		));
}


// given an array of tconsts find the movie info for each from the movies collection
function findMovieInfo(tconsts, db) {
	return db.collection('movies')
		.find({ _id: { $in: tconsts }})
		.toArray()
		.then(info => (
			info.reduce((info, movie) => (
				Object.assign(info, { [movie._id]: movie })
			), {})
		));
}

// Function that puts it all together and gives us the full path. Note that
// we assume nconst is a valid actor id, we verify this elsewhere.
function getBaconPath(nconst) {
	return connectToDb((db, resolve, reject) => {

		findParents(nconst, db)
			.then(pathToBacon => {		
				const nconsts = [];
				const tconsts = [];

				pathToBacon.forEach(node => {
					nconsts.push(node.actor);
					tconsts.push(node.movie);
				});

				return Promise.all([
					pathToBacon,
					findActorInfo(nconsts, db),
					findMovieInfo(tconsts, db)
				]);
			})
			.then(([ pathToBacon, actorInfo, movieInfo ]) => (
				pathToBacon
					.map(node => ({
						actor: actorInfo[node.actor],
						movie: movieInfo[node.movie]
					}))
					.concat({ actor: KevinBaconInfo, movie: null })
			))
			.then(success.bind(null, db, resolve))
			.catch(failure.bind(null, db, reject));
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
	getMovieInfo,
	getBaconPath
};

