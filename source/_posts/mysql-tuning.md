---
title: MySQL调优
date: 2016-05-24 21:16:33
comment: true
toc: true
categories: MySQL
tags: [MySQL]
---
>啦啦啦，啦啦啦，我是卖报的小行家~~

<!-- more -->
先分享个脑洞打开的mv，coldplay新单up&up，看看会飞的海龟🐢，一点也不精彩，就看了30多遍而已😂。
<embed src="http://player.video.qiyi.com/977853bfe26ef11b25e524a983e72c30/0/0/w_19rt2btvq9.swf-albumId=5831552909-tvId=5831552909-isPurchase=0-cnId=5" allowFullScreen="true" quality="high" width="480" height="350" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash"></embed>


----------------------------------我是预示画风转变分割线-------------------------------------------------------------------------
根据视频([链接](http://www.imooc.com/learn/194))整理。
### 为什么要进行优化？
* 避免由数据库链接timeout产生页面5xx的错误
* 避免由于慢查询造成页面无法加载
* 避免由于阻塞造成数据无法提交
* 优化用户体验

### 可以从哪几个方面进行数据库优化？
![image](/images/mysql.png)
从图中可以看出，SQL及索引的优化是最重要的，成本最低效果最好。   
下面分别来看看如何优化SQL和索引。
### SQL优化
#### 慢查询日志配置
可以使用慢查询日志对有效率问题的SQL进行监控。下面是关于如何开启慢查询日志和慢查询日志的一些配置。
```bash
show variables like 'slow_query_log'; //查看是否开启了慢查询
set global slow_query_log_file='/home/mysql/sql_log/mysql-slow.log'; //设置慢查询日志的位置
set global log_queries_not_using_indexes=ON; //是否记录未使用索引的查询
set global long_query_time=1;//设置记录超过多长时间的SQL语句
set global slow_query_log=ON;//设置慢查询日志是否开启
```
慢查询日志的格式：
![慢查询日志的格式](/images/mysql2.png)
详细看一下每一行都是什么意思。
查询的执行时间 Time:140606 12:30:17
执行SQL的主机信息 User@Host:root[root] @ localhost []
SQL的执行信息 Query_time: 0.000024 Lock_time:0.000000 Rows_sent:0 Rows_examined: 0
SQL执行时间 SET timestamp=1402389328
SQL的内容:show tables
#### 分析慢查日志的工具
1.mysqldumpslow
可以使用MySQL自带的慢查询分析工具`mysqldumpslow`，可以通过`mysqldumpslow -h`来查看具体的使用方法。
eg:mysqldumpslow -t 3 /path/to/mysql-slow-query.log | more
上面的命令会列出查询时间top 3的SQL语句，具体格式如下图，会列出SQL执行的次数，SQL来执行的时间，锁定的时间，发送的函数，由谁在哪个服务器上执行的和具体的SQL内容。
![mysqldumpslow格式](/images/mysql3.png)
mysqldumpslow是比较常用的慢查询日志分析工具，但是分析结果包含的信息比较少，对于SQL优化来说可能还不太够。下面看看另一种分析工具。

2.pt-query-digest
`pt-query-digest`支持将分析结果保存到文件或数据表中。
```
输出到文件
pt-query-digest slow.log > slow_log.report
输出到数据库表
pt-query-digest slow.log -review \
h=127.0.0.1,D=test,p=root,P=3306,u=root,t=query_review \
--creat-reviewtable \
--review-history t=hostname_slow
```
通过`pt-query-digest --help`可以查看具体的使用方式。
eg: pt-query-digest /home/mysql/data/mysql-slow.log | more
通过上面的命令，会列出慢查询日志的分析结果，分为三个部分。
第一部分中包含日志中有多少个SQL，多少个不同的SQL，SQL执行的时间范围，总的执行时间，最短的执行时间，最长的执行时间，平均执行时间，总锁定时间，总发送行数，总检索行数等等。 
![pt-query-digest格式](/images/pt1.png)
第二部分包含关于  表和执行语句的统计，可以看到哪个表的哪个操作的实行时间是最多的，也可以看到对应的响应时间和调用次数。 
![pt-query-digest格式](/images/pt2.png)
第三部分就是具体的SQL的分析，包括对应语句执行时间，锁定时间，发送行数，检索行数等等。
![pt-query-digest格式](/images/pt3.png)
#### 定位有问题的SQL
通过上面的慢查询日志分析我们可以定位需要优化的SQL,通常有三种：
* 查询次数多且每次查询占用时间长的SQL：通常为pt-query-digest分析的前几个查询。
* IO大的SQL：注意pt-query-digest分析中的Rows examine项
* 未命中索引的SQL： 注意pt-query-digest分析中Rows examine和Rows Send的对比。

#### 通过Explain查询和分析SQL的执行计划
可以通过Explain查询SQL的执行计划，例子如下：
![Explain](/images/explain.png)
explain返回的各列的含义：

 列 | 含义 | 
:----------- | :-----------: |
table       | 显示查询是关于哪个表的        |
type         | 很重要的列，显示连接使用了何种类型。从最好到最差的连接类型为const、eq_reg、ref、range、index和ALL |
possible_keys       | 显示可能应用在这张表中的索引。如果为空，没有可能应用的索引        |
key         | 实际使用的索引。如果为NULL，则没有使用索引        |
key_len       | 使用的索引的长度。在不损失精确性的情况下，长度越短越好        |
ref         | 显示索引的哪一列被使用了|
rows       | MYSQL认为必须检查的用来返回请求的行数|
extra| 当这一列的值是Using filesort或Using temporary时，说明查询需要优化了
### 索引优化
#### 如何选择合适的列来建立索引
* 在where从句，group by从句，order by从句，on从句中出现的列
* 索引的字段越小越好
* 在建立联合索引时，离散度大的列放大联合索引的前面

#### 如何维护和优化索引
要避免重复及冗余索引，重复索引是指相同的列以相同的顺序建立的同类型的索引。冗余索引是指多个索引的前缀列相同，或是在联合索引中包含了主键的索引。 
可以使用`pt-duplicate-key-checker`工具可以检查重复及冗余索引。
同时还要注意及时删除由于业务变更不再使用的索引。目前MySQL中还没有记录索引的使用情况，但在PerconMuSQL和MariaDB中可以通过INDEX_STATISTICS表来查看哪些索引未使用，在MySQL中目前只能通过慢查询日志配合pt-index-usage工具来进行索引的使用情况的分析。

>欢迎指正错误，欢迎一起讨论~~

