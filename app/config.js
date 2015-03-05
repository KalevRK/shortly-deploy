var Bookshelf = require('bookshelf');
var path = require('path');
var mongoose = require('mongoose');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

mongoose.connect('mongodb://localhost:27017/shortly');

module.exports.linkSchema = new mongoose.Schema({
  // id: Schema.ObjectId,
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: Number,
  timestamp: {type: Date, default: Date.now}
});

module.exports.linkSchema.pre('save', function(next){
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code =  shasum.digest('hex').slice(0, 5);
  next();
})

module.exports.userSchema = new mongoose.Schema({
  // id: Schema.ObjectId,
  username: String,
  password: String,
  timestamp: {type: Date, default: Date.now}
});

module.exports.userSchema.pre('save', function(next) {
  this.comparePassword = 'TACOOOOOO';
  (function(){
      var cipher = Promise.promisify(bcrypt.hash);
      return cipher(this.password, null, null).bind(this)
        .then(function(hash) {
          this.password = hash;
        });
  })();
  next();
});


//   comparePassword: function(attemptedPassword, callback) {
//     bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
//       callback(isMatch);
//     });
//   },
//   hashPassword: function(){
//     var cipher = Promise.promisify(bcrypt.hash);
//     return cipher(this.get('password'), null, null).bind(this)
//       .then(function(hash) {
//         this.set('password', hash);
//       });
//   }


// db.knex.schema.hasTable('users').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('users', function (user) {
//       user.increments('id').primary();
//       user.string('username', 100).unique();
//       user.string('password', 100);
//       user.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

