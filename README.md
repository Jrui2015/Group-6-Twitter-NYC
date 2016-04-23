# Realtime Twitter

This is a visualization class project which tries to visualize the realtime twitter data via twitter streaming.

# Prerequisites

1. Mongodb running in the default 27017 port
2. ruby gems:
   - mongo
   - activesupport
3. run `npm install` to install node dependencies

# Configuration
We need 2 twitter apps to run this project. Put each of the `consumer_key`, `consumer_secret`, `token` and `token_secret` into `config/locations.config` and `config/follow1.js` with different twitter app config set.

# Usage

1. make sure mongodb is on;
2. run `ruby ./find_users_in_area.rb` as daemon, it will collect users who post a tweet in NYC area;
3. run `sudo node ./tweet-proxy.js` as daemon, it will following users who post a tweet in NYC in the last 24 hours.

By default the `tweet-proxy.js` runs a web server on 80 port so it needs root privilege.

WARNING: The Debian Linux system is extremely unfriendly to node.js. I just can't make my code works on such system.
