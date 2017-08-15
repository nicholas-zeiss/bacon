/**
 *	This module allows us to find images for a list of actors. It uses the mediawiki php api
 * to first query wikipedia for an image from an actor's article, should one exist, and find
 * the file name. It then retreives the direct url for that file from wikimedia commons.
 *
 * TODO: see if smaller versions of the image can be found
 */


const axios = require('axios');
const querystring = require('querystring');


//gives us the url to query wikipedia for a list of actors and the files on their pages
function searchNamesUrl(names) {
	return 'https://en.wikipedia.org/w/api.php?' + querystring.stringify({
		action: 'query',
		format: 'json',
		prop: 'images',
		titles: names.join('|'),
		redirects: 1,
		imlimit: '500'
	});
}
 

//gives us the url to query wikimedia commons for the image urls of a list of files
function searchImagesUrl(files) {
	return 'https://commons.wikimedia.org/w/api.php?' + querystring.stringify({
		action: 'query',
		format: 'json',
		prop: 'imageinfo',
		titles: files.join('|'),
		iiprop: 'url|metadata',
		iiurlwidth: '400'
	});
}


/**
 * Given an array of actor names, find an image title for each one or null if none exist.
 *
 * inputs:
 * actors: [ name1, name2, ... ]
 *
 * output: { name1: fileTitle1, ... }  (fileTitles can be non empty str or null)
 */
function findImageTitles(actors) {
	return axios({
		method: 'get',
		url: searchNamesUrl(actors)
	})
	.then(result => {
		let redirectMap = {};
		let redirects = result.data.query.redirects || [];

		let output = {};
		let pages = result.data.query.pages;

		redirects.forEach(redirect => redirectMap[redirect.to] = redirect.from);

		for (let page in pages) {
			let name = redirectMap[pages[page].title] || pages[page].title;

			if (pages[page].images && pages[page].images.length) {
				let images = pages[page].images.filter(img => img.title.match(/jpg$|png$/i));
				output[name] = images.length ? images[0].title : null;
			}
		}

		//if an actor didn't get returned a page we add them to output here
		actors.forEach(actor => {
			output[actor] = output[actor] || null;
		});

		return output;
	})
	.catch(error => {
		console.log('error getting image titles:\n', error);
		throw error;
	});
}


/**
 * Given an object of actor names and file titles, find a url for each file title or null if none exist.
 * If the image also has pesky exif orientation data that would cause it to rotate we record that as well.
 *
 * inputs:
 * images: { name1: fileTitle1 ... }	(fileTitles can be non empty str or null)
 *
 * output: { name1: { url: fileUrl1, orientation: orientation1 ] ... } OR null 
 * (fileUrls can be non empty str or null, orientation is in standard exif format and defaults to 1)
 */
function findImageUrls(images) {
	let titlesToSearch = [];
	let titleToName = {};
	let output = {};

	for (let name in images) {
		if (images[name]) {
			titlesToSearch.push(images[name]);
			titleToName[images[name]] = name;
		} else {
			output[name] = null;
		}
	}

	if (!titlesToSearch.length) {
		return output;
	}

	return axios({
		method: 'get',
		url: searchImagesUrl(titlesToSearch)
	})
	.then(result => {
		let pages = result.data.query.pages;

		for (let pageid in pages) {
			let page = pages[pageid];
			let name = titleToName[page.title]
			let url = null;
			let orientation = 1;

			if (page.imageinfo && page.imageinfo.length) {
				url = pages.imageinfo[0].thumburl;

				pages.imageinfo[0].metadata.forEach(data => {
					if (data.name === 'Orientation') {
						orientation = data.value;
					}
				});
			}

			output[name] = { url, orientation }
		}

		return output;
	})
	.catch(error => {
		console.log('error getting image urls:\n', error);
		throw error;
	});
}


//put it all together
module.exports = function(actors) {
	return findImageTitles(actors).then(imageTitles => {
		return findImageUrls(imageTitles);
	})
	.catch(error => {
		console.log('error getting images:\n', error);
		throw error;
	});
}

