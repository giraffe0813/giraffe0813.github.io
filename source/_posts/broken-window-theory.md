---
title: 谈谈破窗理论
date: 2016-05-15 14:02:14
toc: true
categories: 随笔
tags: [随笔]
---
>在湾区日报上看到篇关于破窗理论(Broken Window Theory)的[文章](http://blog.codinghorror.com/the-broken-window-theory/?utm_source=wanqu.co&utm_campaign=Wanqu+Daily&utm_medium=ios)，真是颇有感触，所以决定写篇博客，结合这几个月开发代理商网站的心(keng)路(die)历程,谈谈为何不能忽视一点点糟糕的代码或者不好的设计。

<!-- more -->
### 破窗理论
先简单解释下什么是“破窗理论”，“破窗理论”是指：如果有人打坏了一幢建筑物的窗户玻璃，而这扇窗户又得不到及时的维修，别人就可能受到某些暗示性的纵容去打烂更多的窗户。
![破窗理论](/images/broken-window.jpg)
湾区日报上的文章中是这样描述破窗理论的：
>Don't leave "broken windows" (bad designs, wrong decisions, or poor code) unrepaired. Fix each one as soon as it is discovered. If there is insufficient time to fix it properly, then board it up. Perhaps you can comment out the offending code, or display a "Not Implemented" message, or substitute dummy data instead. Take some action to prevent further damage and to show that you're on top of the situation.
We've seen clean, functional systems deteriorate pretty quickly once windows start breaking. There are other factors that can contribute to software rot, and we'll touch on some of them elsewhere, but neglect accelerates the rot faster than any other factor.

简单翻译一下就是：
>不要放任“破窗户”(不好的设计，错误的决定或糟糕的代码)不管。要尽量在发现时立刻修复。如果没有足够的时间进行适当的修复，就先把它保留起来。可以把出问题的代码放到注释中，或是显示“未实现”消息，也可用虚拟数据加以替代。总之，要采取一些措施，防止进一步的恶化。表明局势尚在掌控之中。有许多整洁良好的系统在出现“破窗”之后立马崩溃。虽然促使软件崩溃的原因还有其他因素（我们将在其他地方接触到），但对“破窗”置之不理，肯定会更快地加速系统崩溃。



### 亲身感受
先说说背景，故事要从三个月前开始讲起了，当时刚刚转去搜索组做部门内部的搜索，组内总共3个人。本以为可以远离业务代码，专心技术，可万万没想到Elasticsearch的书还没焐热就被部门leader叫去开会，说要做一个代理商系统，很紧急，是公司P0级别的项目，全公司的资源都要给我们让路(事实证明只是画饼，因为现在连一个固定前端都没了)。其实这个项目一听就是个深坑，从头发到脚都是拒绝的。因为主数据（餐厅，活动，订单）全在别的部门，85%的功能都依赖于其他部门的接口(si不si很神奇)，所以做这个项目主要工作就是。。。。。通过SOA或者Thrift调别人的接口。不过即便知道是坑也没办法，只有搜索组刚刚成立比较闲，只能我们做-_-|||。当时部门leader的要求是封闭开发一周半，拿出个可用的版本就行，一定要快！！。所以我们搜索组的三个人加上从别的组借调的两个实习生再加上两个前端就搬去了小黑屋，开始了近两周的封闭开发。

好了，背景聊完了，进入正题，聊聊代理商是怎么变得越来越难维护的。代理商的开发leader是个搜索大牛，但没做过Web开发，对Java Web开发并不是十分了解。因为部门leader要求快快快，所以将许多必要的步骤省略了。比如定义方法参数命名规范，定义api规范，代码review等等。。。每天就是划分下接口，每人开发几个接口，和前端定义接口文档，就开始开发提测了。讲真，其实所有人都是有责任的，可能是对这个项目一开始就很反感，有抵触心理，所以从内心就没打算好好做，一些觉得可以改进的地方也就得过且过了。后面的事实证明，当觉得设计或规范有不合理的时候，一定要及时提出来，不能忍，忍的后果就是一次一次降低自己的底线，然后亲手造就一个难维护的系统，到时候即便有心想重构也是心有余力不足了。

公司项目就不贴实际代码了，简单举几个例子，看看开发前定义必要的规范是多么的重要。由于代理商没有事先规定api的定义要符合RESTFul的规范，所以项目中api的风格有两种，符合RESTFul的和不符合的。比如获取餐厅信息的api定义是`GET /restaurant/{id}`，而创建餐厅的api定义是`POST /restaurant/create`，so。。。如果后面的人想设计更新餐厅信息的api是`PUT /restaurant/{id}`还是`PUT /restaurant/update`呢，真是一脸懵逼。接口的命名就更是五花八门了，因为大家是来自不同组，而且也没有定义统一的命名的规范，比如：一个简单的获取信息，获取餐厅信息的接口是`getRestaurant`,获取活动信息是`activityInfo`,获取代理商信息接口是`getAgentDto`，获取订单信息又变成了`getOrderData`,so。。。谁能告诉我之后想添加个获取信息的接口到底该叫什么。。。估计只能看当时的心情随便取了。。。还有就是项目中存在大量重复代码，获取餐厅管理员信息基本上每个人都写了一遍，因为管理员的信息在获取餐厅，活动信息时都用的到，由于没有代码review，所以一开始大家也不知道，就各写各的，也是蛮醉的。

上面的例子只是一点点，实际还有很多很多很多的槽点，都是泪啊。由于第一版本为了压缩工时(至今也不明白为啥要那么急。。。)就这样草草交工，导致后面的几个迭代开发也随之变得越来越随意，随意命名，随意定义api，缺乏junit测试，越来越不上心。听说代理商要移交给BD组，但估计情况也只会越来越糟，因为没人愿意去整理一坨坨糟糕的代码，只会在出现问题的时候，随意的打补丁。。。

###  总结
其实也没啥好总结的，一句话，以后一定要写干净，整洁的代码，注意规范，不能忽视一点点糟糕的代码或者设计对项目带来的负面影响。
>欢迎一起讨论~~



