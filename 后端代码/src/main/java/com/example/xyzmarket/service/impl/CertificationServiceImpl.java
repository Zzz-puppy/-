package com.example.xyzmarket.service.impl;

import com.example.xyzmarket.entity.Certification;
import com.example.xyzmarket.mapper.CertificationMapper;
import com.example.xyzmarket.service.CertificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CertificationServiceImpl implements CertificationService {

    @Autowired
    private CertificationMapper certificationMapper;

    @Override
    public Certification getUserCertificationStatus(Long userId) {
        return certificationMapper.findByUserId(userId);
    }
}