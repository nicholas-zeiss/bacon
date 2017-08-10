const tsv = require('./tsvUtils');
const db = require('./db');


function prepData(actorTree, names, movies, baconNumber) {
	// nconst => [nconst, tconst]
	// nconst => name
	// tconst => title
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

			dbNames.push({
				nconst: Number(childNconst.slice(2)),
				name: names.get(childNconst),
				number: baconNumber
			});
		}
	}

	for (let tconst of validMovies) {
		dbMovies.push({
			tconst: Number(tconst.slice(2)),
			title: movies.get(tconst)
		});
	}

	return [dbTree, dbNames, dbMovies, nextParents];
}


function expand(parents, alreadyIndexed, baconNumber) {
	console.log('calling expand w/ number ', baconNumber);

	if (baconNumber == 7) {
		return;
	}	

	let actorTree;				//nconst => [nconst, tconst]
	let movies;		//tconst => title

	let actorSet;

	let dbNames;
	let dbMovies;
	let nextParents;

	tsv.getCostars(parents, alreadyIndexed).then(costars => {
		console.log('got costars');
		
		parents = null;
		actorTree = costars.actorMap;
		actorSet = costars.actorSet;
		return tsv.getMoviesByTconsts(costars.movieSet);
	
	}).then(titles => {
		console.log('got titles');

		movies = titles;
		return tsv.getActorNames(actorSet);

	}).then(names => {
		console.log('got games');

		return prepData(actorTree, names, movies, baconNumber);

	}).then(dbData => {

		dbNames = dbData[1];
		dbMovies = dbData[2];
		nextParents = dbData[3];

		return db.addTreeLevel(dbData[0], baconNumber - 1);

	}).then(() => {
		
		console.log('sent actor tree');
		return db.addActorReferences(dbNames);

	}).then(() => {
		
		console.log('sent actor names');
		return db.addMovieReferences(dbMovies);

	}).then(() => {
		
		console.log('sent movie names');
		expand(nextParents, alreadyIndexed, baconNumber + 1);
	
	});
}


let parents = new Set(['nm0000102']);
let alreadyIndexed = new Set(['nm0000102']);

db.resetDb().then(() => expand(parents, alreadyIndexed, 1));





