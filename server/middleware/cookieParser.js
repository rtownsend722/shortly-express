// recieve a post request with a cookie property on it and the cookie is JSON stringified
const parseCookies = (req, res, next) => {
  //access the cookie property
  if (req.headers.cookie) {
    var cookies = req.headers.cookie;
    // make a cookie object
    var parsedCookies = {};
    // split the req.Cookie string on '; '
    cookies = cookies.split('; ');
    // iterate through the resulting array
    cookies.forEach(function(cookie) {
      // set new array variable equal to splitting string on =
      var individualCookie = cookie.split('=');
      // set cookie object's key value pairs equal to ^
      parsedCookies[individualCookie[0]] = individualCookie[1];
    });
    // replace the existing JSON cookie on the request object with the parsed cookie 
    req.cookies = parsedCookies;
    // then()
  }
  next(req);
};

module.exports = parseCookies;