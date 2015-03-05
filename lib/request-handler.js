var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');

var util = require('../lib/utility');
var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  var user = req.session.user || req._passport.session.user.username;
  Link.find({user: user},function(err, data){
    console.log(data);
    res.send(200, data);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;
  var username = req.session.user || req._passport.session.user.username

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({'url':uri, user:username } ,function(err, data){
    if (data){
      res.send(200, data);
    } else {
      util.getUrlTitle(uri, function(err, title){
        if (err){
          console.error('Error reading URL Heading: ', err);
          return res.send(404);
        }

        var link = new Link( {
          url: uri,
          title: title,
          base_url: req.headers.origin,
          user: username
        });

        link.save(function(err, result) {
          if (err) {
            console.error(err);
            return res.send(404);
          }
          return res.send(200, result);
        });
      })
    }
  })
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({'username': username}, function(err, data) {
    if (data) {
      console.log(password, data.password)
      util.comparePassword(password, data.password, function(match){
          if (match) {
            console.log(username, ' logged in');
            util.createSession(req, res, username);
          } else {
            console.log(username, ' failed to login');
            res.redirect('/login');
          }
        })
    } else {
      console.log(username, ' isnt a user');
      res.redirect('/login');
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({'username':username} ,function(err, data){
    if (data){
      console.log(username, ' already exists');
      res.redirect('/login');
    } else {
      var user = new User( {
        username: username,
        password: password
      });
      user.save(function(err, result) {
        if (err) {
          console.log(username, ' couldnt create an acount');
          console.error(err);
          return res.send(404);
        }
        console.log(username, ' created an account');
        util.createSession(req, res, result);
      });
    }
  })
};

exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] }, function(err, data){
    if (!data){
      res.redirect('/');
    } else {
      data.visits++;
      data.save(function(err, result){
        if (err){
          console.error(err)
        }else {
          return res.redirect(data.url);
        }
      })
    }
  })
};
