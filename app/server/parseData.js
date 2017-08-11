const tsv = require('./tsvUtils');
const db = require('./db');


function prepData(actorTree, names, movies, baconNumber) {
	let dbTree = [];
	let dbNames = [];
	let dbMovies = [];

	let validMovies = new Set();		//different childNconst can have same tconst
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
				number: baconNumber
			}, names.get(childNconst)));
		}
	}

	for (let tconst of validMovies) {
		dbMovies.push(Object.assign({ tconst: Number(tconst.slice(2)) }, movies.get(tconst)));
	}

	return [dbTree, dbNames, dbMovies, nextParents];
}


function expand(parents, alreadyIndexed, baconNumber) {
	console.log('calling expand w/ number ', baconNumber);

	if (baconNumber == 7) {
		return;
	}

	tsv.getCostars(parents, alreadyIndexed).then(costars => {
		console.log('got costars');
		parents = null;

		return Promise.all([
			costars.actorMap,
			tsv.getMoviesByTconsts(costars.movieSet),
			tsv.getActorNames(costars.actorSet)
		]);
	
	}).then(([actorTree, titles, names]) => {
		console.log('got titles and names');

		let [dbTree, dbNames, dbMovies, nextParents] = prepData(actorTree, names, titles, baconNumber);

		return Promise.all([
			nextParents,
			db.addTreeLevel(dbTree, baconNumber - 1),
			db.addActorReferences(dbNames),
			db.addMovieReferences(dbMovies)
		]);

	}).then(([nextParents, foo, bar, baz]) => {
		
		console.log('sent actor tree, actor names, movie names');
		expand(nextParents, alreadyIndexed, baconNumber + 1);

	});
}


let parents = new Set(['nm0000102']);
let alreadyIndexed = new Set(['nm0000102']);

db.resetDb().then(() => expand(parents, alreadyIndexed, 1));





