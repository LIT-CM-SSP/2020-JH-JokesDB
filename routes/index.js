var express = require('express');
const { render } = require('../app');
var router = express.Router();

var allJokes = new Array();
var jokesID = 1;

var joke = {};
joke.id = jokesID++;
joke.text = "Knock, knock. Who is there?";
joke.date = new Date();

allJokes.push(joke);

joke = {
 id: jokesID++,
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
  console.log(`From submitted with these values ${req.body.jokeText} and ${req.body.submit}`);

  if (req.body.submit == "Cancel")
  {
    res.redirect('/');
  }
  else
  {
    console.log("Adding a new joke");
    //Todo
    // Create a new joke object with the text of the joke being equal to the value
    // of the jokeText input field. Then add this new joke to the allJokes array.

    let newJoke = {};
    newJoke.id = jokesID++;
    newJoke.text = req.body.jokeText;
    newJoke.date = new Date();

    allJokes.push(newJoke);

    res.redirect('/');
  }
});


module.exports = router;
