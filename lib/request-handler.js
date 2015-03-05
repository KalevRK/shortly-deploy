var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');

var util = require('../lib/utility');
var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

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
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({'url':uri} ,function(err, data){
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
          base_url: req.headers.origin
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
    console.log(data);
    if (data) {
      util.comparePassword(password, data.password, function(match){
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/');
          }
        })
    }
    // .fetch()
    // .then(function(user) {
    //   if (!user) {
    //     res.redirect('/login');
    //   } else {
    //   }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({'username':username} ,function(err, data){
    if (data){
      res.redirect('/signup');
    } else {
      var user = new User( {
        username: username,
        password: password
      });
      user.save(function(err, result) {
        if (err) {
          console.error(err);
          return res.send(404);
        }
        util.createSession(req, res, result);
        return res.send(302, result);
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
