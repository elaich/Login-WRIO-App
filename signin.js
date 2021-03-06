var uuid = require('node-uuid');
var FacebookStrategy = require('passport-facebook').Strategy;

var env = process.env.NODE_ENV || 'development';

var config = require('./config/config.json')[env];

signin = {}

signin.serialize = function(user, done) {
  done(null, user.userID)
}

signin.deserialize = function(db) {
  return function(id, done) {
    console.log('deserialize: ' + id)
    db.find({ userID: id })
      .success(function(user) {
        done(null, user)
      })
      .fail(function(err) {
        done(err)
      })
  }
}

signin.facebookStrategy = function(db) {
  return new FacebookStrategy({
  clientID: config.api_keys.facebook.client_id,
  clientSecret: config.api_keys.facebook.client_secret,
  callbackURL: config.callback_urls.facebook,
  profileFields: ['id', 'name'],
}, function(accessToken, refreshToken, profile, done){
  process.nextTick( function(){
    db.find({'facebookID': profile.id})
      .success(function(user){ 
        if (user)
          return done(null, user)
        else
          db.create({
            userID: uuid.v4(),
            facebookID: profile._json.id,
            lastName: profile._json.last_name,
            firstName: profile._json.first_name,
          }).success(function(user) {
            console.dir(user.dataValues)
            return done(null, user)
          }).fail(function(err) {
            return done(err)
          });
      })
      .fail(function(err) {
        return done(err)
      })
    })
  })
};

module.exports = signin;
