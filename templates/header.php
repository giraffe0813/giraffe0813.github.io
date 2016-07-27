<!DOCTYPE html>
<html lang=zh>
<head>
  <meta charset="utf-8">

  <meta name="baidu-site-verification" content="lt822VnP06" />
  <meta name="baidu-site-verification" content="0Ajixw1Puk" />
  <meta name="google-site-verification" content="gCQD0Y6f0YlPTZTAjp_mqms4C7TlkMWrg3Xy0mFdMwI" />
  <title>【Spring】Bean的生命周期 | Giraffe&#39;s Home</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta name="description" content="智商捉鸡🐔，实在没办法一下子理解Spring IoC和AOP的实现原理，看的闹心也不太懂，所以。。。决定拆成小的不能在小的一个个问题，一点点啃。今天先来看看Spring中Bean的生命周期。">
  <meta property="og:type" content="article">
  <meta property="og:title" content="【Spring】Bean的生命周期">
  <meta property="og:url" content="http://yemengying.com/2016/07/14/spring-bean-life-cycle/index.html">
  <meta property="og:site_name" content="Giraffe's Home">
  <meta property="og:description" content="智商捉鸡🐔，实在没办法一下子理解Spring IoC和AOP的实现原理，看的闹心也不太懂，所以。。。决定拆成小的不能在小的一个个问题，一点点啃。今天先来看看Spring中Bean的生命周期。">
  <meta property="og:image" content="http://yemengying.com/images/life.png">
  <meta property="og:updated_time" content="2016-07-16T01:08:26.000Z">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="【Spring】Bean的生命周期">
  <meta name="twitter:description" content="智商捉鸡🐔，实在没办法一下子理解Spring IoC和AOP的实现原理，看的闹心也不太懂，所以。。。决定拆成小的不能在小的一个个问题，一点点啃。今天先来看看Spring中Bean的生命周期。">
  <meta name="twitter:image" content="http://yemengying.com/images/life.png">

  <link rel="icon" href="/images/favicon.png" />

  <link rel="stylesheet" href="/vendor/font-awesome/css/font-awesome.min.css">
  <link rel="stylesheet" href="/vendor/open-sans/styles.css">
  <link rel="stylesheet" href="/vendor/source-code-pro/styles.css">
  <link rel="stylesheet" href="/vendor/fancybox/jquery.fancybox.css">
  <link rel="stylesheet" href="/css/style.css">

  <script src="/vendor/jquery/2.1.3/jquery.min.js"></script>
</head>
<body>