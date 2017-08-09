const tsv = require('./tsvUtils');
const db = require('./db');



function expand(parents, foundActors, baconNumber) {
	console.log('calling expand w/ number ', baconNumber);
	if (baconNumber == 2) {
		return;
	}

	let movies = new Set();
	let costars;
	
	let movieReference = [];
	let actorReference = [];
	let actorTree = [];

	tsv.getCostars(parents, foundActors, movies).then(children => {
		console.log('got costars');
		costars = children;
		parents.clear();
		
		return tsv.getMoviesByTconsts(movies);
	
	}).then(titles => {
		console.log('got titles');
	
		movies = null;
		
		for (let [tconst, title] of titles.entries()) {
			movieReference.push({
				tconst: Number(tconst.slice(2)),
				title
			});
		}
		
		for (let [child, [parent, tconst]] of costars.entries()) {
			if (titles.has(tconst)) {
				parents.add(child);
				
				actorTree.push({ 
					nconst: Number(child.slice(2)),
					parent: Number(parent.slice(2)),
					tconst: Number(tconst.slice(2))
				});
			}
		}

		costars = null;

		return tsv.getActorsNames(parents);

	}).then(names => {
		console.log('got names');

		for (let [nconst, name] of names.entries()) {
			actorReference.push({
				nconst: Number(nconst.slice(2)),
				name,
				number: baconNumber
			});
		}

		return db.addTitleReferences(movieReference);

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
		expand(parents, foundActors, baconNumber + 1);
	
	});
}


let bacon = new Set(['nm0000102']);

expand(bacon, bacon, 1);

