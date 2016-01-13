title: 读书笔记-Linux Bible 9th Edition之文件系统
date: 2015-11-26 16:28:15
toc: true
comment: true
tags:
  - linux
  - 读书笔记
---
>跟着书，重新梳理一下linux文件系统的有关知识, 最近一天一个接口的节奏真真是极好的,有时间看看书了。😻😻😻

 相关博客:
 [Linux Bible 9th Edition之使用shell](http://yemengying.com/2015/11/23/%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0-Linux-Bible-9th-Edition/)
 [Linux Bible 9th Edition之玩转文本文件](http://yemengying.com/2015/11/30/%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0-Linux-Bible-9th-Edition%E4%B9%8B%E7%8E%A9%E8%BD%AC%E6%96%87%E6%9C%AC%E6%96%87%E4%BB%B6/)
 

![霸气的喵喵](/images/霸气的喵喵.jpg)

<!-- more -->

### Linux文件系统结构
> 在linux中文件组织在一个层级的目录结构中，每个目录可以包含文件和目录，整体看起来就像一个倒过来的树。最上面就是根目录，用"/"符号表示。根目录下面是linux系统中一些常见的目录,比如bin,dev,home,lib等等。下面的图(书上的截图)展示了linux文件系统的层级结构。
![linux_filesystem](/images/linux_filesystem.jpg)

### 基本的一些文件系统命令

|命令|作用|
|:---|:---|
|cd|进入另一个目录|
|pwd|打印当前工作目录的路径
|mkdir|创建一个目录
|chmod|更改文件或目录的权限
|ls|列出目录的内容

- *cd*命令
cd命令是其中最常用的   
eg：

```
 # 进入根目录下的usr目录下的share目录 以"/"开头，代表在根目录下
 $ cd /usr/share
 # 只输入cd 回到home目录
 $ cd 
 # 进入home目录下的某一目录 "~"代表home目录
 $ cd ~/coffee
 # 回到上一级目录 ".."代表上一级目录
 $ cd ..
```
- 创建目录并查看权限

```
 # 创建目录test
 $ mkdir test
 # 查看目录权限
 $ ls -ld test
```

### 使用Metacharacters(元字符)和Operators(操作符)

 使用metacharacters进行文件匹配     
 
  "*"代表任意数量的字符 "?"代表任意一个字符 "[...]"匹配任意一个包含在括号中的字符,也可以用连字符表示一个范围  
  eg：
  
```
   # 创建5个空文件
   $ touch apple banana grape grapefruit watermelon
   $ ls a*
   apple
   $ ls g*
   grape 
   $ ls g???e
   grape
   $ ls [abw]*
   apple banana watermelon
   $ ls [a-g]*
   apple banana grape grapefruit 
```
 使用metacharacters进行文件重定向   
	使用管道符号"|"可以将一个命令的标准输出(standard output)作为另一个命令的标准输入(standard input)。对于文件，我们可以用"<"和">"来将数据从文件中输入或输出。
  
  |符号|作用|
  |:---|:---|
  |<|文件的内容输入到命令|
  |>|将一个命令的标准输出输出到文件，如果文件已存在,文件的内容会被覆盖|
  |2>|将错误输出输出到文件|
  |&>|将标准输出和错误输出都输出到文件|
  |>>|将命令的输出到文件中，不覆盖文件原有内容，将输出添加到文件最后|
  |<<|后面要跟着一个单词，之后所有的输入都会当做用户输入，直到重复输入符号后的单词

 使用大括号 
  
 通过使用大括号"{}",可以在文件名后扩展一组元素。
 eg:
 ```
  $ touch {a,b,c}-{1,2,3}
  $ ls
  a-1 a-2 a-3 b-1 b-2 b-3 c-1 c-2 c-3
 ```


 
### 列出文件和目录

在linux系统中,*ls*命令用来列出文件和目录的有关信息，*ls*命令有许多option。在默认情况下，输入*ls*，会输出当前目录下所有的非隐藏的文件和目录。如果在命令后在上选项"-l"会输出详细的信息(如下)，其中total代表了目录中的内容占用了多少磁盘空间;第一列第一个字符代表了文件的类型，"-"代表普通文件，"d"代表是目录，"l"代表是一个符号链接,剩下的9个字符代表了文件的权限(下面会讲);第二列展示了文件硬链接数或目录子目录数;第三列显示了文件或目录的拥有者;第四列代表文件拥有者所在的组;第五列是文件的大小;第六列是文件最后的修改时间;最后一列展示了文件或目录的名字;
eg：

```
$ ls -l
total 4-rw-rw-r--. 1 joe joe 0 Dec 18 13:38 applelrwxrwxrwx. 1 joe joe 5 Dec 18 13:46 pointer_to_apple -> apple -rwxr-xr-x. 1 joe joe 0 Dec 18 13:37 scriptx.shdrwxrwxr-x. 2 joe joe 4096 Dec 18 13:38 Stuff
```
*ls*命令的其它选项：

|选项|作用|
|:---|:---|
| -a|展示包含隐藏文件(以.开头)在内的所有文件|
| -t|按照最近修改时间展示
| -F|在展示时，在目录名后加"/",在可执行文件后加"*",在符号链接后加"@"
| -S|展示时按大小排序
| -d|只展示包含的目录
| -R|递归的列出当前目录下所有的文件和目录
| --hide=|不展示指定目录或文件

### 理解文件权限

>在使用Linux系统时，经常会看到"Permission Denied"(权限不足)的提示。权限控制是为了避免用户访问其他用户的私有文件和保护重要的系统文件。在Linux中，每个文件对应一个9bit的权限信息(eg:rwxrwxrwx)。其中前三位代表了文件拥有者的权限，中间三位代表了拥有者所在组的权限，最后三位代表了其他用户的权限。权限由字母代表，"r"代表读权限，"w"代表写权限，"x"代表执行权限，如果某一位不是字母，而是"-"，则代表没有该位所代表的权限。举个两个栗子🌰🌰，"rw-"代表有读写权限，没有执行权限；"r--"代表只有读权限

### 使用chmod命令更改权限

- 使用数字
>文件的拥有者可以改变文件的权限，每种权限都对应了一个数字，读权限r对应4，写权限w对应2，执行权限x对应1。可以通过设置数值来建立权限。
eg:

```
 # 设置权限 rwxrwxrwx
 # chmod 777 filename
 # 设置权限 rwxr-xr-x
 # chomd 755 filename
 # 设置权限 rw-r--r--
 # chomd 644 filename
 # 设置权限 ---------
 # chmod 000 filename
```
- 使用字母
> 在linux中，还有另一种改变权限的方式。在这种方式中，"+"和"-"分别代表权限的开和关。字母"u","g","o"和"a"分别代表拥有者,组，其他用户和全部用户。和上一种方式一样"r","w","x"分别代表读、写和执行权限。
eg：

```
 # 设置权限 将权限rwxrwxrwx改为r-xr-xr-x
 # chmod a-w filename
 # 设置权限 将权限rwxrwxrwx改为rwxrwxrw-
 # chomd o-x filename
 # 设置权限 将权限rwxrwxrwx改为rwx------
 # chmod go-rwx filename
 # 设置权限 将权限---------改为rw-------
 # chmod u+rw filename
 # 更改目录下所有文件和目录的权限
 # chmod -R o-w myapps
```
- 使用umask设置默认权限
>普通用户创建文件 默认权限是rw-rw-r--，创建目录 默认权限是rwxrwxr-x。root用户创建文件和目录权限分别是rw-r--r--和rwxr-xr-x。这些默认值由*umask*的值决定，可通过命令*umask*查看它的值。与*chmod*效果刚好相反，*umask*设置的是权限的补码，*umask*的值有三位分别对应拥有者，同组用户和其他用户的权限。对于文件来说，每一位的最大值是6，因为系统不允许在创建一个文件时就赋予执行权限，需通过*chmod*设置；对于目录来说每一位的最大值是7。例如*umask*值002所对应的文件和目录的创建权限是664和775。可通过*umask*命令改变默认值。
eg：
```
 # 查看默认值
 $ umask
 # 改变默认值
 $ umask 022
```
### 改变文件的拥有者
>作为普通用户，是不能更改文件或目录的拥有者的，只有root user(管理员才可以)。
eg:

```
 # 修改文件的拥有者
 # chown giraffe filename.text
 # 同时修改拥有者和组
 # chown giraffe:coffee filename.txt
 # 修改目录下的所有目录和文件的拥有者
 # chown -R giraffe:coffee /mydic
```

### 移动 复制 删除文件

>移动、复制和删除文件的命令很简单。如果想要改变文件的位置，使用*mv*命令。如果想要复制文件，使用*cp*命令。如果想要删除文件，使用*rm*命令。这些命令可以使用在单一的文件和目录上，也可以递归的使用在许多文件和目录上。


- 移动文件
eg：

```
 # 将文件abc移到home目录
 $ mv abc ~
 # 将目录mydemo的全部内容移到目录document中
 $ mv /home/giraffe/mydemo /home/giraffe/document
```

- 复制文件
eg：

```
 # 将文件abc复制到home目录下
 $ cp abc ~
 # 将目录bash-completion*下的内容复制到tmp/a下
 $ cp -r /usr/share/bash-completion* /tmp/a
 # 将目录bash-completion*下的内容复制到tmp/a下 并且保留权限
 $ cp -ra /usr/share/bash-completion* /tmp/a
```
- 删除文件
eg：

```
 # 删除文件abc
 $ rm abc
 # 删除当前目录下所有文件
 $ rm *
 # 删除一个空的目录
 $ rmdir /home/giraffe/empty
 # 删除目录和他包含的所有内容
 $ rm -r /home/giraffe/bigdir
 # 不提示的删除目录和它包含的所有内容
 $ rm -rf /home/giraffe/bigdir
```




