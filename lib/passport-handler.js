var passport = require('passport');
var config = require('./oauth');
var User = require('../app/models/user');
var GithubStrategy = require('passport-github').Strategy;

passport.serializeUser(function (user, done){
  done(null, user);
});

passport.deserializeUser(function (user, done){
  done(null, user);
});

passport.use(new GithubStrategy({
  clientID: config.github.clientID,
  clientSecret: config.github.clientSecret,
  callbackURL: config.github.callbackURL
},
function(accessToken, refreshToken, profile, done) {
  User.findOne({username: profile.username}, function(err, data) {
    if (!data) {
      var newUser = new User({
        username: profile.username,
        password: accessToken
      });
      newUser.save(function(err, result) {
        if (err) {
          console.error(err);
        } else {
          done(null, newUser);
        }
      });
    } else {
      done(null, data);
    }
  });
})

);

module.exports.loginUserCallback = function(req, res) {
  res.redirect('/');
};

