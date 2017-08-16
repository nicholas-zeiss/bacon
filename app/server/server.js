/**
 * This module sets up the server for our web app using express and the utilities in baconController.js, db.js, and imageFinder.js
 */


const bodyParser = require('body-parser')
const express = require('express');
const path = require('path');

const baconPath = require('./baconController');
const db = require('./db');
const getImages = require('./imageFinder');


const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../app')));


app.get('/', (req, res) => {
	res.render('index.html');
});


//posts to name are requests for the path between name and Kevin Bacon, find one if one exists
//and send it, or send an appropriate error
app.post('/name', (req, res) => {
	//validate request
	if (!req.body || !req.body.name || (typeof req.body.name !== 'string')) {
		res.sendStatus(400);
		return;
	}

	//as names are not unique in our db we return all matches and respond according to the number of matches
	db.getActorReferences(req.body.name)
	.then(actors => {
		if (actors.length == 0) {
			res.sendStatus(404);
		
		} else if (actors.length == 1) {
			baconPath(actors[0].nconst, actors[0].number, [])
			.then(path => {
				res.status(200).json(path);
			})
			.catch(error => {
				res.sendStatus(500);
			});
		
		//if name not unique send all matched actors and await a call to /nconst
		} else {
			actors.forEach(actor => {
				delete actor._id;
			});

			res.status(300).json(actors);	
		}
	})
	.catch(error => {
		res.sendStatus(500);
	});
});


//when the web app has searched for a non unique name clarification by nconst and degree of separation is required and handled here
//req.body should be { nconst: number, number: int }
app.post('/nconst', (req, res) => {
	//validate request
	if (!req.body
		  || (!req.body.nconst || typeof req.body.nconst !== 'number')
		  || (!req.body.number || typeof req.body.number !== 'number' || number > 6 || number < 0)
		 ) {
		res.sendStatus(400);
		return;
	}

	baconPath(req.body.nconst, req.body.number, [])
	.then(path => {
		res.status(200).json(path)
	})
	.catch(error => {
		if (error === `nconst ${req.body.nconst} does not exist in the db`) {
			res.sendStatus(404);
		} else {
			res.sendStatus(500);
		}
	});
});


//once the web app has received a path it immediately requests for images of the actors in it who do not already have images in the db
//we gather those image urls, send them, and add them to the db here
//req.body should be [ { name: str, nconst: int }, ... ]
app.post('/images', (req, res) => {
	//validate
	if (!req.body || !req.body instanceof Array || !req.body.length) {
		res.sendStatus(400);
		return;
	}

	let names = [];
	let nameToNconst = {};

	req.body.forEach(actor => {
		names.push(actor.name);
		nameToNconst[actor.name] = actor.nconst;
	});

	console.log('calling getImages w/ names:\n', names)

	getImages(names)
	.then(imageUrls => {
		for (let name in imageUrls) {
			if (imageUrls[name]) {
				db.addActorImageUrl(nameToNconst[name], imageUrls[name]);
			}
		}
		
		console.log('getImages returned this in server.js:\n', imageUrls);

		res.status(200).json(imageUrls);
	})
	.catch(error => {
		console.log('getImages threw error:\n', error);
		
		res.sendStatus(500);
	});
});


const port = process.env.PORT || 4000;

app.listen(port, () => console.log('Listening on port ', port));


