const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

let url = 'mongodb://kevinbacon:kevinbacon@ds135382.mlab.com:35382/bacon';

MongoClient.connect(url, (err, db) => {
  assert.equal(null, err);

  db.collection('movieReference').createIndex({ tconst: 1 }, { unique: true });
  db.collection('actorReference').createIndex({ nconst: 1 }, { unique: true });
  db.collection('actorReference').createIndex({name: 'text'});
  db.collection('first').createIndex({ nconst: 1 }, { unique: true });
  db.collection('second').createIndex({ nconst: 1 }, { unique: true });
  db.collection('third').createIndex({ nconst: 1 }, { unique: true });
  db.collection('fourth').createIndex({ nconst: 1 }, { unique: true });
  db.collection('fifth').createIndex({ nconst: 1 }, { unique: true });
  db.collection('sixth').createIndex({ nconst: 1 }, { unique: true });


  db.collection('actorReference').insertOne({name:'Kevin Bacon', nconst: 102, number: 0})
  .then(res => {
  	console.log('database created');
  	db.close();
  })
  .catch(rej => {
  	console.log('database already exists');
  	db.close();
  });
});


exports.addActorReferences = function(documents) {
	console.log('sending actor references ', documents.length);

	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, db) => {
		  assert.equal(null, err);

		  db.collection('actorReference')
		  .insertMany(documents)
		  .then(res => {
		  	console.log('sent actor references');
		  	db.close(false, resolve);
		  })
		  .catch(rej => {
		  	console.log('failed to send actor references');
		  	db.close(false,resolve);
		  });
		});
	});
};


exports.addMovieReferences = function(documents) {
	console.log('sending movie references ', documents.length);
	
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, db) => {
		  assert.equal(null, err);

		  db.collection('movieReference')
		  .insertMany(documents)
		  .then(res => {
		  	console.log('sent movie references');
		  	db.close(false, resolve);
		  })
		  .catch(reject => {
		  	console.log('failed to send movie references');
		  	db.close(false, resolve);
		  })
		});
	});
};


exports.addTreeTable = function(documents, number) {
	let collection = [ 'first', 'second', 'third', 'fourth', 'fifth', 'sixth' ][number];
	console.log('sending actor tree ', documents.length);

	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, db) => {
		  assert.equal(null, err);

		  db.collection(collection)
		  .insertMany(documents)
		  .then(res => {
		  	console.log('sent actor tree');
		  	db.close(false, resolve);
		  })
		  .catch(rej => {
		  	console.log('failed to send actor tree');
		  	db.close(false,resolve);
		  });
		});
	});
};





