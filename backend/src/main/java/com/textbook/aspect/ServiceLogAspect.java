package com.textbook.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Spring AOP，统一记录 Service层方法调用日志
 */
@Aspect
@Component
public class ServiceLogAspect {

    private static final Logger log = LoggerFactory.getLogger(ServiceLogAspect.class);

    /**
     * 切点：所有 Service 层方法
     */
    @Pointcut("execution(* com.textbook.service..*(..))")
    public void serviceLayer() {
        // 切入点
    }

    /**
     * 环绕通知，记录耗时、入参、异常信息
     */
    @Around("serviceLayer()")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        Signature signature = pjp.getSignature();
        String method = signature.getDeclaringTypeName() + "." + signature.getName();

        Object[] args = maskSensitiveArgs(signature.getName(), pjp.getArgs());

        try {
            Object result = pjp.proceed();
            long cost = System.currentTimeMillis() - start;
            log.debug("[AOP] {} args={} cost={}ms", method, Arrays.toString(args), cost);
            return result;
        } catch (Throwable ex) {
            long cost = System.currentTimeMillis() - start;
            log.error("[AOP] {} args={} cost={}ms ex={}", method, Arrays.toString(args), cost, ex.getMessage(), ex);
            throw ex;
        }
    }

    /**
     * 避免密码明文出现在日志中
     */
    private Object[] maskSensitiveArgs(String methodName, Object[] args) {
        if (args == null || args.length == 0) {
            return new Object[0];
        }

        Object[] copy = Arrays.copyOf(args, args.length);

        if ("login".equals(methodName) || "register".equals(methodName)) {
            if (copy.length >= 2 && copy[1] instanceof String) {
                copy[1] = "******";
            }
        }
        return copy;
    }
}