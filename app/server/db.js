const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

let url = 'mongodb://kevinbacon:kevinbacon@ds135382.mlab.com:35382/bacon';


function connectToDb(cb) {
	
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, db) => {
 			assert.equal(null, err);

 			cb(db)
 			.then(result => {
 				resolve(result);
 				db.close();
 			})
 			.catch(result => {
 				reject(result);
 				db.close();
 			})
 		});
	});
}


exports.resetDb = function() {
	
	return connectToDb(db => {
		return new Promise((resolve, reject) => {
			db.dropDatabase().then(() => {
			  db.collection('movieReference').createIndex({ tconst: 1 }, { unique: true });
			  db.collection('actorReference').createIndex({ nconst: 1 }, { unique: true });
			  db.collection('actorReference').createIndex({name: 'text'});
			  db.collection('first').createIndex({ nconst: 1 }, { unique: true });
			  db.collection('second').createIndex({ nconst: 1 }, { unique: true });
			  db.collection('third').createIndex({ nconst: 1 }, { unique: true });
			  db.collection('fourth').createIndex({ nconst: 1 }, { unique: true });
			  db.collection('fifth').createIndex({ nconst: 1 }, { unique: true });
			  db.collection('sixth').createIndex({ nconst: 1 }, { unique: true });

			  db.collection('actorReference')
			  .insertOne({
			  	name:'Kevin Bacon',
			  	nconst: 102,
			  	number: 0,
			  	dob: 1958,
			  	dod: 0,
			  	jobs: 'actor,producer,soundtrack',
			  	imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Kevinbacongfdl.PNG/428px-Kevinbacongfdl.PNG",
			  	imgOrientation: 1
			  })
			  .then(res => {
			  	resolve();
			  	console.log('database created');
			  });
			});
		});
	});
}


exports.addActorReferences = function(documents) {
	console.log('sending actor references ', documents.length);

	return connectToDb(db => {
		return new Promise((resolve, reject) => {
		  db.collection('actorReference')
		  .insertMany(documents)
		  .then(res => {
		  	console.log('sent actor references');
		  	db.close(false, resolve);
		  })
		  .catch(rej => {
		  	console.log('~~~~~~~~~~~~~\nfailed to send actor references\n~~~~~~~~~~~~~');
		  	console.log(rej.message);
		  	db.close(false, reject);
		  });
		});
	});
};


exports.addMovieReferences = function(documents) {
	console.log('sending movie references ', documents.length);

	return connectToDb(db => {
		return new Promise((resolve, reject) => {
		  db.collection('movieReference')
		  .insertMany(documents)
		  .then(res => {
		  	console.log('sent movie references');
		  	db.close(false, resolve);
		  })
		  .catch(rej => {
		  	console.log('~~~~~~~~~~~~~\nfailed to send movie references\n~~~~~~~~~~~~~');
		  	console.log(rej.message);
		  	db.close(false, reject);
		  });
		});
	});
};


exports.addTreeLevel = function(documents, number) {
	let collection = [ 'first', 'second', 'third', 'fourth', 'fifth', 'sixth' ][number];
	console.log('sending actor tree ', documents.length);

	return connectToDb(db => {
		return new Promise((resolve, reject) => {
		  db.collection(collection)
		  .insertMany(documents)
		  .then(res => {
		  	console.log('sent actor tree');
		  	db.close(false, resolve);
		  })
		  .catch(rej => {
		  	console.log('~~~~~~~~~~~~~\nfailed to send actor tree\n~~~~~~~~~~~~~');
		  	console.log(rej.message);
		  	db.close(false, reject);
		  });
		});
	});
};


exports.addActorImageUrl = function(nconst, image) {

	return connectToDb(db => {
		return new Promise((resolve, reject) => {
			db.collection('actorReference')
			.updateOne(
				{ nconst },
				{ $set: { imgUrl: image.url, imgOrientation: image.orientation }}
			)
			.then(res => {
				console.log('success adding url to database for ', nconst);
				db.close(false, resolve);
			})
			.catch(rej => {
				console.log('error', rej);
				db.close(false, reject);
			})
		});
	});
}


exports.getActorReferences = function(name) {
	
	return connectToDb(db => {
		return new Promise((resolve, reject) => {
			db.collection('actorReference')
			.find({ name: { $regex: "^" + name + "$", $options: "i" }})
			.toArray()
			.then(result => resolve(result))
			.catch(error => {
				console.log('error finding ', name);
				console.log(error.message);
				reject(error.message);
			});
		});
	}); 
}


exports.getActorNames = function(nconsts) {
	
	return connectToDb(db => {
		return new Promise((resolve, reject) => {
			db.collection('actorReference')
			.find({ nconst: { $in: nconsts }})
			.toArray()
			.then(result => resolve(result))
			.catch(error => {
				console.log('error finding ', name);
				console.log(error.message);
				reject(error.message);
			});
		});
	});
}


exports.getMovieNames = function(tconsts) {
	
	return connectToDb(db => {
		return new Promise((resolve, reject) => {
			db.collection('movieReference')
			.find({ tconst: { $in: tconsts }})
			.toArray()
			.then(result => resolve(result))
			.catch(error => {
				console.log('error finding ', name);
				console.log(error.message);
				reject(error.message);
			});
		});
	});
}


exports.getActorParent = function(nconst, table) {
	
	return connectToDb(db => {
		return new Promise((resolve, reject) => {
			db.collection(table)
			.findOne({ nconst })
			.then(result => resolve(result))
			.catch(error => {
				console.log('error finding ', name);
				console.log(error.message);
				reject(error.message);
			});
		});
	});
}

