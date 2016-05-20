/* eslint-disable max-len */
/* eslint-disable react/jsx-first-prop-new-line */
import React, { PropTypes } from 'react';

function Tweet({ tweet }) {
  return (
    <div id="container">
      <div className="EmbeddedTweet js-clickToOpenTarget" data-click-to-open-target="https://twitter.com/{tweet.user.screen_name}/status/{tweet.id_str}" data-iframe-title="Twitter Tweet" data-dt-full="%{hours12}:%{minutes} %{amPm} - %{day} %{month} %{year}" data-dt-months="Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec" data-dt-am="AM" data-dt-pm="PM" data-dt-now="now" data-dt-s="s" data-dt-m="m" data-dt-h="h" data-dt-second="second" data-dt-seconds="seconds" data-dt-minute="minute" data-dt-minutes="minutes" data-dt-hour="hour" data-dt-hours="hours" data-dt-abbr="%{number}%{symbol}" data-dt-short="%{day} %{month}" data-dt-long="%{day} %{month} %{year}" data-scribe="page:tweet" id="twitter-widget-1" lang="en" data-twitter-event-id="2">

        <div className="EmbeddedTweet-tweet">
          <blockquote data-cards="hidden" className="Tweet h-entry js-tweetIdInfo subject expanded
                                                     is-deciderHtmlWhitespace" cite="https://twitter.com/{tweet.user.screen_name}/status/{tweet.id_str}" data-tweet-id="{tweet.user.screen_name}" data-scribe="section:subject">
            <div className="Tweet-header u-cf">

              <div className="TweetAuthor" data-scribe="component:author">
                <a className="TweetAuthor-link Identity u-linkBlend" data-scribe="element:user_link" href="https://twitter.com/{tweet.user.screen_name}" aria-label="{tweet.user.name} (screen name: {tweet.user.screen_name})">
                  <span className="TweetAuthor-avatar Identity-avatar">
                    <img className="Avatar" data-scribe="element:avatar" src={tweet.user.profile_image_url} />
                  </span>
                  <span className="TweetAuthor-name Identity-name customisable-highlight" title="{tweet.user.name}" data-scribe="element:name">{tweet.user.name}</span>

                  <span className="TweetAuthor-screenName Identity-screenName" title="@{tweet.user.screen_name}" data-scribe="element:screen_name">@{tweet.user.screen_name}</span>
                </a>
              </div>

            </div>

            <div className="Tweet-body e-entry-content" data-scribe="component:tweet">
              <p className="Tweet-text e-entry-title" lang="en" dir="ltr">{tweet.text}</p>


              <div className="Tweet-metadata dateline">


                <a className="u-linkBlend u-url customisable-highlight long-permalink" data-datetime="{tweet.created_at}" data-scribe="element:full_timestamp" href="https://twitter.com/{tweet.user.screen_name}/status/{tweet.id_str}">

                  <time className="dt-updated" dateTime="2016-05-15T20:50:11+0000" pubdate="" title="Time posted: {tweet.created_at}">{tweet.created_at}</time></a>
              </div>


              <ul className="Tweet-actions" data-scribe="component:actions" role="menu" aria-label="Tweet actions">
                <li className="Tweet-action">
                  <a className="TweetAction TweetAction--reply web-intent" href="https://twitter.com/intent/tweet?in_reply_to={tweet.id_str}" data-scribe="element:reply"><div className="Icon Icon--reply TweetAction-icon" aria-label="Reply" title="Reply" role="img"></div></a></li>
                <li className="Tweet-action">
                  <a className="TweetAction TweetAction--retweet web-intent" href="https://twitter.com/intent/retweet?tweet_id={tweet.id_str}" data-scribe="element:retweet"><div className="Icon Icon--retweet TweetAction-icon" aria-label="Retweet" title="Retweet" role="img"></div>    <span className="TweetAction-stat" data-scribe="element:retweet_count" aria-hidden="true">{tweet.retweet_count}</span>
                    <span className="u-hiddenVisually">{tweet.retweet_count} Retweets</span>
                </a></li>
                <li className="Tweet-action">
                  <a className="TweetAction TweetAction--heart web-intent" href="https://twitter.com/intent/like?tweet_id={tweet.id_str}" data-scribe="element:heart"><div className="Icon Icon--heart TweetAction-icon" aria-label="Like" title="Like" role="img"></div><span className="TweetAction-stat" data-scribe="element:heart_count" aria-hidden="true">{tweet.favorite_count}</span>
                    <span className="u-hiddenVisually">{tweet.favorite_count} likes</span>
                </a></li>
              </ul>
            </div>
          </blockquote>
        </div>
      </div>
    </div>
    );
}

Tweet.propTypes = {
  tweet: PropTypes.object.isRequired,
};

export default Tweet;
