var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');

var User = mongoose.model('user', db.userSchema)
module.exports = User;
