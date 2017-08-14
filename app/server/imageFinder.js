
const axios = require('axios');
const querystring = require('querystring');


function searchNamesUrl(names) {
	return 'https://commons.wikimedia.org/w/api.php?' + querystring.stringify({
		action: 'query',
		format: 'json',
		prop: 'images',
		titles: names.join('|'),
		redirects: 1,
		imlimit: '500'
	});
}


function searchImagesUrl(files) {
	return 'https://commons.wikimedia.org/w/api.php?' + querystring.stringify({
		action: 'query',
		format: 'json',
		prop: 'imageinfo',
		titles: files.join('|'),
		iiprop: 'url'
	});
}


function findImageTitles(actors) {
	return axios({
		method: 'get',
		url: searchNamesUrl(names)
	})
	.then(result => {
		let redirectMap = {};
		let redirects = result.data.query.redirects || [];
		let normalized = result.data.query.normalized || [];

		let output = {};
		let pages = result.data.query.pages;


		redirects.forEach(redirect => redirectMap[redirect.to] = redirect.from);
		normalized.forEach(normal => redirectMap[normal.to] = normal.from)


		for (let page in pages) {
			let name = redirectMap[pages[page].title] || pages[page].title;

			if (pages[page].title.match(/^Category:/)) {
				output[name] = null;
			
			} else {
				output[name] = pages[page].images && pages[page].images.length ? pages[page].images[0].title : null;
			
			}
		}

		names.forEach(name => {
			output[name] = output[name] || null;
		})

		return output
	})
	.catch(error => {
		console.log('error');
		return error;
	});
}

//images => {  name: imagetitle }
function findImageUrls(images) {
	let imageTitles = [];
	let titleToName = {};
	let imageUrls = {};

	for (let name in images) {
		if (images[name]) {
			imageTitles.push(images[name]);
			titleToName[images[name]] = name;
		} else {
			imageUrls[name] = null;
		}
	}

	return axios({
		method: 'get',
		url: searchImagesUrl(imageTitles)
	})
	.then(result => {

		//result.data.query.pages => { pageNum: { title: image title, imageinfo: [ { url: image url } ] } }
		let pages = result.data.query.pages;

		for (let page in pages) {
			let name = titleToName[pages[page].title]

			imageUrls[name] = pages[page].imageinfo && pages[page].imageinfo.length ? pages[page].imageinfo[0].url : null;
		}

		return imageUrls;
	})
	.catch(error => {
		console.log('error');
		return error;
	});
}


function getImages(actors) {
	return findImageTitles(actors).then(imageTitles => {
		return findImageUrls(imageTitles);
	})
	.catch(error => {
		console.log('error getting images');
		return error;
	});
}

module.exports = getImages;
