title: '【译】如何重置一个ArrayList--clear vs removeAll'
date: 2015-10-26 23:20:04
comments: true
thumbnail: /images/金泰妍.jpg
toc: true
categories: [java, list]
tags: [java, 翻译]
---
> 安利一个APP--开发者头条，在上面发现一个不错的英文技术类博客，地址http://javarevisited.blogspot.com/，  会不定期的翻译一些 翻译不好见谅啊😼

原文地址：http://javarevisited.blogspot.co.uk/2015/09/how-to-reset-arraylist-in-java-clear-vs-removeAll-example.html

很多时候为了重用我们会想要重置一个ArrayList，这里的重置是指清空列表或移除列表所有的元素。在Java中，有两个方法可以帮助我们实现重置`clear`或`removeAll`。在列表长度很小的情况下(eg:10或100个元素)，可以放心的使用这两种方法。但如果列表很大(eg:10M个元素)，那么选择clear还是removeAll会对你java应用的性能造成巨大的影响。甚至有时，在列表过大的情况下，重置会耗费许多时间，那么重新创建一个新的列表比将老的列表重置要好。但需要提醒的是，必须要确保老的列表可以被垃圾回收，否则，有很大的风险会出现`java.lang.OutOfMemoryError: Java Heap Space`。言归正传，让我们看看clear()和removeAll()两个方法。大家应该常常会选择用clear(),因为他的复杂度是O(n),而相比之下，removeAll(Collection C)的性能要差一些，它的复杂度是O(n^2)。这也是为什么在重置大的列表的时候两个方法会有巨大的差异。如果阅读他们的源码并运行下面的例子程序，差异会更明显。
<!-- more -->

### Clear() vs RemoveAll(Collection c) 

为了更好的比较这两个方法，阅读他们源码是很重要的。可以在`java.utils.ArrayList`类中找到clear()方法，不过为了方便我将它引入到了这里。下面的代码来自JDK 1.7.0_40版本。如果你想要学习更多的有关性能监控和调优的知识，我强烈建议阅读`Scott Oaks`写的`Java Performance the Definitive Guide`,它包含了java 7和一点java 8。下面是clear()的代码片段:

```java
/** 
 * Removes all of the elements from this list.The list will 
 * be empty after this call returns. 
 */ 
 public void clear() { 
 	modCount++; // clear to let GC do its work 
 	for (int i = 0; i < size; i++) 
 		elementData[i] = null; 
 	size = 0; 
 }

```
大家可以看出，clear()在循环遍历ArrayList，并且将每一个元素都置为null，使它们在没有被外部引用的情况下可以被垃圾回收。相似的，我们可以在`java.util.AbstractCollection`类中查看removeAll(Collention c)的代码，下面是代码片段:

```java
	 public boolean removeAll(Collection<?> c) {
	 	//判断对象是否为null
        Objects.requireNonNull(c);
        boolean modified = false;
        Iterator<?> it = iterator();
        while (it.hasNext()) {
            if (c.contains(it.next())) {
                it.remove();
                modified = true;
            }
        }
        return modified;
    }
```

这个方法会检查迭代器顺序返回的每个元素是否包含在特定的集合中。如果存在，调用迭代器的remove方法将它从集合中移除。因为会用到contains方法，removeAll的复杂度是O(n^2)。所以在想要重置一个大的ArrayList时，这种方法是绝对不可取的。下面我们比较一下两者在重置一个包含100K个元素时的性能差异。

###  删除一个包含100k个元素的列表中的所有元素

我本来想在例子中尝试重置一个包含10M个元素的列表，不过在超过半个小时等待removeAll()结束后，我决定将元素的数量降为100K。在这种情况下，两个方法的差距也是很明显的。removeAll()比clear()多花费了10000倍的时间。事实上，在API中clear()和removeAll(Collection c)这两个方法的目的是不同的。clear()方法是为了通过删除所有元素而重置列表，而removeAll(Collection c)是为了从集合中删除某些存在于另一个提供的集合中的元素，并不是为了从集合中移除所有元素。所以如果你的目的是删除所有元素，用clear(),如果你的目的是删除某些存在于另一集合的元素，那么选择removeAll(Collection c)方法。

```java
	import java.util.ArrayList; 
	/**
	 * Java Program to remove all elements from list in Java and comparing 
	 * performance of clearn() and removeAll() method. 
	 * * @author Javin Paul 
	 */ 
	 public class ArrayListResetTest { 
	 
	 	private static final int SIZE = 100_000; 
	 	public static void main(String args[]) { 
	 	
	 	// Two ArrayList for clear and removeAll 
	 	ArrayList numbers = new ArrayList(SIZE); 
	 	ArrayList integers = new ArrayList(SIZE); 
	 	// Initialize ArrayList with 10M integers 
	 	for (int i = 0; i &lt; SIZE; i++) { 
	 		numbers.add(new Integer(i)); 
	 		integers.add(new Integer(i)); 
	 	} 
	 	// Empty ArrayList using clear method 
	 	long startTime = System.nanoTime(); 
	 	numbers.clear(); 
	 	long elapsed = System.nanoTime() - startTime; 
	 	System.out.println("Time taken by clear to empty ArrayList of 1M elements (ns): " + elapsed); 
	 	// Reset ArrayList using removeAll method 
	 	startTime = System.nanoTime(); 
	 	integers.removeAll(integers); 
	 	long time = System.nanoTime() - startTime; 
	 	System.out.println("Time taken by removeAll to reset ArrayList of 1M elements (ns): " + time); 
	 	} 
	 } 
	 	
	 	Output: 
	 	Time taken by clear to empty ArrayList of 100000 elements (ns): 889619 
	 	Time taken by removeAll to reset ArrayList of 100000 elements (ns): 36633112126

```

由于程序使用了两个arrayList存储Integers，所以在运行时要确保有足够的内存，尤其是你想比较在列表存有1M个元素时，两种方法的性能差异。另外，由于使用了在数字中加入下划线的特性，所以需要java7来运行。如果没有JDK7，也可以移除SIZE常量中的下划线。

>以上就是关于如何重置一个ArrayList的内容。我们不仅仅学到了两种从列表中删除元素的方法，也学到了clear()和removeAll()方法的区别。我们明白了为什么在列表过大时，removeAll()性能很差。
 PS：当使用clear()方法也消耗很长的时间时，考虑创建一个新的列表，因为java可以很快的创建一个新的对象。
 
### 扩展阅读：
    
  - [ArrayList and HashMap Performance Improvement in JDK 7](http://javarevisited.blogspot.sg/2014/07/java-optimization-empty-arraylist-and-Hashmap-cost-less-memory-jdk-17040-update.html)
  - [How to convert ArrayList to Set?](http://javarevisited.blogspot.sg/2012/01/convert-arraylist-to-set-java-example.html)
  - [How to sort an ArrayList in reverse order in Java?](http://javarevisited.blogspot.sg/2012/01/how-to-sort-arraylist-in-java-example.html)
  - [How to remove duplicate elements from ArrayList in Java?](http://javarevisited.blogspot.sg/2012/12/how-to-remove-duplicates-elements-from-ArrayList-Java.html)
  - [How to clone an ArrayList in Java?](http://javarevisited.blogspot.sg/2014/03/how-to-clone-collection-in-java-deep-copy-vs-shallow.html)
  - [How do you convert a Map to List in Java?](http://javarevisited.blogspot.sg/2011/12/how-to-convert-map-to-list-in-java.html)
  - [Performance comparison of contains() vs binarySearch()](http://javarevisited.blogspot.sg/2014/03/binary-search-vs-contains-performance.html)
  - [How to initialize an ArrayList with values in Java?](http://javarevisited.blogspot.sg/2012/12/how-to-initialize-list-with-array-in-java.html)
  - [The ArrayList Guide](http://javarevisited.blogspot.sg/2015/07/java-arraylist-tutorial.html)
  - [The difference between an ArrayList and a Vector in Java?](http://javarevisited.blogspot.sg/2011/09/difference-vector-vs-arraylist-in-java.html)
  - [How to make an ArrayList unmodifiable in Java?](http://javarevisited.blogspot.sg/2012/07/create-read-only-list-map-set-example-java.html)
 	

