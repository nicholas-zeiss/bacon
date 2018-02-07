/**
 *
 *  This module sets up the server for our web app using express
 *
**/


const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

const db = require('./dbController');
const getImages = require('./imageFinder');

const app = express();


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../app')));


app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../../app/index.html'));
});


// helper for /name and /nconst post requests
function sendBaconPath(actor, res) {
	db.getBaconPath(actor)
		.then(path => {		
			if (path.some(node => node.actor.imgUrl === null)) {
				console.log('adding images');
				addImages(path, res);
			} else {
				res.status(200).json(path);
			}
		})
		.catch(() => res.sendStatus(500));
}


// helper for sendBaconPath
function addImages(pathToBacon, res) {
	const names = new Set();

	pathToBacon.forEach(node => {
		if (node.actor.imgUrl === null) {
			names.add(node.actor.name);
		}
	});

	getImages([...names])
		.then(nameToImageUrls => {
			pathToBacon.forEach(node => {
				if (node.actor.imgUrl === null) {
					const urls = nameToImageUrls[node.actor.name];

					node.actor.imgUrl = urls.imgUrl;
					node.actor.imgInfo = urls.imgInfo;
				}
			});
			console.log('sending path');
			res.status(200).json(pathToBacon);
		})
		.catch(() => res.sendStatus(500));
}


// posts to name are requests for the path between name and Kevin Bacon, find one if one exists
// and send it, send an appropriate error if no match is found, or send choices if multiple actors
// with that name are found
app.post('/name', (req, res) => {
	if (!req.body || !req.body.name || (typeof req.body.name != 'string')) {
		res.sendStatus(400);
		return;
	}

	db.getActorsByName(req.body.name)
		.then(actors => {
			if (!actors.length) {
				res.sendStatus(404);
			} else if (actors.length === 1) {
				sendBaconPath(actors[0], res);
			} else {
				res.status(300).json(actors);	
			}
		})
		.catch(() => res.sendStatus(500));
});


// when the web app has searched for a non unique name clarification by nconst is required and handled here
// req.body should be number nconst
app.post('/nconst', (req, res) => {
	if (!req.body || !req.body.nconst || typeof req.body.nconst !== 'number') {
		res.sendStatus(400);
		return;
	}

	db.getActorsByNconsts([req.body.nconst])
		.then(actors => {
			if (!actors.length) {
				res.sendStatus(404);
			} else {
				sendBaconPath(actors[0], res);
			}
		})
		.catch(() => res.sendStatus(500));
});


const port = process.argv[2] ? Number(process.argv[2]) : 8080;

app.listen(port, () => console.log('bacon is listening to port ', port));

