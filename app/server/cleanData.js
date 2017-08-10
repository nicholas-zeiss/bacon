const tsv  = require('./tsvUtils');


function cleanPrincipals(row, stream) {
	let tconst = row.match(/^([^\t]+)/)

	if (this.tconsts.has(tconst)) {
		stream.write(row);
	}
}


function cleanTSV() {

	let basicsInput = {
		file: 'title.basics.tsv',
		matches: new Set(),
		cb: function(row) {
			let movie = row.match(/^([^\t]+)\t([^\t]+)\t([^\t]+)/);

			if (movie && movie[2] == 'movie') {
				this.matches.add(movie[1]);
			}
		}
	};


	let basicsOutput = {
		file: 'movie.basics.tsv',
		cb: function(row, stream) {
			let movie = row.match(/^([^\t]+)\t([^\t]+)\t([^\t]+)/);

			if (movie && movie[2] == 'movie') {
				stream.write(`${movie[1]}\t${movie[3]}\n`);
			}
		}
	};


	let principalsInput = {
		file: 'title.principals.tsv',
		matches: null,
		cb: function() {}
	};


	let principalsOutput = {
		file: 'movie.principals.tsv',
		cb: function(row, stream) {
			let tconst = row.match(/^[^\t]+/);

			if (tconst && this.tconsts.has(tconst[0])) {
				stream.write(row);
			}
		}
	};


	let namesInput = {
		file: 'name.basics.tsv',
		matches: null,
		cb: function() {}
	}


	let namesOutput = {
		file: 'names.tsv',
		cb: function(row, stream) {
			let clipped = row.match(/^[^\t]+\t[^\t]+/);
			if (clipped) {
				stream.write(clipped[0] + '\n');
			}
		}
	}


	// tsv.traverseTSV(basicsInput, basicsOutput)
	// .then(tconsts => {
	// 	principalsOutput.tconsts = tconsts;

	// 	return tsv.traverseTSV(principalsInput, principalsOutput);
	// })
	tsv.traverseTSV(namesInput, namesOutput)
	.then(() => {
		console.log('removed all non movies')
	});
}


cleanTSV();




