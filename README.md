# Sudoku Solver
A web app that helps you solve sudoku puzzles. It can check whether a puzzle is valid and can solve the puzzle for you.  
Been living under a rock? Read about sudoku [here](https://en.wikipedia.org/wiki/Sudoku).  

## Installation

All you need to do to get this site up and running on a local is a few simple commands:
```
 $ git clone https://github.com/nicholas-zeiss/sudoku.git
 $ cd sudoku/
 $ npm i
 $ npm start
```
That's it! Sudoku Solver will now be running on your localhost at port 3000.

## Implementation

The front-end consists of HTML, CSS, and JS with jQuery. The backend runs off of Node and express. Note that es6 syntax is widely used so before the JS is sent to the browser it must be transpiled and bundled. Babel and webpack are included as are their configurations; simply running `npm start` will take care of the rest.

The code responsible for doing the actual heavy lifting and solving a sudoku board is a recursive [backtracking algorithm](https://en.wikipedia.org/wiki/Backtracking). Feel free to jump into [solver.js](app/solver.js) to check out my implimentation.



setup your aws credentials
create app/server/data/data
node app/server/data/getData.js
unzip


node app/server/data/cleanData.js

setup dbLogin before creating db