title: 读书笔记-Linux Bible 9th Edition之进程大法好
date: 2015-12-24 17:56:03
toc: true
tags:
  - linux
  - 读书笔记

---
>根据Linux Bible第九版第六章整理的读书笔记，记录linux系统下如何管理进程。

Linux是一个支持多用户和多任务的操作系统，多任务是指可以同时运行多个程序，而每个运行程序的一个实例被称作一个进程。Linux系统提供了可以让我们列出正运行进程，杀死进程，监听系统使用情况的工具。

![Merry Christmas](/images/merry-chrismas.jpg)


<!-- more -->

### 理解进程
一个进程是一个命令正在运行的实例。比如，系统中有一个**vi**命令，如果**vi**命令正在被15个不同的用户运行，那么就对应了15个不同的运行进程。   
一个进程在系统中通过进程Id(process ID)来标识，在当前系统中进程Id是独一无二的。换句话说，如果一个进程正在运行，那么其他进程都不能使用它的进程Id的数字作为自己的进程Id。但如果这个进程已经结束，那么他的进程Id可以被重新使用当做其他进程的进程Id。   
除了进程Id，进程还有一些其他属性。每个运行的进程都会关联一个指定的用户账号和用户组，这个账号决定了进程可以访问哪些系统资源。所以root用户运行的进程能比普通用户的进程访问更多的文件。   
对于一个Linux的管理员来说，管理进程的能力至关重要。因为有时，一些运行的进程会严重影响系统的性能，这一章会讲述如果根据内存和CPU的使用情况，定位和处理这些进程。

#### 列出进程

如果使用命令行列出当前系统运行的进程，**ps**命令是最老也是最常用的命令，而**top**命令不仅可以列出进程还可以更改进程的状态。如果使用的是GNOME，可以使用**gnome-system-monitor**来通过图形界面管理进程。

##### 通过ps命令列出进程

最常用的查看正在运行进程的工具就是ps命令，通过ps命令，我们可以查看正在运行的进程，它们使用的资源以及运行它们的用户。下面是ps命令的一个例子:

```
 $ ps u
 USER PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND 
 jake 2147 0.0 0.7 1836 1020 tty1 S+ 14:50 0:00 -bash 
 jake 2310 0.0 0.7 2592 912 tty1 R+ 18:22 0:00 ps u
```
在上面的命令中，使用u选项会显示用户名和一些其他信息，比如进程是什么时候开始运行的，进程占用的内存和Cpu，命令运行的位置(TTY)等。上面的第一个进程说明了jake用户在登录之后打开了一个bash shell。第二进程显示了jake用户正在运行ps u命令。终端设备**tty1**正在被登录会话使用着。**STAT**这一列代表了进程的状态，R代表进程正在运行，S代表进程处于休眠状态。

>STAT除了R和S之外还可以有别的值，D代表不可中断，R运行，S中断/休眠，T停止，Z僵死。如果后面有+号，代表在前台运行的进程。

**USER**列显示了运行这个进程的用户。**PID**列是进程的进程Id，每个进程都有一个独一无二的进程Id，在需要杀死一个进程或者为进程发送信号时使用。**%CPU**和**%MEN**两列显示了进程占用的CPU百分比和内存百分比。
**VSZ**(virtual set size)展示了虚拟内存占用大小(单位：kb/kilobytes),**RSS**(reside set size)展示了实际内存占用大小(单位：kb/kilobytes)。VSZ和RSS的值可能不一样，因为VSZ是分配给进程的内存大小，而RSS是进程实际使用的内存大小，代表了不可交换的物理内存。**START**代表了进程启动的时间，**TIME**执行累计时间(如果占用cpu时间非常短不到一秒，会显示 0:00)。
在Linux中，有些运行的进程是与终端无关的，这些进程通常在系统启动时开始运行，并且会持续运行，直到系统关闭。可以使用x选项查看与终端无关的进程。

分页查看与当前用户有关的所有运行进程

```
 $ ps ux | less
```
分页查看所有用户的运行的进程

```
 $ ps aux | less
```
管道符("|")会将第一个命令的输出当做第二个命令的输入，上面的例子中ps命令的输出会当做less命令的输入，这样就可以分页查看信息了。按空格键换页，按q退出。
我们还可以自定义ps命令展示的信息，并按其中一列排序。使用-o选项，可以通过关键字指定想要展示的列。下面的例子就是指定ps展示进程Id(pid),用户名(username),用户Id(uid),用户组(group),组Id(gid),分配的虚拟内存(vsz),实际使用内存(rss),运行的命令(comm),默认情况下按进程Id排序。
```
$ ps -eo pid,user,uid,group,gid,vsz,rss,comm | less  PID USER GROUP GID VSZ   RSS   COMMAND
  1   root  root  0  19324 1320   init 
  2   root  root  0  0       0    kthreadd
```
如果想要按其他列排序可以使用sort=选项。例如，想查看那个进程占用了最多的内存，可以按rss排列，会按rss从低到高展示进程，如果想从高到底可以在前面加连字符。下面是例子：
```
$ ps -eo pid,user,group,gid,vsz,rss,comm --sort=-rss | less
PID     USER     GROUP     GID     VSZ       RSS       COMMAND
12005   cnegus   cnegus   13597   1271008    522192    firefox
5412    cnegus   cnegus   13597   949584     157268 thunderbird-bin
25870   cnegus   cnegus   13597   1332492    112952 swriter.bin
```

未完待续。。。。。。。。。
### 题外话
最近负能量太多了 赶紧听首我大少时的歌压压。
<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="http://music.163.com/outchain/player?type=2&id=26133356&auto=0&height=66"></iframe>



                   






