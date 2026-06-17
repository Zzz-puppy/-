package com.example.xyzmarket.service;

/**
 * IM 服务接口
 */
public interface ImService {

    /**
     * 生成腾讯云 IM UserSig
     *
     * @param userId 用户ID
     * @return UserSig 签名字符串
     */
    String generateUserSig(Long userId);

}