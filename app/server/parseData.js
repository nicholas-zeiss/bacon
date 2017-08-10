const tsv = require('./tsvUtils');
const db = require('./db');


function getCostars(parents, alreadyIndexed, tconsts, nextParents) {
	return tsv.getCostars(parents, alreadyIndexed, tconsts).then(children => {
		console.log('got costars');
		
		parents = null;
		
		for (let child of children.keys()) {
			nextParents.add(child);
		}

		return children;
	});
}


function getMovies(tconsts) {
	return tsv.getMoviesByTconsts(tconsts).then(titles => {
		console.log('got titles');
		
		tconsts = null;
		let movies = [];

		for (let [tconst, title] of titles.entries()) {
			movies.push({
				tconst: Number(tconst.slice(2)),
				title: title
			});
		}

		return movies;
	});
}


function getNames(parents, costars, number) {
	return tsv.getActorsNames(parents).then(names => {
		console.log('got names');
		
		let actors = [];
		let tree = [];

		for (let [nconst, name] of names.entries()) {

			actors.push({
				nconst: Number(nconst.slice(2)),
				name: name,
				number: number
			});

			if (costars.has(nconst)) {
				tree.push({ 
					nconst: Number(nconst.slice(2)),
					parent: Number(costars.get(nconst)[0].slice(2)),
					tconst: Number(costars.get(nconst)[1].slice(2))
				});
			}
		}

		return [ actors, tree ];
	});
}


function expand(parents, alreadyIndexed, baconNumber) {
	console.log('calling expand w/ number ', baconNumber);

	if (baconNumber == 7) {
		return;
	}

	let tconsts = new Set();
	let nextParents = new Set();
	let childActors;
	
	let actorTree;
	let movieReference;
	let actorReference;


	getCostars(parents, alreadyIndexed, tconsts, nextParents).then(costars => {
		
		childActors = costars;

		let n = 0;
		for (let t of tconsts) n++;
		console.log('found ', n, ' different tconsts at this level');

		return getMovies(tconsts);
	
	}).then(titles => {

		movieReference = titles;
		return getNames(nextParents, childActors, baconNumber);

	}).then(actorData => {

		[ actorReference, actorTree ] = actorData;
		return db.addMovieReferences(movieReference);

	}).then(() => {
		
		console.log('sent titles');
		movieReference = null;
		return db.addActorReferences(actorReference);

	}).then(() => {
		
		console.log('sent actor names');
		actorReference = null;
		return db.addTreeTable(actorTree, baconNumber - 1);

	}).then(() => {
		
		console.log('sent actor tree');
		actorTree = null;
		expand(nextParents, alreadyIndexed, baconNumber + 1);
	
	});
}


let parents = new Set(['nm0000102']);
let alreadyIndexed = new Set(['nm0000102']);

expand(parents, alreadyIndexed, 1);






