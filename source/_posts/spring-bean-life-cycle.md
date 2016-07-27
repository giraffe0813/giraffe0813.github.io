---
title: 【Spring】Bean的生命周期
date: 2016-07-14 21:35:53
toc: true
categories: [spring]
tags: [spring]
---
>智商捉鸡🐔，实在没办法一下子理解Spring IoC和AOP的实现原理，看的闹心也不太懂，所以。。。决定拆成小的不能在小的一个个问题，一点点啃。今天先来看看Spring中Bean的生命周期。

<!-- more -->

Spring Bean是Spring应用中最最重要的部分了。所以来看看Spring容器在初始化一个bean的时候会做那些事情，顺序是怎样的，在容器关闭的时候，又会做哪些事情。

### 示例代码
git地址：
{% github giraffe0813 giraffeInSpring giraffeInSpring %}

spring版本：4.2.3.RELEASE
鉴于Spring源码是用gradle构建的，我也决定舍弃我大maven，尝试下[洪菊](http://kevin.doyeden.com/)推荐过的gradle。运行beanLifeCycle模块下的junit test即可在控制台看到如下输出，可以清楚了解Spring容器在创建，初始化和销毁Bean的时候依次做了那些事情。

```bash
Spring容器初始化
=====================================
调用GiraffeService无参构造函数
GiraffeService中利用set方法设置属性值
调用setBeanName:: Bean Name defined in context=giraffeService
调用setBeanClassLoader,ClassLoader Name = sun.misc.Launcher$AppClassLoader
调用setBeanFactory,setBeanFactory:: giraffe bean singleton=true
调用setEnvironment
调用setResourceLoader:: Resource File Name=spring-beans.xml
调用setApplicationEventPublisher
调用setApplicationContext:: Bean Definition Names=[giraffeService, org.springframework.context.annotation.CommonAnnotationBeanPostProcessor#0, com.giraffe.spring.service.GiraffeServicePostProcessor#0]
执行BeanPostProcessor的postProcessBeforeInitialization方法,beanName=giraffeService
调用PostConstruct注解标注的方法
执行InitializingBean接口的afterPropertiesSet方法
执行配置的init-method
执行BeanPostProcessor的postProcessAfterInitialization方法,beanName=giraffeService
Spring容器初始化完毕
=====================================
从容器中获取Bean
giraffe Name=李光洙
=====================================
调用preDestroy注解标注的方法
执行DisposableBean接口的destroy方法
执行配置的destroy-method
Spring容器关闭
```

### 参考文档
[life cycle management of a spring bean](http://www.journaldev.com/2637/spring-bean-life-cycle#comment-35644)
[Spring Bean Life Cycle](http://javabeat.net/life-cycle-management-of-a-spring-bean/)

### Spring Bean的生命周期
先来看看，Spring在Bean从创建到销毁的生命周期中可能做得事情。
#### initialization 和 destroy
有时我们需要在Bean属性值set好之后和Bean销毁之前做一些事情，比如检查Bean中某个属性是否被正常的设置好值了。Spring框架提供了多种方法让我们可以在Spring Bean的生命周期中执行initialization和pre-destroy方法。

**1.实现InitializingBean和DisposableBean接口**

这两个接口都只包含一个方法。通过实现InitializingBean接口的afterPropertiesSet()方法可以在Bean属性值设置好之后做一些操作，实现DisposableBean接口的destroy()方法可以在销毁Bean之前做一些操作。

🌰如下：
```java
public class GiraffeService implements InitializingBean,DisposableBean {
    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("执行InitializingBean接口的afterPropertiesSet方法");

    }

    @Override
    public void destroy() throws Exception {
        System.out.println("执行DisposableBean接口的destroy方法");
    }
}
```
这种方法比较简单，但是不建议使用。因为这样会将Bean的实现和Spring框架耦合在一起。

**2.在bean的配置文件中指定init-method和destroy-method方法**

Spring允许我们创建自己的init方法和destroy方法，只要在Bean的配置文件中指定init-method和destroy-method的值就可以在Bean初始化时和销毁之前执行一些操作。
🌰如下：
```java
public class GiraffeService {
    //通过<bean>的destroy-method属性指定的销毁方法
    public void destroyMethod() throws Exception {
        System.out.println("执行配置的destroy-method");
    }

    //通过<bean>的init-method属性指定的初始化方法
    public void initMethod() throws Exception {
        System.out.println("执行配置的init-method");
    }

}
```
配置文件中的配置：

```xml
<bean name="giraffeService" class="com.giraffe.spring.service.GiraffeService" init-method="initMethod" destroy-method="destroyMethod">
</bean>
```
需要注意的是自定义的init-method和post-method方法可以抛异常但是不能有参数。
这种方式比较推荐，因为可以自己创建方法，无需将Bean的实现直接依赖于spring的框架。

**3.使用@PostConstruct和@PreDestroy注解**

除了xml配置的方式，Spring也支持用`@PostConstruct`和 `@PreDestroy`注解来指定init和destroy方法。这两个注解均在`javax.annotation`包中。
为了注解可以生效，需要在配置文件中定义`org.springframework.context.annotation.CommonAnnotationBeanPostProcessor`或`context:annotation-config`
🌰如下：
```java
public class GiraffeService {
    @PostConstruct
    public void initPostConstruct(){
        System.out.println("执行PostConstruct注解标注的方法");
    }

    @PreDestroy
    public void preDestroy(){
        System.out.println("执行preDestroy注解标注的方法");
    }

}

```
配置文件:
```xml
<bean class="org.springframework.context.annotation.CommonAnnotationBeanPostProcessor" />
```

#### 实现\*Aware接口 在Bean中使用Spring框架的一些对象
有些时候我们需要在Bean的初始化中使用Spring框架自身的一些对象来执行一些操作，比如获取ServletContext的一些参数，获取ApplicaitionContext中的BeanDefinition的名字，获取Bean在容器中的名字等等。为了让Bean可以获取到框架自身的一些对象，Spring提供了一组名为\*Aware的接口。
这些接口均继承于`org.springframework.beans.factory.Aware`标记接口，并提供一个将由Bean实现的set\*方法,Spring通过基于setter的依赖注入方式使相应的对象可以被Bean使用。
网上说，这些接口是利用观察者模式实现的，类似于servlet listeners，目前还不明白，不过这也不在本文的讨论范围内。
介绍一些重要的Aware接口：
* ApplicationContextAware: 获得ApplicationContext对象,可以用来获取所有Bean definition的名字。
* BeanFactoryAware:获得BeanFactory对象，可以用来检测Bean的作用域。
* BeanNameAware:获得Bean在配置文件中定义的名字。
* ResourceLoaderAware:获得ResourceLoader对象，可以获得classpath中某个文件。
* ServletContextAware:在一个MVC应用中可以获取ServletContext对象，可以读取context中的参数。
* ServletConfigAware在一个MVC应用中可以获取ServletConfig对象，可以读取config中的参数。

🌰如下:
```java
public class GiraffeService implements   ApplicationContextAware,
        ApplicationEventPublisherAware, BeanClassLoaderAware, BeanFactoryAware,
        BeanNameAware, EnvironmentAware, ImportAware, ResourceLoaderAware{
         @Override
    public void setBeanClassLoader(ClassLoader classLoader) {
        System.out.println("执行setBeanClassLoader,ClassLoader Name = " + classLoader.getClass().getName());
    }

    @Override
    public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
        System.out.println("执行setBeanFactory,setBeanFactory:: giraffe bean singleton=" +  beanFactory.isSingleton("giraffeService"));
    }

    @Override
    public void setBeanName(String s) {
        System.out.println("执行setBeanName:: Bean Name defined in context="
                + s);
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        System.out.println("执行setApplicationContext:: Bean Definition Names="
                + Arrays.toString(applicationContext.getBeanDefinitionNames()));

    }

    @Override
    public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        System.out.println("执行setApplicationEventPublisher");
    }

    @Override
    public void setEnvironment(Environment environment) {
        System.out.println("执行setEnvironment");
    }

    @Override
    public void setResourceLoader(ResourceLoader resourceLoader) {

        Resource resource = resourceLoader.getResource("classpath:spring-beans.xml");
        System.out.println("执行setResourceLoader:: Resource File Name="
                + resource.getFilename());

    }

    @Override
    public void setImportMetadata(AnnotationMetadata annotationMetadata) {
        System.out.println("执行setImportMetadata");
    }
}
```

#### BeanPostProcessor
上面的*Aware接口是针对某个实现这些接口的Bean定制初始化的过程，
Spring同样可以针对容器中的所有Bean，或者某些Bean定制初始化过程，只需提供一个实现BeanPostProcessor接口的类即可。 该接口中包含两个方法，postProcessBeforeInitialization和postProcessAfterInitialization。 postProcessBeforeInitialization方法会在容器中的Bean初始化之前执行， postProcessAfterInitialization方法在容器中的Bean初始化之后执行。
🌰如下：
```java
public class CustomerBeanPostProcessor implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("执行BeanPostProcessor的postProcessBeforeInitialization方法,beanName=" + beanName);
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("执行BeanPostProcessor的postProcessAfterInitialization方法,beanName=" + beanName);
        return bean;
    }


}
```
要将BeanPostProcessor的Bean像其他Bean一样定义在配置文件中
```xml
<bean class="com.giraffe.spring.service.CustomerBeanPostProcessor"/>
```

### 总结
所以。。。结合第一节控制台输出的内容，Spring Bean的生命周期是这样纸的：

* Bean容器找到配置文件中Spring Bean的定义。
* Bean容器利用Java Reflection API创建一个Bean的实例。
* 如果涉及到一些属性值 利用set方法设置一些属性值。
* 如果Bean实现了BeanNameAware接口，调用setBeanName()方法，传入Bean的名字。
* 如果Bean实现了BeanClassLoaderAware接口，调用setBeanClassLoader()方法，传入ClassLoader对象的实例。
* 如果Bean实现了BeanFactoryAware接口，调用setBeanClassLoader()方法，传入ClassLoader对象的实例。
* 与上面的类似，如果实现了其他*Aware接口，就调用相应的方法。
* 如果有和加载这个Bean的Spring容器相关的BeanPostProcessor对象，执行postProcessBeforeInitialization()方法
* 如果Bean实现了InitializingBean接口，执行afterPropertiesSet()方法。
* 如果Bean在配置文件中的定义包含`init-method`属性，执行指定的方法。
* 如果有和加载这个Bean的Spring容器相关的BeanPostProcessor对象，执行postProcessAfterInitialization()方法
* 当要销毁Bean的时候，如果Bean实现了DisposableBean接口，执行destroy()方法。
* 当要销毁Bean的时候，如果Bean在配置文件中的定义包含`destroy-method`属性，执行指定的方法。

用图表示一下([图来源](http://www.jianshu.com/p/d00539babca5))：

![Spring BeanLifeCycle](/images/life.png)

希望今晚能成功玩上pokemon go，好想抓精灵啊
![啦啦啦](/images/li.jpg)

>欢迎指正错误，欢迎一起讨论~~









