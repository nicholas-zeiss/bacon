/**
 *
 *  This module downloads the IMDb dataset from AWS. Run this for title.basics.tsv.gz, title.principals.tsv.gz, and name.basics.tsv.
 *
**/


const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const out = require('fs').createWriteStream('/data/title.basics.tsv.gz', 'binary');


const params = {
	Bucket: 'imdb-datasets',
	Key: 'documents/v1/current/title.basics.tsv.gz',
	RequestPayer: 'requester'
};


s3.getObject(params)
	.createReadStream()
	.pipe(out);

