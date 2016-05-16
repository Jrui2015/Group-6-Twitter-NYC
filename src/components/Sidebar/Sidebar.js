import TweetList from '../TweetList';
import React, { PropTypes } from 'react';

function Sidebar({ tweets }) {
  return (

    <TweetList tweets={tweets} />

  );
}

Sidebar.propTypes = {
  tweets: PropTypes.array.isRequired,
};

export default Sidebar;
