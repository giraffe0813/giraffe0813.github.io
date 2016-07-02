---
title: 面试总结
date: 2016-06-05 10:12:59
toc: true
categories: 随笔
tags: [随笔]
---
>从决定离职开始，前前后后面试了几家公司，把还能记得住的面试问题总结一下，帮小伙伴们查漏补缺吧，希望小伙伴们可以一举拿下offer。会简要写一下我觉得问题的关键点，不过有的可能并不是正确的答案，有的问题我到现在也还没明白。。。~~

<!-- more -->
### Java相关
__Java GC机制(重要程度:★★★★★)__

主要从三个方面回答:GC是针对什么对象进行回收(可达性分析法)，什么时候开始GC(当新生代满了会进行Minor GC，升到老年代的对象大于老年代剩余空间时会进行Major GC)，GC做什么(新生代采用复制算法，老年代采用标记-清除或标记-整理算法)，感觉回答这些就差不多了，也可以补充一下可以调优的参数(-XX:newRatio,-Xms,-Xmx等等)。详细的可以看我另一篇博客([Java中的垃圾回收机制](http://yemengying.com/2016/05/13/jvm-GC/))。

__如何线程安全的使用HashMap(重要程度:★★★★★)__

作为Java程序员还是经常和HashMap打交道的，所以HashMap的一些原理还是搞搞清除比较好。这个问题感觉主要就是问HashMap，HashTable，ConcurrentHashMap，sychronizedMap的原理和区别。具体的可以看我另一篇博客([如何线程安全的使用HashMap](http://yemengying.com/2016/05/07/threadsafe-hashmap/))。

__HashMap是如何解决冲突的(重要程度:★★★★☆)__

其实就是链接法，将索引值相同的元素存放到一个单链表里。但为了解决在频繁冲突时HashMap性能降低的问题，Java 8中做了一个小优化，在冲突的元素个数超过设定的值(默认为8)时，会使用平衡树来替代链表存储冲突的元素。具体的可以看我另一篇博客([Java 8中HashMap和LinkedHashMap如何解决冲突](http://yemengying.com/2016/02/03/%E8%AF%91-Java%E4%B8%ADHashMap%E5%92%8CLinkedHashMap%E5%A6%82%E4%BD%95%E8%A7%A3%E5%86%B3%E5%86%B2%E7%AA%81/))。

__Java创建对象有哪几种(重要程度:★★★★☆)__

这个问题还算好回答，大概有四种---new、工厂模式、反射和克隆，不过这个问题有可能衍生出关于设计模式，反射，深克隆，浅克隆等一系列问题。。。要做好准备~
参考资料：
[设计模式Java版](https://www.gitbook.com/book/quanke/design-pattern-java/details)
[Java反射详解](http://www.jianshu.com/p/53eb4e16d00e)
[深克隆与浅克隆的区别](http://www.cnblogs.com/yxnchinahlj/archive/2010/09/20/1831615.html)

__注解(重要程度:★★★☆☆)__

如果简历中有提到过曾自定义过注解，还是了解清楚比较好。主要是了解在自定义注解时需要使用的两个主要的元注解@Retention和@Target。@Retention用来声明注解的保留策略，有CLASS，RUNTIME,SOURCE三种，分别表示注解保存在类文件，JVM运行时刻和源代码中。@Target用来声明注解可以被添加到哪些类型的元素上，如类型，方法和域等。
参考资料：
[Java注解](http://www.infoq.com/cn/articles/cf-java-annotation)

__异常(重要程度:★★★☆☆)__

一道笔试题，代码如下，问返回值是什么。
```java
int ret = 0;
try{
throw new Exception();
}
catch(Exception e){
ret = 1;
return ret;
}
finally{
ret = 2;
}
```
主要的考点就是catch中的return在finally之后执行 但是会将return的值放到一个地方存起来，所以finally中的ret=2会执行，但返回值是1。
参考资料：
[深入理解Java异常处理机制](http://blog.csdn.net/hguisu/article/details/6155636)
[Java异常处理](http://www.runoob.com/java/java-exceptions.html)

__悲观锁和乐观锁区别，乐观锁适用于什么情况(重要程度:★★★★☆)__

悲观锁，就是总觉得有刁民想害朕，每次访问数据的时候都觉得会有别人修改它，所以每次拿数据时都会上锁，确保在自己使用的过程中不会被他人访问。乐观锁就是很单纯，心态好，所以每次拿数据的时候都不会上锁，只是在更新数据的时候去判断该数据是否被别人修改过。
大多数的关系数据库写入操作都是基于悲观锁，缺点在于如果持有锁的客户端运行的很慢，那么等待解锁的客户端被阻塞的时间就越长。Redis的事务是基于乐观锁的机制，不会在执行WATCH命令时对数据进行加锁，只是会在数据已经被其他客户端抢先修改了的情况下，通知执行WATCH命令的客户端。乐观锁适用于读多写少的情况，因为在写操作比较频繁的时候，会不断地retry，从而降低性能。
参考资料：
[关于悲观锁和乐观锁的区别](https://yq.aliyun.com/articles/1273)
[乐观锁和悲观锁](http://www.cnblogs.com/guyufei/archive/2011/01/10/1931632.html)

__单例模式找错误(重要程度:★★★★☆)__

错误是没有将构造函数私有化，单例还是比较简单的，把它的饿汉式和懒汉式的两种实现方式看明白了就可以了。
[单例模式](https://quanke.gitbooks.io/design-pattern-java/content/%E5%8D%95%E4%BE%8B%E6%A8%A1%E5%BC%8F-Singleton%20Pattern.html)

__

### Spring相关
关于Spring的问题主要就是围绕着Ioc和AOP，它们真是Spring的核心啊。

__Spring Bean的生命周期(重要程度:★★★★★)__

就不写我那么low的回答了，直接看参考资料吧。
参考资料：
[Spring Bean的生命周期](http://www.cnblogs.com/zrtqsk/p/3735273.html)
[Top 10 Spring Interview Questions Answers J2EE](http://javarevisited.blogspot.jp/2011/09/spring-interview-questions-answers-j2ee.html)

__Spring中用到的设计模式(重要程度:★★★★★)__

工厂模式:IOC容器
代理模式:AOP
策略模式:在spring采取动态代理时，根据代理的类有无实现接口有JDK和CGLIB两种代理方式，就是采用策略模式实现的
单例模式:默认情况下spring中的bean只存在一个实例
只知道这四个。。。。
参考资料:
[Design Patterns Used in Java Spring Framework](https://premaseem.wordpress.com/2013/02/09/spring-design-patterns-used-in-java-spring-framework/)

__讲一讲Spring IoC和AOP(重要程度:★★★★★)__

IoC的核心是依赖反转，将创建对象和对象之间的依赖管理交给IoC容器来做，完成对象之间的解耦。
AOP主要是利用代理模式，把许多接口都要用的又和接口本身主要的业务逻辑无关的部分抽出来，写成一个切面，单独维护，比如权限验证。这样可以使接口符合“单一职责原则”，只关注主要的业务逻辑，也提高了代码的重用性。

__AOP的应用场景(重要程度:★★★★☆)__

权限，日志，处理异常，事务等等，个人理解就是把许多接口都要用的又和接口本身主要的业务逻辑无关的部分抽出来，写成一个切面，单独维护，比如权限验证。这样可以使接口符合“单一职责原则”，只关注主要的业务逻辑，也提高了代码的重用性。

__Spring中编码统一要如何做(重要程度:★★★☆☆)__

配置一个拦截器就行了
```XML
	<filter>  
        <filter-name>CharacterEncodingFilter</filter-name>  
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>  
        <init-param>  
            <param-name>encoding</param-name>  
            <param-value>UTF-8</param-value>  
        </init-param>  
        <init-param>  
            <param-name>forceEncoding</param-name>  
            <param-value>true</param-value>  
        </init-param>  
    </filter>  
    <filter-mapping>  
        <filter-name>CharacterEncodingFilter</filter-name>  
        <url-pattern>/*</url-pattern>  
    </filter-mapping>
```

### 数据库相关
__Mysql索引的内部结构(重要程度:★★★★☆)__

B+树，三层，真实的数据存储在叶子节点
参考资料:
[MySQL索引原理及慢查询优化](http://tech.meituan.com/mysql-index.html)

__如果一个SQL执行时间比较长怎么办(重要程度:★★★★☆)__

可以利用pt-query-digest等工具分析慢查询日志，也可以用explain查看SQL的执行计划。具体可看我的另一篇博客[MySQL调优](http://yemengying.com/2016/05/24/mysql-tuning/)

__如果一张表中有上千万条数据应该怎么做分页(重要程度:★★★☆☆)__

肯定不能直接limit,offset，主要就是要想办法避免在数据量大时扫描过多的记录。具体可看我的另一篇博客[【译】优化MySQL中的分页](http://yemengying.com/2016/05/28/optimized-pagiantion-mysql/)

__什么样的列适合加索引，如果一个列的值只有1和2，那么它适合加索引么(重要程度:★★★☆☆)__

* 在where从句，group by从句，order by从句，on从句中出现的列
* 索引的字段越小越好
* 在建立联合索引时，离散度大的列放大联合索引的前面

只有1和2不适合建索引

### Redis相关
__Redis提供哪几种数据结构(重要程度:★★★★★)__

一共有5种，字符串，散列，列表，集合，有序集合。
参考资料：
[Redis中文官网](http://www.redis.cn/)

__Redis支持集群么，从哪个版本开始支持集群的(重要程度:★★☆☆☆)__

支持集群，从3.0版本开始。当然面试时我也没记住版本。。。

__Redis集群中，如何将一个对象映射到对应的缓存服务器(重要程度:★★★★☆)__

一般就是hash%N,就是用对象的hash值对缓存服务器的个数取余

__接上个问题，缓存集群中如果新增一台服务器，怎么才能不影响大部分缓存数据的命中？(重要程度:★★★★☆)__

其实就是一致性Hash算法。以前有看过，可惜面试的时候脑袋就空了，只记得一个环，果然还是要实践啊。
参考资料：
[Consistent Hashing](http://blog.plasmaconduit.com/consistent-hashing/)
[五分钟理解一致性哈希算法(consistent hashing)](http://blog.csdn.net/cywosp/article/details/23397179)

__项目中具体是怎样使用Redis的(重要程度:★★★★☆)__

根据实际情况回答吧。。。。我是主要做权限控制时用到了Redis，将用户Id和权限Code拼接在一起作为一个key，放到Redis的集合中，在验证某一用户是否有指定权限时，只需验证集合中是否有用户Id和权限Code拼接的key即可

### 算法相关
__判断一个数字是否为快乐数字(重要程度:★☆☆☆☆)__

leetcode第202题
[链接](https://leetcode.com/problems/happy-number/)

__给定一个乱序数组和一个目标数字 找到和为这个数字的两个数字 时间复杂度是多少(重要程度:★☆☆☆☆)__

leetcode第一题
[链接](https://leetcode.com/problems/two-sum/)

__如何判断一个链表有没有环(重要程度:★☆☆☆☆)__

用快慢指针

__删除字符串中的空格 只留一个(重要程度:★☆☆☆☆)__

这个比较简单。。。。

__二叉树层序遍历(重要程度:★★☆☆☆)__

利用队列就可以了

__地铁票价是如何计算的(重要程度:★★☆☆☆)__

不知道正确答案，感觉是图的最短路径算法相关的。

### Elasticsearch相关
__为什么要用Elasticsearch(重要程度:★★★★☆)__

其实对Es的了解还是比较少的，因为没做多久就去写坑爹代理商了😖。个人觉得项目中用Es的原因一是可以做分词，二是Es中采用的是倒排索引所以性能比较好，三是Es是个分布式的搜索服务，对各个节点的配置还是很简单方便的

__Elasticsearch中的数据来源是什么，如何做同步(重要程度:★★★★☆)__

数据是来自其他部门的数据库，会在一开始写python脚本做全量更新，之后利用RabbitMQ做增量更新，就是数据更改之后，数据提供方将更改的数据插入到指定消息队列，由对应的消费者索引到Es中

__接上个问题，利用消息队列是会对对方代码造成侵入的，还有没有别的方式(重要程度:★★★☆☆)__

还可以读MySQL的binlog

### 发散思维的题
以下题都是没有正确答案的，不知道是想考思维，还是压力面试，就只写题目，不写回答了。。。

__画一下心中房树人的关系(重要程度:★☆☆☆☆)__
__给你一块地建房如何规划(重要程度:★☆☆☆☆)__
__估计二号线有几辆车在运行(重要程度:★☆☆☆☆)__

### 其他
__Thrift通信协议(重要程度:★★★☆☆)__

这个问题被问了两遍，然而现在还是不知道。。。什么东西都不能停留在只会用的阶段啊~

__git相关(重要程度:★★★★★)__

一些git相关的问题，比如如何做分支管理(git flow)，rebase和merge的区别([merge操作会生成一个新的节点](http://blog.isming.me/2014/09/26/git-rebase-merge/))等等。。。

__如何学习一门新技术(重要程度:★★★☆☆)__

google+官网+stackoverflow+github

__比较爱逛的网站和爱看的书(重要程度:★★★☆☆)__

根据实际情况回答吧。。。

__了不了解微服务(重要程度:★★☆☆☆)__

简单了解过。。。
参考资料：
[基于微服务的软件架构模式](http://www.jianshu.com/p/546ef242b6a3)

__针对简历中的项目问一些问题(重要程度:★★★★★)__

就是根据简历上的项目问一些东西，比如权限控制是怎么做的，有没有碰到过比较难解决的问题之类的，不具体列举了，只要简历上的内容是真实的基本都没啥问题

__为什么要离职(重要程度:★★★★★)__

被问了n遍，挺不好回答的一个问题，毕竟不算实习期工作还没满一年，这个时候跳槽很容易让人觉得不安稳。。。。

__对公司还有什么问题(重要程度:★★★★★)__

基本每轮面试结束都会问的一个问题，一开始也没当回事，直到有家公司居然挂在四面的这个问题上，我也是蛮醉的😂，果然言多必失啊🌝。。。

__在\*\*\*公司最大的收获是什么(重要程度:★★★★★)__

对于我来说，觉得最大的收获就是对企业级的应用有了一个大致的了解，企业里的项目不像学校的课程作业，只要jdbc连接数据库完成功能就可以了，企业的项目要考虑很多东西，比如说为了提高可用性，要部署在多台服务器上，用nginx做负载均衡，还有就是用缓存，异步之类来提高接口性能。然后，也是第一次接触到SOA，这种面向服务的架构。也了解到一个好的应用，除了开发本身，一些自动化发布系统和监控系统也是必不可少的。当然，还认识了一群三观合的小伙伴~~~


>未完待续。。。。暂时只想到这些。。。面试真真是件很心累的事情，每次面完都感觉被拔了层皮，希望两年内不要在面试了😂。后天就要入职了，想想还有点小紧张呢，去看学叔推荐的美剧压压惊。。。



