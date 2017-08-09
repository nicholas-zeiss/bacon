const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const out = require('fs').createWriteStream('title.basics.tsv.gz', 'binary');


const params = {
	Bucket: 'imdb-datasets',
	Key: 'documents/v1/current/title.basics.tsv.gz',
	RequestPayer: 'requester'
};


s3.getObject(params).createReadStream().pipe(out);

