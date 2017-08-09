const tsv = require('./tsvUtils');
const db = require('./db');



function expand(parents, foundActors, baconNumber) {
	console.log('calling expand');
	if (baconNumber == 2) {
		return;
	}

	let movies = new Set();

	tsv.getCostars(parents, foundActors, movies).then(children => {
		console.log('got costars');
		let actorTree = [];
		parents.clear();

		for (let [child, connection] of children.entries()) {
			parents.add(child);
			
			actorTree.push({ 
				nconst: Number(child.slice(2)),
				parent: Number(connection[0].slice(2)),
				tconst: Number(connection[1].slice(2))
			});
		}

		Promise.all(tsv.getMoviesByTconsts(movies), tsv.getActorsNames(parents)).then(values => {
			console.log('got titles and names');
			movies = null;
			let titles = [], actors = [];

			for (let [tconst, title] of values[0].entries()) {
				titles.push({
					tconst: Number(tconst.slice(2)),
					title
				});
			}

			for (let [nconst, name] of values[1].entries()) {
				actors.push({
					nconst: Number(nconst.slice(2)),
					name,
					number: baconNumber
				});
			}

			return [titles, actors];
		}).then(values => {
			// while another Promise.all would be more elegant, we don't want these fighting over
			// the same database
			db.addTitleReferences(values[0]).then(res => {
				console.log('sent titles');
				db.addActorReferences(values[1]).then(res => {
					console.log('sent actor names');
					db.addTreeTable(actorTree, baconNumber - 1).then(res => {
						console.log('sent actor tree');
						values = null;
						actorTree = null;
						
						expand(parents, foundActors, baconNumber + 1);
					});
				});
			});
		});
	});
}


let bacon = new Set(['nm0000102']);

expand(bacon, bacon, 1);

