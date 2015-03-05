var path = require('path');
var mongoose = require('mongoose');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var key = require('./key');
console.log(key);

if (process.env.TERM_PROGRAM === 'Apple_Terminal'){
  mongoose.connect('mongodb://localhost:27017/shortly');
} else {
  mongoose.connect(key);
}

module.exports.linkSchema = new mongoose.Schema({
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: {type: Number, default: 0},
  timestamp: {type: Date, default: Date.now}
});

module.exports.linkSchema.pre('save', function(next){
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code =  shasum.digest('hex').slice(0, 5);
  next();
});

module.exports.userSchema = new mongoose.Schema({
  username: String,
  password: String,
  timestamp: {type: Date, default: Date.now}
});

module.exports.userSchema.pre('save', function(next) {
  var cipher = Promise.promisify(bcrypt.hash);
  cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.update({password: hash}, function(err){
      });
    });
  next();
});
