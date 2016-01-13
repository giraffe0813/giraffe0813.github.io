layout: post
title: spring事务管理总结
date: 2015-09-12 14:44:29
comments: true 
toc: true  
tags:
  - spring
  - java
  - transaction
  - spring-aop
---

以前写在segmentFault上的一篇文章 搬移到这里。

>在项目开发过程中经常会使用事务来确保数据的一致性。根据网上的资料整理一下在spring中配置事务的几种方式。
>无论是哪种方式都需要在配置文件中配置连接池和事务管理器,代码如下。    

<!-- more -->

```
   xml
   <!-- 读取配置文件 -->
   <bean
		class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
		<property name="locations">
			<list>
				<value>classpath:database.properties</value>
				<value>classpath:service.properties</value>
			</list>
		</property>
		<property name="fileEncoding" value="UTF-8" />
		<property name="ignoreResourceNotFound" value="false" />
	</bean>
    <!--连接池 -->
	<bean id="dataSource"
		class="org.springframework.jdbc.datasource.DriverManagerDataSource">
		<property name="driverClassName" value="${db.driver}" />
		<property name="url" value="${db.url}" />
		<property name="username" value="${db.username}" />
		<property name="password" value="${db.password}" />
	</bean>
	<!-- 配置事务管理器 -->
	<bean id="transactionManager"
		class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
		<property name="dataSource" ref="dataSource" />
	</bean>
```
## 声明式事务管理
### 基于AspectJ的XML方式的配置
这是我觉得最好的方式，基于aop配置，当新增的方法要使用事务管理时，无需修改代码。
首先在配置文件xml中引入aop和tx的命名空间
```
xmlns:tx="http://www.springframework.org/schema/tx" 
xmlns:aop="http://www.springframework.org/schema/aop"
xsi:schemaLocation="http://www.springframework.org/schema/tx
http://www.springframework.org/schema/tx/spring-tx-3.0.xsd
http://www.springframework.org/schema/aop   
http://www.springframework.org/schema/aop/spring-aop-3.0.xsd"
```
然后在xml中加入aop的配置,下面的配置就是在services的切入点上应用txAdvice的增强，services的切入点就是ymy.com.service.impl包下的所有方法应用txAdvice的增强。然后txAdvice是在所有以create,add,delete,update,change开头的方法上加上事务管理。

```
    <!-- 定义事务通知 （事务的增强）-->
	<tx:advice id="txAdvice" transaction-manager="transactionManager">
	    <!-- 定义方法的过滤规则 -->
	    <tx:attributes>
	        <!-- 所有方法都使用事务 -->
	        <!-- 
				propagation:事务传播行为
				isolation：事务隔离
				read-only:只读
				rollback-for:发生哪些异常回滚
				no-rollback-for:发生哪些异常不回滚 
				timeout:过期信息    
	         -->
	        <tx:method name="create*" propagation="REQUIRED"/>
	        <tx:method name="add*" propagation="REQUIRED"/>
	        <tx:method name="delete*" propagation="REQUIRED"/>
	        <tx:method name="update*" propagation="REQUIRED"/>
	        <tx:method name="change*" propagation="REQUIRED"/>
	    </tx:attributes>
	</tx:advice>
	  
	<!-- 定义AOP配置 配置切面 -->
	<aop:config>
	    <!-- 定义一个切入点 -->
	    <aop:pointcut expression="execution (* ymy.com.service.impl.*.*(..))" id="services"/>
	    <!-- 对切入点和事务的通知，进行适配 -->
	    <aop:advisor advice-ref="txAdvice" pointcut-ref="services"/>
	</aop:config> 
```
采用这种方式配置，当方法是按照事务定义的规则命名时，都会加入事务管理。

### 基于注解
这种方式是我觉得最简单的，第二推荐。要采用注解的方式，需要在配置文件中开启注解事务。

```
<!-- 开启注解事务 -->
<tx:annotation-driven transaction-manager="transactionManager"/>
```
在使用时只需在对应的类上添加注解@Transactional即可

```
@Service
@Transactional
public class TaskService implements ITaskService {

}
```
也可在使用注解时定义事物的传播级别 隔离行为等。。

```
@Transactional(propagation=Propagation.REQUIRED)
```
### 基于TransactionProxyFactoryBean
这种方式配置比较麻烦，需要为每一个需要事务管理的类配置一个代理类，不推荐使用。例如我要对taskService进行事务管理，需要如下配置，用代理类对目标类进行增强。

```
	<!-- 配置service层的代理 -->
	<bean id = "taskServiceProxy" class="org.springframework.transaction.interceptor.TransactionProxyFactoryBean">
		<!-- 配置目标对象 -->
		<property name = "target" ref="taskService"></property>
		<!-- 注入事务管理器 -->
		<property name = "transactionManager" ref="transactionManager"></property>
		<!-- 设置需要事务管理的方法 -->
		<property name="transactionAttributes">
			<props>
				<prop key="update*">PROPAGATION_REQUIRED</prop>
			</props>
		</property>
	</bean>
```
之后在注入service类时，就要注入它的代理类。

```
@Resource(name = "taskServiceProxy")
private ITaskService taskSerivce;
```
## 编程式事务管理
超级不推荐，需要为每个类注入事务模板，然后在需要事务管理的方法中使用事务模板。

```
private TransactionTemplate transactionTemplate;
public void test(){
		transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				//进行事务相应的操作。。。
				//方法一...
				//方法二...
			}
		});
	}
```

