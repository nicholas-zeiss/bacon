const tsv = require('./tsvUtils');
const db = require('./db');



function expand(parents, foundActors, baconNumber) {
	console.log('calling expand w/ number ', baconNumber);
	if (baconNumber == 2) {
		return;
	}

	let movies = new Set();
	
	let movieReference = [];
	let actorReference = [];
	let actorTree = [];

	tsv.getCostars(parents, foundActors, movies).then(children => {
		console.log('got costars');
		parents.clear();
		
		for (let [child, [parent, tconst]] of children.entries()) {
			parents.add(child);
			
			actorTree.push({ 
				nconst: Number(child.slice(2)),
				parent: Number(parent.slice(2)),
				tconst: Number(tconst.slice(2))
			});
		}

		// console.log(actorTree);

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
		
		let n = 0;
		for (let t of parents) {
			n++;
		}
		console.log('parents has length ', n);

		return tsv.getActorsNames(parents);

	}).then(names => {
		console.log('got names');

		for (let [nconst, name] of names.entries()) {
			actorReference.push({
				nconst: Number(nconst.slice(2)),
				name: name,
				number: baconNumber
			});
		}

		return db.addTitleReferences(movieReference);
	// }).then(() => console.log('sent titles'));
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


let parent = new Set(['nm0000102']);
let found = new Set(['nm0000102']);

expand(parent, found, 1);

// tsv.getActorsNames(new Set(['nm0000102'])).then(res => res.forEach((name, nconst) => console.log(name, '---', nconst)));
// let movies = new Set();
// tsv.getCostars(new Set(['nm0000102']), new Set(['nm0000102']), movies).then(res => res.forEach((name, nconst) => console.log(name, '---', nconst)));






