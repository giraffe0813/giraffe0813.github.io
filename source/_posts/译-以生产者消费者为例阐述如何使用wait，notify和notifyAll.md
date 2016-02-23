title: '【译】以生产者消费者为例阐述如何使用wait，notify和notifyAll'
date: 2015-10-29 14:34:55
comments: true
toc: true
categories: [java, thread]
tags: [java, 翻译]
 	
---
> 原文来自一个java大牛的技术博客 地址[http://javarevisited.blogspot.com/2015/07/how-to-use-wait-notify-and-notifyall-in.html](http://javarevisited.blogspot.com/2015/07/how-to-use-wait-notify-and-notifyall-in.html) 博客以生产者和消费者为例 讲解了如何使用wait,notify,notifyAll进行多个线程之间的通信。下面是原文的翻译。


在Java中可以利用use,notify,notifyAll来完成线程之间的通信。举个例子，假设你的程序中有两个线程(eg:`Producer`(生产者)和`Consumer`(消费者))，Producer要和Consumer通信，通知Consumer队列中有元素了可以开始消费。相似的，Consumer也需要通知Producer队列中有空闲可以插入元素了。一个线程可以可以在一定条件下调用wait方法暂停什么都不做。比如，在Producer和consumer的问题中，当队列满了时Producer需要调用wait，当队列为空时Consumer需要调用wait方法。如果一些线程在等待某些条件变为真，可以在条件改变时使用notify和notifyAll通知他们并唤醒他们。Notify方法和NotifyAll方法都可以发送通知，不同的是，notify只能向等待的线程中的一个发送通知，不保证接受到通知的是哪个线程，而NotifyAll会向所有线程发送通知。所以如果只有一个线程等待对象锁，notify和notifyAll都会通知到它。在这个java多线程的教程中，将利用生产者，消费者的例子讲述在Java中如何使用wait，notify和notifyAll实现线程内部通信。另外，如果大家对掌握多线程和并发很感兴趣，强烈建议大家阅读`Brian Goetz`写的`Java Concurrency in Practice`。如果没看过这本书，你的Java多线程之旅是不完整的🙀。


<!-- more -->

### 在代码中展示如何使用wait和notify

尽管wait和notify是相当基础的概念，并且他们定义在`Object`类中，但要想在代码中使用他们并非易事。你可以在面试中让面试者通过手写代码解决Producer者和Consumer者问题来验证，我相信大多数人都会犯在错误的地方同步，没有在正确的对象上调用wait之类的错。讲真，这些常常会困惑许多程序员。第一个困惑点来自怎样调用wait方法，因为wait方法并不是定义在Thread类中，所以不能简单的Thread.wait()。而许多Java开发者习惯于Thread.sleep(),所以常常错误的想用同样的方式调用wait。实际上，wait()方法需要在一个被两个线程共享的对象上调用，例如在Producer者和消费Consumer的问题中，两个线程共享对象是一个队列。第二个困惑点来自wait方法应该在同步块还是同步方法中调用？如果使用同步块，那么哪个对象应该放到同步块中？这个对象和你想要获得锁的对象应该是同一个。在我们的例子中，这个对象就是两个线程共享的队列。
![image](/images/wait1.jpg)

### 在循环中使用wait和notify，而不是If代码块中

在你已经了解需要在一个共享的对象上调用wait方法后，接下来就是学会避免许多java开发者犯的错---在If代码块中调用wait而不是while循环中。因为需要在一定的条件下调用wait，比如Producer线程要在队列满了的情况下调用wait，所以第一反应都是使用If语句。但是，在If代码块中调用wait会产生`bug`，因为线程存在一定的可能在等待条件没有改变的情况下`假唤醒(spurious wake up)`。所以如果没有使用循环在线程唤醒后检查等待条件，可能会造成尝试在已经满了的队列中插入元素或者在空了的队列中取元素。这就是为什么我们要在while循环中调用wait而不是if。

```java

 // The standard idiom for calling the wait method in Java
  synchronized (sharedObject) {
        while (condition) {
            sharedObject.wait();// (Releases lock, and reacquires on wakeup)
         } 
        ...// do action based upon condition e.g. take or put into queue
}
```
正如我建议的，我们应该在一个循环中调用wait。这个循环用于在线程休眠之前和之后检查condition。

### Java中使用wait(),notify(),notifyAll()的例子

下面是在Java中使用wait(),notify(),notifyAll()的例子。在这个程序中，有两个线程(PRODUCTOR和CONSUMER)，用继承了Thread类的Producer和Consumer类实现。Prodcuer和Consumer的业务逻辑写在他们各自的run()方法中。并且实现一个LinkedList，当做共享队列。Producer在一个死循环中不断在队列中插入随机数，直到队列满了。我们会检查while(queue.size == maxSize),需要注意的是在检查之前需要给队列加上同步锁以保证在检查时没有另一个线程修改队列。如果队列满了，PRODUCER线程就会休眠，直到CONSUMER消费了队列中的元素并且调用notify()方法通知PRODUCER线程。`wait和notify都是在共享的对象(我们的例子中是队列)上调用的`。

```java
import java.util.LinkedList;
import java.util.Queue;
import java.util.Random;
/**
 * Simple Java program to demonstrate How to use wait, notify and notifyAll()
 * method in Java by solving producer consumer problem.
 *
 * @author Javin Paul
 */
public class MultipleThread {
    public static void main(String args[]) {
        System.out.println("How to use wait and notify method in Java");
        System.out.println("Solving Producer Consumper Problem");
        Queue<Integer> buffer = new LinkedList<>();
        int maxSize = 10;
        Thread producer = new Producer(buffer, maxSize, "PRODUCER");
        Thread consumer = new Consumer(buffer, maxSize, "CONSUMER");
        producer.start();
        consumer.start();
    }
}
/**
 * Producer Thread will keep producing values for Consumer
 * to consumer. It will use wait() method when Queue is full
 * and use notify() method to send notification to Consumer
 * Thread.
 * @author WINDOWS 8
 * */
class Producer extends Thread {
    private Queue<Integer> queue;
    private int maxSize;
    public Producer(Queue<Integer> queue, int maxSize, String name) {
        super(name);
        this.queue = queue;
        this.maxSize = maxSize;
    }
    @Override public void run() {
        while (true) {
            synchronized (queue) {
                while (queue.size() == maxSize) {
                    try {
                        System.out .println("Queue is full, " + "Producer thread waiting for " + "consumer to take something from queue");
                        queue.wait();
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }
                }
                Random random = new Random();
                int i = random.nextInt();
                System.out.println("Producing value : " + i);
                queue.add(i);
                queue.notifyAll();
            }
        }
    }
}
/**
 * Consumer Thread will consumer values form shared queue.
 * It will also use wait() method to wait if queue is
 * empty. It will also use notify method to send * notification to producer thread after consuming values
 * from queue.
 * @author WINDOWS 8
 **/
class Consumer extends Thread {
    private Queue<Integer> queue;
    private int maxSize;
    public Consumer(Queue<Integer> queue, int maxSize, String name){
        super(name);
        this.queue = queue;
        this.maxSize = maxSize;
    }
    @Override public void run() {
        while (true) {
            synchronized (queue) {
                while (queue.isEmpty()) {
                    System.out.println("Queue is empty," + "Consumer thread is waiting" + " for producer thread to put something in queue");
                    try {
                        queue.wait();
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }
                } System.out.println("Consuming value : " + queue.remove());
                queue.notifyAll();
            }

        }
    }
}
Output 
How to use wait and notify method in Java 
Solving Producer Consumper Problem 
Queue is empty,Consumer thread is waiting for producer thread to put something in queue 
Producing value : -1692411980 
Producing value : 285310787 
Producing value : -1045894970 
Producing value : 2140997307 
Producing value : 1379699468 
Producing value : 912077154 
Producing value : -1635438928 
Producing value : -500696499 
Producing value : -1985700664 
Producing value : 961945684 
Queue is full, Producer thread waiting for consumer to take something from queue Consuming value : -1692411980 
Consuming value : 285310787 
Consuming value : -1045894970 
Consuming value : 2140997307 
Consuming value : 1379699468 
Consuming value : 912077154 
Consuming value : -1635438928 
Consuming value : -500696499 
Consuming value : -1985700664 
Consuming value : 961945684 
Queue is empty,Consumer thread is waiting for producer thread to put something in queue



```
为了更好的理解这个程序，我建议大家使用debug模式运行。

### 使用wait，notify，notifyAll需要注意的

- 在Java中可以使用wait，notify，notifyAll完成多线程(不仅仅是两个线程)的内部通信。
- 在同步方法或同步块中使用wait，notify，notifyAll，否则JVM会抛出IllegalMonitorStateException
- 在循环中调用wait，notify。
- 在线程共享的对象上调用wait
- 偏向选择notifyAll，而不是notify，原因在这篇[文章](http://javarevisited.blogspot.sg/2012/10/difference-between-notify-and-notifyall-java-example.html)里

![image](/images/wait2.jpg)


