/**
 *
 *	This module allows us to find images for a list of actors. It uses the mediawiki php api to first query wikipedia
 *  for images from an actor's article, should they exist, and finds the file names. It then retreives the url for 
 *  the first image title it can find that is hosted on wikimedia commons.
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


// Given an array of actor names, find all the image titles on their wikipedia page,
// should they exist
function findImageTitles(actors) {
	return axios({
		method: 'get',
		url: searchNamesUrl(actors)
	})
		.then(result => {

			const nameToImageTitles = {};
			const pages = result.data.query.pages;
			const redirects = result.data.query.redirects || [];
			
			// maps a name we are redirected to by wikipedia to the original name in input
			// eg, nameRedirectMap['Charlie Chaplin'] = 'charles      chaplin'
			const nameRedirectMap = {};

			redirects.forEach(redirect => nameRedirectMap[redirect.to] = redirect.from);

			for (let page in pages) {
				const name = nameRedirectMap[pages[page].title] || pages[page].title;

				if (pages[page].images && pages[page].images.length) {
					nameToImageTitles[name] = pages[page].images
						.filter(img => img.title.match(/jpg$|png$/i))		// wikipedia pages are full of svg logos/icons, filter those out
						.map(img => img.title);
				}
			}

			actors.forEach(actor => nameToImageTitles[actor] = nameToImageTitles[actor] || []);

			return nameToImageTitles;

		})
		.catch(error => {
			console.log('error getting image titles:\n', error);
			throw error;
		});
}


// Given an array of image titles and the name of the corresponding actor, find the first
// title that is hosted on wikimedia and return its direct url and info page url along with
// the actor name
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
			console.log('Error searching wikimedia:\n', error);
			throw error;
		});
}


// Given the map of actor names to arrays of image titles created above, search for those titles
// on wikimedia commons and return urls if any titles are found
function findImageUrls(imageTitles) {
	const searchesToMake = [];
	const nameToImageUrl = {};

	for (let name in imageTitles) {
		if (imageTitles[name].length) {
			searchesToMake.push(searchWikimedia(name, imageTitles[name]));
		} else {
			nameToImageUrl[name] = { imgUrl: '', imgInfo: '' };
		}
	}

	if (!searchesToMake.length) {
		return nameToImageUrl;
	}

	return Promise.all(searchesToMake)
		.then(results => {			
			
			results.forEach(result => {
				nameToImageUrl[result.name] = {
					imgUrl: result.imgUrl,
					imgInfo: result.imgInfo
				};
			});

			return nameToImageUrl;

		})
		.catch(error => {
			console.log('error getting image urls:\n', error);
			throw error;
		});
}


// Joins the above logic together and given an array of actor names this returns a promise
// resolving to a map of actor names to an object holding an image url and info page url
// (urls are empty strings if no image found)
module.exports = function(actors) {
	return findImageTitles(actors)
		.then(findImageUrls)
		.catch(error => {
			console.log('error getting images:\n', error);
			throw error;
		});
};

