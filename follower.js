/* jshint esversion:6 */
// TODO users_part starts from 0
var users_part = 1; // TODO get from argv, remember add guards

let MongoClient = require('mongodb').MongoClient;
let url = require('./config/db').url;
let apiConfig = require('./config/api-config');
let assert = require('assert');
let Stream = require('node-tweet-stream');
// TODO followTokens[0] = require(...)
let followToken = require(`./config/follow${users_part}`);


// Setup stream
var follower = new Stream({
  consumer_key: followToken.consumer_key,
  consumer_secret: followToken.consumer_secret,
  token: followToken.access_token,
  token_secret: followToken.access_token_secret
});

var count = 0;
follower.on('tweet', tweet => {
  // transfer to client
  // TODO use web socket

  // stdout
  console.log(`${++count}: ` +
              `${tweet.user.name}: ${tweet.text.substr(0,10)}... ` +
              `(\u2937 ${tweet.retweet_count} \u2665 ${tweet.favorite_count})`);

  MongoClient.connect(url, (err, db) => {
    assert.equal(null, err);
    db.collection('tweets').insert(tweet, () => db.close());
  });

});


follower.on('error', (err) => {
  console.log(err);
});


/**
 * get most recent active users, and only pass partial users
 * (of length STREAM_USER_FOLLOW_LIMIT) to process
 */
// TODO add parameter user_part
function getRecentActiveUsers(db, callback) {
  var cursor = db.collection('users').find({
    // TODO use easy-date package
    updated_at: {$gte: new Date(new Date().getTime() - 24*60*60*1000)}
  });

  cursor
    .sort({updated_at: -1})
    .skip((users_part-1) * apiConfig.STREAM_USER_FOLLOW_LIMIT)
    .limit(apiConfig.STREAM_USER_FOLLOW_LIMIT)
    .toArray(callback);
}


function fetchActiveUsersAndFollows() {

  MongoClient.connect(url, (err, db) => {
    assert.equal(null, err);

    getRecentActiveUsers(db, (err, docs) => {
      console.log(`totally ${docs.length} users`);

      var users = docs.map(d => d._id);
      db.close();

      follower._filters.follow = {};
      follower.follow(users);
    });

  });

  // update active users periodically
  setTimeout(fetchActiveUsersAndFollows, 2 * 60 * 1000);

}


// Let's start it
// TODO start multiple (i.e. 2) follower lines
// different reconnect time make data flow smoother
fetchActiveUsersAndFollows();
