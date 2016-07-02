title: Redis相关---【译】利用Redis起飞吧
date: 2016-04-02 10:56:03
comment: true
thumbnail: /images/redis.png
toc: true
categories: redis
tags: [redis, 翻译]
---
>一直以来对Redis的使用都很是简单粗暴，不得精髓，趁假期好好补补。翻译一篇Redis之父Antirez的博客，文章中讲述了几个利用Redis解决实际问题的例子。并非逐字逐句的翻译，有些不太懂的地方就任性的跳过了😋，翻译这篇博客只做加深印象之用，建议大家还是出门左转看原文吧。。。。。。

原文地址：[http://oldblog.antirez.com/post/take-advantage-of-redis-adding-it-to-your-stack.html](http://oldblog.antirez.com/post/take-advantage-of-redis-adding-it-to-your-stack.html)

<!-- more -->
### 写在前面 
 Redis在很多方面不同于MySql等数据库：比如，Redis使用内存做主要的存储，使用磁盘实现数据持久化；数据模型不同；Redis是单线程的等等。但我认为最大的不同是如果开发者想要使用Redis，无需切换到Redis。可以在不把Redis作为数据库的前提下，利用Redis实现一些以前不好实现的功能或者优化遗留的问题。   
 完全切换到Redis当然也是可行的，许多开发者在想使用Redis的一些特性时，会将Redis当做主数据库，但将一个已经在生产环境中运行的项目切换到Redis显然是个大工程。而且有一些应用并不适合将Redis作为数据库：比如Redis的数据集不能比可用内存大，所以对于大数据量的应用，Redis可能不是一个好的选择。   
下面会介绍一些在已有项目中加入Redis的例子，会向大家展示如何在不把Redis当做主要数据库的情况下利用Redis的某些特性解决问题。

### 在主页展示最新的评论列表
我敢打赌，如果每次都通过下面的查询语句获取最新评论，那么网站性能会很差。
```sql
SELECT * FROM foo WHERE ... ORDER BY time DESC LIMIT 10
```
展现最新添加的某些东西在网站应用中十分常见，下面看看如何利用Redis优化这类问题。假设网站想要展示最新的20条评论，并且还有个“展示全部评论”的链接，通过这个链接可以通过分页的形式查看历史评论记录。
我们还假设每条评论都存储在数据库中，并且有一个自增的Id。
我们可以使用一个很简单的Redis同时解决展现最新评论和分页展现历史评论的问题。

* 每当创建一条新的评论，将评论的Id插入到Redis的一个列表中:**LPUSH latest.comments <ID>**
* Redis支持将列表修剪到指定长度。所以我们可以通过**LTRIM latest.comments 0 5000.**操作维持列表中始终存储5000个最新的评论Id.
* 每次想要获取指定范围内的评论时，可以使用下面的函数（伪代码）.
```python
FUNCTION get_latest_comments(start,num_items):
    id_list = redis.lrange("latest.comments",start,start+num_items-1)
    IF id_list.length < num_items
        id_list = SQL_DB("SELECT ... ORDER BY time LIMIT ...")
    END
    RETURN id_list
END
```
这段代码的功能很简单。在Redis中维护一个`“动态缓存”`，经常更新,存储最新评论的Id,缓存中限制最多只存5000个Id。在系统第一次启动时,缓存列表中的Id个数为0。所以我们上面实现的方法会在先访问Redis，如果参数(start/count)的超过了列表范围，再去访问数据库。
我们无需刷新缓存，并且只会在用户想要查看最新5000条评论之外的评论时才会访问数据库。也就是说展示最新评论的主页，和查看历史评论前几页都无需访问数据库。
### 删除和过滤
在遇到评论被删除时，我们可以使用`LREM`命令来删除Redis列表中缓存的评论Id。如果删除评论的情况不常见，也可以在展示指定评论时跳过它，因为我们在根据评论Id去数据库查询评论具体内容时，数据库会告诉我们某条评论已经不存在了。
### 选手积分榜及相关问题
另一个比较常见的，用数据库实现性能较差的需求是按分数排序，展现列表，并且实时更新，一个常见的例子就是在线游戏中的选手积分榜。在在线游戏中，需要接受高频率的来自不同用户的分数更新，通过这些分数实现以下需求：
* 在积分榜中展现分数最高的100位选手
* 展现用户的当前排名

这些操作用Redis的`有序集合`来实现是很简单的，哪怕你的系统每分钟要更新上百万的分数。
每当接受到一个用户的新分数时，我们对Redis做如下的操作：
```bash
ZADD leaderboard <score> <username>
```
ps:也可以使用userId，而不是用户名, 看开发者的个人喜好。
接下来，我们可以很简单的通过下面的操作获得分数排名前100的用户
```bash
ZREVRANGE leaderboard 0 99
```
也可以通过
```bash
ZRANK leaderboard <username> 
```
来获取用户的当前排名。
除此之外，我们还可以获得排名靠近当前用户的用户，以及等等等等。。。。。
### 按照用户投票和时间排序
下面谈谈选手积分榜问题的一个变种问题。在诸如Reddit和Hacker News这类的网站中，新闻是按照类似下面公式计算得出的分数来排序的。
```bash
score = points / time^alpha
```
也就是说用户的投票会在一定很小程度上提升新闻的排名，而时间流逝则会使新闻的排名呈指数级下降。实际的算法会比我们的例子更复杂，但解决的方式是一样的。
首先假设只有最新发布的1000条新闻才有资格出现在首页上，所以我们只关注最新发布的1000条新闻，忽略太老的新闻，大致解决方法如下：
* 每当新发布一条新闻，将其Id加入到Redis的列表中，通过**LPUSH+LTRIM**将列表维持到只保存最新发布的1000条新闻的Id。
* 通过一个定时任务获取Redis中Id列表，并且不断的计算列表中新闻的分数。将计算结果通过ZADD操作存储到一个有序集合中，同时将旧的新闻从有序列表中清除。
主要思想就是，有序集合中存储着1000条最新新闻，并按分数排序。分数的排序是通过后台程序完成的，与浏览网站的用户数无关。

### 将元素过期
我们还可以利用有序集合实现将超过指定时间的元素在数据库中删除或置为过期。具体做法如下：
* 每当数据库中新加入一个元素时，同时将其添加到有序集合中，分数是当前时间加上指定的存活时间
* 让一个后台任务查询有序集合，利用**ZRANGE ...WITHSCORES**获取元素，如果元素对应的分数小于当前时间，说明元素已过期，在数据库中删除对应记录。

### 计数器
Redis可以用来实现计数器,使用INCRBY操作即可。
相信很多人都曾想过在数据库中添加一张计数器表，用来为用户展现一些统计信息，但又考虑到需要对这张表进行大量的写操作而放弃，本宝宝曾经无数次遇到过这个问题。
现在，我们可以通过Redis来解决这个问题。通过Redis我们可以为计数器原子性的增加计数,也可以使用`GETSET`命令重置计数器或者为计数器设置过期时间。比如我们可以按照如下做法实现计数一个用户指定时间内的页面访问量，如果超过了指定值，比如20，就弹出一个提示。
```bash
INCR user:<id>
EXPIRE user:<id> 60
```
### 统计指定时间内不同的用户
另一个用数据库实现比较困难，但是用Redis却很简单的功能就是统计指定时间内访问某资源的用户数。比如我想知道访问指定页面的用户数(相同用户访问多次只计算一次)，我只需要在新增一个页面浏览(PV)时,执行下面的操作：
```bash
SADD page:day1:<page_id>  <user_id>
```
想获得某页面的用户访问数，只需执行**SCARD page:day1:<page_id>**即可。

### 实时分析
我们已经看过了几个利用Redis如何实现一些利用数据库不好实现的功能，如果深入学习Redis的命令集，活用Redis中的数据结构，我们可以很容易的实现实时统计的功能，用来增强反垃圾邮件系统，或者通过分析得到的一些数据来提高网站的质量。

### 发布/订阅
Redis中实现了一个高性能的`发布/订阅`系统，易于使用，稳定，性能高，并且支持模式匹配。详细的信息可以阅读[Redis官方文档](http://redis.io/topics/pubsub)

### 队列
大家可能已经注意到了，通过Redis对列表插入元素和弹出元素的命令，很适合用来实现一个队列。但Redis能做的远远不止这些，比如Redis弹出列表元素时还有提供[BLPOP命令](http://redis.io/commands/blpop)，可以在列表为空时，将连接阻塞。除此之外利用有序集合也可以很容易的实现一个优先队列。Redis在队列方面还有很多用法(比如`RPOPLPUSH`,`Resque`)，大家可以慢慢发掘。

### 缓存
关于这一节其实就够再写一篇博客了。简单来说，Redis可以作为`memcached`的替代品，使我们的缓存既可以存储数据又易于更新。

### 快在Redis的帮助下起飞吧
快使用Redis来增强用户体验，降低系统复杂度，加快请求响应吧~~，无需全部切换到Redis，可仅仅利用Redis实现用数据库不好实现或性能不高的新功能。

分享个觉得还不错的视频，拖延症患者可以看看，不过估计也没什么卵用，该拖还得拖，哈哈哈哈哈哈~~~
<object width="640" height="360"><param name="movie" value="http://swf.ws.126.net/openplayer/v02/-0-2_MBHQSM52F_MBI15O7QE-vimg1_ws_126_net//image/snapshot_movie/2016/3/Q/F/MBI15O7QF-1423031805654.swf?isTEDPlay=1"></param><param name="allowScriptAccess" value="always"></param><param name="wmode" value="transparent"></param><embed src="http://swf.ws.126.net/openplayer/v02/-0-2_MBHQSM52F_MBI15O7QE-vimg1_ws_126_net//image/snapshot_movie/2016/3/Q/F/MBI15O7QF-1423031805654.swf?isTEDPlay=1" type="application/x-shockwave-flash" width="640" height="360" allowFullScreen="true" wmode="transparent" allowScriptAccess="always"></embed></object>










