---
title: 如何线程安全的使用HashMap
date: 2016-05-07 17:21:06
thumbnail: /images/fighting.jpg
toc: true
categories: [java, hashmap]
tags: [java,hashMap]
---
> 这周真是发生了不少事，脑袋和心里一直都很乱，周二参加了一场面试，经历了笔试+3轮面试，周五正式提交了离职申请。要开始新的征程了，意外的有些失落和不舍，毕竟是毕业后的第一份工作，毕竟在这认识了一群可爱的人，毕竟在这学到了很多东西,毕竟这有8000+的aeron chair!!!。可既然已经做了选择就没有退路了，勇敢往下走吧，希望接下来的三周可以把手头上的工作做好交接善始善终，也希望以后不会后悔今天的选择。

<!-- more -->
![fighting！！！](/images/fighting.jpg)    

进入正题，在周二面试时，一面的面试官有问到HashMap是否是线程安全的，如何在线程安全的前提下使用HashMap,其实也就是`HashMap`，`Hashtable`，`ConcurrentHashMap`和`synchronized Map`的原理和区别。当时有些紧张只是简单说了下HashMap不是线程安全的；Hashtable线程安全，但效率低，因为是Hashtable是使用synchronized的，所有线程竞争同一把锁；而ConcurrentHashMap不仅线程安全而且效率高，因为它包含一个segment数组，将数据分段存储，给每一段数据配一把锁，也就是所谓的锁分段技术。当时忘记了synchronized Map和解释一下HashMap为什么线程不安全。面试结束后问了下面试官哪里有些不足，面试官说上面这个问题的回答算过关，但可以在深入一些或者自己动手尝试一下。so~~~虽然拿到了offer，但还是再整理一下，不能得过且过啊。

### 为什么HashMap是线程不安全的
总说HashMap是线程不安全的，不安全的，不安全的，那么到底为什么它是线程不安全的呢？要回答这个问题就要先来简单了解一下HashMap源码中的使用的`存储结构`(这里引用的是Java 8的源码，与7是不一样的)和它的`扩容机制`。
#### HashMap的内部存储结构
下面是HashMap使用的存储结构:
```java
transient Node<K,V>[] table;

static class Node<K,V> implements Map.Entry<K,V> {
        final int hash;
        final K key;
        V value;
        Node<K,V> next;
}
```
可以看到HashMap内部存储使用了一个Node数组(默认大小是16)，而Node类包含一个类型为Node的next的变量，也就是相当于一个链表，所有hash值相同(即产生了冲突)的key会存储到同一个链表里，大概就是下面图的样子(顺便推荐个在线画图的网站[Creately](http://creately.com/Draw-UML-and-Class-Diagrams-Online))。
![HashMap内部存储结果](/images/node1.png)
>需要注意的是，在Java 8中如果hash值相同的key数量大于指定值(默认是8)时使用平衡树来代替链表，这会将get()方法的性能从O(n)提高到O(logn)。具体的可以看我的另一篇博客[Java 8中HashMap和LinkedHashMap如何解决冲突](http://yemengying.com/2016/02/03/%E8%AF%91-Java%E4%B8%ADHashMap%E5%92%8CLinkedHashMap%E5%A6%82%E4%BD%95%E8%A7%A3%E5%86%B3%E5%86%B2%E7%AA%81/)。

#### HashMap的自动扩容机制
HashMap内部的Node数组默认的大小是16，假设有100万个元素，那么最好的情况下每个hash桶里都有62500个元素😱，这时get(),put(),remove()等方法效率都会降低。为了解决这个问题，HashMap提供了自动扩容机制，当元素个数达到数组大小*loadFactor后会扩大数组的大小，在默认情况下，数组大小为16，loadFactor为0.75，也就是说当HashMap中的元素超过16\*0.75=12时，会把数组大小扩展为2\*16=32，并且重新计算每个元素在新数组中的位置。如下图所示([图片来源](http://coding-geek.com/how-does-a-hashmap-work-in-java/)，权侵删)。
![自动扩容](/images/resizing_of_java_hashmap.jpg)
从图中可以看到没扩容前，获取EntryE需要遍历5个元素，扩容之后只需要2次。
#### 为什么线程不安全
个人觉得HashMap在并发时可能出现的问题主要是两方面,首先如果多个线程同时使用put方法添加元素，而且假设正好存在两个put的key发生了碰撞(hash值一样)，那么根据HashMap的实现，这两个key会添加到数组的同一个位置，这样最终就会发生其中一个线程的put的数据被覆盖。第二就是如果多个线程同时检测到元素个数超过数组大小*loadFactor，这样就会发生多个线程同时对Node数组进行扩容，都在重新计算元素位置以及复制数据，但是最终只有一个线程扩容后的数组会赋给table，也就是说其他线程的都会丢失，并且各自线程put的数据也丢失。
关于HashMap线程不安全这一点，《Java并发编程的艺术》一书中是这样说的：
>HashMap在并发执行put操作时会引起死循环，导致CPU利用率接近100%。因为多线程会导致HashMap的Node链表形成环形数据结构，一旦形成环形数据结构，Node的next节点永远不为空，就会在获取Node时产生死循环。

哇塞，听上去si不si好神奇，居然会产生死循环。。。。google了一下，才知道死循环并不是发生在put操作时，而是发生在扩容时。详细的解释可以看下面几篇博客：
* [酷壳-Java HashMap的死循环](http://coolshell.cn/articles/9606.html)
* [HashMap在java并发中如何发生死循环](http://firezhfox.iteye.com/blog/2241043)
* [How does a HashMap work in JAVA](http://coding-geek.com/how-does-a-hashmap-work-in-java/)


### 如何线程安全的使用HashMap
了解了HashMap为什么线程不安全，那现在看看如何线程安全的使用HashMap。这个无非就是以下三种方式：
* Hashtable
* ConcurrentHashMap
* Synchronized Map

例子：
```java
//Hashtable
Map<String, String> hashtable = new Hashtable<>();

//synchronizedMap
Map<String, String> synchronizedHashMap = Collections.synchronizedMap(new HashMap<String, String>());

//ConcurrentHashMap
Map<String, String> concurrentHashMap = new ConcurrentHashMap<>();
```
依次来看看。
#### Hashtable
先稍微吐槽一下，为啥命名不是HashTable啊，看着好难受😖，不管了就装作它叫HashTable吧。这货已经不常用了，就简单说说吧。HashTable源码中是使用`synchronized`来保证线程安全的，比如下面的get方法和put方法：
```java
public synchronized V get(Object key) {
       // 省略实现
    }
public synchronized V put(K key, V value) {
	// 省略实现
    }
```
所以当一个线程访问HashTable的同步方法时，其他线程如果也要访问同步方法，会被阻塞住。举个例子，当一个线程使用put方法时，另一个线程不但不可以使用put方法，连get方法都不可以，好霸道啊！！！so~~，效率很低，现在基本不会选择它了。

#### ConcurrentHashMap
ConcurrentHashMap(以下简称CHM)是JUC包中的一个类，Spring的源码中有很多使用CHM的地方。之前已经翻译过一篇关于ConcurrentHashMap的博客，[如何在java中使用ConcurrentHashMap](http://yemengying.com/2015/11/06/%E3%80%90%E8%AF%91%E3%80%91%E5%A6%82%E4%BD%95%E5%9C%A8java%E4%B8%AD%E4%BD%BF%E7%94%A8ConcurrentHashMap/)，里面介绍了CHM在Java中的实现，CHM的一些重要特性和什么情况下应该使用CHM。需要注意的是，上面博客是基于Java 7的，和8有区别,在8中CHM摒弃了Segment（锁段）的概念，而是启用了一种全新的方式实现,利用CAS算法，有时间会重新总结一下。
#### SynchronizedMap
看了一下源码，SynchronizedMap的实现还是很简单的。
```java
 // synchronizedMap方法
 public static <K,V> Map<K,V> synchronizedMap(Map<K,V> m) {
        return new SynchronizedMap<>(m);
    }
 // SynchronizedMap类
 private static class SynchronizedMap<K,V>
        implements Map<K,V>, Serializable {
        private static final long serialVersionUID = 1978198479659022715L;

        private final Map<K,V> m;     // Backing Map
        final Object      mutex;        // Object on which to synchronize

        SynchronizedMap(Map<K,V> m) {
            this.m = Objects.requireNonNull(m);
            mutex = this;
        }

        SynchronizedMap(Map<K,V> m, Object mutex) {
            this.m = m;
            this.mutex = mutex;
        }

        public int size() {
            synchronized (mutex) {return m.size();}
        }
        public boolean isEmpty() {
            synchronized (mutex) {return m.isEmpty();}
        }
        public boolean containsKey(Object key) {
            synchronized (mutex) {return m.containsKey(key);}
        }
        public boolean containsValue(Object value) {
            synchronized (mutex) {return m.containsValue(value);}
        }
        public V get(Object key) {
            synchronized (mutex) {return m.get(key);}
        }

        public V put(K key, V value) {
            synchronized (mutex) {return m.put(key, value);}
        }
        public V remove(Object key) {
            synchronized (mutex) {return m.remove(key);}
        }
        // 省略其他方法
    }
```

从源码中可以看出调用synchronizedMap()方法后会返回一个SynchronizedMap类的对象，而在SynchronizedMap类中使用了synchronized同步关键字来保证对Map的操作是线程安全的。
#### 性能对比
这是要靠数据说话的时代，所以不能只靠嘴说CHM快，它就快了。写个测试用例，实际的比较一下这三种方式的效率([源码来源](http://crunchify.com/hashmap-vs-concurrenthashmap-vs-synchronizedmap-how-a-hashmap-can-be-synchronized-in-java/))，下面的代码分别通过三种方式创建Map对象，使用`ExecutorService`来并发运行5个线程，每个线程添加/获取500K个元素。

```java
public class CrunchifyConcurrentHashMapVsSynchronizedMap {

    public final static int THREAD_POOL_SIZE = 5;

    public static Map<String, Integer> crunchifyHashTableObject = null;
    public static Map<String, Integer> crunchifySynchronizedMapObject = null;
    public static Map<String, Integer> crunchifyConcurrentHashMapObject = null;

    public static void main(String[] args) throws InterruptedException {

        // Test with Hashtable Object
        crunchifyHashTableObject = new Hashtable<>();
        crunchifyPerformTest(crunchifyHashTableObject);

        // Test with synchronizedMap Object
        crunchifySynchronizedMapObject = Collections.synchronizedMap(new HashMap<String, Integer>());
        crunchifyPerformTest(crunchifySynchronizedMapObject);

        // Test with ConcurrentHashMap Object
        crunchifyConcurrentHashMapObject = new ConcurrentHashMap<>();
        crunchifyPerformTest(crunchifyConcurrentHashMapObject);

    }

    public static void crunchifyPerformTest(final Map<String, Integer> crunchifyThreads) throws InterruptedException {

        System.out.println("Test started for: " + crunchifyThreads.getClass());
        long averageTime = 0;
        for (int i = 0; i < 5; i++) {

            long startTime = System.nanoTime();
            ExecutorService crunchifyExServer = Executors.newFixedThreadPool(THREAD_POOL_SIZE);

            for (int j = 0; j < THREAD_POOL_SIZE; j++) {
                crunchifyExServer.execute(new Runnable() {
                    @SuppressWarnings("unused")
                    @Override
                    public void run() {

                        for (int i = 0; i < 500000; i++) {
                            Integer crunchifyRandomNumber = (int) Math.ceil(Math.random() * 550000);

                            // Retrieve value. We are not using it anywhere
                            Integer crunchifyValue = crunchifyThreads.get(String.valueOf(crunchifyRandomNumber));

                            // Put value
                            crunchifyThreads.put(String.valueOf(crunchifyRandomNumber), crunchifyRandomNumber);
                        }
                    }
                });
            }

            // Make sure executor stops
            crunchifyExServer.shutdown();

            // Blocks until all tasks have completed execution after a shutdown request
            crunchifyExServer.awaitTermination(Long.MAX_VALUE, TimeUnit.DAYS);

            long entTime = System.nanoTime();
            long totalTime = (entTime - startTime) / 1000000L;
            averageTime += totalTime;
            System.out.println("2500K entried added/retrieved in " + totalTime + " ms");
        }
        System.out.println("For " + crunchifyThreads.getClass() + " the average time is " + averageTime / 5 + " ms\n");
    }
}
```

测试结果：

```bash
Test started for: class java.util.Hashtable
2500K entried added/retrieved in 2018 ms
2500K entried added/retrieved in 1746 ms
2500K entried added/retrieved in 1806 ms
2500K entried added/retrieved in 1801 ms
2500K entried added/retrieved in 1804 ms
For class java.util.Hashtable the average time is 1835 ms

Test started for: class java.util.Collections$SynchronizedMap
2500K entried added/retrieved in 3041 ms
2500K entried added/retrieved in 1690 ms
2500K entried added/retrieved in 1740 ms
2500K entried added/retrieved in 1649 ms
2500K entried added/retrieved in 1696 ms
For class java.util.Collections$SynchronizedMap the average time is 1963 ms

Test started for: class java.util.concurrent.ConcurrentHashMap
2500K entried added/retrieved in 738 ms
2500K entried added/retrieved in 696 ms
2500K entried added/retrieved in 548 ms
2500K entried added/retrieved in 1447 ms
2500K entried added/retrieved in 531 ms
For class java.util.concurrent.ConcurrentHashMap the average time is 792 ms
```
这个就不用废话了，CHM性能是明显优于Hashtable和SynchronizedMap的,CHM花费的时间比前两个的一半还少，哈哈，以后再有人问就可以甩数据了。

> 欢迎指正错误，欢迎一起讨论。另外，针对提离职当天发生的一个小插曲，真真是给我上了一课，不是所有人都能接受实话的，只想引用欢乐颂里安迪的一句话:常与同好争高下,不与傻瓜论短长。










