var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

var Link = mongoose.model('link', db.linkSchema);
module.exports = Link;
