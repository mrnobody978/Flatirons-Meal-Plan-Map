// Imports ---------------------------------------------------------------------------------------------

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars'); //to enable express to work with handlebars
const Handlebars = require('handlebars'); // to include the templating engine responsible for compiling templates
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.
const { rmSync } = require('fs');
const { time } = require('console');

// Constants

const BYPASS_LOGIN = false; // ONLY SET TO TRUE FOR TESTING AND DEVELOPMENT.  Bypasses requirement to log in.

// Connect to database ---------------------------------------------------------------------------------

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// App settings ----------------------------------------------------------------------------------------

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Custom handlebars helpers
Handlebars.registerHelper('isEqual', (value1, value2) => {
  return value1 == value2;
});

// Routes ------------------------------------------------------------------------------------------

app.get("/", (req, res) => {
  res.redirect("/dashboard"); 
});

// For getting the style.css file and other stuff in resources
app.get("/resources/:filename", (req, res) => {
    res.sendFile(__dirname + "/resources/" + req.params.filename);
    
    // TODO Make this more secure
});

// Non-authenitcation middleware (opposite of auth)
const nonauth = (req, res, next) => {
    if (!BYPASS_LOGIN) {
        if (req.session.user) {
            // Default to login page.
            return res.redirect('/dashboard');
        }
        // Maybe add max time here
    }
    next();
};
// Include nonauth in any pages that require being logged out

// Routes for Registering

app.get("/register", nonauth, async (req, res) => {
  res.render("pages/register");
});

const usernameRegex = /^[A-Za-z0-9_.\-]{4,50}$/; // Username allows letters, numbers, and characters _ . - (6-50 characters total)
const passwordRegex = /^[^\s';]{6,50}$/; // Password allows any character excluding whitespace, ', and ; (6-50 characters total))
app.post("/register", nonauth, async (req, res) => {
  // TODO Add password reentry
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  if (!usernameRegex.test(username)) { // Invalid username
    res.render("pages/register", { messageType: 'warning', messageText: 'Invalid username.  Username must be 4-50 characters and contain only letters, numbers, and characters _ . and -' });
    return;
  }
  // TODO Maybe add more password checking to guarentee safe passwords
  if (!passwordRegex.test(password)) { // Invalid password
    res.render("pages/register", { messageType: 'warning', messageText: 'Invalid password.  Password must be at least 6 characters and cannot contain spaces, \', or ;', usernameDefault: username });
    return;
  }

  if (password != password2) { // Password doesn't match re-entered password
    res.render("pages/register", { messageType: 'warning', messageText: 'Passwords must match', usernameDefault: username });
    return;
  }

  const passwordHashed = await bcrypt.hash(password, 10); // 10 complexity, maybe increase this later

  const FIND_USERNAME_QUERY = "SELECT * FROM users WHERE username = $1 LIMIT 1;";
  const INSERT_USER_QUERY = "INSERT INTO users (username, password) VALUES ($1, $2);";

  db.task(async () => {
    let sameUsername = await db.any(FIND_USERNAME_QUERY, username);
    if (sameUsername.length > 0) {
      res.render("pages/register", { messageType: 'warning', messageText: 'Username is already in use, please choose a different username' });
      return;
    }

    await db.none(INSERT_USER_QUERY, [username, passwordHashed]);
    // TODO Call login post method with username and password information instead of going to dashboard
    req.url = '/login';
    req.method = 'POST';
    app._router.handle(req, res, (req1, res1) => {
        res1.redirect("/dashboard");
    });

  }).catch(err => {
    console.log("ERROR: An error occurred when trying to create an account:");
    console.log(err);
    res.render("pages/register", { messageType: 'error', messageText: 'An error has occurred, please try again later' });
  });

});

// Routes for logging in

app.get("/login", nonauth, (req, res) => {
    res.render("pages/login");
});

app.post("/login", nonauth, async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // TODO Check that username doesn't contain characters like "

    try {
        const FIND_USER_QUERY = "SELECT * FROM users WHERE username = $1 LIMIT 1;";
        const user = await db.any(FIND_USER_QUERY, username);
        if (user == undefined || user.length == 0) { // Invalid username
            res.render("pages/login", {messageType: 'warning', messageText: 'Invalid username or password', usernameDefault: username});
            return;
        }

        if (! await bcrypt.compare(password, user[0].password)) {
            // Invlaid password
            res.render("pages/login", {messageType: 'warning', messageText: 'Invalid username or password', usernameDefault: username});
            return;
        } else { // Log in and redirect
            user[0].password = "";
            req.session.user = user[0];
            req.session.save();
            res.redirect("/dashboard");
        }
    } catch (err) {
        console.log(err);
        res.render("pages/login", {messageType: 'error', messageText: 'An error occurred, please try again later', usernameDefault: username});
    }
});

// Authenitcation middleware
const auth = (req, res, next) => {
    if (!BYPASS_LOGIN) {
        if (!req.session.user) {
            // Default to login page.
            return res.redirect('/login');
        }
        // Maybe add max time here
    }
    next();
};
// Include auth in any pages that require being logged in

// Helper functions to get user info for logged in users, otherwise null
function getUserID (req) { return (req.session.user) ? req.session.user[0].user_id : null; }
function getUsername (req) { return (req.session.user) ? req.session.user[0].username : null; }

// Routes for logging out

app.get("/logout", auth, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }
        res.render("pages/logout", {timeout: false});
    });
});


// Routes for Dashboard
// On every load, selects a random restaurant from database to put in recommendation

app.get("/dashboard", auth, async (req, res) => {

  try {

    const recommendationQuery = `
    SELECT *
    FROM restaurants
    ORDER BY RANDOM()
    LIMIT 1;
    `;

    const restaurant = await db.one(recommendationQuery);

    res.render("pages/dashboard", { restaurant});

  } catch(err) {

    console.log("Error fetching random restaurant:", err);
    res.render("pages/dashboard", {restaurant: null});

  }

});

// Routes for Map

app.get("/map", auth, (req, res) => {
  res.render("pages/map");
});

// Start server and keep it listening ------------------------------------------------------------------
app.listen(3000);
console.log('Server is listening on port 3000');