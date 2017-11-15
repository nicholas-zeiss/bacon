/**
 *
 *  This module sets up the server for our web app using express and the utilities in baconController.js, db.js, and imageFinder.js
 *
**/


const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

const baconPath = require('./baconController');
const db = require('./db');
const getImages = require('./imageFinder');

const app = express();


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../app')));


app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../../app/index.html'));
});


// helper for /name and /nconst post requests
function sendBaconPath(nconst, number, res) {
	baconPath(nconst, number)
		.then(path => res.status(200).json(path))
		.catch(error => res.sendStatus(500));
}


// posts to name are requests for the path between name and Kevin Bacon, find one if one exists
// and send it, or send an appropriate error
app.post('/name', (req, res) => {
	if (!req.body || !req.body.name || (typeof req.body.name != 'string')) {
		res.sendStatus(400);
		return;
	}

	// as names are not unique in our db we return all matches and respond according to the number of matches
	db.getActorReferences(req.body.name)
		.then(actors => {
			if (!actors.length) {
				res.sendStatus(404);
			} else if (actors.length == 1) {
				sendBaconPath(actors[0].nconst, actors[0].number, res);		
			} else {
				actors.forEach(actor => delete actor._id);
				res.status(300).json(actors);	
			}
		})
		.catch(error => res.sendStatus(500));
});


// when the web app has searched for a non unique name clarification by nconst is required and handled here
// req.body should be number nconst
app.post('/nconst', (req, res) => {

	if (!req.body || !req.body.nconst || typeof req.body.nconst !== 'number') {
		res.sendStatus(400);
		return;
	}

	db.getActorNames([req.body.nconst])
		.then(result => {
			if (!result.length) {
				res.sendStatus(404);
			} else {
				sendBaconPath(result[0].nconst, result[0].number, res);
			}
		})
		.catch(error => {
			console.log('getActorNames threw error:\n', error);
			res.sendStatus(500);
		});
});


// once the web app has received a path it immediately requests images of the actors in it who do not already have images in the db
// we gather those image urls, send them, and add them to the db here
// req.body should be [ { name: str, nconst: int }, ... ]
app.post('/images', (req, res) => {
	
	if (!req.body || !(req.body instanceof Array) || !req.body.length) {
		res.sendStatus(400);
		return;
	}

	const names = [];
	const nameToNconst = {};

	req.body.forEach(actor => {
		names.push(actor.name);
		nameToNconst[actor.name] = actor.nconst;
	});

	getImages(names)
		.then(imageUrls => {
			const nconstToUrl = {};

			for (let name in imageUrls) {
				nconstToUrl[nameToNconst[name]] = imageUrls[name];
			}

			db.addActorImageUrls(nconstToUrl);
			res.status(200).json(imageUrls);
		})
		.catch(error => {
			console.log('getImages threw error:\n', error);
			res.sendStatus(500);
		});
});


const port = process.argv[2] ? Number(process.argv[2]) : 4080;
app.listen(port, () => console.log('bacon is listening to port ', port));



module.exports = app;

