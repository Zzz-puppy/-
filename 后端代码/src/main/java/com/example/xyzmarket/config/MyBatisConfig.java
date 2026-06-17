package com.example.xyzmarket.config;

import org.apache.ibatis.session.Configuration;
import org.mybatis.spring.boot.autoconfigure.ConfigurationCustomizer;
import org.springframework.context.annotation.Bean;

/**
 * MyBatis 配置类
 * 注意：不使用 MyBatis-Plus
 */
@org.springframework.context.annotation.Configuration
public class MyBatisConfig {

    /**
     * MyBatis 配置定制
     */
    @Bean
    public ConfigurationCustomizer configurationCustomizer() {
        return (Configuration configuration) -> {
            // 开启驼峰命名转换
            configuration.setMapUnderscoreToCamelCase(true);
        };
    }

}