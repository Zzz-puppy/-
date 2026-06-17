package com.example.xyzmarket.service;

import com.example.xyzmarket.dto.WantedDTO;
import com.example.xyzmarket.entity.Wanted;

import java.util.List;
import java.util.Map;

public interface WantedService {

    Long publish(WantedDTO dto, Long userId);

    Map<String, Object> getList(int page, int size, Integer categoryId);

    List<Wanted> getMyList(Long userId);

    void update(Long id, WantedDTO dto, Long userId);

    void cancel(Long id, Long userId);

    /**
     * 标记求购为已成交
     */
    void fulfill(Long id, Long userId);

}