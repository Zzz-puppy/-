package com.example.xyzmarket.config;

import com.example.xyzmarket.entity.User;
import com.example.xyzmarket.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 数据初始化器 - 在应用启动时初始化测试数据
 * 仅当数据库中无用户时创建预置管理员用户
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserMapper userMapper;

    @Override
    public void run(String... args) throws Exception {
        // 每次启动时重置管理员登录尝试次数（解锁管理员入口）
        userMapper.resetAdminLoginAttempts(LocalDateTime.now());
    }
}