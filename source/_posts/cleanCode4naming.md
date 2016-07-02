---
title: 【译】如何给变量取个简短且无歧义的名字
date: 2016-06-25 16:23:39
toc: true
categories: [Clean Code]
tags: [翻译]
---
>湾区日报上分享的一篇文章，文章的作者在Google设计Dart语言，就变量命名方面给了4点建议，文中也列出了好变量名、坏变量名的对比。不管作者的看法与你实际中的命名习惯是否一致，看完这篇文章，相信可以在变量命名方面有一些新的思考。

<!-- more -->
原文地址（康桑阿米达）：http://journal.stuffwithstuff.com/2016/06/16/long-names-are-long/?utm_source=wanqu.co&utm_campaign=Wanqu+Daily&utm_medium=website

google做的最明智的规定之一就是严格执行code review。每一个改动在上线之前，都要经过两种形式的review。首先，团队中的人会进行常规的review，以确保代码完成了它应该完成的功能。

接下来还会进行可读性层面的review。顾名思义，它是为了确保代码是可读性高的：是否利于理解和维护？是否符合该编程语言的一些惯例？是否有良好的文档？

[Dart](https://www.dartlang.org/)已经开始google内部使用，所以我有幸参与了n次上面类型的code review。作为该语言的设计者，这是一项令人着迷的工作。我可以直接看到人们是如何使用Dart的，这对语言的进一步发展很有帮助。在reivew的同时，我也能够清晰的了解到那些比较常见的错误和使用最多的特性，我就好像是一个记录本地居民生活的人类学者。

当然，上面说的与本文的主旨无关，这并不是一篇关于Dart的文章。本文主要是想讨论我看到过的一些令人抓狂的代码：**这些代码的变量命名实在是太尼玛的长了。。。。。**

是的，变量的名称可以很短。回到当C语言中外部标识符仅需要由前六个字符来唯一的区分; 自动补全功能还没有发明; 每次按键盘都像在雪地上坡一样艰难的时候,长的命名就会带来很多问题。不过幸运的是，我们现在生活的世界太美好了，键盘操作变得如此简单。

但我们现在似乎走上了另一个极端，我们不应该做海明威，但我们也无需成为田纳西·威廉斯。代码中使用了超长的命名会影响代码的清晰性。同时，超长的变量命名会造成换行，这会影响代码的结构，不易于阅读。

* 长的类名会使开发者不易声明该类型的变量。
* 长的方法命名会使它变得晦涩难懂.
* 长的变量命名不利于代码重用，导致过长的方法链。

我曾见过超过60个字符的变量命名,你甚至可以写首诗。别慌，下面我们来看看如何解决这一问题。

### 选择一个好的命名
命名有两个目标：
* 清晰：你要知道该命名与什么有关
* 精确：你要知道该命名与什么无关

当一个命名完成上面两个目标之后，其余的字符就是多余的了。下面是我在开发时的一些命名原则：

#### 命名中无需含有表示变量或参数类型的单词
如果使用如Java之类的静态类型语言, 开发者通常知道变量的类型. 由于方法的实现一般都比较简短, 所以即便是在查看一个需要推断才知道类型的本地变量, 或者在code review等静态分析器不可用的情况下, 我们也可以通过多看很少的几行代码就能知道变量的类型.

所以将类型说明加入到变量名中是多余的. 我们应该舍弃[匈牙利命名法](https://en.wikipedia.org/wiki/Hungarian_notation)，如下：
```java
// 不好的:
String nameString;
DockableModelessWindow dockableModelessWindow;

// 改进:
String name;
DockableModelessWindow window;
```
特别是对于集合来说，最好使用名词的复数形式来描述其内容, 而不是使用名词的单数形式来描述. 如果开发者更在乎集合中存储的内容, 那么变量命名应当反映这一点。
```java
// 不好的:
List<DateTime> holidayDateList;
Map<Employee, Role> employeeRoleHashMap;

// 改进:
List<DateTime> holidays;
Map<Employee, Role> employeeRoles;
```
这一点也同样适用于方法的命名。方法名不需要描述它的参数及参数的类型--参数列表已经说明了这些。
```java
// 不好的:
mergeTableCells(List<TableCell> cells)
sortEventsUsingComparator(List<Event> events,
    Comparator<Event> comparator)

// 改进:
merge(List<TableCell> cells)
sort(List<Event> events, Comparator<Event> comparator)
```
这样可以帮助调用者更好的阅读：

```java
mergeTableCells(tableCells);
sortEventsUsingComparator(events, comparator);
```
当然，这只是我个人的看法，欢迎大家一起讨论~~
#### 省略命名中不是用来消除歧义的单词
有些开发者倾向于将他们知道的有关这个变量的所有信息都塞到命名里。要记住，命名只是一个标识符：只是告诉你该变量是在哪定义的。并不是用来告诉阅读者所有他们想知道的有关这个对象的详细信息。这是定义应该做的事情的。 命名只是让你找到他的定义。

当我看到一个叫`recentlyUpdatedAnnualSalesBid`(最近更新的全年销售投标)的标识符时，我会问：
* 存在不是最近更新的全年销售投标么？
* 存在没有被更新的最近的全年销售投标么？
* 存在最近更新的非全年的销售投标么？
* 存在最近更新的全年非销售的投标么？
* 存在最近更新的全年销售非投标的东东吗？

上面任何一个问题的回答是“不存在”，就意味着命名中引入了无用的单词。

```java
// 不好的:
finalBattleMostDangerousBossMonster;
weaklingFirstEncounterMonster;

// 改进:
boss;
firstMonster;
```
当然，你可能会觉得这有一些过了。比如将第一个例子的标识符简化为`bid`,会让人觉得有点模糊不清。但你可以放心大胆的这样做，如果在之后的开发中觉得该命名会造成冲突或不明确，可以添加些修饰词来完善它。反之，如果一开始就取了一个很长的命名，你是不可能在之后重新回来简化它的。

#### 省略命名中可以从上下文获取的单词
我可以在文章中使用"我"，因为读者都知道这是一篇由Bob Nystrom所做的博客。我蠢萌的脸就挂在那，我无需不停的说我的名字。写代码也是一样，类中的方法/属性和方法中的变量，都是存在在上下文中的，无需重复。

```java
// Bad:
class AnnualHolidaySale {
  int _annualSaleRebate;
  void promoteHolidaySale() { ... }
}

// Better:
class AnnualHolidaySale {
  int _rebate;
  void promote() { ... }
}
```
实际上, 一个命名嵌套的层次越多, 它就有更多的相关的上下文，也就更简短。换句话说，一个变量的作用域越小，命名就越短。
#### 省略命名中无任何含义的单词
我常常在许多游戏开发中看到包含无任何含义的单词的命名，一些开发者喜欢在命名中添加一些看起来有点严肃的单词。我猜可能他们觉得这样做可以让他们的代码显得重要，或者说让他们觉得自己更重要。

实际上，有一些词语并没有实际意义，只是一些套话。比如：data, state, amount, value, manager, engine, object, entity和instance。

一个好的命名能够在阅读者的脑海中描画出一幅图画。而将某变量命名为"manager"并不能向读者传达任何有关该变量是做什么的信息. 它是用来做绩效评估的吗? 它是管理加薪的吗?

在命名时可以问一下自己，把这个单词去掉含义是不是不变？如果是，那就果断把它剔除吧~~

### 实际例子---华夫饼
为了让大家了解以上的命名原则在实际中如何应用，这有个违法了以上所有原则的反例。这个例子和我实际上review过的一段代码一样令人心碎。。。。
```java
// 好吃的比利时华夫饼
class DeliciousBelgianWaffleObject {
  void garnishDeliciousBelgianWaffleWithStrawberryList(
      List<Strawberry> strawberryList) { ... }
}
```
首先，通过参数列表我们可以知道方法是用来处理一个strawberry的列表，所以可以在方法命名中去掉：
```java
class DeliciousBelgianWaffleObject {
    void garnishDeliciousBelgianWaffle(
        List<Strawberry> strawberries) { ... }
}
```
除非程序中还包含不好吃的比利时华夫饼或者其他国家的华夫饼，不然我们可以将这些无用的形容词去掉：
```java
class WaffleObject {
  void garnishWaffle(List<Strawberry> strawberries) { ... }
}
```
方法是包含在`WaffleObject`类中的，所以方法名中无需Waffle的说明：
```java
class WaffleObject {
  void garnish(List<Strawberry> strawberries) { ... }
}
```
很明显它是一个对象，任何事物都是一个对象，这也就是传说中的“面向对象”的含义，所以命名中无需带有`Object`：
```java
class Waffle {
  void garnish(List<Strawberry> strawberries) { ... }
}
```
好了，这样看起来好多了。

以上就是我总结的相当简洁的命名原则。可能有些人会觉得无需在命名上耗费太多的精力，但我认为命名是开发过程中最基本的任务之一。
--------------------------------------------------我是萌萌哒分界线----------------------------------------------------------------
感觉变量或者方法的命名，看似简单，实际很难，特别是想一个简洁明了可读性高的命名。自己也经常用什么`data`,`xxxlist`来命名，作者说的挺对的，前者没什么意义，后者又有点啰嗦。不过对于集合类型的变量，统一用名词复数命名容易混淆。举个例子对于Apple这个类来说，可能存在List<Apple>和Map<Integer,Apple>两种集合类型的变量。个人觉得对List类型的变量可以采用名词复数来命名，Map类型的变量可以采用valueByKey格式来命名，比较容易区分。

>欢迎指正错误，欢迎一起讨论~~~
