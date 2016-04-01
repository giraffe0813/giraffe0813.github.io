title: Java 8 --行为参数化(behavior parameterization)
toc: true
comment: true
date: 2016-02-20 19:33:21
thumbnail: /images/thumbnail6.jpg
banner: /images/thumbnail6.jpg
categories: java
tags: [java]
---
> 根据书 << Java 8 in action >>第二章的一个例子整理。书中通过一个例子，讲述了如何利用behavior parameterization来应对不停变化的需求。想想之前自己写的工具类，真是大写的Low啊。。。。

题外话：要时刻谨记 Later equals never,Later equals never,Later equals never！！！！！！！

<!-- more -->



<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="http://music.163.com/outchain/player?type=2&id=35090760&auto=0&height=66"></iframe>



### 行为参数化
在软件开发中，一个众所周知的问题就是无论你做什么,用户的需求总会改变。举个栗子，假设要做一个帮助农场主理解库存的应用。一开始，农场主可能想有一个在所有库存中找出所有绿色苹果的功能。但是第二天他可能会告诉你他还想要找到所有重量大于150g的苹果。两天后，他可能又提出找到所有绿色的并且重量大于150g的苹果。在面对这些相似的新功能时，我们都想尽可能的减少开发量。
**behavior parameterization**是用来处理频繁更改的需求的一种软件开发模式，可以将一段代码块当做参数传给另一个方法，之后执行。这样做的好处是，方法的行为可以由传入的代码块控制。



### 例子
下面通过农场应用来看看面对不断改变的需求如何将代码写的更灵活。先实现第一个功能:从一个list中过滤出所有的绿色苹果,听起来是不是很简单。

#### 版本1 ： 过滤出绿色苹果
最开始想到的解决办法可能长下面的样子：

```java
public static List<Apple> filterGreenApples(List<Apple> inventory){
        List<Apple> result = new ArrayList<>(); // An accumulator list for apples
        for(Apple apple : inventory){
            if( "green".equals(apple.getColor())){
                // Select only green apples
                result.add(apple);     
            }
        }
        return result;
    }

```
上面的方法可以过滤出绿色的苹果，但是如果农场主还想知道红色的苹果呢？一个很幼稚的做法是将上面的方法复制一遍，命名为filterRedApples，更改一下if语句。但如果还想知道黄色的呢？一个好的做法是：试着抽象。

#### 版本2 ： 将颜色作为参数
可以在方法中加入颜色作为参数，使代码更灵活。

```java
public static List<Apple> filterApplesByColor(List<Apple> inventory,String color) {
        List<Apple> result = new ArrayList<>();
        for (Apple apple: inventory){
            if ( apple.getColor().equals(color) ) {
                result.add(apple);
            }
        }
        return result;
}
```
这样就可以灵活的根据颜色来筛选。这时农场主又提出了根据重量筛选，于是参照上面根据颜色筛选的方法又新增了一个根据重量筛选的方法，如下：

```java
public static List<Apple> filterApplesByWeight(List<Apple> inventory,int weight) {
        List<Apple> result = new ArrayList<>();
        for (Apple apple: inventory){
            if ( apple.getWeight()>weight ) {
                result.add(apple);
            }
        }
        return result;
}

```
这是一个解决办法，但考虑到苹果有许多其它特性，如果针对每一特性的筛选都复制一个方法，违背了DRY(don't repeat yourself)原则.我们可以将颜色和重量结合到一个方法，并通过一个标记来指明想要进行过滤的是颜色还是重量(这样做其实很不好，之后会解释)。

#### 版本3 ： 在一个方法中过滤想要过滤的属性
下面在一个方法中根据flag值的不同过滤不同的属性(这样做法很不好)。

```java
public static List<Apple> filterApples(List<Apple> inventory,String color, int weight, boolean flag){
        List<Apple> result = new ArrayList<>();
        for(Apple apple : inventory){
            if((flag&&apple.getColor().equals(color)) || 
                    (!flag && apple.getWeight() > weight)){
                result.add(apple);
            }
        }
        return result;
    }
```
上面的代码很丑陋而且也没有解决需求变化的问题，比如如果农场主还想要根据大小，产地，形状来筛选就不适用了。

#### 版本4 ： 根据抽象约束过滤
一个更好的解决办法是将过滤的标准抽象出来，我们先定义一个接口作为抽象的选择标准.
```java
public interface ApplePredicate{
	boolean test(Apple apple);
}
```
接下来就可以定义多个ApplePredicate接口的实现类来代表不同的过滤标准。如下图:
![abstract criteria](/images/behavior.jpg)

```java
//select only heavy apple
public class AppleHeavyWeightPredicate implements ApplePredicate{ 
	public boolean test(Apple apple){
		return apple.getWeight() > 150;
	}
}

//select only green apple
public class AppleGreenColorPredicate implements ApplePredicate{ 
	public boolean test(Apple apple){
		return "green".equals(apple.getColor);
	}
}
```
上面每一个实现了ApplePredicate接口的类都代表了一种筛选策略。在此基础上，我们可以将筛选方法修改成下面的样子,将ApplePredicate作为参数传入。

```java
public static List<Apple> filterApples(List<Apple> inventory, ApplePredicate p){
	List<Apple> result = new ArrayList<>();
	for(Apple apple : inventory){
		if(p.test(apple)){
			result.add(apple);
		}
	}
	return result;
}
```
现在的筛选方法比第一个版本灵活多了，如果想改变筛选标准，只需创建不同的ApplePredicate对象，并传入filterApples方法即可。例如新增了选出红色并且重量大于150g的苹果的需求，我们可以创建一个实现ApplePredicate接口的类即可，代码如下:
```java
public class AppleRedAndHeavyPredicate implements ApplePredicate{
	public boolean test(Apple apple){
		return "red".equals(apple.getColor()) && apple.getWeight() > 150;
	}
}

List<Apple> redAndHeavyApples = filter(inventory, new AppleRedAndHeavyPredicate());
```
但是上面的实现有一个缺点，就是太啰嗦了，每新增一个筛选标准都要新增一个类。下面来继续优化一下。

#### 版本5 ： 使用匿名类
匿名类是没有名字的类，使用匿名类可以创建一个临时的实现。下面的代码展示了如何利用匿名类创建实现了ApplePredicate的对象。
```java
List<Apple> redApples = filterApples(inventory, new ApplePredicate(){
	public boolean test(Apple apple){
		return "red".equals(apple.getColor());
	}
});
```
但是尽管匿名类解决了为一个接口声明多个实现类的问题，使用匿名类还不足够好。使用匿名类代码看起来有些笨重，可读性差，而且有一些开发者对匿名类感到困惑。下面我们使用Java 8引入的lambda表达式使代码看起来更加简洁一点。

#### 版本6 ： 使用lambda表达式
我们可以使用lambda表达式简化代码.

```java
List<Apple> result = filterApples(inventory,(Apple apple) -> "red".equals(apple.getColor()));
```
#### 最终版 ： 使用泛型，抽象列表的类型
我们可以继续做一些抽象。目前，filterApples方法只可以过滤元素类型为Apple的List。我们可以将列表的类型抽象出来，使得我们的过滤方法变得更加通用，代码如下：
```java
public interface Predicate<T>{
	boolean test(T t);
}

pucblic static <T> List<T> filter(List<T> list, Predicate<T> p){
	List<T> result = new ArrayList<>();
	for(T e: list){
		if(p.test(e)){
			result.add(e);
		}
	}
	return result;
}
```
这样就可以对多种类型的list进行过滤了：

```java
List<Apple> redApples = filter(inventory, (Apple apple) -> "red".equals(apple.getColor()));

List<String> evenNumber = filter(numbers, (Integer i) -> i%2 == 0);
```

终于over了，拖延癌果真已经到了晚期。。。。。

![do it now](/images/delay.jpg)

