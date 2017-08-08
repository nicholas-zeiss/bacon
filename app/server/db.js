const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

let url = 'mongodb://kevinbacon:kevinbacon@ds135382.mlab.com:35382/bacon';

MongoClient.connect(url, (err, db) => {
  console.log(err);
  assert.equal(null, err);
  console.log("Connected successfully to server");

  db.close();
});