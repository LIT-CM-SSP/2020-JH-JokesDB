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

      // SSP: The query function is passed the query, an array of unknowns (if any) and a callback
      // function. The callback when called will be passed three arguments: error will be an Error 
      // if one occurred during the query; results will contain the results of the query; fields will 
      // contain information about the returned results fields (if any)
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

      // SSP: The query function is passed the query, an array of unknowns (if any) and a callback
      // function. The callback when called will be passed three arguments: error will be an Error 
      // if one occurred during the query; results will contain the results of the query; fields will 
      // contain information about the returned results fields (if any)
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

        // SSP: The query function is passed the query, an array of unknowns (if any) and a callback
        // function. The callback when called will be passed three arguments: error will be an Error 
        // if one occurred during the query; results will contain the results of the query; fields will 
        // contain information about the returned results fields (if any)
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

  // SSP: Get a connection from the pool
  pool.getConnection(function(err, connection) {

    // SSP: Check for errors
    if (err) {
      // SSP: Got an error, handle it
      if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT'){
        console.log("Got a PROTOCOL_SEQUENCE_TIMEOUT error .... ignoring");
      }
      else {
        console.log("Got a DB error when trying to connect", err);
      }
      // SSP: Render the error page
      res.render('error', {error: err});
    }
    else {
      // SSP: All is good, let's use the connect to issue a query

      // SSP: The query function is passed the query, an array of unknowns (if any) and a callback
      // function. The callback when called will be passed three arguments: error will be an Error 
      // if one occurred during the query; results will contain the results of the query; fields will 
      // contain information about the returned results fields (if any)
      connection.query('select * FROM jokes WHERE id=?',[req.params.id], function(err, results, fields){
        if (err)
        {
          // SSP: Handle the error
          res.render('error', {error: err});
        }
        else {
          // SSP: Create a joke object from the information we got back from the database query. We will
          // later pass this object to the editJokeForm.pug page.
          // Remember, the results object that is being passed to this callback function is an array
          // containing all the rows in the database which matched our query, which there should only
          // be one of.
          let jokeToEdit = {};
          jokeToEdit.id = results[0].id;
          jokeToEdit.text = results[0].text;
          jokeToEdit.date = new Date(results[0].date);

          // SSP: Now that we are finished with the results we can release the connection.
          connection.release();

          res.render('editJokeForm', {joke: jokeToEdit});
        }
      });
    }
  });  
});

router.post('/editJoke', function(req, res) {
  console.log(`Processing edit for joke ${req.body.id}`);

  if (req.body.submit == "Update")
  {
    // SSP: Let's create a new joke object to store this new "edited" joke
    let editedJoke = {};

    // SSP: Let's get the id of the joke we are editing. This id is stored in a 
    // hidden text field in the form called 'id'.
    editedJoke.id = req.body.id;

    // SSP: Let's get the new edited text of the joke. This is stored in a textarea
    // called jokeText. We'll also trim the text of whitespace while we are at it.
    editedJoke.text = req.body.jokeText.trim();

    // SSP: Let's set the date to now to reflect the time that this joke was edited
    editedJoke.date = new Date();

    // SSP: Get a connection from the pool
    pool.getConnection(function(err, connection) {

      // SSP: Check for errors
      if (err) {
        // SSP: Got an error, handle it
        if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT'){
          console.log("Got a PROTOCOL_SEQUENCE_TIMEOUT error .... ignoring");
        }
        else {
          console.log("Got a DB error when trying to connect", err);
        }
        // SSP: Render the error page
        res.render('error', {error: err});
      }
      else {
        // SSP: All is good, let's use the connect to issue a query

        // SSP: The query function is passed the query, an array of unknowns (if any) and a callback
        // function. The callback when called will be passed three arguments: error will be an Error 
        // if one occurred during the query; results will contain the results of the query; fields will 
        // contain information about the returned results fields (if any)
        connection.query('UPDATE jokes SET text=?, date=? WHERE id=?',[editedJoke.text, editedJoke.date, editedJoke.id], function(err, results, fields){
          if (err)
          {
            // SSP: Handle the error
            res.render('error', {error: err});
          }
          else {
            // SSP: Okay, looks like the UPDATE was successful. All that is left to do is release the
            // connection and redirect.
            connection.release();
            res.redirect('/');
          }
        });
      }
    }); 
  }
  else if (req.body.submit == "Cancel"){
    res.redirect('/');
  }
  
  
});


module.exports = router;
