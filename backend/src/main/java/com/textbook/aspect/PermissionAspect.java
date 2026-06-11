package com.textbook.aspect;

import com.textbook.annotation.RequireAdmin;
import com.textbook.dto.Result;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

/**
 * 权限切面，校验管理员权限
 */
@Aspect
@Component
public class PermissionAspect {

    @Pointcut("@within(com.textbook.annotation.RequireAdmin) || @annotation(com.textbook.annotation.RequireAdmin)")
        public void requireAdminMethods() {
    }

    @Around("requireAdminMethods()")
    public Object checkAdminRole(ProceedingJoinPoint joinPoint) throws Throwable {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = (attrs != null ? attrs.getRequest() : null);

        if (request != null) {
            String userRole = (String) request.getAttribute("userRole");
            if (!"admin".equals(userRole)) {
                return Result.error(403, "无权访问");
            }
        } else {
            return Result.error(403, "无权访问");
        }

        return joinPoint.proceed();
    }
}
