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
      const newState = this.state.tweets.concat(tweet);
      this.setState({ tweets: newState });
    };
    global.setTweets = (tweets) => this.setState({ tweets });
    global.getTweeets = () => this.state.tweets;
  }

  componentWillUnmount() {
    this.removeCss();
  }

  render() {
    this.props.context.onSetTitle('Twitter NYC');
    return (
      <div className={s.fill}>
        <Header />
        <div className={s.main}>
          <div className={`col-md-3 ${s.fill}`}>
            <Sidebar tweets={this.state.tweets} />
          </div>
          <div className={`col-md-9 ${s.fill}`}>
            <Main tweets={this.state.tweets} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

}

export default App;
