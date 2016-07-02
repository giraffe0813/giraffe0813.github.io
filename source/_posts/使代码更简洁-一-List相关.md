layout: post   
title: 使代码更简洁(一)---List相关
date: 2015-09-10 14:07:54
comments: true 
thumbnail: /images/thumbnail1.jpg
toc: true
categories: java
tags: [java, stream,list]

---

以前写在segmentFault上的一篇文章 搬移到这里。

>记录一下在工作开发中封装的一些工具类，使代码看起来更加的简洁。这篇就记录下和list相关的吧。。。。。会持续记录。。。。

<!--more-->

# 利用stream代替for循环

   在对list的操作中常常需要for循环来遍历整个list，代码看起来不够简洁。所以利用java8的新特性Stream来代替for循环，提高程序的可读性。
从网上coyp了一些stream的介绍：Stream 不是集合元素，它不是数据结构并不保存数据，它是有关算法和计算的，它更像一个高级版本的 Iterator。原始版本的 Iterator，用户只能显式地一个一个遍历元素并对其执行某些操作；高级版本的 Stream，用户只要给出需要对其包含的元素执行什么操作，比如 “过滤掉长度大于 10 的字符串”、“获取每个字符串的首字母”等，Stream 会隐式地在内部进行遍历，做出相应的数据转换。
Stream 就如同一个迭代器（Iterator），单向，不可往复，数据只能遍历一次，遍历过一次后即用尽了，就好比流水从面前流过，一去不复返。
而和迭代器又不同的是，Stream 可以并行化操作，迭代器只能命令式地、串行化操作。顾名思义，当使用串行方式去遍历时，每个 item 读完后再读下一个 item。而使用并行去遍历时，数据会被分成多个段，其中每一个都在不同的线程中处理，然后将结果一起输出。Stream 的并行操作依赖于 Java7 中引入的 Fork/Join 框架（JSR166y）来拆分任务和加速处理过程。
下面是一些利用stream写的工具类

打印list中的元素
--

```java
/**
 * 
 * @author yemengying
 *
 */
public class ListUtils {
	/**
	 * 打印list中的元素
	 * @param list
	 */
	public static <T> void printList(List<T> list){
		if(null == list) list = new ArrayList<T>();
		list.stream().forEach(n -> System.out.println(n.toString()));
	}
}
```
从list中删除指定的元素
--

```java
/**
 * 
 * @author yemengying
 *  
 */
public class ListUtils {
	
	/**
	 * 从list中删除指定的元素 其他类需重写equals方法
	 * @param list
	 * @param arg 要删除的元素
	 * @return 返回删除了指定元素的list
	 * eg:list:[1,2,3,1]---removeElementFromList(list,1)---return list:[2,3]
	 */
	public static <T> List<T> removeElementFromList(List<T> list, T arg){
		if(null == list || list.isEmpty()) return new ArrayList<T>();
		if(arg == null) return list;
		return list.stream().filter(n -> {
	        return !n.equals(arg);
	    }).collect(Collectors.toList());
	}
}
```
 list排序
 --

```java
/**
 * 
 * @author yemengying
 *  
 */
public class ListUtils {
	/**
	 * list排序
	 * @param list
	 * @param comparator
	 * @return 返回按comparator排好序的list
	 * eg:User:id name两个属性 
	 *  List<User> userList = new ArrayList<User>();
	 *	userList.add(new User(1,"abc"));
	 *	userList.add(new User(3, "ccd"));
	 *	userList.add(new User(2, "bde"));
	 *	1.按user名字排序
	 *	userList = ListUtils.sortList(userList, (p1, p2) -> p1.getName().compareTo(p2.getName()));
	 *	2.按user Id排序
	 *  userList = ListUtils.sortList(userList, (p1, p2) -> p1.getId()-p2.getId());
	 */
	public static <T> List<T> sortList(List<T> list, Comparator<? super T> comparator){
		if(null == list || list.isEmpty()) return new ArrayList<T>();
		if(null == comparator) return list;
		return list.stream().sorted(comparator).collect(Collectors.toList());
		
	}
}	
```
 判读list中的元素是不是全部满足 指定条件
 --

```java
/**
 * 
 * @author yemengying
 *  
 */
public class ListUtils {
	/**
	 * 判读list中的元素是不是全部满足 predicate的条件 
	 * @param list
	 * @param predicate
	 * @return 全部满足 true 有不满足的 false
	 * eg：判断list中的user的id是不是均小于4
	 * List<User> userList = new ArrayList<User>();
	 *	userList.add(new User(1,"abc"));
	 *	userList.add(new User(3, "ccd"));
	 *	userList.add(new User(2, "bde"));
	 *	System.out.println(ListUtils.isAllMatch(userList, u -> u.getId()<4));
	 *  输出 true
	 */
	public static <T> boolean isAllMatch(List<T> list, Predicate<? super T> predicate){
		if(null == list || list.isEmpty()) return false;
		if(null == predicate) return false;
		return list.stream().allMatch(predicate);
	}
}	
```
 判断list中是不是有一个元素满足predicate的条件
 --

```java
/**
 * 
 * @author yemengying
 *  
 */
public class ListUtils {
	/**
	 * 只要有一个元素满足predicate的条件 返回true
	 * @param list
	 * @param predicate
	 * @return 
	 * eg：判断list中的user的id是不是有一个大于4
	 * List<User> userList = new ArrayList<User>();
	 *	userList.add(new User(1,"abc"));
	 *	userList.add(new User(3, "ccd"));
	 *	userList.add(new User(2, "bde"));
	 *	System.out.println(ListUtils.isAllMatch(userList, u -> u.getId()>4));  return false
	 */ 
	public static <T> boolean isAnyMatch(List<T> list, Predicate<? super T> predicate){
		if(null == list || list.isEmpty()) return false;
		if(null == predicate) return false;
		return list.stream().anyMatch(predicate);
	}
}	
```
 判断list中是不是没有一个元素满足predicate的条件
 --

```java
/**
 * 
 * @author yemengying
 *  
 */
public class ListUtils {
	/**
	 * 没有一个元素满足predicate的条件 返回true
	 * @param list
	 * @param predicate
	 * @return
	 * eg：判断list中的user的id是不是有一个大于4
	 * List<User> userList = new ArrayList<User>();
	 *	userList.add(new User(1,"abc"));
	 *	userList.add(new User(3, "ccd"));
	 *	userList.add(new User(2, "bde"));
	 *	System.out.println(ListUtils.isAllMatch(userList, u -> u.getId()>4));  return true
	 */
	public static <T> boolean isNoneMatch(List<T> list, Predicate<? super T> predicate){
		if(null == list || list.isEmpty()) return false;
		if(null == predicate) return false;
		return list.stream().noneMatch(predicate);
	}
}	
```
 list去重
 --

```java
/**
 * 
 * @author yemengying
 *  
 */
public class ListUtils {
	/**
	 * list去重
	 * @param list
	 * @return
	 * eg:
	 * list[1,2,2]---distinctList(list)---list[1,2]
	 */
	public static <T> List<T> distinctList(List<T> list){
		if(null == list || list.isEmpty()) return new ArrayList<T>();
		return list.stream().distinct().collect(Collectors.toList());
    }
}	
```
# 2利用泛型编写一些通用的方法

方便的构造一个list
--

在开发时经常遇到要调用一个接口，接口的参数是list。例如在开发通知中心时发送消息的接口定义如下,其中messageForm是要发送的内容，userList是接受者的用户id

```java
public int pushMessage(MessageForm messageForm,List<Integer> userList);
```
这样，在给一个人发送消息的时候也需要构造一个list
一般的做法,如下:

```java
List<Integer> list = new ArrayList<Integer>();
list.add(8808);
pushService.pushMessage(messageForm,list);
```
比较麻烦，所以同事封装了一个工具方法：

```java
public class ListUtils {
     /**
	 * 构造list
	 * @param args
	 * @return
	 * @author zhoujianming
	 */
	@SuppressWarnings("unchecked") 
	public static <T> List<T> toList(T...args) {
		if (null == args) {
			return new ArrayList<T>();
		}
		List<T> list = new ArrayList<T>();
		for (T t : args) {
			list.add(t);
		}
		return list;
	}
}
```

这样在调用时，比较简洁:

```java
//给id 8808和8809发消息
pushService.pushMessage(messageForm,ListUtils.toList(8808,8809));
```

利用递归获得多个list的笛卡尔积
--

获得多个list的笛卡尔积，代码参考stackoverflow

```java
	
	/**
	 * 递归获得多个list的笛卡尔积
	 * eg[1],[8808],[1,2,3]-->[[1,8808,1],[1,8808,2]]
	 * 参考：http://stackoverflow.com/questions/714108/cartesian-product-of-arbitrary-sets-in-java
	 * @param lists
	 * @return
	 */
	public static <T>  List<List<T>> cartesianProduct(List<List<T>> lists) {
	    List<List<T>> resultLists = new ArrayList<List<T>>();
	    if (lists.size() == 0) {
	        resultLists.add(new ArrayList<T>());
	        return resultLists;
	    } else {
	        List<T> firstList = lists.get(0);
	        List<List<T>> remainingLists = cartesianProduct(lists.subList(1, lists.size()));
	        for (T condition : firstList) {
	            for (List<T> remainingList : remainingLists) {
	                ArrayList<T> resultList = new ArrayList<T>();
	                resultList.add(condition);
	                resultList.addAll(remainingList);
	                resultLists.add(resultList);
	            }
	        }
	    }
	    return resultLists;
	}
```

使用时将需要获得笛卡尔积的多个list放到一个list里，调用上面的方法即可，调用示例如下：

```java
List<Integer> list1 = Arrays.asList(1,2,3);
List<Integer> list2 = Arrays.asList(8808,8809,8810);
List<Integer> list3 = Arrays.asList(4);
List<List<Integer>> lists = Arrays.asList(list1,list2,list3);
List<List<Integer>> resultLists = ListUtils.cartesianProduct(lists);
```
[1,2,3],[8808,8809,8810],[4]------>[[1, 8808, 4], [1, 8809, 4], [1, 8810, 4], [2, 8808, 4], [2, 8809, 4], [2, 8810, 4], [3, 8808, 4], [3, 8809, 4], [3, 8810, 4]]
