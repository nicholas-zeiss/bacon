/**
 *
 *  This module downloads the IMDb dataset from AWS. Run this for title.basics.tsv.gz, title.principals.tsv.gz, and name.basics.tsv.gz
 *
**/


const AWS = require('aws-sdk');
const s3 = new AWS.S3();

[
	'name.basics.tsv.gz',
	'title.basics.tsv.gz',
	'title.principals.tsv.gz'
]
	.forEach(file => {
		const out = require('fs').createWriteStream(__dirname + '/data/' + file, 'binary');

		s3
			.getObject({
				Bucket: 'imdb-datasets',
				Key: 'documents/v1/current/' + file,
				RequestPayer: 'requester'
			})
			.createReadStream()
			.pipe(out);		
	});


