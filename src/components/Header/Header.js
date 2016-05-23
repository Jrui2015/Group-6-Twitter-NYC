/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import NativeListener from 'react-native-listener';

function Header({ onSearch }) {
  return (

    <nav className="navbar navbar-inverse navbar-static-top">
      <div className="container-fluid">
        <div className="navbar-header">
          <a className="navbar-brand" href="##">
            Hot Topic Finder of Tweets
            &nbsp;
            <span id="fire-icon" className="glyphicon glyphicon-fire"></span>&nbsp;
          </a>
        </div>

        <div className="col-sm-3 col-md-3">
          <form className="navbar-form">
            <div className="input-group">
              <input type="text" className="form-control" placeholder="Search keyword..." name="keyword" id="keyword" />
              <div className="input-group-btn">
      <NativeListener onClick={onSearch}>
      <button className="btn btn-default" ><i className="glyphicon glyphicon-search"></i></button>
      </NativeListener>
              </div>
            </div>
          </form>
        </div>

      </div>
    </nav>

  );
}

export default Header;
