/**
 *
 *	This module takes our cleaned IMDb data and with it creates a database for our "Bacon tree". Starting off with
 *	Kevin Bacon himself, it finds all movies in which he stars and from that generates a list of costars. It adds all
 *	these movies and costars to the actorReference and movieReference collections in the db, and populates the "first" collection
 *	with the links between these costars and Kevin Bacon. It then recurses on those costars, finding their costars and adding them
 *	to actorReference, movieReference, and "second", etc until 6 degrees of separation are reached.
 *
**/


const tsv = require('./tsvUtils');
const db = require('../db');


/**
 *
 *	Formats data collected in the expand function for the database. actorTree holds the links between a parent and child actor
 *	and ends up in one of the cardinal collections ("first", "second", etc). names and movies map nconsts/tconsts to actor/movie
 *	information and end up in actorReference/movieReference.
 *
 *	inputs:
 *	actorTree: Map(str nconst => [ str parentNconst, str tconst ])
 *	names: Map(str nconst => { name: str name, dob: number birthYear, dod: number deathYear, jobs: str professions })
 *	movies: Map(str tconst => { title: str title, year: number year })
 *	baconNumber: number
 *
 *	return: [dbTree, dbNames, dbMovies, nextParents]
 *	dbTree: [ { nconst: number nconst, parent: number nconst, tconst: number tconst}, ... ]
 *	dbNames: [ { nconst: number nconst, number: number degreeOfSeparation, imgUrl: null, imgPath: null, name: str name, dob: number birthYear, dod: number deathYear, jobs: str professions }, ... ]
 *	(imgUrl/Path are default value at this point, these are created by actually using the app)
 *	dbMovies: [ { tconst: number tconst, title: str title, year: number year }, ... ]
 *	nextParents: Set( str nconst ) 
 *
**/
function prepData(actorTree, names, movies, baconNumber) {
	let dbTree = [];
	let dbNames = [];
	let dbMovies = [];

	let validMovies = new Set();
	let nextParents = new Set();


	for (let [childNconst, [ rootNconst, tconst]] of actorTree.entries()) {
		if (names.has(childNconst) && movies.has(tconst)) {
			nextParents.add(childNconst);
			validMovies.add(tconst);

			dbTree.push({
				nconst: Number(childNconst.slice(2)),
				parent: Number(rootNconst.slice(2)),
				tconst: Number(tconst.slice(2))
			});

			dbNames.push(Object.assign({
				nconst: Number(childNconst.slice(2)),
				number: baconNumber,
				imgUrl: null,
				imgInfo: null
			}, names.get(childNconst)));
		}
	}


	for (let tconst of validMovies) {
		dbMovies.push(Object.assign({ tconst: Number(tconst.slice(2)) }, movies.get(tconst)));
	}


	return [dbTree, dbNames, dbMovies, nextParents];
}


/**
 *
 *	The recursive function that generates the Bacon tree. Call with Kevin Bacon's info and baconNumber 1 to generate.
 *	parents is the set of nconsts whose costars we will collect each function call and add to the collection
 *	corresponding to baconNumber. alreadyIndexed is the set of all nconsts already in the Bacon tree, including parents.
 *	
 *	inputs:
 *	parents: Set( str nconst1, ... ) 
 *	alreadyIndexed: Set( str nconst1, ... )
 *	baconNumber: number
 *	
 *	return: none
 *
**/
function expand(parents, alreadyIndexed, baconNumber) {

	if (baconNumber == 7) {
		return;
	}

	tsv.getCostars(parents, alreadyIndexed)
		.then(costars => {
			parents = null;

			// costars.actorMap - map of costar nconst to [ parent nconst, linking tconst ]
			// costars.movieSet - set of all tconsts of linking movies
			// costars.actorSet - set of all costar nconsts
			return Promise.all([
				costars.actorMap,
				tsv.getMoviesByTconsts(costars.movieSet),
				tsv.getActorNames(costars.actorSet)
			]);

		}).then(([actorMap, titles, names]) => {

			let [dbTree, dbNames, dbMovies, nextParents] = prepData(actorMap, names, titles, baconNumber);

			return Promise.all([
				nextParents,
				db.addTreeLevel(dbTree, baconNumber - 1),
				db.addActorReferences(dbNames),
				db.addMovieReferences(dbMovies)
			]);

		}).then(([nextParents, foo, bar, baz]) => {
			expand(nextParents, alreadyIndexed, baconNumber + 1);
		});
}


// nm0000102 is the nconst for Kevin Bacon
let parents = new Set(['nm0000102']);
let alreadyIndexed = new Set(['nm0000102']);

// clear db and generate Bacon tree
db.resetDb().then(() => expand(parents, alreadyIndexed, 1));

