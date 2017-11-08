const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  // check if there are no cookies :(
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
        req.session = {hash: results.hash};
        res.cookies.shortlyid = {};
        res.cookies.shortlyid.value = [];
        res.cookies.shortlyid.value.push(results.hash);
        // RETURN! query sessions table for id using the hash in req
        return models.Sessions.get({hash: res.cookies.shortlyid.value});
      })
      .then( (results) => {
        if (results.userId) {
          idExists = true;
        }
        return models.Users.get({id: results.userId});
      })
      .then( (results) => {
        console.log('IF THIS LOGS IT WORKS');
        req.session.user = {};
        if (idExists) {
          req.session.userId = results.id;
          req.session.user.username = results.username;
        }
        next();
      });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
