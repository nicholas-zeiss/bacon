# Six Degrees of Bacon
A web app that will show you the smallest possible link from an actor to Kevin Bacon in the parlour game [Six Degrees of Kevin Bacon](https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon). If a link from Kevin Bacton to the actor is found, the app will display an easy to follow arrow diagram that shows each actor and the movie linking them all the way to Kevin Bacon. The data this app is built on is the [public IMDb dataset](http://www.imdb.com/interfaces/).


## Implementation

Stack: MongoDB, Express, AngularJS, Node.js, AWS

Using the IMDb dataset (acquired via AWS), a tree is created where Kevin Bacon is the root and each of his children are actors that starred in a movie with him. Their children are all the actors they starred in movies with (excluding actors already included), and this pattern continues until a depth of 6 is reached. Using the latest IMDb dataset available on 2/6/2018, this tree will contain 471,607 unique actors linked by 205,606 unique movies.

Once this tree is created, it is used to setup our MongoDB database, which consists of two collections: actors and movies. Each document in actors contains that actor's relevant information and the IDs of each actor/movie link in their path to Kevin Bacon. The documents in movies store information relevant to each movie.

With the database setup, the web app is ready to go. With it a user can search for an actor, and if found, the full path from that actor to Kevin Bacon and information for that path will be returned and displayed to the user.


## Installation

First simply clone this repository and install dependencies:
```
$ git clone https://github.com/nicholas-zeiss/bacon.git
$ cd bacon/
$ npm i
```

To continue setting up the application, you will first need a valid Amazon Web Services account with which to download the IMDb dataset. Ensure that your credentials are saved
in your [shared credentials file](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html).

With that setup, add the directory to hold the dataset, download it, and unpack it with:
```
$ mkdir app/server/data/data
$ node app/server/data/getDataset.js
$ gzip -dk app/server/data/data/*
```

Next we'll extract the relevant information from this data into new files to speed up following steps:
```
$ node app/server/data/cleanDataset.js
```

Before continuing, ensure that you have setup a MongoDB database to hold the data we will create. I recommend that you create a local database for this purpose to speed up the process; you can then export it to any MongoDB instance you choose. You will want to create a file app/server/dbLogin.js and export from it a URL string connecting to this database. With that setup, we can now use our IMDb dataset to create the database with:
```
$ node app/server/data/createDatabase.js
```

Then, if desired, one can add images for each actor that will be displayed on the front-end to the database. Images are found on an actor's [Wikipedia](https://www.wikipedia.org/) page and then the direct URL/description page are found on [Wikimedia Commons](https://commons.wikimedia.org/wiki/Main_Page). Appropriate attribution information of the image will be stored and displayed on the front-end.

This is an optional step that both takes a long time to complete and greatly increases the size of the database; if you choose to skip it the images will still be found and sent to the front-end on each search for an actor. However, this greatly increases the response time of the server. If you do wish to complete the step note that you can terminate the process at anytime and any images already found will be preserved.

If you choose to do so, add images to the database with:
```
$ node app/server/data/addImages.js
```

Your database will now be ready to go! To start running the app use:
```
$ npm start
```

The app will now be running on your localhost on port 8080.

