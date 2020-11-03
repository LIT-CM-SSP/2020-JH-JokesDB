var express = require('express');
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

module.exports = router;
