package com.example.xyzmarket.service.impl;

import com.example.xyzmarket.common.ErrorCode;
import com.example.xyzmarket.dto.WantedDTO;
import com.example.xyzmarket.entity.Wanted;
import com.example.xyzmarket.exception.BusinessException;
import com.example.xyzmarket.mapper.WantedMapper;
import com.example.xyzmarket.service.WantedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class WantedServiceImpl implements WantedService {

    @Autowired
    private WantedMapper wantedMapper;

    private static final List<Map<String, Object>> CATEGORIES = List.of(
        Map.of("id", 1, "name", "数码产品"),
        Map.of("id", 2, "name", "图书教材"),
        Map.of("id", 3, "name", "生活用品"),
        Map.of("id", 4, "name", "运动器材"),
        Map.of("id", 5, "name", "服装服饰"),
        Map.of("id", 6, "name", "其他")
    );

    @Override
    public Long publish(WantedDTO dto, Long userId) {
        Wanted wanted = new Wanted();
        wanted.setUserId(userId);
        wanted.setTitle(dto.getTitle());
        wanted.setDescription(dto.getDescription());
        wanted.setCategoryId(dto.getCategoryId());
        wanted.setBudget(dto.getBudget());
        wanted.setStatus(0);
        wanted.setCreateTime(LocalDateTime.now());
        wanted.setUpdateTime(LocalDateTime.now());
        wantedMapper.insert(wanted);
        return wanted.getId();
    }

    @Override
    public Map<String, Object> getList(int page, int size, Integer categoryId) {
        int offset = (page - 1) * size;
        List<Wanted> list;
        int total;
        if (categoryId != null && categoryId > 0) {
            list = wantedMapper.findListByCategory(offset, size, categoryId);
            total = wantedMapper.countActiveByCategory(categoryId);
        } else {
            list = wantedMapper.findList(offset, size);
            total = (int) wantedMapper.countActive();
        }
        for (Wanted item : list) {
            if (item.getCategoryId() != null) {
                String name = item.getCategoryId() >= 1 && item.getCategoryId() <= CATEGORIES.size()
                        ? (String) CATEGORIES.get(item.getCategoryId() - 1).get("name")
                        : "其他";
                item.setCategoryName(name);
            }
        }
        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", total);
        return result;
    }

    @Override
    public List<Wanted> getMyList(Long userId) {
        List<Wanted> list = wantedMapper.findByUserId(userId);
        for (Wanted w : list) {
            String name = CATEGORIES.stream()
                .filter(c -> c.get("id").equals(w.getCategoryId()))
                .map(c -> (String) c.get("name"))
                .findFirst().orElse("其他");
            w.setCategoryName(name);
        }
        return list;
    }

    @Override
    public void update(Long id, WantedDTO dto, Long userId) {
        Wanted wanted = wantedMapper.findById(id);
        if (wanted == null) throw new BusinessException(ErrorCode.NOT_FOUND, "求购不存在");
        if (!wanted.getUserId().equals(userId)) throw new BusinessException(ErrorCode.FORBIDDEN, "无权操作");

        wantedMapper.update(id, dto.getTitle(), dto.getDescription(),
            dto.getCategoryId(), dto.getBudget(), LocalDateTime.now());
    }

    @Override
    public void cancel(Long id, Long userId) {
        Wanted wanted = wantedMapper.findById(id);
        if (wanted == null) throw new BusinessException(ErrorCode.NOT_FOUND, "求购不存在");
        if (!wanted.getUserId().equals(userId)) throw new BusinessException(ErrorCode.FORBIDDEN, "无权操作");

        wantedMapper.updateStatus(id, 2, LocalDateTime.now());
    }

    @Override
    public void fulfill(Long id, Long userId) {
        Wanted wanted = wantedMapper.findById(id);
        if (wanted == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "求购不存在");
        }
        if (!wanted.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "只能操作自己的求购");
        }
        if (wanted.getStatus() != 0) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "该求购已结束");
        }
        wantedMapper.updateStatus(id, 1, LocalDateTime.now());
    }

}