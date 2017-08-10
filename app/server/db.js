const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

let url = 'mongodb://kevinbacon:kevinbacon@ds135382.mlab.com:35382/bacon';

MongoClient.connect(url, (err, db) => {
  assert.equal(null, err);

  db.collection('movieReference').createIndex({ tconst: 1 }, { unique: true });
  db.collection('actorReference').createIndex({ nconst: 1 }, { unique: true });
  db.collection('first').createIndex({ nconst: 1 }, { unique: true });
  db.collection('second').createIndex({ nconst: 1 }, { unique: true });
  db.collection('third').createIndex({ nconst: 1 }, { unique: true });
  db.collection('fourth').createIndex({ nconst: 1 }, { unique: true });
  db.collection('fifth').createIndex({ nconst: 1 }, { unique: true });
  db.collection('sixth').createIndex({ nconst: 1 }, { unique: true });

  db.close();
});


exports.addActorReferences = function(documents) {
	console.log('sending actor names ', documents.length);
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, db) => {
		  assert.equal(null, err);

		  db.collection('actorReference')
		  .insertMany(documents)
		  .then(res => {
		  	console.log('resolved');
		  	db.close(false, resolve);
		  })
		  .catch(rej => {
		  	console.log('rejected');
		  	db.close(false,resolve);
		  });
		});
	});
};


exports.addTitleReferences = function(documents) {
	console.log('sending titles ', documents.length);
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, db) => {
		  assert.equal(null, err);

		  db.collection('movieReference')
		  .insertMany(documents)
		  .then(res => {
		  	console.log('resolved');
		  	db.close(false, resolve);
		  })
		  .catch(reject => {
		  	console.log('rejected');
		  	db.close(false, resolve);
		  })
		});
	});
};


exports.addTreeTable = function(documents, number) {
	console.log('sending actor tree ', documents.length);
	let collection = [ 'first', 'second', 'third', 'fourth', 'fifth', 'sixth' ][number];

	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, db) => {
		  assert.equal(null, err);

		  db.collection(collection)
		  .insertMany(documents)
		  .then(res => {
		  	console.log('resolved');
		  	db.close(false, resolve);
		  })
		  .catch(rej => {
		  	console.log('rejected');
		  	db.close(false,resolve);
		  });
		});
	});
};


// addTitleReferences([{ tconst: 1, title: 'foo' }, { tconst: 2, title: 'foo' }, { tconst: 3, title: 'foo' }, { tconst: 4, title: 'foo' }, ]).then(() => console.log('titles sent'));






