/**
 *
 *  This module sets up the server for our web app using express
 *
**/


const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

const db = require('./dbController');

const app = express();


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../app')));


app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../../app/index.html'));
});


// posts to name are requests for the path between name and Kevin Bacon, find one if one exists
// and send it, or send an appropriate error
app.post('/name', (req, res) => {
	if (!req.body || !req.body.name || (typeof req.body.name != 'string')) {
		res.sendStatus(400);
		return;
	}

	// as names are not guaranteed unique in our db we find all matches and respond according to the number of matches
	db.getActorsByName(req.body.name)
		.then(actors => {
			if (!actors.length) {
				res.sendStatus(404);
			
			} else if (actors.length == 1) {
				db.getBaconPath(actors[0])
					.then(path => res.status(200).json(path))	
					.catch(() => res.sendStatus(500));

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
				db.getBaconPath(actors[0])
					.then(path => res.status(200).json(path))	
					.catch(() => res.sendStatus(500));
			}
		})
		.catch(() => res.sendStatus(500));
});


const port = process.argv[2] ? Number(process.argv[2]) : 4080;
app.listen(port, () => console.log('bacon is listening to port ', port));

