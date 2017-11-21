/**
 *
 *	This module takes our cleaned IMDb data and with it creates a database for our Bacon tree. Starting off with
 *	Kevin Bacon himself, it finds all movies in which he stars and from that generates a list of child actors. It adds all
 *	these movies and child actors to the actors and movies collections in the db, and adds the link between each child actor and 
 *	Kevin Bacon to the childToParent collection. It then recurses on those child actors, finding their child actors and adding them
 *	to the database, etc until 6 degrees of separation are reached.
 *
**/


const tsv = require('./tsvUtils');
const db = require('../dbController');


function buildDatabase(parentActors, indexedActors, indexedMovies, depth) {
	if (depth == 7) {
		console.log('Finished buildDatabase calls');
		return;
	}

	console.log('building depth ', depth);
	
	const childNconsts = new Set();

	tsv.getChildActors(parentActors, indexedActors, indexedMovies)
		.then(result => {
			
			result.childActors
				.forEach((val, nconst) => childNconsts.add(nconst));

			return Promise.all([
				result.childActors,
				tsv.getActorInfoByNconst(childNconsts),
				tsv.getMovieInfoByTconst(result.movies)
			]);
		
		})
		.then(([childToParent, actorInfo, movieInfo]) => {
			const childParentDocs = [];
			const actorDocs = [];
			const movieDocs = [];

			for (let [ nconst, { _id, movie_id, parent_id } ] of childToParent) {
				if (actorInfo.has(nconst) && (movieInfo.has(movie_id) || indexedMovies.has(movie_id))) {

					indexedActors.add(nconst);
					actorDocs.push(actorInfo.get(nconst));
					childParentDocs.push({
						_id,
						parent_id,
						movie_id: Number(movie_id.slice(2))
					});

					if (!indexedMovies.has(movie_id)) {
						indexedMovies.add(movie_id);
						movieDocs.push(movieInfo.get(movie_id));
					}
				}
			}
			
			db.addChildParent(childParentDocs);
			db.addActorInfo(actorDocs);
			db.addMovieInfo(movieDocs);
		})
		.then(() => {
			buildDatabase(childNconsts, indexedActors, indexedMovies, depth + 1);
		})
		.catch(err => console.log(err));
}


// clear db and generate Bacon tree. 0000102 is the nconst for Kevin Bacon.
db.resetDb()
	.then(() => {
		buildDatabase(new Set([ 'nm0000102' ]), new Set([ 'nm0000102' ]), new Set(), 1);
	});

