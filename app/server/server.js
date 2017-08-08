const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '../../app')));

app.get('/', (req, res) => {
	res.render('index.html');
});


const port = process.env.PORT || 4000;

app.listen(port, () => console.log('Listening on port ', port));