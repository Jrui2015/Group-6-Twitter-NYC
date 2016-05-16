import React, { PropTypes } from 'react';
import TweetMap from '../Map';

function Main({ tweets }) {
  return (

    <TweetMap tweets={tweets} />

  );
}

Main.propTypes = {
  tweets: PropTypes.array.isRequired,
};

export default Main;
