/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import Sidebar from '../../components/Sidebar';
import Main from '../../components/Main';

function Home({ tweets }) {
  return (
    <div className="container-fluid App_main_11s">
      <div className="col-md-3 App_fill_2Je">
        <Sidebar tweets={tweets} />
      </div>
      <div className="col-md-9 App_fill_2Je">
        <Main tweets={tweets} />
      </div>
    </div>
  );
}

Home.propTypes = {
  tweets: PropTypes.array,
};

export default Home;
