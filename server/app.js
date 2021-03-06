const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
const db = require('./db');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/', 
(req, res) => {
  res.render('index');
});

app.get('/create', 
(req, res) => {
  res.render('index');
});

app.get('/links', 
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links', 
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

//TODO: think of a less roundabout way to handle an existing user
  //specifically, better manage control flow by conditionally invoking .then or .catch
app.post('/signup',
(req, res, next) => {
  var userExists = false;
  return models.Users.get({username: req.body.username})
    .then((results) => {
      if (results !== undefined) {
        userExists = true;
      }
    })
    .then(() => {
      if (!userExists) {
        return models.Users.create(req.body);
      }
    })
    .then(() => {
      var location = '/signup';
      if (!userExists) {
        location = '/';
      }
      res.setHeader('location', location);
      res.status(201).send();
    })
    .error((err) => {
      res.status(501).send(err);
    });
});

app.post('/login', (req, res, next) => {
  // declare userExists variable, set to false
  var userExists = false;
  // declare passwordMatch variable, set to false
  var passwordMatch = false;
  return models.Users.get({username: req.body.username})
    .then((results) => {
      if (results !== undefined) {
        userExists = true;
      }
      return results;
    })
    .then((results) => {
      if (results) {
        return models.Users.compare(req.body.password, results.password, results.salt);
      }
    })
    .then((results) => {
      if (results) {
        passwordMatch = true;
      }
    })
    .then( () => {
      // if userExists is true && passwordMatch is true
      if (userExists && passwordMatch) {
        // login user
        res.setHeader('location', '/');
        res.status(201).send();
      } else {
        res.setHeader('location', '/login');
        res.status(401).send();
      }
      // if userExists is false || passwordMatch is false
        // keep on login page
        
    });
  // check if user exists
    // if so, set userExists to true
  // check to see if password matches
    // if so, set passwordMatch to true
});


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
