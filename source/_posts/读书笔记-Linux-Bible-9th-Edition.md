title: 读书笔记-Linux Bible 9th Edition之使用shell
date: 2015-11-23 16:23:32
comments: true
toc: true
tags:
  - linux
  - 读书笔记
---
> 其实也不算读书笔记 主要是想整理一下常用的一些linux命令 
> 

 相关博客:
 [Linux Bible 9th Edition之玩转文本文件](http://yemengying.com/2015/11/30/%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0-Linux-Bible-9th-Edition%E4%B9%8B%E7%8E%A9%E8%BD%AC%E6%96%87%E6%9C%AC%E6%96%87%E4%BB%B6/)
 [Linux Bible 9th Edition之文件系统](http://yemengying.com/2015/11/26/%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0-Linux-Bible-9th-Edition%E4%B9%8B%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F/)


![doge](/images/doge.jpg)
<!-- more -->

#### linux命令的一些语法
> *$*提示符代表普通用户 *#*提示符代表root用户。 大多数命令都有许多选项 选项通常由单一字符和连字符组成(eg:ls -a),还有选项是由一个单词代表,需在单词前加双连字符(eg:date - -help)

#### 获得当前登录会话的一些信息

```
 $ who 
 $ who am i 
 $ who -uH
```
#### 查看服务器上的时间

```
 $ date
 $ date +'%d/%m/%y'(以10/12/14的格式输出)
```
#### 当前的目录

```
 $ pwd 
```
#### 获得hostname
```
 $ hostname
```
#### 列出当前目录下的文件和目录

```
 $ ls
 $ ls -l(列出详细信息) -a(列出包括.开头的隐含文件在内的所有文件) -t(按时间排序)
```
#### 查看uid gid

```
 $ id
```

#### LINUX如何定位命令

>可通过*echo $PATH*命令查看PATH环境变量的值，如果命令存放的目录包含在PATH中，可直接输入命令运行。如果不包含则需给出命令的位置(eg:绝对位置:/home/chris/scriptx.sh,相对位置:./scriptx.sh) shell检查输入命令的顺序：1.Aliases(别名) 2.Reserved word(保留的关键字) 3.Function 4.Build-in command(eg:cd/echo/exit/type..) 5.Filesystem

```
 #查看一个命令的位置
 $ type bash
 #打印PATH环境变量的值
 $ echo $PATH
```

#### 在文件系统中查找

```
 $ locate ymy
```

#### 查看历史输入的命令,修改命令

>可以用*history*命令查看之前输入过的所有命令,之后可以通过!+行号 运行指定一行的命令。向上箭头(↑)可查看最近一条命令,下面是修改命令的一些快捷按键。

|快捷键|作用|
|:---|:---|
|ctrl+A|将光标定位到命令的最前面|
|ctrl+E|将光标定位到命令的最后面|
|ctrl+L|清空屏幕，将命令置为最上面|
|ctrl+F或 → |将光标后移|
|ctrl+B或 ← |将光标前移|
|alt+F|将光标后移一个单词|
|alt+B|将光标前移一个单词|
|ctrl+D|删除当前字符
|backspace|删除前一个字符|
|ctrl+T|将当前字符和前一个字符对换|
|alt+T|将当前单词和前一个单词对换|
|alt+U|将当前单词变成大写|
|alt+L|将当前单词变成小写|
|ctrl+K|剪切从光标位置到最后|
|ctrl+U|剪切从光标位置到最前|
|ctrl+W|剪切前一个单词|
|alt+D|剪切后一个单词|
|ctrl+Y|粘贴最近复制的内容|
|alt+Y|粘贴最前复制的内容|
|tab|补全命令|


#### 连接和扩展命令

- 管道符号 "|"
将前一个命令的输出作为下一个命令的输入   
eg:
```
 $ cat /etc/passwd | sort |less
```
- 命令分隔符 ";"
在一行语句中 顺次执行各个命令
eg: 

```
 #可获得troff命令的执行时间
 $ date; troff -me verylargedocument|lpr ; date 
```
- 后台进程符 "&"
如果不希望shell一直被一个命令占用着，可以使用"&"让命令在后台运行
eg:
```
 $ troff -me verylargedocument | lpr &
```
- 使用数学表达式/命令的结果 "$[]"/"$()"
可以在一个命令中使用数学表达式或另一个命令的结果   
eg:
```
 $ echo "I am $[2015 - 1993] years old"
 $ echo "there are $(ls | wc -w) files in this directory"
```
- 变量调用符号 "$"
eg:
```
 $ echo $USER
```

#### 创建和使用别名
使用*alias*命令，可以给任何的命令及选项取一个别名     
eg:
 
```
 #为命令pwd取别名ymy
 $ alias ymy='pwd'
 #查看所有的别名
 $ alias
 #删除别名
 $ unalias ymy 
 
```
#### 退出shell

```
 $ exit
```



