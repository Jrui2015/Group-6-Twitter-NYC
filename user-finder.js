/* jshint esversion: 6 */
var MongoClient = require('mongodb').MongoClient;
var url = require('./config/db').url;
var assert = require('assert');
var Stream = require('node-tweet-stream');
var locationsToken = require('./config/locations');

var locationsFilter = new Stream({
  consumer_key: locationsToken.consumer_key,
  consumer_secret: locationsToken.consumer_secret,
  token: locationsToken.access_token,
  token_secret: locationsToken.access_token_secret
});

var userSet = new Set();
locationsFilter.on('tweet', function(json) {
  var id = json.user.id_str;
  if (userSet.has(id)) {return false;}
  userSet.add(id);

  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    var users = db.collection('users');
    users.save({_id: id}, function(err) {
      assert.equal(null, err);
      console.log("save user id" + id);
      db.close();
    });
  });

});

locationsFilter.on('error', function(err) {
  console.log(err);
  locationsFilter.destroy();
});

var NYC = [-74, 40, -73, 41];
locationsFilter.locations(NYC); // XXX: why not working?
