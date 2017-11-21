/**
 *
 *	This module allows us to find images for a list of actors. It uses the mediawiki php api to first query wikipedia
 *  for an image from an actor's article, should one exist, and finds the file name. It then retreives the url for 
 *  that file's page and the url to the file iteself from wikimedia commons.
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


function searchWikimedia(name, titles) {
	return axios({
		method: 'get',
		url: searchImagesUrl(titles)
	})
		.then(results => {
			const pages = results.data.query.pages;
			const output = { 
				name,
				imgUrl: '',
				imgInfo: ''
			};

			for (let pageid in pages) {
				const page = pages[pageid];

				if (page.imageinfo && page.imageinfo.length) {
					output.imgUrl = page.imageinfo[0].thumburl;
					output.imgInfo = page.imageinfo[0].descriptionshorturl;
					break;
				}
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

			const output = {};
			const redirectMap = {};
			const redirects = result.data.query.redirects || [];
			const pages = result.data.query.pages;

			redirects.forEach(redirect => redirectMap[redirect.to] = redirect.from);

			for (let page in pages) {
				const name = redirectMap[pages[page].title] || pages[page].title;

				if (pages[page].images && pages[page].images.length) {
					output[name] = pages[page]
						.images
						.filter(img => img.title.match(/jpg$|png$/i))		// wikipedia pages are full of svg logos/icons, filter those out
						.map(img => img.title);
				}
			}

			actors.forEach(actor => output[actor] = output[actor] || []);
			console.log('findImageTitles output:\n', output)
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
 *	imageTitles: { actorName1: str fileTitle1 OR null, ... }
 *
 *	return: A promise resolving to { name1: { imgUrl: str/null, imgInfo: str/null }, ... }
 *
**/
function findImageUrls(imageTitles) {
	const searchesToMake = [];
	const output = {};

	for (let name in imageTitles) {
		if (imageTitles[name].length) {
			searchesToMake.push(searchWikimedia(name, imageTitles[name]));
		} else {
			output[name] = { imgUrl: '', imgInfo: '' };
		}
	}

	if (!searchesToMake.length) {
		return output;
	}

	return Promise.all(searchesToMake)
		.then(results => {			
			results.forEach(result => {
				output[result.name] = {
					imgUrl: result.imgUrl,
					imgInfo: result.imgInfo
				};
			});

			return output;
		})
		.catch(error => {
			console.log('error getting image urls:\n', error);
			throw error;
		});
}

// findImageTitles([ 'Heath ledger', 'Tom hanks' ])
// 	.then(findImageUrls)
// 	.then(res => console.log(res))
// 	.catch(error => {
// 		console.log('error getting images:\n', error);
// 		throw error;
// 	});


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
		.then(findImageUrls)
		.catch(error => {
			console.log('error getting images:\n', error);
			throw error;
		});
};

