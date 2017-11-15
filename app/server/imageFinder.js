/**
 *
 *	This module allows us to find images for a list of actors. It uses the mediawiki php api
 *	to first query wikipedia for an image from an actor's article, should one exist, and find
 *	the file name. It then retreives the direct url for that file from wikimedia commons.
 *
**/


const axios = require('axios');
const querystring = require('querystring');


// gives us the url to query wikipedia for a list of actors and the files on their pages
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
 

// gives us the url to query wikimedia commons for the image urls of a list of files
function searchImagesUrl(files) {
	return 'https://commons.wikimedia.org/w/api.php?' + querystring.stringify({
		action: 'query',
		format: 'json',
		prop: 'imageinfo',
		titles: files.join('|'),
		iiprop: 'url',
		iiurlwidth: '400'		// sets the width of the image referenced by the url
	});
}


/**
 *
 *	Given an array of actor names, find an image title for each one or null if none exist.
 *
 *	inputs:
 *	actors: [ str name1, ... ]
 *
 *	return: A promise resolving to { name1: str fileTitle1 OR null, ... }
 *
**/
function findImageTitles(actors) {
	
	return axios({
		method: 'get',
		url: searchNamesUrl(actors)
	})
		.then(result => {

			// redirects occur when eg we search wikipedia for charles chaplin and it redirects to charlie chaplin
			let redirectMap = {};
			let output = {};

			let redirects = result.data.query.redirects || [];
			let pages = result.data.query.pages;

			redirects.forEach(redirect => redirectMap[redirect.to] = redirect.from);

			for (let page in pages) {
				let name = redirectMap[pages[page].title] || pages[page].title;

				if (pages[page].images && pages[page].images.length) {
					// wikipedia pages are full of svg logos/icons, filter those out
					let images = pages[page].images.filter(img => img.title.match(/jpg$|png$/i));
					output[name] = images.length ? images[0].title : null;
				}
			}

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
 *
 *	Given an object of actor names and file titles, find a url for each file title or null if none exist.
 *
 *	inputs:
 *	images: { name1: str fileTitle1 OR null, ... }
 *
 *	return: A promise resolving to { name1: { imgUrl: str/null, imgInfo: str/null }, ... }
 *
**/
function findImageUrls(imageUrls) {
	
	let titlesToSearch = [];
	let titleToName = {};
	let output = {};


	for (let name in imageUrls) {
		if (imageUrls[name]) {
			titlesToSearch.push(imageUrls[name]);
			titleToName[imageUrls[name]] = name;
		} else {
			output[name] = { imgUrl: '', imgInfo: '' };
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
				let imgUrl = '';
				let imgInfo = '';
				let page = pages[pageid];
				let name = titleToName[page.title];

				if (page.imageinfo && page.imageinfo.length) {
					imgUrl = page.imageinfo[0].thumburl;
					imgInfo = page.imageinfo[0].descriptionshorturl;
				}

				output[name] = { imgUrl, imgInfo };
			}

			return output;
			
		})
		.catch(error => {
			console.log('error getting image urls:\n', error);
			throw error;
		});
}


/**
 *
 *	Put it all together...
 *
 *	inputs:
 *	actors: [ str name1, ... ]
 *
 *	return: A promise resolving to { name1: { imgUrl: str, imgInfo: str }, ... }
 *
**/
module.exports = function(actors) {
	return findImageTitles(actors)
		.then(imageTitles => {
			return findImageUrls(imageTitles);
		})
		.catch(error => {
			console.log('error getting images:\n', error);
			throw error;
		});
};

