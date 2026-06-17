package com.example.xyzmarket.controller;

import com.example.xyzmarket.common.Result;
import com.example.xyzmarket.dto.WantedDTO;
import com.example.xyzmarket.entity.Wanted;
import com.example.xyzmarket.service.WantedService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wanted")
public class WantedController {

    @Autowired
    private WantedService wantedService;

    @PostMapping
    public Result<Long> publish(@Valid @RequestBody WantedDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long id = wantedService.publish(dto, userId);
        return Result.success(id);
    }

    @GetMapping("/list")
    public Result<Map<String, Object>> getList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Integer categoryId) {
        Map<String, Object> result = wantedService.getList(page, size, categoryId);
        return Result.success(result);
    }

    @GetMapping("/my")
    public Result<List<Wanted>> my(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(wantedService.getMyList(userId));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable("id") Long id, @Valid @RequestBody WantedDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        wantedService.update(id, dto, userId);
        return Result.success(null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> cancel(@PathVariable("id") Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        wantedService.cancel(id, userId);
        return Result.success(null);
    }

    /**
     * 标记求购为已成交
     */
    @PutMapping("/{id}/fulfill")
    public Result<String> fulfill(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        wantedService.fulfill(id, userId);
        return Result.success("已标记为成交");
    }
}