var express = require('express');
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

router.get('/edit/:id', function(req, res){
  console.log(`Editing joke ${req.params.id}`);

  let jokeToEdit = allJokes.filter( (arrayElement) => arrayElement.id == req.params.id);

  // SSP: jokeToEdit should now be an array containing one joke object matching 
  // the id of the joke to edit.
  if (jokeToEdit.length != 0)
  {
    res.render('editJokeForm', {joke: jokeToEdit[0]});
  }
  else
  {
    // SSP: We should never get to this branch of the if statement unless the html was somehow
    // "hacked". Let's just redirect to the main page.
    res.redirect('/');
  }
  
});

router.post('/editJoke', function(req, res) {
  console.log(`Processing edit for joke ${req.body.id}`);

  if (req.body.submit == "Update")
  {
    // SSP: Let's get the id of the joke we are editing. This id is stored in a 
    // hidden text field in the form called 'id'.
    let idOfJokeToEdit = req.body.id;

    // SSP: The findIndex method on Javascript arrays returns the index that satisfies the provided
    // texting function or -1 if no element is found.
    let indexOfJokeToEdit = allJokes.findIndex( (arrayElement) => arrayElement.id == idOfJokeToEdit);

    // SSP: jokeToEdit should now be an array containing one Joke object that matches the
    // id of the joke we want to edit.

    let newJokeText = req.body.jokeText.trim();

    if (indexOfJokeToEdit != -1 && newJokeText.length != 0)
    {
      // SSP: Edit the text of the Joke we are editing to match the jokeText that
      // was entered in the form
      allJokes[indexOfJokeToEdit].text = newJokeText;

      // SSP: Let's also update the date property of the Joke to reflect
      // the current date and time
      allJokes[indexOfJokeToEdit].date = new Date();
    }
  }
  
  res.redirect('/');
  
})


module.exports = router;
