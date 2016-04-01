---
title: '[Elasticsearch配置项(二)]Node,Threadpool模块配置'
date: 2016-03-21 21:32:41
thumbnail: /images/thumbnail16.jpg
banner: /images/thumbnail16.jpg
toc: true
categories: elasticsearch
tags: [elasticsearch]
---
>接上文。。。。。。按照官方文档(版本2.2)和一些参考资料整理一下elasticsearch的可配置项。先整理了Node，ThreadPool两个模块的可配置项，其他模块(比如Cluster)会在之后慢慢整理的。本文只包含两个模块可用配置项的含义及用法，并不涉及应该如何优化，这是为什么呢？因为俺也不会。。。。。(欢迎指正错误，康桑阿米达)

相关博客：[elasticsearch 配置项(一)](http://yemengying.com/2016/03/18/Elasticsearch%E9%85%8D%E7%BD%AE%E9%A1%B9-Local-gateway-HTTP-Indices-Network-Settings%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE/)

wuli光洙镇楼~~
![hahaha](/images/guangzhu.jpg)

<!-- more -->

### 参考文档（万分感谢）

* http://www.opscoder.info/es_threadpool.html
* http://www.voidcn.com/blog/BrotherDong90/article/p-3851633.html

### Node(节点)
每当启动一个Es实例，就是启动了一个节点。多个连接在一起的节点组成的集合就是集群。
默认情况下，每个节点都可以通过HTTP和Transport通信。每个节点都知道集群中的其他节点，可以将客户端的请求转发到合适的节点。除此之外，每个节点还有着以下一种或多种具体角色。
** Master-eligible node (候选主节点) **
当一个节点的`node.master`被设置为`true`(默认为true)时，该节点就有资格被选为master节点，控制集群。
** Data node (数据节点) **
配置项`node.data`设置为true的节点称为数据节点。数据节点存储数据并且处理和数据相关的一些操作，比如CRUD，查找和聚合等。
** Client node (客户端节点) **
当一个节点的`node.master`和`node.data`均被设置为`false`时，它既不能存储数据也不能作为一个主节点。它被看做一个“路由器”，负责将集群层面的请求转发到主节点，将数据相关的请求转发到数据节点。
** Tribe node (部落节点) **
部落节点是一种特殊类型的客户端节点，可通过`tribe.*`配置项配置。部落节点可以连接多个集群，并且可以跨集群执行查找和其他操作。

默认情况下，每个节点即是主节点也是数据节点。但是当集群扩大后，更好的做法是将主节点和数据节点独立开。
> Coordinating node(协调节点)：一些请求可能会涉及到多个数据节点，比如搜索或批量索引。搜索请求一般分为两个阶段，由接受客户端请求的节点做协调，称为协调节点。在搜索的第一阶段协调节点会将请求转发到数据节点，每个节点在本地执行请求，并将结果返给协调节点。在第二阶段，协调节点会将各个结果汇总在一起。这意味着负责接受请求的客户端节点(也就是协调节点)需要用足够的内存和CPU来处理查询结果的汇总。

#### Master-eligible node(候选主节点)
主节点主要负责创建索引，删除索引，追踪集群中的节点，分配分片等，所以有一个稳定的主节点对于集群来说非常重要，非常重要，非常重要（说三遍，哈哈哈）。集群中任何有资格成为主节点的节点都可能被选为主节点。
由于索引和搜索会对节点资源造成压力，在集群比较大时，最好将主节点和数据节点的角色区分，即不要让主节点同时也是数据节点。
通过下面的配置可以设置一个专门的主节点(只是主节点不是数据节点)。
```bash
 node.master: true
 node.data: false
```
** 通过minimum_master_nodes来避免脑裂现象 **
`discovery.zen.minimum_master_nodes`配置项说明形成集群时，集群中有资格成为主节点的节点数最少是多少，默认为1.
脑裂现象：假设集群中有两个有资格成为主节点的候选主节点，`discovery.zen.minimum_master_nodes`配置默认为1。当由于网络问题中断了两个节点间的通信，这时两个节点都只会发现一个有资格成为主节点的节点（自己本身）， 根据配置(minimum_master_nodes = 1),符合组成一个集群的条件，所以每个节点都会成为新的master节点，从而导致形成了两个集群，也就是脑裂。直到其中一个节点重启，才会重新形成集群，并且写入重启节点的数据会丢失。假设集群中有三个有资格成为主节点的候选主节点，而这时`minimum_master_nodes`设置为2，如果一个节点与其他两个失去了通信，被独立的节点会发现不满足设置的条件(有两个候选主节点)，所以不会选举自己为主节点。而剩下两个节点会选举出一个新的主节点，确保正常运行。

`discovery.zen.minimum_master_nodes`最好设置为(候选主节点数/2) + 1, 举个例子，当有三个候选主节点时，该配置项的值为(3/2)+1=2。
也可以通过下面的API动态的更新这个值：

```json
PUT _cluster/settings
{
  "transient": {
    "discovery.zen.minimum_master_nodes": 2
  }
}
```
#### Data node(数据节点)
数据节点包含着索引文档的分片，负责处理和数据相关的操作，比如CRUD，搜索和聚合。这些操作会涉及到IO,内存和CPU，所以要注意监控这些资源，添加更多的数据节点以防负载过重。通过下面的配置可以设置一个专门的数据节点(只是数据节点不是主节点)。
```bash
 node.master: false
 node.data: true
```
#### Client node(客户端节点)
客户端节点主要负责路由请求，汇总搜索结果等，本质上来看，客户端节点更像一个负载均衡器。

> 注意：集群中添加过多的客户端节点会增加整个集群的负担。所以不要过大夸大客户端节点的好处，数据节点也可以像客户端节点一样服务。

 通过下面的配置可以设置一个专门的客户端节点(不是数据节点也不是主节点)。
 ```bash
 node.master: false
 node.data: false
 ```
#### 设置节点的数据路径
`path.data`
每个数据节点和主节点都需要在文件中存储一些关于分片，索引和集群的元数据。`elasticsearch.yml`文件中的`path.data`可以配置文件的绝对路径或相对路径，默认值是`$ES_HOME/data`，也可以通过命令配置。

```bash
./bin/elasticsearch --path.data /var/elasticsearch/data
```
`node.max_local_storage-nodes`
上面的设置可以被不同的节点共享（在生产环境下建议一个服务器只运行一个节点）。为了避免多个节点共享同一个路径，可以在`elasticsearch.yml`中添加如下配置。
```bash
node.max_local_storage_nodes: 1
```
> 注意，不要将不同类型节点的信息存储到同一个目录下，可能会造称数据丢失。

### Thread Pool(线程池)
为了提升线程内存消耗的管理，每个Es节点都有多个线程池。
#### 线程池类型
下面介绍一下线程池的三种类型和各自的一些参数：
**cached**:
	`cached`类型的线程池没有限制大小，当有pending的请求时就会创建一个线程。这类线程池可以防止请求阻塞或被拒绝。未使用的线程会在过期(默认5分钟)之后消亡。`cache`类型专门为`generic`线程池保留的。
	`keep_alive`参数定义了未使用的线程的存活时间。
	```bash
	threadpool:
    generic:
        keep_alive: 2m
	```
**fixed**:
	`fixed`类型的线程池持有固定个数的线程处理请求队列。`size`参数用来控制线程的个数，默认为cpu核心数的5倍。`queue_size`参数用来控制请求队列的大小。默认值为-1，意味着无上限。如果请求队列已满，那么接下来到来的请求会被终止。
	```bash
	threadpool:
    index:
        size: 30
        queue_size: 1000
	```
**scaling**:
	`scaling`线程池中线程数可动态变化。线程数在1和`size`参数值的中间。
	`keep_alive`参数定义了未使用的线程的存活时间。
	
	```bash
	threadpool:
    warmer:
        size: 8
        keep_alive: 2m
	```

#### Es中重要的线程池
以下是Es中几个比较重要的线程池及他们的类型:

|线程池|作用|
|:---|:---|
|generic|负责一些诸如发现节点之类的通用操作。该线程池类型为`cache`。
|index|负责索引数据/删除数据操作，类型为`fixed`，默认线程数为`available processors`,队列大小为`200`。
|search|负责统计/搜索操作，类型为`fixed`,默认线程数为`int((available_processors * 3) / 2) + 1`,队列大小为`1000`。
|suggest|负责获取提示操作，类型为`fixed`,默认线程数为`available processors`,队列大小为`1000`。
|get|负责get操作，类型为`fixed`,默认线程数为`available processors`,队列大小为`1000`。
|bulk|负责批量操作，类型为`fixed`,默认线程数为`available processors`,队列大小为`50`。
|percolate|负责过滤操作，类型为`fixed`,默认线程数为`available processors`,队列大小为`1000`。
|snapshot|负责快照/恢复操作，类型为`scaling`,默认线程数为`min(5, (available processors)/2)`,默认未使用线程的存活时间为`5m`。
|warmer|负责warm-up操作，类型为`scaling`,默认线程数为`min(5, (available processors)/2)`,默认未使用线程的存活时间为`5m`。
|refresh|负责更新操作，类型为`scaling`,默认线程数为`min(10, (available processors)/2)`,默认未使用线程的存活时间为`5m`。
|listener|负责java client的执行，类型为`scaling`,默认线程数为`min(10, (available processors)/2)`,默认未使用线程的存活时间为`5m`。

#### 处理器设置
Es可以自动检测处理器的数量，线程池的配置也会基于这个值。可能存在检测失败的情况，这是可以通过`processors`配置显式设置这个值。

> 注意以上这些配置如果不是很了解，还是不要轻易改动，使用默认配置即可。

看累了吧，分享个觉得还不错的TED视频~~
<object width="640" height="360"><param name="movie" value="http://swf.ws.126.net/openplayer/v02/-0-2_MBFLN6BJF_MBFLNJGFE-vimg1_ws_126_net//image/snapshot_movie/2016/2/F/F/MBFLNJGFF-1423031805654.swf?isTEDPlay=1"></param><param name="allowScriptAccess" value="always"></param><param name="wmode" value="transparent"></param><embed src="http://swf.ws.126.net/openplayer/v02/-0-2_MBFLN6BJF_MBFLNJGFE-vimg1_ws_126_net//image/snapshot_movie/2016/2/F/F/MBFLNJGFF-1423031805654.swf?isTEDPlay=1" type="application/x-shockwave-flash" width="640" height="360" allowFullScreen="true" wmode="transparent" allowScriptAccess="always"></embed></object>






 
