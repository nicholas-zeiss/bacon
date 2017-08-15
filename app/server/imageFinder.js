
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


function searchCategoryUrl(category) {
	return 'https://commons.wikimedia.org/w/api.php?' + querystring.stringify({
		action: 'query',
		format: 'json',
		list: 'categorymembers',
		cmtitle: category,
		cmprop: 'title',
		cmtype: 'file'
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
		url: searchNamesUrl(actors)
	})
	.then(result => {
		let redirectMap = {};
		let redirects = result.data.query.redirects || [];
		let normalized = result.data.query.normalized || [];

		let output = {};
		let categories = {};
		let pages = result.data.query.pages;


		redirects.forEach(redirect => redirectMap[redirect.to] = redirect.from);
		normalized.forEach(normal => redirectMap[normal.to] = normal.from)


		for (let page in pages) {
			let name = redirectMap[pages[page].title] || pages[page].title;

			if (pages[page].title.match(/^Category:/)) {
				categories[name] = pages[page].title;
			} else {
				output[name] = pages[page].images && pages[page].images.length ? pages[page].images[0].title : null;
			}
		}

		// console.log('categories are ', categories);
		// console.log('regular output is ', output);

		return findCategoryUrls(categories, output, actors)
	})
	.catch(error => {
		console.log('error getting image titles:\n', error);
		throw error;
	});
}


//category => category_name
function findCategoryUrl(name, category) {
	// console.log(searchCategoryUrl(category))
	return axios({
		method: 'get',
		url: searchCategoryUrl(category)
	})
	.then(result => {
		// console.log('result from category http request is \n\n\n', result, '\n\n\n');
		return result.data.query && result.data.query.categorymembers && result.data.query.categorymembers.length ? [ name, result.data.query.categorymembers[0].title ] : null;
	})
	.catch(error => {
		throw error;
	})
}


//category => { name: category_name }
function findCategoryUrls(categories, output, actors) {
	let toSearch = [ output, actors ];

	for (let actor in categories) {
		toSearch.push(findCategoryUrl(actor, categories[actor]));
	}

	return Promise.all(toSearch).then(categoryFiles => {
		// console.log('categoryFiles is ', categoryFiles);

		let [ output, actors ] = categoryFiles.splice(0, 2);

		for (let categoryFile of categoryFiles) {
			if (categoryFile) {
				output[categoryFile[0]] = categoryFile[1];
			}
		}

		actors.forEach(name => {
			output[name] = output[name] || null;
		})

		return output;
	});
}



//images => {  name: imagetitle }
function findImageUrls(images) {
	let imageTitles = [];
	let titleToName = {};
	let imageUrls = {};

	// console.log('input to findImageUrls is ', images);

	for (let name in images) {
		if (images[name]) {
			imageTitles.push(images[name]);
			titleToName[images[name]] = name;
		} else {
			imageUrls[name] = null;
		}
	}

	// console.log('array being sent in findImageUrls :', imageTitles);

	if (!imageTitles.length) {
		return imageUrls;
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
		console.log('error getting image urls:\n', error);
		throw error;
	});
}


function getImages(actors) {
	return findImageTitles(actors).then(imageTitles => {
		return findImageUrls(imageTitles);
	})
	.catch(error => {
		console.log('error getting images:\n', error);
		throw error;
	});
}

module.exports = getImages;
