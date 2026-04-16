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
const fs = require('fs');
const { rmSync } = require('fs');
const { time, profile } = require('console');
const { scrapeRestaurants } = require('./resources/scraper');  // To scrape restaurant data from the web
const { scrapeDeals } = require('./resources/dealScraper'); // To scrape weekly deal data from website
const multer = require('multer'); // Middleware to process uploaded profile images

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
app.get("/resources/userProfileImages/:filename", (req, res) => {
    res.sendFile(__dirname + "/resources/userProfileImages/" + req.params.filename);
});

app.get("/resources/:filename", (req, res) => {
    if (req.params.filename == "scraper.js") {
        res.status(404).json({error: 404});
        return;
    }

    res.sendFile(__dirname + "/resources/" + req.params.filename, (err) => {
        if (err && err.message.indexOf("ENOENT") == 0) {
            console.log("Resource not found");
            res.status(404).json({error: 404});
        }
    });

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

const usernameRegex = /^[A-Za-z0-9_.\-]{4,50}$/; // Username allows letters, numbers, and characters _ . - (4-50 characters total)
const passwordRegex = /^[^\s';]{6,50}$/; // Password allows any character excluding whitespace, ', and ; (6-50 characters total))
// Return -1 = An error occurred
// Return 0 = Good username
// Return 1 = Username doesn't fit regex
// Return 2 = Username is taken
async function checkUsernameChange(username, ignoreID) {
    const FIND_USERNAME_QUERY = "SELECT * FROM users WHERE username = $1 AND user_id != $2 LIMIT 1;";
    // TODO Make it so it ignores renaming
    try {
        if (!usernameRegex.test(username)) {
            return 1;
        }
        const usernameTaken = await db.any(FIND_USERNAME_QUERY, [username, ignoreID]);
        if (usernameTaken.length != 0) {
            return 2;
        }

        return 0;
    } catch (err) {
        console.log("An error occurred checking username validity", err);
        return -1;
    }
}

async function checkUsername(username) {
    return await checkUsernameChange(username, -1);
}

app.post("/register", nonauth, async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  // TODO Maybe add more password checking to guarentee safe passwords
  if (!passwordRegex.test(password)) { // Invalid password
    res.render("pages/register", { messageType: 'warning', messageText: 'Invalid password.  Password must be at least 6 characters and cannot contain spaces, \', or ;', usernameDefault: username });
    return;
  }

  if (password != password2) { // Password doesn't match re-entered password
    res.render("pages/register", { messageType: 'warning', messageText: 'Passwords must match', usernameDefault: username });
    return;
  }

  switch (await checkUsername(username)) {
    case -1:
      res.render("pages/register", { messageType: 'error', messageText: 'An error has occurred, please try again later' });
      return;
    case 1:
      res.render("pages/register", { messageType: 'warning', messageText: 'Invalid username.  Username must be 4-50 characters and contain only letters, numbers, and characters _ . and -' });
      return;
    case 2:
      res.render("pages/register", { messageType: 'warning', messageText: 'Username is already in use, please choose a different username' });
      return;
  }

  const passwordHashed = await bcrypt.hash(password, 10); // 10 complexity, maybe increase this later

  const INSERT_USER_QUERY = "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *;";

  db.task(async (t) => {

    const newUser = await t.one(INSERT_USER_QUERY, [username, passwordHashed]);

    // Auto-login: Set the session user
    newUser.password = ""; // Clear password for security
    req.session.user = newUser;
    req.session.save();

    res.redirect("/dashboard");

  }).catch(err => {
    console.log("ERROR: An error occurred when trying to create an account:", err);
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
      res.render("pages/login", { messageType: 'warning', messageText: 'Invalid username or password', usernameDefault: username });
      return;
    }

    if (! await bcrypt.compare(password, user[0].password)) {
      // Invlaid password
      res.render("pages/login", { messageType: 'warning', messageText: 'Invalid username or password', usernameDefault: username });
      return;
    } else { // Log in and redirect
      user[0].password = "";
      req.session.user = user[0];
      req.session.save();
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.log(err);
    res.render("pages/login", { messageType: 'error', messageText: 'An error occurred, please try again later', usernameDefault: username });
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
function getUserID(req) { return (req.session.user) ? req.session.user.user_id : null; }
function getUsername(req) { return (req.session.user) ? req.session.user.username : null; }

// REQUIRES DATABASE QUERY, use above helpers if possible
// Returns an object containing the user_id, username, real_name, and image_path of the current user
async function getProfileDetails(req) {
    try {
        const details = await db.any("SELECT user_id, username, real_name, image_path FROM users WHERE user_id = $1 LIMIT 1;", getUserID(req));
        if (details.length == 1) {
            return details[0];
        } else {
            return null;
        }
    } catch (err) {
        console.log("An error occurred getting profile image:", err);
        return null;
    }
}

async function renderLoggedIn(req, res, page, args) {
    let userinfo = await getProfileDetails(req);
    if (!userinfo.image_path) {
        userinfo.image_path = "/resources/profile.png";
    }
    res.render(page, Object.assign({ 
        user: userinfo.user_id, 
        username: userinfo.username, 
        userImg: userinfo.image_path, 
        userRealName: userinfo.real_name == undefined ? "" : userinfo.real_name
    }, args));
};

// Routes for logging out

app.get("/logout", auth, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
  });
  res.render("pages/logout", { timeout: false });
});


// Routes for Dashboard
// On every load, selects a random restaurant from database to put in recommendation

app.get("/dashboard", auth, async (req, res) => {
  try {
    const userId = req.session.user.user_id;

    const recommendationQuery = `
    SELECT *
    FROM restaurants
    ORDER BY RANDOM()
    LIMIT 1;
    `;

    const favoritesQuery = `
    SELECT r.*
    FROM restaurants r
    JOIN users_to_restaurants ur
    ON r.id = ur.restaurant_id
    WHERE ur.user_id = $1
    ORDER BY r.name;
    `;

    const topFavoritesQuery = `
    SELECT r.*, COUNT(*) AS favorite_count
    FROM restaurants r
    JOIN users_to_restaurants ur
      ON r.id = ur.restaurant_id
    GROUP BY r.id, r.name, r.website, r.address, r.phone, r.image_path, r.latitude, r.longitude
    HAVING COUNT(*) > 0
    ORDER BY COUNT(*) DESC, r.name ASC
    LIMIT 3;
    `;

    const dealQuery = `
    SELECT *
    FROM deals
    WHERE CURRENT_DATE BETWEEN start_date AND end_date
    LIMIT 1;
    `;

    const restaurant = await db.one(recommendationQuery);
    const favorites = await db.any(favoritesQuery, [userId]);
    const topFavorites = await db.any(topFavoritesQuery);
    const deal = await db.oneOrNone(dealQuery);

    renderLoggedIn(req, res, "pages/dashboard", {
      restaurant,
      favorites,
      topFavorites,
      deal
    });

  } catch (err) {
    console.log("Error fetching dashboard data:", err);
    renderLoggedIn(req, res, "pages/dashboard", {
      restaurant: null,
      favorites: [],
      topFavorites: [],
      deal: null
    });
  }
});

// Routes for Map

app.get("/map", auth, (req, res) => {
  renderLoggedIn(req, res, "pages/map");
});

// Helper to geocode an address using Nominatim (free, no API key needed)
async function geocode(address) {
  try {
    const query = `${address}, Boulder, CO`;
    // Bounding box for the Greater Boulder area [left, top, right, bottom]
    const viewbox = '-105.301,40.094,-105.178,39.957';
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=1`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'FlatironsMealPlanMap/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
  } catch (err) {
    console.log('Geocoding error for address:', address, err.message);
  }
  return null;
}

// API endpoint to get all restaurants
app.get("/api/restaurants", auth, async (req, res) => {
  try {
    const restaurants = await db.any("SELECT * FROM restaurants;");
    res.json(restaurants);
  } catch (err) {
    console.log("Error fetching restaurants:", err);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

// route for scraping data
app.get('/scrape', auth, async (req, res) => {
  try {
    const restaurants = await scrapeRestaurants();
    let count = 0;

    for (const r of restaurants) {
      // Nominatim requires ~1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1100));
      const coords = await geocode(r.address);

      await db.none(
        `INSERT INTO restaurants (name, address, phone, image_path, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name) DO UPDATE 
         SET address = EXCLUDED.address, 
             phone = EXCLUDED.phone, 
             image_path = EXCLUDED.image_path,
             latitude = EXCLUDED.latitude,
             longitude = EXCLUDED.longitude`,
        [r.name, r.address, r.phone, r.image_path, coords ? coords.lat : null, coords ? coords.lng : null]
      );
      count++;
    }

    res.json({ status: 'success', processed: count, data: restaurants });

  } catch (err) {
    console.log('Scrape error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Route for scraping weekly deals
app.get('/scrape-deals', auth, async (req, res) => {
  try {
    const deals = await scrapeDeals();
    let count = 0;

    for (const d of deals) {

      await db.none(

        `INSERT INTO deals (start_date, end_date, name, note, address, image_path)
        Values($1, $2, $3, $4, $5, $6)
        ON CONFLICT(start_date, name) DO UPDATE
        SET note = EXCLUDED.note,
        address = EXCLUDED.address,
        image_path = EXCLUDED.image_path`,
        [d.start_date, d.end_date, d.name, d.note, d.address, d.image_path]

      );

      count++;

    }

    res.json({ status: 'success', processed: count, data: deals });

  } catch (err) {

    console.log('Deal scrape error:', err);
    res.status(500).json({ status: 'error', message: err.message })

  }

});

// Scrape restaurants on start up
(async () => {

  if (process.env.NODE_ENV === 'test') return;

  try {

    console.log('Scraping weekly deals...');
    const deals = await scrapeDeals();

    for (const d of deals) {

      await db.none(

        `INSERT INTO deals (start_date, end_date, name, note, address, image_path)
        Values($1, $2, $3, $4, $5, $6)
        ON CONFLICT(start_date, name) DO UPDATE
        SET note = EXCLUDED.note,
        address = EXCLUDED.address,
        image_path = EXCLUDED.image_path`,
        [d.start_date, d.end_date, d.name, d.note, d.address, d.image_path]

      );

    }

    console.log(`Processed ${deals.length} deals.`);

  } catch (err) {

    console.log('Auto deal scrape error:', err.message);

  }

})();

// Routes for favoriting restaurants
app.get("/api/favorites", auth, async (req, res) => {

  const userId = getUserID(req);

  try {

    const favorites = await db.any(
      `SELECT r.*
      FROM restaurants r
      JOIN users_to_restaurants ur
      ON r.id = ur.restaurant_id
      WHERE ur.user_id = $1`,
      [userId]
    );

    res.json(favorites);

  } catch (err) {

    console.log("error fetching favorites:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });

  }

});

// API endpoint to favorite a restaurant
app.post("/api/favorites", auth, async (req, res) => {
  const userId = getUserID(req);
  const { restaurant_id } = req.body;

  try {
    await db.none(
      `INSERT INTO users_to_restaurants (user_id, restaurant_id)
       VALUES ($1, $2)`,
      [userId, restaurant_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.log("Error adding favorite:", err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// API endpoint to delete a restaurant from favorites
app.delete("/api/favorites/:id", auth, async (req, res) => {

  const userId = getUserID(req);
  const restaurantId = parseInt(req.params.id, 10);

  try {

    await db.none(
      `DELETE FROM users_to_restaurants
      WHERE user_id = $1 AND restaurant_id = $2`,
      [userId, restaurantId]
    );

    res.json({ success: true });

  } catch (err) {
    console.log("Error removing favorite:", err);
    res.status(500).json({ error: "Failed to remove favorite" });

  }

});

app.get("/profile/:username", auth, async (req, res) => {
    // TODO display other user's profile
    try {
        const userInfoQuery = "SELECT user_id, username, real_name, image_path FROM users WHERE username = $1 LIMIT 1;";
        let userinfo = await db.any(userInfoQuery, req.query.username);
        
        if (userinfo.length >= 1) {
            userinfo = userinfo[0];
            const isFriendsQuery = "SELECT * FROM friends WHERE user_id_1 = $1 AND user_id_2 = $2 LIMIT 1;";
            const isFriends = (await db.any(isFriendsQuery, getUserID(), userinfo.user_id)).length == 1;
            
            const favoritesQuery = `
            SELECT r.*
            FROM restaurants r
            JOIN users_to_restaurants ur
            ON r.id = ur.restaurant_id
            WHERE ur.user_id = $1
            ORDER BY r.name;
            `;
            const favorites = await db.any(favoritesQuery, userinfo.user_id);

            renderLoggedIn(req, res, "pages/profile", {
                allowEdit: false, 
                profileUsername: userinfo.username,
                profileUserImg: userinfo.image_path,
                profileUsername: userinfo.real_name == undefined ? null : userinfo.real_name,
                showRealName: isFriends,
                favorites: favorites
            });
        } else { // User not found
            res.status(404);
            renderLoggedIn(res, res, "pages/404", {});
        }

        
    } catch (err) {
        console.log("Error displaying other user's profile:", err);
    }
});

// Routes for profile and editing
app.get("/profile", auth, async (req, res) => {
    const favoritesQuery = `
    SELECT r.*
    FROM restaurants r
    JOIN users_to_restaurants ur
    ON r.id = ur.restaurant_id
    WHERE ur.user_id = $1
    ORDER BY r.name;
    `;
    
    try {
        const userinfo = await getProfileDetails(req);
        const favorites = await db.any(favoritesQuery, userinfo.user_id);

        renderLoggedIn(req, res, "pages/profile", {
            allowEdit: true, 
            profileUsername: userinfo.username,
            profileUserImg: userinfo.image_path,
            profileRealName: userinfo.real_name == undefined ? null : userinfo.real_name,
            showRealName: true,
            favorites: favorites
        });
    } catch (err) {
        
    }
});

app.get("/editprofile", auth, (req, res) => {
    renderLoggedIn(req, res, "pages/editprofile", {})
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'resources/temp/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage
});

app.post("/editprofile", auth, upload.single("profileImage"), async (req, res) => {
    
    const currentInfo = await getProfileDetails(req);

    const newUsername = req.body.username;
    const newRealName = req.body.realName;


    const updateUsernameQuery = "UPDATE users SET username = $1 WHERE user_id = $2;";
    const updateImageQuery = "UPDATE users SET image_path = $1 WHERE user_id = $2;";
    const updateRealNameQuery = "UPDATE users SET real_name = $1 WHERE user_id = $2;";

    db.task(async t => {
        if (newUsername && newUsername != currentInfo.username){
            switch (await checkUsernameChange(newUsername, currentInfo.user_id)) {
                case -1:
                    renderLoggedIn(req, res, "pages/editprofile", { messageType: 'error', messageText: 'An error has occurred, please try again later' });
                    throw "FAIL";
                case 1:
                    renderLoggedIn(req, res, "pages/editprofile", { messageType: 'warning', messageText: 'Invalid username.  Username must be 4-50 characters and contain only letters, numbers, and characters _ . and -' });
                    throw "FAIL";
                case 2:
                    renderLoggedIn(req, res, "pages/editprofile", { messageType: 'warning', messageText: 'Username is already in use, please choose a different username' });
                    throw "FAIL";
            }
            await t.none(updateUsernameQuery, [newUsername, currentInfo.user_id]);
        }
        if (req.file) {
            // Save file
            const tempPath = req.file.path;
            const fileType = path.extname(req.file.originalname).toLowerCase();
            const acceptedFileTypes = [".png", ".jpg", ".jpeg"];
            const oldPath = await db.oneOrNone("SELECT image_path FROM users WHERE user_id = $1 LIMIT 1;", currentInfo.user_id);
            if (! fileType in acceptedFileTypes) {
                fs.unlink(tempPath, err => {
                    console.log("Error deleting temporary image:", err);
                });
                renderLoggedIn(req, res, "pages/editprofile", { messageType: 'warning', messageText: 'Profile image must be of one of these types: ' + acceptedFileTypes.join(" ") });
                throw "FAIL";
            }
            const localTargetPath = `/resources/userProfileImages/${currentInfo.user_id}${fileType}`;
            const targetPath = path.join(__dirname, localTargetPath);
            fs.rename(tempPath, targetPath, err => {
                if (err) {
                    console.log("Error uploading image:", err);
                    throw err;
                } else {
                    db.none(updateImageQuery, [localTargetPath, currentInfo.user_id]);
                }
            });
            console.log(oldPath);
            if (oldPath && oldPath.image_path != localTargetPath) {
                fs.unlink(path.join(__dirname, oldPath.image_path), err => {
                    if (err) {
                        console.log("Error removing old image:", err);
                    }
                });
            }

        } 
        if (newRealName && newRealName != currentInfo.real_name) {
            console.log("Changing real name...", newRealName, currentInfo.real_name);
            await t.none(updateRealNameQuery, [newRealName, currentInfo.user_id]);
        }
    }).then(async () => {
        res.redirect("/profile");
    }).catch(async err => {
        if (err != "FAIL"){
            console.log("Error updating profile:", err);
            renderLoggedIn(req, res, "pages/editprofile", {messageText: "An error occurred, try again later", messageType: "error"});
        }
    });
});

//Routes for Tests
app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

//Automatically scrapes restaurant info when server starts
// Auto-scrape restaurants on server startup
(async () => {
  // Don't run during tests to speed things up
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  try {
    console.log('Checking for new restaurants to scrape and geocode...');
    const restaurants = await scrapeRestaurants();

    // Fetch all existing names and their coordinates in one query
    const existingData = await db.any('SELECT name, latitude, longitude FROM restaurants');
    const existingMap = new Map(existingData.map(r => [r.name, r]));

    for (const r of restaurants) {
      const existing = existingMap.get(r.name);

      if (!existing || existing.latitude === null || existing.longitude === null) {
        console.log(`Geocoding new or missing: ${r.name}`);
        // Nominatim requires ~1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1100));
        const coords = await geocode(r.address);

        await db.none(
          `INSERT INTO restaurants (name, address, phone, image_path, latitude, longitude)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (name) DO UPDATE 
           SET address = EXCLUDED.address, 
               phone = EXCLUDED.phone, 
               image_path = EXCLUDED.image_path,
               latitude = EXCLUDED.latitude,
               longitude = EXCLUDED.longitude`,
          [r.name, r.address, r.phone, r.image_path, coords ? coords.lat : null, coords ? coords.lng : null]
        );
      } else {
        // Just update basic info if it already has coordinates (much faster)
        await db.none(
          `UPDATE restaurants 
           SET address = $2, phone = $3, image_path = $4
           WHERE name = $1`,
          [r.name, r.address, r.phone, r.image_path]
        );
      }
    }

    console.log(`Scraped and processed ${restaurants.length} restaurants.`);
  } catch (err) {
    console.log('Auto-scrape error:', err.message);
  }
})();

// Start server and keep it listening ------------------------------------------------------------------
const port = process.env.PORT || 3000;
module.exports = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});