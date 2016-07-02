title: '[Elasticsearch配置项(一)]Local gateway,HTTP,Indices,Network Settings模块配置'
date: 2016-03-18 17:48:10
thumbnail: /images/trim.jpg
toc: true
categories: elasticsearch
tags: [elasticsearch]
---
> 近两周线上的搜索接口间隔性莫名其妙的出现莫名其妙的异常，比如神马NoAvailableThread，NoAvailableWorker之类的。可能是由于部门中没有很懂elasticsearch的人，只能摸着石头过河，所以一直使用elasticsearch的默认配置并没有对其线程池和内存分配进行优化造成的。所以按照官方文档(版本2.2)和一些参考资料整理一下elasticsearch的可配置项，看看可不可以优化一下。先整理了Local gateway,HTTP,Indices,Network Settings四个模块的可配置项，其他模块(比如Cluster)会在之后慢慢整理的。本文只包含四个模块可用配置项的含义及用法，并不涉及应该如何优化，这是为什么呢？因为俺也不会。。。。。(欢迎指正错误，康桑阿米达)

相关博客：[elasticsearch 配置项(二)](http://yemengying.com/2016/03/21/elasticsearch-settings2/)
<!-- more -->
![哇咔咔咔](/images/baobao.jpg)

### 参考资料(万分感谢)：

* http://donlianli.iteye.com/blog/2115979
* http://aoyouzi.iteye.com/blog/2164820
* http://blog.csdn.net/jingkyks/article/details/41081261
* http://m.oschina.net/blog/387512
* http://my.oschina.net/secisland/blog/618702?fromerr=ZGR1hlby#OSC_h4_5
* https://github.com/chenryn/ELKstack-guide-cn/blob/master/elasticsearch/performance/cache.md

### Local gateway模块
官网对应链接：[Local gateway](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-gateway.html)   
该模块用于存储集群信息和分片数据，以便整个集群重启后可以恢复。
以下的一些静态配置，需要在集群的每一个节点上设置，用来控制节点需要等待多长时间之后再尝试恢复存储在本地的数据。

|配置项|含义
|:---|:---|
|gateway.expected_nodes|期望的集群中节点的数量，当集群中的节点数达到设定值时立即开始启动恢复本地数据的进程(会忽略recover_after_time配置)，默认为0|
|gateway.expected_master_nodes|期望的集群中master节点的数量，当集群中的节点数达到设定值时立即开始启动恢复本地数据的进程(会忽略recover_after_time配置)，默认为0|
|gateway.expected_data_nodes|期望的集群中master节点的数量，当集群中的节点数达到设定值时立即开始启动恢复本地数据的进程(会忽略recover_after_time配置)，默认为0|
|gateway.recover_after_time|当没有达到期望的节点数时，恢复进程会在等待配置时间之后尝试启动。当期望的节点数设置为1时，等待时间默认为5m

一旦到达了recover_after_time设置的时间，还要满足以下的配置条件，恢复进程才会启动。

|配置项|含义
|:---|:---|
|gateway.recover_after_nodes|需要多少个节点加入集群|
|gateway.recover_after_master_nodes|需要多少个master节点加入集群|
|gateway.recover_after_data_nodes|需要多少个data节点加入集群|

>注意：这些配置只有在整个集群重启时才会有用。

### HTTP模块
官网对应链接：[HTTP](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-http.html)   
HTTP模块用来通过HTTP暴露Es的API。因为HTTP机制是完全异步的，这意味着等待响应时不会阻塞线程。使用异步的通信可以解决[C10k](http://en.wikipedia.org/wiki/C10k_problem)的问题。
如果可以，可考虑使用[HTTP keep alive](https://en.wikipedia.org/wiki/Keepalive#HTTP_Keepalive)来连接以便提升性能。并且不要在客户端使用[HTTP chunking](https://en.wikipedia.org/wiki/Chunked_transfer_encoding)。
#### 配置
下面表中是关于HTTP模块的一些配置。需要注意的是，它们都不能动态更新，必须配置在`elasticsearch.yml`文件中。

|配置项|含义
|:---|:---|
|http.port|绑定端口的范围 默认9200-9300
|http.publish_port|客户端与节点交互时需要使用的端口。这一配置在集群节点处于防火墙后时很有用，默认和`http.port`中分配的端口一致。
|http.bind_host|绑定http服务的host地址，默认和`http.host`(如果设置了)或者`network.bind_host`一致
|http.publish_host|客户端访问的host地址，默认和`http.host`(如果设置了)或者`network.public_host`一致
|http.host|用来设置`http.bind_host`和`http.publish_host`,默认为`http.host`或者`network.host`
|http.max_content_length|设置请求内容的最大大小。默认`100mb`。如果设置的数值超过了`Integer.MAX_VALUE`,会被重置为100mb。
|http.max_initial_line_length|HTTP请求URL的最大长度，默认`4kb`
|http.max_header_size|请求头的最大大小，默认`8kb`
|http.compression|是否支持压缩(使用Accept-Encoding)，默认`false`
|http.compression_level|定义使用的压缩级别，默认为6
|http.cors.enabled|是否允许跨域请求。默认为`false`
|http.cors.allow-origin|定义允许哪些源请求。可以使用正则表达式，例如`/https?:\/\/localhost(:[0-9]+)?/`可设置支持本地HTTP和HTTPS请求。也可以设置为`*`,但是会存在安全隐患，因为任何来源都可访问Elasticsearch(以下简称为Es)实例。
|http.cors.max-age|	浏览器会发送一个“预检”的OPTIONS请求，来检查CORS设置。`max-age`定义应该缓存多长时间的结果。默认为`1728000`（20天）
|http.cors.allow-methods|定义了允许的请求方式，默认允许`OPTIONS`, `HEAD`, `GET`, `POST`, `PUT`, `DELETE`
|http.cors.allow-headers|定义了允许的请求头信息。默认允许`X-Requested-With`, `Content-Type`, `Content-Length`
|http.cors.allow-credentials|是否返回设置的`Access-Control-Allow-Credentials`头信息。默认为false
|http.detailed_errors.enabled|是否输出详细的错误信息和堆栈。默认为`true`
|http.pipelining|是否启用HTTP管道支持, 默认为true
|http.pipelining.max_events|在一个HTTP连接被关闭之前内存队列中允许的最大的事件数量，默认为`10000`

该模块也可使用一些公共的网络配置(见网络设置一节)。

#### 禁用HTTP
HTTP模块可以通过将`http.enable`设置为false来禁用。Es节点(和Java客户端)的内部通信使用transport接口，而非HTTP。这意味着我们可以将不接受直接REST请求的节点的HTTP禁用。比如，可以将数据节点的http禁用，创建非数据节点用来处理所有的REST请求。需要注意的是，不能向一个已经禁用了HTTP的节点直接发送任何REST请求。

### Indices(索引模块)
官网对应链接：[Indices](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-indices.html)
这一模块可以对所有索引的索引相关配置进行全局控制。
相关的配置如下：
#### Circuit breaker(断路器)
官网对应链接：[Circuit breaker](https://www.elastic.co/guide/en/elasticsearch/reference/current/circuit-breaker.html)    
该模块用来限制内存的使用，避免出现内存溢出。
Es中包含多个Circuit breaker(断路器)用来阻止可能造成OutOfMemoryError异常的操作。此外，还有一个父级别断路器限制了可以使用的总内存。
这些配置都可通过[Cluster-update-settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-update-settings.html)动态更新。
**父断路器**
父级别的断路器可以通过`indices.breaker.total.limit`来设置，默认是JVM堆的70%

**Filed data断路器**
允许Es提前估计加载一个字段需要的内存，然后检查加载需要的fielddata会不会导致总的内存大小超过设置的百分比。这样可以预防在加载的过程中产生异常。默认的限制是60%的JVM堆，可以通过以下参数配置。
`indices.breaker.fielddata.limit`：限制fielddata所能占用的最大内存，默认为JVM堆的60%
`indices.breaker.fielddata.overhead`:一个常量。es将使用这个值乘以field实际的大小作Field估算值，默认为1.03
**请求断路器**
允许Es阻止使用内存超过限制的请求。
`indices.breaker.request.limit`:默认JVM堆的40%
`indices.breaker.request.overhead`:一个常量。所有请求的预估内存乘以这个常量就是最终的估计值。默认为1

#### Fielddata cache(字段数据缓存)

限制内存中的数据缓存可以使用多大的堆内存
field data缓存主要用于针对一个字段排序和做聚合计算。为了快速的访问某些值，Es会将这些字段值加载到内存中。需要注意的是将字段加载到内存很耗费资源，所以官方建议保证有足够的内存，并且保持所有字段被加载。
field data内存的大小可通过`indices.fielddata.cache.size`配置项控制。要注意的是，当这个缓存不够用时，为了腾出空间给新的缓存，原来缓存的字段会被挤出来，这会导致系统性能下降。
`indices.fielddata.cache.size`:field data缓存的最大值。可以设为节点堆空间的30%，也可设置为一个确定的值，比如12GB。默认无限大，生产环境要注意设置这个值。
>注意：这些静态配置需要在集群的每一个节点上设置。

**监控field data**
可以通过[Node Stats API](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-nodes-stats.html)监控内存使用情况。

#### Node query cache(查询缓存)
配置缓存查询结果可以使用多少堆内存
查询缓存负责对查询结果进行缓存。每一个节点都有一个查询缓存，由所有分片共享。缓存采用LRU机制，将最近最少使用的内容替换成新数据。查询缓存只会缓存filter的内容。
下面的配置需要在集群的每一个节点上配置。
`indices.queries.cache.size`: 控制过滤结果缓存的大小。默认是10%。也可设置为一个确定的值，如`512mb`。
#### Indexing buffer(索引缓冲)
控制分配多少内存给索引进程
索引缓冲用来存储新索引的文档。当缓冲区满了时，缓冲的文档会被写到磁盘的一个段，划分到该节点的所有分片上。
以下这些静态配置需要在集群的每一个节点上设置。

|配置项|含义
|:---|:---|
|indices.memory.index_buffer_size|设置索引缓冲区的大小。可设置一个百分比或者字节大小。默认为10%，意味着节点的10%的
|indices.memory.min_index_buffer_size|如果indices.memory.index_buffer_size被设置成了一个百分比，本配置项可以用来代表缓冲区的最小值，默认为48mb。
|indices.memory.max_index_buffer_size|如果indices.memory.index_buffer_size被设置成了一个百分比，本配置项可以用来代表缓冲区的最大值，默认无限大。
|indices.memory.min_shard_index_buffer_size|为每个分片自己的索引缓冲区设置最小值。默认4mb

#### Shard request cache(分片请求缓存)
控制分片级别的查询缓存的行为。
当一个搜索请求是针对一个索引或者多个索引的时候，每一个涉及到的分片都会在本地进行搜索，然后把结果返回到协调节点，在由协调节点把这些结果合并到一起。由于分片缓存模块会将本地的查询结果缓存，所以频率高的搜索请求会立刻返回结果。
>注意：目前，请求缓存只缓存查询条件size=0的搜索，缓存的内容有hits.total, aggregations,suggestions，而不缓存原始的hits。并且通过now查询的结果也不缓存。

只缓存查询条件size=0的搜索原因如下(引用自[ELKstack-guide-cn](https://github.com/chenryn/ELKstack-guide-cn/blob/master/elasticsearch/performance/cache.md)):ES对请求的处理过程是有不同类型的，默认的叫 query_then_fetch。在这种情况下，各数据节点处理检索请求后，返回的是只包含文档id和相关性分值的结果，这一段处理，叫做query阶段；汇聚到这份结果后，按照分值排序，得到一个全集群最终需要的文档id，再向对应节点发送一次文档获取请求，拿到文档内容，这一段处理，叫做 fetch阶段。两段都结束后才返回响应。
此外，还有DFS_query_then_fetch类型，提高小数据量时的精确度;query_and_fetch类型，在有明确routing时可以省略一个数据来回;count类型，不关心文档内容只需要计数时省略 fetch阶段;scan类型，批量获取数据省略query阶段，在reindex时就是使用这种类型。
回到query cache，这里这个query，就是处理过程中query阶段的意思。各个节点上的数据分片，会在处理完query阶段时，将得到的本分片有关该请求的计数值，缓存起来。
根据上面的请求类型介绍，显然,只有当?search_type=count的时候，这个query cache才能起到作用。
**缓存失效**
在分片数据真正发生变化时刷新索引分片，缓存的结果会自动失效。刷新间隔越长缓存的数据越多。当缓存满了的时候，会将最少使用的数据删除。
缓存可以通过[clear-cache API](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-clearcache.html)手动设置过期。

```bash
curl -XPOST 'localhost:9200/kimchy,elasticsearch/_cache/clear?request_cache=true'
```

**默认启动缓存**
分片请求缓存默认是不启动的，但可以在创建新的索引时通过下面的方式启动：

```bash
curl -XPUT localhost:9200/my_index -d'
{
  "settings": {
    "index.requests.cache.enable": true
  }
}
```
也可以通过[update-settings API](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-update-settings.html)为就索引动态的启动和关闭缓存。

```bash
curl -XPUT localhost:9200/my_index/_settings -d'
{ "index.requests.cache.enable": true }
```
**为每个请求启动缓存**
可以在请求时通过请求参数`request_cache`来为每个请求启动和关闭缓存。
```bash
curl 'localhost:9200/my_index/_search?request_cache=true' -d'
{
  "size": 0,
  "aggs": {
    "popular_colors": {
      "terms": {
        "field": "colors"
      }
    }
  }
}
```
**缓存设置**
缓存是在节点级别管理，默认JVM堆内存的`1%`。可在`config/elasticsearch.yml`文件中更改。
```bash
indices.requests.cache.size: 2%
```
也可以通过`indices.requests.cache.expire`设置缓存过期时间，但是没有必要，因为旧的结果会在索引刷新时自动失效。

**检测缓存使用**
可通过[indices-stats API](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-stats.html)检测索引中缓存的使用情况
```bash
curl 'localhost:9200/_stats/request_cache?pretty&human'
```
或通过[nodes-stats API](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-nodes-stats.html)查看节点的使用情况。
```bash
curl 'localhost:9200/_nodes/stats/indices/request_cache?pretty&human'
```

#### Indices Recovery(索引恢复)
限制分片恢复进程的资源
以下的配置用来管理恢复策略：

|配置项|含义
|:---|:---|
|indices.recovery.concurrent_streams|默认是3
|indices.recovery.concurrent_small_file_streams|默认2
|indices.recovery.file_chunk_size|	默认512kb
|indices.recovery.translog_ops|默认1000
|indices.recovery.translog_size|默认512kb
|indices.recovery.compress|默认true
|indices.recovery.max_bytes_per_sec|默认40mb

这些配置都可通过[Cluster-update-settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-update-settings.html)动态更新。
#### TTL interval
控制过期文档的删除
设有ttl值的文档会在过期之后被删除。以下动态配置控制了删除文档的检查间隔，和批量删除的大小。
`indices.ttl.interval`：删除进程启动间隔。默认60s
`indices.ttl.bulk_size`：删除进程的数量。默认为1000

### NetWork Settings(网络设置)
Es默认只和localhost绑定。如果想要在多个服务器上启动生产环境的集群需要配置一些基本的网络设置。
>注意：要小心使用网络配置，不要将不受保护的节点暴露在公共网络中。

#### 常用的网络设置

|配置项|含义
|:---|:---|
|network.host|将节点绑定到设置的hostname或ip地址，并通知集群中的其他节点。该配置项接受IP地址，主机名，一些特定值(见下一个表)和由上面几项组成的数组。默认为`_local_`。
|discovery.zen.ping.unicast.hosts|如果一个节点加入一个集群，需要知道集群中其他节点hostname和ip地址。本配置项为节点提供了其他节点的初始列表。默认`["127.0.0.1","[::1]"]`
|http.port|为HTTP请求绑定端口，可设置单个端口，也可设置一个范围。如果设定了一个范围，节点会绑定在范围中第一个可用的端口。默认`9200-9300`。
|transport.tcp.port|节点间内部通信绑定的端口，可设置单个端口，也可设置一个范围。如果设定了一个范围，节点会绑定在范围中第一个可用的端口。默认`9300-9400`

#### `network.host`可使用的一些特殊值

|特殊值|含义|
|:---|:---|
|\_[networkInterface]\_|指定网卡的IP地址，如\_en0\_
|\_local\_|本机ip地址，如127.0.0.1
|\_site\_|任意一个site-local地址，如192.168.0.1
|\_global\_|任意一个globally-scoped地址，如8.8.8.8

**IPv4 vs IPv6**
以上特殊值默认在IPV4和IPv6下均可使用，可以通过:ipv4和:ipv6标识符来做限制。例如,`_en0:ipv4_`。

#### 高级网络设置
常用网络设置一节中提到的`network.host`配置项只是一个为了同时设置`band_host`和`publish_host`的快捷设置。为了一下更复杂的情况，比如在一个代理服务器后运行节点，可能需要一些不同的配置。

|配置项|含义
|:---|:---|
|network.bind_host|设置节点绑定的ip地址，用来监听请求。默认`network.host`。
|network.publish_host|配置其他节点与本节点通信的地址，默认为`network.bind_host`中的最佳地址。

以上配置都和`network.host`一样，可配置ip地址，hostname和某些特殊值。

#### 高级TCP设置
任何使用TCP的模块（如HTTP和Transport）共享以下的配置。

|配置项|含义
|:---|:---|
|network.tcp.no_delay|是否启用[TCP no delay](https://en.wikipedia.org/wiki/Nagle%27s_algorithm)。默认为`true`
|network.tcp.keep_alive|是否启用[TCP keep alive](https://en.wikipedia.org/wiki/Keepalive)。默认为`true`
|network.tcp.reuse_address|一个地址是否可以重复使用
|network.tcp.send_buffer_size|TCP发送缓冲区的大小，默认不设置
|network.tcp.receive_buffer_size|TCP接收缓冲区的大小，默认不设置

#### Transport和HTTP协议
Es会基于上面的配置暴露两种网络协议，它们也可以进一步独立配置。
**TCP transport** 用于节点之间通信 具体可见Transport模块一节。
**HTTP** 用于暴露基于JSON的http接口。具体可见HTTP模块一节。


都看到这了，听首歌再走吧。分享首适合抖腿的歌，写博客时听这种歌真是分分钟都要把键盘按穿。。。
<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="http://music.163.com/outchain/player?type=2&id=26095964&auto=0&height=66"></iframe>










