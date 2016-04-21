#!/usr/bin/env ruby
require 'rubygems'
require 'bundler/setup'
require 'pry'
require 'twitter'
require 'mongo'
require 'active_support/all'
db = Mongo::Client.new(['localhost:27017'], database: 'realtime-twitter-viz')

class Twitter::Tweet
  def to_brief
    "#{self.user.name}: #{self.text[0...10]}... (\u2937 #{self.retweet_count} \u2665 #{self.favorite_count})"
  end

  def to_s
    s = ''
    s += '----------'
    s += "\n#{self.created_at}\n"
    s += self.to_brief + "\n"
    unless self.retweeted_tweet.nil?
      s += "retweeted from: #{self.retweeted_tweet.to_brief}\n"
    end
    s += "quote: #{self.quoted_tweet.to_brief}\n" if self.quote?
    s += "hashtags: #{self.hashtags.map(&:text)}\n" unless self.hashtags.empty?
    s += "geo: #{self.geo.coordinates}\n" unless (self.geo.nil? or self.geo.coordinates.empty?)
    s += '----------'
  end
end

bounding_boxes = {
  world: '-180,-90,180,90',
  NYC: '-74,40,-73,41',
}

area = ARGV[0].to_sym if ARGV[0]
area = :NYC unless bounding_boxes.include? area
puts "finding tweets in #{area}"

client = Twitter::Streaming::Client.new do |config|
  config.consumer_key,
  config.consumer_secret,
  config.access_token,
  config.access_token_secret = File.readlines('config/locations.config').map(&:strip)
end

statistics_fname = "log/#{area}.log"
begin
  up_minutes,
  tweet_count,
  retweet_count,
  quote_count,
  hashtag_count,
  geo_count = File.readlines(statistics_fname).map(&:to_i)
rescue Errno::ENOENT => err
  puts"#{err}. Create new statistics log"
end
up_minutes ||= 0
tweet_count ||= 0
retweet_count ||= 0
quote_count ||= 0
hashtag_count ||= 0
geo_count ||= 0

work = lambda do |obj|
  $retry_time = 0
  next unless obj.is_a?(Twitter::Tweet)
  tweet_count += 1
  puts obj
  retweet_count += 1 unless obj.retweeted_tweet.nil?
  quote_count   += 1 if     obj.quote?
  hashtag_count += 1 unless obj.hashtags.empty?
  unless (obj.geo.nil? or obj.geo.coordinates.empty?)
    geo_count += 1
    id = obj.user.id
    db[:users].update_one({ _id: id }, { updated_at: Time.now }, upsert: true)
  end
  puts "total: #{tweet_count}; retweet: #{retweet_count}; quote: #{quote_count}"
  puts "have_hashtags: #{hashtag_count}; have_geo: #{geo_count}"
end

## begin monitoring
start_time = Time.now
$retry_time = 2.5
begin
  raise Interrupt "Reconnecting failed, quit." if $retry_time > 160
  if area == :sample
    client.sample(&work)
  else
    client.filter(locations: bounding_boxes[area], &work)
  end

rescue Interrupt => err
  puts err
  unless area == :sample
    elapse = (Time.now - start_time).to_i / 60
    File.write(statistics_fname, [up_minutes + elapse,
                                  tweet_count,
                                  retweet_count,
                                  quote_count,
                                  hashtag_count,
                                  geo_count].join("\n") + "\n")
  end

rescue EOFError
  $retry_time *= 2
  puts "Disconnected, reconnecting in #{$retry_time} seconds..."
  sleep($retry_time)
  retry

end
