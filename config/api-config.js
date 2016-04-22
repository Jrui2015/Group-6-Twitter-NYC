/* jshint esversion: 6 */
var settings = {
  STREAM_USER_FOLLOW_LIMIT: 5000,
  // due to the experiments, active geolocated users in NYC is around 8k/day
  STREAM_FOLLOW_LINES: 2
};
settings.TOTAL_FOLLOWING_USERS = settings.STREAM_USER_FOLLOW_LIMIT * settings.STREAM_FOLLOW_LINES;

module.exports = settings;
