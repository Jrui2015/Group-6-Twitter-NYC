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
      selectedKeywords: [],
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
      const keywords = this.getTrendTopics().concat(this.state.selectedKeywords);
      this.setState({
        tweets: newState,
        newTweetLocation: tweet.coordinates,
        nodesInBounds, keywords,
      });
    };
    global.setTweets = (tweets, timeWindow) => {
      let i = 0;
      const now = new Date();
      tweets.forEach(t => {
        const time = new Date(t.created_at);
        if (now - time > timeWindow * 60 * 1000) i++;
        else return;
      });
      const recents = tweets.slice(i);
      this.state.qtrees[timeWindow] = new QuadTree([-180, -90, 180, 90], recents.map(t => ({
        x: t.coordinates.coordinates[0],
        y: t.coordinates.coordinates[1],
        all: t,
      })), (node, item) => {
        if (!node.freqs) {
          node.freqs = new WordFrequency(); // eslint-disable-line
        }
        node.freqs.add(item.all.text);
      });
      const nodesInBounds = this.state.qtrees[timeWindow]
              .nodesInBounds(this.state.bounds);
      const keywords = this.getTrendTopics().concat(this.state.selectedKeywords);
      this.setState({ tweets: recents.slice(0, recents.length - 1), timeWindow, nodesInBounds, keywords });
      if (recents.length) global.addTweet(recents[recents.length - 1]);
    };
    this.removeOldTweets(this);
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

  onSearch(event) {
    event.preventDefault();
    if (this.state.selectedKeywords.length >= 5) {
      alert('too many keywords here, please remove some before adding new ones');
      return;
    }
    const qtree = this.state.qtrees[this.state.timeWindow];
    const freqs = qtree.root.freqs.freqs;
    const keyword = document.getElementById('keyword').value;
    const selectedKeywords = this.state.selectedKeywords.concat(keyword);
    const keywords = this.getTrendTopics().concat(selectedKeywords);
    if (freqs.get(keyword)) {
      this.setState({ selectedKeywords, keywords });
    } else {
      alert(`"${keyword}" is not in the recent records`);
    }
  }

  getTrendTopics() { // eslint-disable-line
    if (!this.state.timeWindow) return [];
    const ary = [];
    const qtree = this.state.qtrees[this.state.timeWindow];
    if (!qtree) { return []; }
    qtree.root.freqs.freqs.forEach((freq, word) => ary.push([word, freq]));
    ary.sort((a, b) => (b[1] - a[1]));
    return ary.slice(0, 10).map(d => d[0]);
  }

  removeOldTweets(self) {
    if (self.state.timeWindow) {
      let i = 0;
      const now = new Date();
      const timeWindow = self.state.timeWindow * 60 * 1000;
      self.state.tweets.forEach(t => {
        const time = new Date(t.created_at);
        if (now - time > timeWindow) i++;
        else return;
      });
      global.setTweets(self.state.tweets.slice(i), self.state.timeWindow);
    }
    setTimeout(() => self.removeOldTweets(self), 120 * 1000);
  }

  render() {
    this.props.context.onSetTitle('Twitter NYC');
    const onSearch = this.onSearch.bind(this);
    const onBoundsChange = this.onBoundsChange.bind(this);
    return (
      <div className={s.fill}>
        <Header onSearch={onSearch} />
        <div className={s.main}>
          <div className={`col-md-3 ${s.fill}`}>
            <Sidebar tweets={this.state.tweets} />
          </div>
          <div className={`col-md-9 ${s.fill}`}>
            <Main
              tweets={this.state.tweets}
              nodesInBounds={this.state.nodesInBounds}
              newTweetLocation={this.state.newTweetLocation}
              keywords={this.state.keywords}
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
