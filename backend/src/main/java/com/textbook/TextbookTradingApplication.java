package com.textbook;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * 高校教材交易系统
 */
@SpringBootApplication
@EnableTransactionManagement
@EnableScheduling
@MapperScan("com.textbook.dao")
public class TextbookTradingApplication {

    public static void main(String[] args) {
        SpringApplication.run(TextbookTradingApplication.class, args);
        System.out.println("\n========================================");
        System.out.println("高校教材交易系统启动成功！");
        System.out.println("后端地址: http://localhost:8085");
        System.out.println("========================================\n");
    }
}