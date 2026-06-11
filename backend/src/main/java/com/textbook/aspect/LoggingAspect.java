package com.textbook.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * 日志切面 - 记录服务层方法的调用信息
 */
@Aspect
@Component
public class LoggingAspect {
    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);

    // 定义切入点，拦截 service 包下所有公共方法
    @Pointcut("execution(* com.textbook.service..*.*(..))")
    public void serviceMethods() {
    }

    @Around("serviceMethods()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        logger.info("Entering " + methodName + ", args: " + Arrays.toString(joinPoint.getArgs()));
        try {
            Object result = joinPoint.proceed();
            logger.info("Exiting " + methodName + ", return: " + result);
            return result;
        } catch (Exception e) {
            logger.error("Exception in " + methodName, e);
            throw e;
        }
    }
}