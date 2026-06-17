package com.example.xyzmarket.service;

import com.example.xyzmarket.entity.Certification;

public interface CertificationService {

    /**
     * 获取用户最新的认证状态
     */
    Certification getUserCertificationStatus(Long userId);
}