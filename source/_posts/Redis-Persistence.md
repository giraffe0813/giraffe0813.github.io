---
title: Redis相关---Redis持久化(AOF&Snapshot)
date: 2016-04-24 15:09:18
thumbnail: /images/redis.png
toc: true
categories: redis
tags: [redis]
---
>恩，先说点题外话。上周被小虐了一丢丢,但有很大收获,了解了自己的不足,知道了自己还在哪些方面有欠缺。更坚定了一直以来的想法,应届生或者工作时间不长的人找工作公司规模，福利薪资都是浮云，跟对人才是最重要的,非常及其以及特别的重要,一个人好技术牛的部门leader绝对抵得上5K的薪资。这也完美解释了为何部门拆分,老大和磊哥走了之后这么不舒服,这尼玛相当于给我减了5K的工资啊,扯远了。。。。还是来看Redis吧，整理下Redis持久化的相关内容，加深下印象。不想看文字的可直接看下面的图😂。

<!-- more -->
![概要](/images/persistent.png)
### AOF持久化
AOF(append-only file只追加文件)持久化会将执行的写命令追加到AOF文件的末尾。在恢复数据时，只要从头到尾的执行AOF文件中包含的所有写命令即可
#### AOF可用配置
配置项 | 含义|可选值 
------------ | ------------- | 
appendonly | 是否开启AOF持久化|no,yes 
appendfsync | 将写命令同步到硬盘的间隔|everysec,always,no
no-appendfsync-on-rewrite |对文件进行压缩时能否执行同步操作|no,yes
auto-aof-rewrite-percentage|当前文件大小是上一次压缩后AOF文件大小的多少时执行自动压缩|
auto-aof-rewrite-min-size|当前文件大小是多少时执行自动压缩
dir path/to/appendonly.aof|文件存放位置

其实主要的就是appendfsync配置项，有三个可选值，`always`(每次执行写操作都要同步写入硬盘),`everysec`(每秒执行一次同步),`no`(让系统决定何时执行同步)。虽然选择`always`可将数据丢失减少到最少，但这种策略会对硬盘进行大量的写入操作，处理命令速度受到硬盘限制。建议选择`everysec`。

#### AOF优缺点
优点：
* 比快照方式可靠，默认每秒同步一次，意味着最多丢失一秒的数据

缺点：
* 相同数据集大小，AOF文件会比快照文件大

#### AOF文件格式
一开始以为Redis就是将写命令原封不动的存储到AOF文件中，自己试了一下才知道，AOF文件是使用Redis网络通讯协议的格式来保存这些命令。
举个🌰：
```bash
127.0.0.1:6379> set number 21
OK
```
将上面的命令存储到AOF文件就是下面的样子（select 0命令是代表选择id为0的数据库）：

```bash
*2
$6
SELECT
$1
0
*3
$3
SET
$6
number
$2
21
```
来看下AOF文件的格式，了解它的格式可以让我们很容易的解析它，指不定哪天能用到啊🌝。*号代表命令参数的个数(在上面的例子中参数为set、number、21,共3个)，$号代表第N个参数的长度，在上面的例子中，三个参数的长度分别为3，6，2。
#### 压缩AOF文件
Redis可以自动压缩(也可以叫重写)AOF文件，用户也可以通过`BGREWRITEAOF`命令来压缩AOF文件。这里的压缩，不是平时说的压缩的意思，是指创建一个新的文件来替换旧的文件，两个文件保存的数据状态完全一致。如果在本地手动执行`BGREWRITEAOF`命令，可以看到会生成一个temp-rewriteaof-*.aof的临时文件，在结束后替换appendonly.aof文件，从而减小appendonly.aof文件的大小。我知道这样说其实还是不好理解，还是上图吧。为了方便画图，我就默默假装Redis直接将命令按输入的样子存储到AOF文件中，不要拆穿我🙈。
假设执行的写命令是下面的样子：
![执行的写操作](/images/write.png)
那么看看在压缩前AOF文件的样子(就是存储了除get命令外的所有写命令)：
![压缩前的AOF文件](/images/aof.png)
接着执行BGREWRITEAOF命令，Redis会生成一个新的文件来替换旧的AOF文件，从而达到压缩的目的：
![压缩后的AOF文件](/images/yasuo.png)

可以看到压缩前文件中存储了7条写命令，压缩后只存储一条。而且执行set number 1和6次incr number命令 ，与执行set number 7命令效果是一样的。从而即保证了数据的正确性又压缩了文件的大小。
>需要注意的是，Redis是启用子进程来进行AOF文件的压缩，在这期间主进程还是可以继续处理请求的，如果这时请求有写操作就可能导致当前数据库与压缩后的AOF不一致。Redis增加了一个缓存来解决这个问题，主进程在接收到新的写操作命令之后，会将命令写入现有的AOF文件和缓存中。在子进程完成新的AOF文件之后会将缓存的内容写入到新的AOF文件中，并改名覆盖旧的AOF文件。


### 快照持久化
#### 快照可用配置
配置项 | 含义|可选值 
------------ | ------------- | 
save m n |m秒内有n次写入时创建快照 |
stop-writes-on-bgsave-error  | 创建快照失败后是否继续执行写命令|no,yes
rdbcomression|是否压缩快照文件|no,yes
dbfilename|命名快照文件|
dir path/to/dump.rdb|文件存放位置

#### RDB文件结构
RDB文件是一个经过压缩的二进制文件，不同类型的键值对会采用不同的方式来保存它们。具体的结构我也还没理清楚。。可以参考这篇文章[http://redisbook.com/preview/rdb/rdb_struct.html](http://redisbook.com/preview/rdb/rdb_struct.html)

#### 创建快照

创建快照的方式有以下几种：
* 客户端发送`BGSAVE`命令。与压缩AOF文件一样，Redis会fork出一个子进程，由子进程负责将快照写入硬盘。
* 客户端发送`SAVE`命令。Redis会开始创建快照，并且在快照创建完成之前不再处理其他命令。不常使用`SAVE`命令
* 在满足配置的save m n选项时。比如，配置了save 60 1000,会在满足60秒内有1000次写入的时候开始创建快照。
* 当接收到`SHUTDOWN`请求时，Redis会执行`SAVE`命令,并且不再执行任何其他命令。
* 当从服务器向主服务器发送SYNC命令时，如果主服务器不是刚刚执行过`BGSAVE`命令,就会开始执行`BGSAVE`来创建快照。

#### 快照优缺点
优点：
* 文件紧凑,适用于做不同版本的数据备份
* 与AOF相比在恢复大数据集时，更快
* 很方便传送到另一个数据中心

缺点：
* 一旦Redis出现问题，上一次创建快照之后的数据就丢失了

### 参考文档
《Redis In Action》
[http://www.redis.cn/topics/persistence.html](http://www.redis.cn/topics/persistence.html)
[http://redisbook.readthedocs.org/en/latest/internal/aof.html](http://redisbook.readthedocs.org/en/latest/internal/aof.html)

