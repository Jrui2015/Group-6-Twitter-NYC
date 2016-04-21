> 1. design a whole UI, not single charts
> 2. problem statement specific
> 3. create data analysis questions using the domain language
> 4. create a concise but effective table for data abstraction

# What is the problem you want to sovle and who has this problem?
talk about:
1. background  
2. in what kind of situations our solution is needed  
3. what our dataset is about  
4. who has this problem and how do they benefit from our solution  

1&2.推特上有大量的信息，有些对于用户有用的信息常常淹没在巨大的信息量中； 针对用户感兴趣的话题分类，目前推特并没有提供一种有效的途径来展示最新最热的变化趋势; 基于庞大的用户数量，用户可能会错过许多值得关注的推主。our solution 在上述情况下，用户可能需要一种快速筛选推特消息的工具来帮助他们更好地了解推特世界。
3. 通过跟踪并分析实时发送的推特消息

In this project, we focus on the tweets of NYC in realtime. 

# What questions do you want to be able to answer with you viz?

> What do you mean by questions is data analysis questions. It's questions about data and domain that you can answer when you use your visualization

be specific, not abstract

1. specific: find customers with similar behaviors
2. abstract: cluster of dataset coordinates according to their similarity

问题：

1. 如何发现当前热门话题？用最近数分钟内时间段按话题频次排序的列表（list）展示，排在越前面的就是越热门的话题。
2. 如何发现不同地区人们的兴趣差异？在地理地图上用颜色标记不同话题类型（category），颜色在不同地区的集聚差异表明了不同地区人们的差异。
3. 如何发现谁对话题变得热门贡献最大？nework { node: user, area size: retweet/fav count of tweets under certain topic, link: retweet/fav }

# details
## What is your data about?
## where does it come from?
## what attributes are you going to use?
## What is their meaning?
## What are their attribute types (data abstraction)?
## Do you plan to generate derived attributes? If yes, which and why?
至少有两个衍生数据：

1. class of topic
2. geolocation distict
3. 用户兴趣组

original:
| attribute name  | attribute type  | description | value range | derived |
| --------------- | --------------- | ----------- | ----------- | ------- |
| geolocation  | Categorical  | the location of tweets | -180~180, -90~90 | N |
| hashtags  | Categorical  | the content after "#" tag in tweets | N |
| created time | Ordinal | when did the tweets be posted |20160324 - present| N  |
| retweeted/quoted tweets (as links) | Categorical | ??? |
| mentions | Categorical | the users has been mentions("@") in tweets |  | N |
| favorite/retweet/quote count | Quantitative | the number of times of "favorite" and retweet/quote of tweets | N |
| lang | Categorical | the language used of tweets | N |
| text(as detail) | Categorical | the content of each tweets | N |

alternate:
| attribute name  | attribute type  | description | value range | derived |
| --------------- | --------------- | ----------- | ----------- | ------- |
| user | Categorical  | the author name of a tweet |  | N |
| geolocation  | Categorical  | the location name of tweets | -180~180, -90~90 | N |
| hot_issue  | Categorical  | the hot topics | Y |
| created time | Ordinal | when did the tweets be posted |20160324 - present| N |
| retweeted/quoted tweets count | Quantitative | times of retweeted/quote of a tweet | N |
| mentions | Categorical | the users has been mentions("@") in tweets |  | N |
| favorite count | Quantitative | times of "favorite" of a tweet | N |
| lang | Categorical | the language used of tweets | N |
| text | Categorical | the content of each tweets | N |


- geolocation => area
- retweets/quotes => rank of trend
- text => discount/promotes/etc.


# What have others done to solve this or related problems?
answer it form [here](https://interactive.twitter.com/)

The geography of Tweets[here](https://blog.twitter.com/2013/the-geography-of-tweets)
In this visualization, the author displayed the geography patterns that emerge from aggregated geo-taged Tweets over time among the world since 2009. In this pattern, the dots represents each Tweets and the color represents count. From it we can grasp much useful information easily. Such as Istanbul, Tokyo and New York are three cities with highest tweets density.

See the State of The Union address minute by minute on Twitter[here](http://twitter.github.io/interactive/sotu2015/#p1)
It explores the realtime reaction on Twitter of specific speech. The author displayed the volume of Tweets by using line. The subjects debated and where the tweets posted from across US also showed in right map. By clicking the spikes on the chart we can know related hot topics and which paragraphs are being talked.

# What solution do you propose? How does the solution help you answer the questions stated above?
TBD

# How do you plan to verify whether you have met your goals with this project?
- map: recognize distinguishable clusters
... 

# How is your project team going to work on the project? Who is going to do what?

- Yang Liu : Programming, Data/viz model design, UI design
- Jinglong Li: Analysis, UI design, Programming
- Yuan Zhou : Writing proposal, Data/viz model design, Programming
