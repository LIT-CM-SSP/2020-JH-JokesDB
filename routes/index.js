const { query } = require('express');
var express = require('express');
var router = express.Router();
var mysql = require('mysql');

// SSP: Create a MySql connection pool
var pool = mysql.createPool({
  connectionLimit: 5,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

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


   pool.getConnection(function(err, connection){
     if (err) {
      // SSP: Got an error, handle it
      if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT'){
        console.log("Got a PROTOCOL_SEQUENCE_TIMEOUT error .... ignoring");
      }
      else {
        console.log("Got a DB error when trying to connect", err);
      }

      res.render('error', {error: err});

     }
     else {
      // SSP: No error, lets use the connection
      connection.query('SELECT * FROM jokes', function(err, results, fields){
        if (err)
        {
          // SSP: Handle the error
          res.render('error', {error: err});
        }

        var allJokes = new Array();

        for (let i=0; i < results.length; i++) {
          let joke = {};
          joke.id = results[i].id;
          joke.text = results[i].text;
          joke.date = new Date(results[i].date);

          allJokes.push(joke);
        }

        connection.release();
        
        res.render('jokeList', { jokes: allJokes });

      });

     }
   });

  
});

router.get('/delete/:id', function(req, res){
  console.log(`Deleting joke ${req.params.id}`);

  pool.getConnection(function(err, connection) {
    if (err) {
      // SSP: Got an error, handle it
      if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT'){
        console.log("Got a PROTOCOL_SEQUENCE_TIMEOUT error .... ignoring");
      }
      else {
        console.log("Got a DB error when trying to connect", err);
      }

      res.render('error', {error: err});

     }
     else {
       // SSP: No error, should be able to issue a query
       connection.query('DELETE from jokes where id=?', [req.params.id], function(err, results, fields){
        if (err)
        {
          // SSP: Handle the error
          res.render('error', {error: err});
        }
        else {
          // SSP: Looks like joke has been deleted
          connection.release();

          res.redirect('/');
        }

       });
     }
  });
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
    newJoke.text = req.body.jokeText;
    newJoke.date = new Date();

    pool.getConnection(function(err, connection) {
      if (err) {
        // SSP: Got an error, handle it
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT'){
          console.log("Got a PROTOCOL_SEQUENCE_TIMEOUT error .... ignoring");
        }
        else {
          console.log("Got a DB error when trying to connect", err);
        }
  
        res.render('error', {error: err});
  
       }
       else {
         // SSP: All is good, let's use the connect to issue a query
         connection.query('INSERT INTO jokes (text, date) VALUES(?,?)',[newJoke.text, newJoke.date], function(err, results, fields){
          if (err)
          {
            // SSP: Handle the error
            res.render('error', {error: err});
          }
          else {
            // SSP: Just for demo purposes here is how you get the auto increment field
            newJoke.id = results.insertId;
            console.log(`The Id of the new Joke is ${newJoke.id}`);

            connection.release();

            res.redirect('/');
          }
         });
       }
    });
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
