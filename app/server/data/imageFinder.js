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
function findImageTitles(names) {
	return axios({
		method: 'get',
		url: searchNamesUrl(names)
	})
		.then(result => {
			const nameToTitle = {};
			const pages = result.data.query.pages;
			const redirects = result.data.query.redirects || [];
			
			// maps a name we are redirected to by wikipedia to the original name in input
			// eg, nameRedirects['Charlie Chaplin'] = 'charles chaplin'
			const nameRedirects = {};

			redirects.forEach(redirect => nameRedirects[redirect.to] = redirect.from);

			for (let p in pages) {
				const page = pages[p];
				const name = nameRedirects[page.title] || page.title;

				if (page.images && page.images.length) {
					nameToTitle[name] = page.images
						.filter(img => img.title.match(/jpg$|png$/i))		// wikipedia pages are full of svg logos/icons, filter those out
						.map(img => img.title);
				}
			}

			names.forEach(name => nameToTitle[name] = nameToTitle[name] || []);

			return nameToTitle;
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
				imgUrl: '',
				imgInfo: '',
				name
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
	const searches = [];
	const nameToImageUrl = {};

	for (let name in imageTitles) {
		if (imageTitles[name].length) {
			searches.push(searchWikimedia(name, imageTitles[name]));
		} else {
			nameToImageUrl[name] = { imgUrl: '', imgInfo: '' };
		}
	}

	if (!searches.length) {
		return nameToImageUrl;
	}

	return Promise.all(searches)
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
// (map will not have names of actors that it could not find an image for)
module.exports = function(actors) {
	return findImageTitles(actors)
		.then(findImageUrls)
		.catch(error => {
			console.log('error getting images:\n', error);
			throw error;
		});
};

