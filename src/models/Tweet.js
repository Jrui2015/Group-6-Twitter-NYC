import mongoose, { Schema } from 'mongoose';

const TweetSchema = Schema({
  tweet: {},
});

const Tweet = mongoose.model('Tweet', TweetSchema);

export default Tweet;
