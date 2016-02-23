title: 【译】Java8中的扩展(default/extension)方法
date: 2015-11-01 22:11:06
toc: true
tags:
 - java
 - interface
---

> 原文来自一个java大牛的技术博客 地址[http://javarevisited.blogspot.hk/2014/07/default-defender-or-extension-method-of-Java8-example-tutorial.html#uds-search-results](http://javarevisited.blogspot.hk/2014/07/default-defender-or-extension-method-of-Java8-example-tutorial.html#uds-search-results) 博客讲解了Java 8中新引入的可以在接口中定义扩展方法。下面是原文的翻译。

Java 8允许开发者使用`default`和`static`两个关键字在接口中加入非抽象的方法。带有default关键字的方法在Java中也被称作defender方法或defaul方法。在Java 8之前，想要改变一个已经发布的接口几乎是不可能的，任何改动(例如增加一个新的方法)都会影响该接口现有的实现类。这也是为什么在Java 8想要改变内部iterator的实现，使用forEach()方法时面临了一个巨大的挑战，因为这会破坏了现有的Iterable接口的实现类。毫无疑问，向后兼容是Java工程师最优先考虑的事，所以要破坏现有的实现类是不可行的。因此，他们提出了一个解决办法，引入default方法。这是一个绝妙的想法，因为现在你可以用扩展现有的接口。JDK本身也使用了许多default方法,java.util.Map接口扩展了许多default方法，例如replaceAll(),putIfAbsent(Key k,Value v)....。另外，由于default方法可以扩展现有的接口也被称作extension方法。一个接口中的default方法是数量不受限制的。我相信，在这次改变之后，将不再需要抽象类来提供骨架实现(skeletal implementation),例如List接口有AbstractList，Collection接口有AbstractCollection，Set接口有AbstractSet，Map接口有AbstractMap。我们可以通过在接口中定义default方法来替代创建一个新的抽象类。相似的，static方法的引入也使得接口的工具类变得冗余。例如，Collection接口的Collections类，Path接口的Paths类，因为你可以直接在接口中定义静态工具方法。如果你想了解更多关于Java 8的新特性，我建议阅读Cay S. Horstmann写的Java SE 8 Really Impatient。这是我最喜欢的关于Java 8的书之一，它详细的介绍了Java7与Java 8不同的特性。

<!-- more -->

### Default方法的例子

Java 8让我们可以通过default关键字为接口添加非抽象的方法。这一特性也被称作Extension(扩展)方法。下面是第一个例子：

```
interface Multiplication{ 
    
    int multiply(int a, int b); 
    
    default int square(int a){ 
        return multiply(a, a); 
    } 
}

```
除了抽象方法multiply()之外，接口Multiplication还包含一个default方法square()。任何实现Multiplication接口的类只需实现抽象方法multiply，default方法square()可以直接使用。

```
Multiplication product = new Multiplication(){

    @Override
    public int multiply(int x, int y){
        return x*y;
    }
};

    int square = product.square(2);
    int multiplication = product.multiply(2, 3);

```
product是个匿名类。这段代码有点啰嗦了，用了6行实现一个简单地乘法的功能。我们可以利用lambda表达式来简化一下代码，lambda表达式也是Java 8中新引入的。因为我们的接口只包含一个抽象方法，而且lambda表达式也是SAM(Single Abstract method单一抽象方法)类型的。我们可以用lambda表达式来替代匿名类将代码简化成下面的样子。

```
Multiplication lambda = (x, y) -> x*y; 
int product = lambda.multiply(3, 4); 
int square = lambda.square(4);

```

以上就是在接口中使用default方法的例子。现在，你可以毫无顾虑的在旧的接口中扩展新的方法，只要这些方法是default或static的就不用担心会破坏接口的实现类。

```
/**Java Program to demonstrate use of default method in Java 8. 
 * You can define non-abstract method by using default keyword, and more 
 * than one default method is permitted, which allows you to ship default skeletal 
 * implementation on interface itself. 
 * @author Javin Paul
 */ 
 public class Java8DefaultMethodDemo{
 
    public static void main(String args[]) { 
    // Implementing interface using Anonymous class 
    Multiplication product = new Multiplication(){ 
        @Override public int multiply(int x, int y){ 
            return x*y; 
        } 
    }; 
        int squareOfTwo = product.square(2); 
        int cubeOfTwo = product.cube(2); 
        System.out.println("Square of Two : " + squareOfTwo); 
        System.out.println("Cube of Two : " + cubeOfTwo); 
        // Since Multiplication has only one abstract method, it can 
        // also be implemented using lambda expression in Java 8 
        Multiplication lambda = (x, y) -> x*y; 
        int squareOfThree = lambda.square(3); 
        int cubeOfThree = lambda.cube(3); 
        System.out.println("Square of Three : " + squareOfThree); 
        System.out.println("Cube of Three : " + cubeOfThree);
        } 
    } 
 
   interface Multiplication{ 
        int multiply(int a, int b);
        default int square(int a){ 
            return multiply(a, a); 
        } 
        default int cube(int a){ 
            return multiply(multiply(a, a), a); 
        } 
       } 
       Output :  Square of Two : 4 
                 Cube of Two : 8 
                 Square of Three : 9 
                 Cube of Three : 27

```
这是个很好的关于如何使用default方法在接口中方便的添加方法的例子。也展示了如何避免一个额外的帮助类，比如Collections类。它仅仅提供了一些用于Collection的工具方法，而现在我们可以直接在Collection中定义这些方法。在上面的例子中，我们有一个包含一个抽象方法multiply(a,b)的接口Multiplication，接口还包括两个依赖于multiply(a,b)方法的非抽象方法square(a)和cube(b)。接口的实现类只需要实现multiply(a,b)方法，就可以直接使用square(a)和cube(b)方法了。

### default方法的关键点

现在让我们来复习我们刚刚学到了什么，记一下关于default方法的关键点。

![image](/images/default.jpg)

- 在Java8中你可以在接口中添加default方法
- default方法的出现使得接口和抽象类的不同变得模糊。所以，当在面试中被问到这个问题，别忘了提一下，以前只能通过抽象类实现的事情，现在也可以通过default方法实现了。
- default并不是一个新的关键字，在JDK1.1中就是保留关键字
- 接口中default方法的数量没有限制
- 如果接口C继承了接口A和B，如果A和B中拥有一样的default方法，编译器在编译过程中会报错。为了避免歧义，这在Java 8中是不允许的。所以当default方法有冲突时，是不可以多继承的
- 在JDK1.8中有许多关于default方法的例子，比如forEach方法。也可以查看java.util.Map中新添的putIfAbsent方法，在JDK1.8之前，我们只能ConcurrentMap来使用它。


以上就是default方法。不得不说，这是一个巨大的突破，使我们可以更好更方便的使用接口。了解CurrentMap的putIfAbsent方法可以帮助我们更好的记住default方法。在JDK1.7中，putIfAbsent方法并不存在于Map接口中，所以为了使用putIfAbsent方法，必须将Map接口指向的ConcurrentMap对象强制转换成ConcurrentMap。但Java 8引入扩展方法之后，Map接口中也有了putIfAbsent方法。想了解更多的关于Java8的新特性，可以阅读`Manning's Java 8 in Action`

