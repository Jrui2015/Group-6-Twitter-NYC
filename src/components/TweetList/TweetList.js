import React, { PropTypes } from 'react';
import Tweet from '../Tweet';

function TweetList({ tweets }) {
  return (
    <div className="App_fill_2Je" id="tweet-list">
      {tweets.slice(tweets.length - 100).reverse().map(tweet => (
        <Tweet tweet={tweet} key={tweet.id_str} />
      ))}
      <script async src="//platform.twitter.com/widgets.js"></script>
    </div>
  );
}

TweetList.propTypes = {
  tweets: PropTypes.array.isRequired,
};

export default TweetList;
