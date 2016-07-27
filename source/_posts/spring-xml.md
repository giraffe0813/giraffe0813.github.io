---
title: 【Spring】Xml解析相关
date: 2016-07-25 22:37:18
toc: true
categories: [spring]
tags: [spring]
---
> 先请看下左上角，hiahia，新logo，si不si很漂酿，有个会设计的表哥就是好，又好又快，还不用钱。

<!-- more -->
总结下最近看的 Spring Xml 解析相关的一点点东东，还没有看完。。。。

### 参考文档
[Spring 资源访问剖析和策略模式应用](https://www.ibm.com/developerworks/cn/java/j-lo-spring-resource/)


### 题外话
先说个在看源码时，发现的一个以前没有关注过的点。大神们在创建集合的时候，大多数都设置了一个预估的初始容量(2的幂数)，而不是直接采用默认的初始容量( HashMap 中是16)，就像下面这样:
```java
/** Map from dependency type to corresponding autowired value */
private final Map<Class<?>, Object> resolvableDependencies = new ConcurrentHashMap<Class<?>, Object>(16);

/** Map of bean definition objects, keyed by bean name */
private final Map<String, BeanDefinition> beanDefinitionMap = new ConcurrentHashMap<String, BeanDefinition>(256);

/** Map of singleton and non-singleton bean names, keyed by dependency type */
private final Map<Class<?>, String[]> allBeanNamesByType = new ConcurrentHashMap<Class<?>, String[]>(64);

/** Map of singleton-only bean names, keyed by dependency type */
private final Map<Class<?>, String[]> singletonBeanNamesByType = new ConcurrentHashMap<Class<?>, String[]>(64);

/** List of bean definition names, in registration order */
private volatile List<String> beanDefinitionNames = new ArrayList<String>(256);

/** List of names of manually registered singletons, in registration order */
private volatile Set<String> manualSingletonNames = new LinkedHashSet<String>(16);

```
大神们这样写肯定是有好处的。不太了解其它集合类的实现，就以 HashMap 为例看一下。HashMap 底层的存储结构是一个 Entry 对象的数组(Java 8中是 Node 对象的数组)，默认初始容量是16，负载因子是0.75。也就是说当元素个数超过16*0.75=12时，就要进行扩容，将数组大小扩大一倍，并计算元素在新数组中的位置，这个过程是比较耗费性能的。所以，个人觉得大神们这样写是因为如果直接采用默认的初始容量，那么在元素个数较少时，会浪费空间；元素个数较多时，又会造成频繁的扩容，耗费性能。

想起上次的需求，明明确定一定以及肯定评分只有5个，还是new了个默认容量(16)的map。
![ren xing](/images/renxing.jpeg)

### 相关接口
先理一理加载xml配置文件的相关接口
**1.Resource**：采用了策略模式，是 Spring 资源访问策略的抽象，该接口有多种实现类，每个实现类代表一种资源访问策略，负责具体的资源访问。
**2.ResourceLoader**：该接口的实现类可以获得一个 Resource 的实例。
**3.BeanDefinitionReader**： 根据指定的 Resource 加载bean definition. 

未完待续。。。。。。

本来是想多整理一点的，但是。。。听说新一期RM主角是wuli光洙，这还能忍，滚去看RM了。。。。



