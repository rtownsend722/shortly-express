const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // check if there are no cookies :(
  console.log('plush plush');
  var idExists = false;
  if (!req.cookies.shortly) {
    // if there no cookies, make a session
    return new Promise( (resolve, reject) => {
      resolve(models.Sessions.create());
    })
      .then( (results) => {
        return models.Sessions.get({id: results.insertId});
      })
      .then( (results) => {
        console.log('results from models.Sessions.get DONt MISLE US ', results);
        req.session = {hash: results.hash};
        res.cookies.shortlyid = {};
        res.cookies.shortlyid.value = [];
        res.cookies.shortlyid.value.push(results.hash);
        // RETURN! query sessions table for id using the hash in req
        return models.Sessions.get({hash: res.cookies.shortlyid.value});
      })
      .then( (results) => {
        console.log('results from models.Sessions.get', results);
        if (results.userId) {
          idExists = true;
        }
        return models.Users.get({id: results.userId});
      })
      .then( (results) => {
        console.log('results from models.Users.get', results);
        console.log('IF THIS LOGS IT WORKS', idExists);
        req.session.user = {};
        if (idExists) {
          console.log(req.session, 'this is our session ok guys');
          req.session.userId = results.id;
          req.session.user.username = results.username;
        }
        next();
      });
        // .then
        // check to see if we get null for results.id
          // if we do, then next()
        // RETURN using id query users table for username
        // .then
        // set the id and username on the sessions object
        // next(); we'll be back for you
  }
  // otherwise, console log that there are cookies :)
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
