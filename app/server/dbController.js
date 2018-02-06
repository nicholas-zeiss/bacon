/**
 *
 *  This module handles creating and manipulating our MongoDB database which we use to store the Bacon tree.
 *
 *	Note: the IMDb dataset indexes actors by a number referred to as nconst and movies by a number referred to as tconst.
 *		We use those indices for our database as well.
 *
 *  Our database is composed of 2 collections:
 *		actors - indexed by name, holds general information about the actors and the nconsts of the actors linking them to Kevin Bacon
 *  	movies - holds general information about the movies
 *
 *	Collection formats:
 *
 *   i. actors - {
 *			  _id: int nconst,       					-  their numerical index as specified in the IMDb dataset
 *			  name: str,				     					-  name of the actor
 *			  birthDeath: str,       					-  '' if no info, 'birthYear - deathYear' or 'birthYear - present' otherwise
 *        jobs: str, 						 					-  top three professions according to IMDb joined by ', '
 *        imgUrl: null | str,		 					-  url to the image found of the actor (null if not yet generated, empty string if no image could be found)
 * 				imgInfo: null | str, 	 					-  url to the wikimedia commons page for the image (null if not yet generated, empty string if no image could be found)
 *				parents: [ 						 					-  array of nconst/tconst of parent, grandparent, etc in path to Kevin Bacon. Empty if actor is Kevin Bacon.
 *					[						         
 *						int nconst,		- nconst of this actors parent
 *						int tconst    - tconst of movie linking them
 *					 ],
 *					...
 *				]
 *		  }
 *
 *
 *   ii. movies - {
 *			  _id: int tconst,     	 					-  numerical index as specified in the IMDb dataset
 *			  title: str,				     					-  primary title of the movie
 *        year: int              					-  year the movie was released (0 if not in dataset)
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
	imgInfo: 'https://commons.wikimedia.org/wiki/File:Kevinbacongfdl.PNG',
	parents: []
};





/**
 *
 *					UTILS FOR CRUD OPERATIONS
 *
**/

// Connects to the database and executes a callback. It returns a promise that resolves/rejects according to the callback.
function connectToDb(cb) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, db) => {
			assert.equal(null, err);
			cb(db, resolve, reject);
		});
	});
}


function success(db, resolve, result) {
	db.close(false, resolve.bind(null, result));
}


function failure(db, reject, error) {
	db.close(false, reject.bind(null, error));
}


function addActorInfo(actors, db) {
	return db.collection('actors')
		.insertMany(actors, { ordered: false });
}


function addMovieInfo(movies, db) {
	return db.collection('movies')
		.insertMany(movies, { ordered: false });
}


function getActorsByName(name, db) {
	return db.collection('actors')
		.find({ $text: { $search: `"${name}"` }})
		.toArray()
		.then(array => (
			array.filter(actor => (
				actor.name.toLowerCase() == name.toLowerCase()
			))
		));
}


function getActorsByNconsts(nconsts, db) {
	return db.collection('actors')
		.find({  _id: { $in: nconsts }})
		.toArray();
}


function getMoviesByTconsts(tconsts, db) {
	return db.collection('movies')
		.find({ _id: { $in: tconsts }})
		.toArray();
}





/**
 *
 *					UTILS FOR PARSING PATH TO BACON
 *
**/

function mapDocuments(documents) {
	return documents.reduce((map, doc) => (
		Object.assign(map, { [doc._id]: doc })
	), {});
}


// Takes the actor document of the start of the path to Bacon and arrays of the actor/movie
// documents of their ancestors. Returns an array of objects holding an actor and the movie linking
// them to their parent.
function generatePath(actor, parents, movies) {
	parents = mapDocuments(parents);
	movies = mapDocuments(movies);

	let currActor = { actor };
	const pathToBacon = [];

	actor.parents.forEach(([ nconst, tconst ]) => {
		currActor.movie = movies[tconst];
		pathToBacon.push(currActor);
		currActor = { actor: parents[nconst] };
	});

	// currActor is now Kevin Bacon, who has no parent thus no movie linking to his parent
	currActor.movie = null;
	pathToBacon.push(currActor);

	return pathToBacon;
}


/**
 *
 *					DB INTERFACE
 *
**/

exports.connectToDb = connectToDb;


exports.addActorsMovies = (actors, movies) => (
	connectToDb((db, resolve, reject) => {
		Promise.all([
			addActorInfo(actors, db),
			addMovieInfo(movies, db)
		])
			.then(success.bind(null, db, resolve))
			.catch(failure.bind(null, db, reject));
	})
);


exports.getActorsByName = name => (	
	connectToDb((db, resolve, reject) => {
		getActorsByName(name, db)
			.then(success.bind(null, db, resolve))
			.catch(failure.bind(null, db, reject));
	}) 
);


exports.getActorsByNconsts = nconsts => (	
	connectToDb((db, resolve, reject) => {
		getActorsByNconsts(nconsts, db)
			.then(success.bind(null, db, resolve))
			.catch(failure.bind(null, db, reject));
	}) 
);


exports.getBaconPath = actor => (
	connectToDb((db, resolve, reject) => {
		const nconsts = [];
		const tconsts = [];

		actor.parents.forEach(([ nconst, tconst ]) => {
			nconsts.push(nconst);
			tconsts.push(tconst);
		});

		Promise.all([
			getActorsByNconsts(nconsts, db),
			getMoviesByTconsts(tconsts, db)
		])
			.then(([ parents, movies ]) => {
				const baconPath = generatePath(actor, parents, movies);
				success(db, resolve, baconPath);
			})
			.catch(failure.bind(null, db, reject));
	})
);


exports.resetDb = () => (
	connectToDb((db, resolve, reject) => {		
		db.dropDatabase()
			.then(() => {
				Promise.all([
					() => db.collection('actors').createIndex({ name: 'text' }),
					() => db.collection('movies')
				])
					.then(() => {
						db.collection('actors')
							.insertOne(KevinBaconInfo)
							.then(success.bind(null, db, resolve))
							.catch(failure.bind(null, db, reject));
					})
					.catch(failure.bind(null, db, reject));
			})
			.catch(failure.bind(null, db, reject));
	})
);

