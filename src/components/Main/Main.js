import React, { PropTypes } from 'react';
import TweetMap from '../Map';

function Main({ tweets, newTweetLocation, nodesInBounds, keywords, onBoundsChange }) {
  return (

    <TweetMap
      tweets={tweets}
      newTweetLocation={newTweetLocation}
      nodesInBounds={nodesInBounds}
      keywords={keywords}
      onBoundsChange={onBoundsChange}
    />
  );
}

Main.propTypes = {
  tweets: PropTypes.array.isRequired,
  newTweetLocation: PropTypes.object,
  nodesInBounds: PropTypes.array,
  onBoundsChange: PropTypes.func.isRequired,
};

export default Main;
