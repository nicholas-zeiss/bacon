/**
 *
 *	Run this to find images for each actor in your database and add them there. It takes all the actors in the database
 *  that have not hand an image generated for them and splits them into batches. The batches are then processed
 *  serially (ie, the next batch will not start processing until the all images have been found for the previous batch
 *  and added to the database). This process takes quite a long time to complete and need not be done all at once; exiting early
 *	will not undo any completed updates.
 *
**/

const database = require('../dbController');
const getImages = require('./imageFinder');

const BATCH_SIZE = 10;


// Adds image info to a single actor in the database.
const updateActor = (db, _id, img) => (
	db.collection('actors').updateOne({ _id }, { $set: img })
);


// Processes a batch of actors. It finds images for each distinct actor name in the batch and
// returns a promise resolving to an array of updateActor calls.
const processBatch = (db, batch)  => {
	const nameToID = batch.reduce((nameToID, { _id, name }) => (
		Object.assign(nameToID, { [name]: _id })
	), {});

	return getImages(Object.keys(nameToID))
		.then(nameToImg => {
			const updates = [];

			for (let name in nameToImg) {
				const img = nameToImg[name];
				const id = nameToID[name];
				updates.push(() => updateActor(db, id, img));
			}

			return Promise.all(updates);
		});
};


// Finds all actors in the actor collection with unassigned images and resolves to an array of
// batches containing them.
const getBatches = db => (
	new Promise((resolve, reject) => {
		const batches = [];
		let currActors = [];
		let total = 0;


		const addActor = ({ _id, name}) => {
			if (currActors.length < BATCH_SIZE) {
				currActors.push({ _id, name });
			} else {
				batches.push(currActors);
				currActors = [{ _id, name }];
			}

			total++;
		};


		const terminate = () => {
			if (currActors.length) {
				batches.push(currActors);
				total += currActors.length;
			}

			console.log('Found ' + total + ' actors in need of an image');
			resolve(batches);
		};


		try {
			db.collection('actors')
				.find({ imgUrl: null })
				.forEach(addActor, terminate);

		} catch(err) {
			console.log('Error creating batches');
			reject(err);
		}
	})
);


// Given an array of batches it will process them serially. It resolves to the number
// of batches successfully processed.
const runBatches = (db, batches) => {
	const total = batches.length;

	console.log('Adding images for ' + total + ' batches of ' + BATCH_SIZE + ' actors');

	return batches.reduce((count, batch, i) => (
		count.then(n => (
			processBatch(db, batch)
				.then(() => {
					if (i % 50 === 0) {
						const percent = (i + 1) / total * 100;
						console.log(percent.toFixed(2) + '% complete');
					}

					return n + 1;
				})
				.catch(() => {
					console.log('Error processing batch #' + (i + 1));
					return n;
				})
		))
	), Promise.resolve(0));
};


// Puts all of the above together.
const addAllImages = () => (
	database.connectToDb((db, resolve, reject) => {
		getBatches(db)
			.then(runBatches.bind(null, db))
			.then(count => {
				console.log('Added images for ~' + count * BATCH_SIZE + ' actors');
				db.close(false, resolve);
			})
			.catch(err => {
				console.log('Error adding images:\n');
				console.log(err);
				db.close(false, reject);
			});
	})
);


addAllImages()
	.then(() => 'Terminating on success')
	.catch(() => 'Terminating on error');




