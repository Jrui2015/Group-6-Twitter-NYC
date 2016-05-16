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

class App extends Component {

  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
      onSetTitle: PropTypes.func,
      onSetMeta: PropTypes.func,
      onPageNotFound: PropTypes.func,
    }),
    children: PropTypes.element.isRequired,
    error: PropTypes.object,
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired,
    onSetTitle: PropTypes.func.isRequired,
    onSetMeta: PropTypes.func.isRequired,
    onPageNotFound: PropTypes.func.isRequired,
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
      onPageNotFound: context.onPageNotFound || emptyFunction,
    };
  }

  componentWillMount() {
    const { insertCss } = this.props.context;
    this.removeCss = insertCss(s);
    global.addTweet = (tweet) => {
      const newState = this.state.tweets.concat(tweet);
      this.setState({ tweets: newState });
    };
  }

  componentWillUnmount() {
    this.removeCss();
  }

  render() {
    const childrenWithProps = React.Children.map(this.props.children,
                                                 child =>
                                                 React.cloneElement(child, this.state)
                                                );
    return !this.props.error ? (
      <div className="App_fill_2Je">
        <Header />
        {childrenWithProps}
        <Footer />
      </div>
    ) : this.props.children;
  }

}

export default App;
