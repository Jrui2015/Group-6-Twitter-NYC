/* jshint esversion: 6 */
let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');

let lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('./users_in_world.ids')
});

let url = require('./config/db').url;
lineReader.on('line', (line) => {
  MongoClient.connect(url, (err, db) => {
    assert.equal(null, err);
    var users = db.collection('users');
    users.save({_id: line}, {w:1}, (err, result) => {
      console.log(`save user id ${line}`);
      db.close();
    });
  });
});
