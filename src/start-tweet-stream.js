/* eslint-disable camelcase */
import mongoose from 'mongoose';
import { url } from './config/db';
import { consumer_key, consumer_secret, token, token_secret } from './config/twitter-app';
import Stream from 'node-tweet-stream';
import socketIo from 'socket.io';
import Tweet from './models/Tweet';

mongoose.connect(url, (err) =>
                 err ? console.error(err) : console.log('database connected...'));

export default function startTweetStream(http) {
  const io = socketIo(http);

  io.on('connection', socket => {
    console.log('a user connected');
    socket.on('disconnect', () => console.log('user disconnected'));
    Tweet.find({}, {}, {
      sort: { created_at: -1 },
      limit: 100,
    }, (err, docs) => {
      if (err) throw err;
      io.emit('tweets', docs.map(d => d.tweet));
    });
  });

  const follower = new Stream({ consumer_key, consumer_secret, token, token_secret });
  follower.on('tweet', tweet => {
    if (!tweet.coordinates) return;
    console.log(`${tweet.user.name}: ${tweet.text.substr(0, 10)}...`);
    io.emit('tweet', tweet);
    new Tweet({ tweet }).save((err) => {
      if (err) throw err;
    });
  });
  follower.on('error', err => console.error(err));
  follower.location('-74,40,-73,41');
}
