/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';

function Header() {
  return (

    <nav className="navbar navbar-inverse navbar-static-top">
      <div className="container-fluid">
        <div className="navbar-header">
          <a className="navbar-brand" href="##">
            Hot Tweets Finder
            &nbsp;
            <span id="fire-icon" className="glyphicon glyphicon-fire"></span>&nbsp;
          </a>
        </div>

        <div className="collapse navbar-collapse" id="navbar-content">
          <ul className="nav navbar-nav">
            <li><a href="#" data-toggle="modal" data-target="#myModal">About</a></li>
          </ul>
        </div>
      </div>
    </nav>

  );
}

export default Header;
