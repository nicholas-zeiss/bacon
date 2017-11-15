/**
 *
 *	This module has utilities to take a raw IMDb tsv and write a new tsv w/o information we do not need in correct formatting.
 *	These utilities also ensure improperly formatted rows are removed. Run/require this file to clean the data.
 *
**/


const tsv  = require('./tsvUtils');


// Takes title.basics.tsv, which holds all movies/tv shows/episodes etc in the dataset, and output only non pornographic movie rows to movie.basics.tsv.
// It resolves to a set of tconsts for such movies which we need to clean title.principals.tsv.
function cleanBasics() {
	const basicsInput = {
		file: 'title.basics.tsv',
		matches: new Set(),
		cb(row) {
			// parantheses correspond to tconst, type, and whether the movie is pornographic (0 for no, 1 for yes)
			const movie = row.match(/^(tt\d{7})\t([^\t]+)\t[^\t]+\t[^\t]+\t([^\t])+\t[^\t]+\t[^\t]+\t[^\t]+\t[^\t\n]+\n$/);

			if (movie && movie[2] == 'movie' && movie[3] == '0') {
				this.matches.add(movie[1]);
			}
		}
	};

	const basicsOutput = {
		file: 'movie.basics.tsv',
		cb(row, stream) {
			// parantheses correspond to tconst, type, title, is pornographic, and year released
			const movie = row.match(/^(tt\d{7})\t([^\t]+)\t([^\t]+)\t[^\t]+\t([^\t])+\t([^\t]+)\t[^\t]+\t[^\t]+\t[^\t\n]+\n$/);

			if (movie && movie[2] == 'movie' && movie[4] == '0') {
				// writes a row holding tconst title year
				stream.write(`${movie[1]}\t${movie[3]}\t${movie[5]}\n`);
			}
		}
	};

	return tsv.traverseTSV(basicsInput, basicsOutput);
}


// Given a set of tconsts to be preserved, clean title.principals.tsv to movie.principals.tsv such that only
// rows with corresponding tconsts are preserved.
function cleanPrincipals(tconsts) {
	const principalsInput = {
		file: 'title.principals.tsv',
		matches: null,
		cb() {}
	};

	const principalsOutput = {
		file: 'movie.principals.tsv',
		tconsts: tconsts,
		cb(row, stream) {
			const tconst = row.match(/^(tt\d{7})\t[^\t\n]+\n$/);

			if (tconst && this.tconsts.has(tconst[1])) {
				stream.write(row);
			}
		}
	};

	return tsv.traverseTSV(principalsInput, principalsOutput);
}	


// Cleans name.basics.tsv to name.tsv, preserving only rows where actor/actress is one of the professions
// and filtering out everything but nconst name dob dod professions
function cleanNames() {
	const namesInput = {
		file: 'name.basics.tsv',
		matches: null,
		cb() {}
	};


	const namesOutput = {
		file: 'names.tsv',
		cb(row, stream) {
			const clipped = row.match(/^(nm\d{7}\t[^\t]+\t[^\t]+\t[^\t]+\t[^\t]+)\t[^\t\n]+\n$/);
			
			if (clipped && (row.includes('actor') || row.includes('actress'))) {
				stream.write(clipped[1] + '\n');
			}
		}
	};

	return tsv.traverseTSV(namesInput, namesOutput);
}


// perform the actual cleaning
cleanBasics()
	.then(tconsts => {
		console.log('cleaned basics');
		return cleanPrincipals(tconsts);
	})
	.then(() => console.log('cleaned principals'));

cleanNames()
	.then(() => console.log('cleaned names'));

