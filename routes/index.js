var express = require('express');
const { render } = require('../app');
var router = express.Router();

var allJokes = new Array();

var joke = {};
joke.id = 1;
joke.text = "Knock, knock. Who is there?";
joke.date = new Date();

allJokes.push(joke);

joke = {
 id: 2,
 text: "Did you hear about ...",
 date: new Date()
};

allJokes.push(joke);

/* GET home page. */
router.get('/', function(req, res, next) {

  /*
   * Connect to a DB
   * Get everything from the jokes table
   *    select * from jokes
   * Create a Jokes object for every row in the table and place in
   * an array.
   * Render jokeList.pug page and pass it the array of Jokes objects
   */

  res.render('jokeList', { jokes: allJokes });
});

router.get('/delete/:id', function(req, res){
  console.log(`Deleting joke ${req.params.id}`);

  let filteredJokes = allJokes.filter( (arrayElement) => arrayElement.id != req.params.id);

  allJokes = filteredJokes;
  
  res.redirect('/');
});

router.get('/createJoke', function(req, res) {
  console.log("Handling the /createJoke route");

  res.render('newJokeForm');
});

router.post('/newJoke', function(req, res) {
  console.log(`From submitted with thses values ${req.body.jokeText} and ${req.body.submit}`);

  res.render('newJokeForm');
});


module.exports = router;
