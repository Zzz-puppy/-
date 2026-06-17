package com.example.xyzmarket.service.impl;

import com.example.xyzmarket.service.ImService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * IM 服务实现类
 */
@Service
public class ImServiceImpl implements ImService {

    @Value("${tencent.im.sdkAppId}")
    private Long sdkAppId;

    @Value("${tencent.im.secretKey}")
    private String secretKey;

    @Override
    public String generateUserSig(Long userId) {
        // TODO: 实现生成 UserSig
        // 思路：使用腾讯云 IM SDK 生成用户签名
        // 注意：需要在 pom.xml 中添加腾讯云 IM SDK 依赖

        return null;
    }

}