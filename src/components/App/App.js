/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component, PropTypes } from 'react';
import emptyFunction from 'fbjs/lib/emptyFunction';
import s from './App.scss';
import Header from '../Header';
import Footer from '../Footer';
import Sidebar from '../Sidebar';
import Main from '../Main';
import QuadTree from '../Map/QuadTree';
import WordFrequency from '../../core/word-statistics';
global.WordFrequency = WordFrequency

class App extends Component {

  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
      onSetTitle: PropTypes.func,
      onSetMeta: PropTypes.func,
    }),
    error: PropTypes.object,
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired,
    onSetTitle: PropTypes.func.isRequired,
    onSetMeta: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      tweets: [],
      nodesInBounds: [],
      qtrees: {},
    };
  }

  getChildContext() {
    const context = this.props.context;
    return {
      insertCss: context.insertCss || emptyFunction,
      onSetTitle: context.onSetTitle || emptyFunction,
      onSetMeta: context.onSetMeta || emptyFunction,
    };
  }

  componentWillMount() {
    const { insertCss } = this.props.context;
    this.removeCss = insertCss(s);
    global.addTweet = (tweet) => {
      if (!this.state.qtrees[this.state.timeWindow]) { return; }
      this.state.qtrees[this.state.timeWindow].insert({
        x: tweet.coordinates.coordinates[0],
        y: tweet.coordinates.coordinates[1],
        all: tweet,
      });
      const newState = this.state.tweets.concat(tweet);
      const nodesInBounds = this.state.qtrees[this.state.timeWindow]
              .nodesInBounds(this.state.bounds);
      this.setState({ tweets: newState, newTweetLocation: tweet.coordinates, nodesInBounds });
    };
    global.setTweets = (tweets, timeWindow) => {
      this.state.qtrees[timeWindow] = new QuadTree([-180, -90, 180, 90], tweets.map(t => ({
        x: t.coordinates.coordinates[0],
        y: t.coordinates.coordinates[1],
        all: t,
      })));
      const nodesInBounds = this.state.qtrees[timeWindow]
              .nodesInBounds(this.state.bounds);
      this.setState({ tweets, timeWindow, nodesInBounds });
    };
  }

  componentWillUnmount() {
    this.removeCss();
  }

  onBoundsChange(bounds) {
    this.setState({ bounds });
    if (!this.state || !this.state.qtrees[this.state.timeWindow]) return;
    const nodesInBounds = this.state.qtrees[this.state.timeWindow].nodesInBounds(bounds);
    this.setState({ nodesInBounds });
  }

  render() {
    this.props.context.onSetTitle('Twitter NYC');
    const onBoundsChange = this.onBoundsChange.bind(this);
    return (
      <div className={s.fill}>
        <Header />
        <div className={s.main}>
          <div className={`col-md-3 ${s.fill}`}>
            <Sidebar tweets={this.state.tweets} />
          </div>
          <div className={`col-md-9 ${s.fill}`}>
            <Main
              tweets={this.state.tweets}
              nodesInBounds={this.state.nodesInBounds}
              newTweetLocation={this.state.newTweetLocation}
              onBoundsChange={onBoundsChange}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

}

export default App;
