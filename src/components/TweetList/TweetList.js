import React, { PropTypes } from 'react';

function TweetList({ tweets }) {
  return (
    <div className="App_fill_2Je">
      {tweets.map(tweet => (
        <blockquote key={tweet.id_str}className="twitter-tweet" data-cards="hidden">
          <p>{tweet.text}</p>&mdash; {tweet.user.name} (@{tweet.user.screen_name})
          <a>{tweet.created_at}</a>
        </blockquote>
      ))}
      <script async src="//platform.twitter.com/widgets.js"></script>
    </div>
  );
}

TweetList.propTypes = {
  tweets: PropTypes.array.isRequired,
};

export default TweetList;
