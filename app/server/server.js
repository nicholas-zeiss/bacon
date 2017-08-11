const bodyParser = require('body-parser')
const express = require('express');
const path = require('path');

const baconPath = require('./baconController');
const db = require('./db');


const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../app')));



app.get('/', (req, res) => {
	res.render('index.html');
});


app.post('/name', (req, res) => {
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
				res.sendStatus(500)
			});
		
		} else {
			res.status(300).json(actors);	
		}
	})
	.catch(error => 
		res.sendStatus(500)
	);
});


app.post('/nconst', (req, res) => {
	baconPath(req.body.nconst, req.body.number, [])
	.then(path => {
		res.status(200).json(path)
	})
	.catch(error => {
		res.sendStatus(500)
	});
});



const port = process.env.PORT || 4000;

app.listen(port, () => console.log('Listening on port ', port));


