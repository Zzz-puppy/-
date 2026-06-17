package com.example.xyzmarket;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.xyzmarket.mapper")
public class XYZMarketApplication {

    public static void main(String[] args) {
        SpringApplication.run(XYZMarketApplication.class, args);
    }

}