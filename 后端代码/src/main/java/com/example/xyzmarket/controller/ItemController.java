package com.example.xyzmarket.controller;

import com.example.xyzmarket.common.Result;
import com.example.xyzmarket.dto.ItemDTO;
import com.example.xyzmarket.entity.Item;
import com.example.xyzmarket.service.ItemService;
import com.example.xyzmarket.vo.PageResult;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/item")
public class ItemController {

    @Autowired
    private ItemService itemService;

    /**
     * 发布商品
     * 需要 JWT 认证，sellerId 从 token 获取
     */
    @PostMapping
    public Result<Long> publishItem(@Valid @RequestBody ItemDTO itemDTO, HttpServletRequest request) {
        Long userId = (Long)request.getAttribute("userId");
        Long itemId = itemService.publishItem(itemDTO, userId);
        return Result.success(itemId);
    }

    /**
     * 获取商品列表（分页+排序）
     * 无需认证
     */
    @GetMapping("/list")
    public Result<PageResult<Item>> getItemList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String sortBy) {
        PageResult<Item> itemList = itemService.getItemList(page, size, sortBy);
        return Result.success(itemList);
    }

    /**
     * 搜索商品（分页+排序）
     * 无需认证
     */
    @GetMapping("/search")
    public Result<PageResult<Item>> searchItems(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String sortBy) {
        PageResult<Item> itemList = itemService.searchItems(keyword, page, size, sortBy);
        return Result.success(itemList);
    }

    /**
     * 获取商品详情
     * 无需认证
     */
    @GetMapping("/{id}")
    public Result<Item> getItemById(@PathVariable Long id) {
        Item item = itemService.getItemById(id);
        return Result.success(item);
    }

    /**
     * 我的发布
     * 需要 JWT 认证，sellerId 从 token 获取
     */
    @GetMapping("/my")
    public Result<List<Item>> getMyItems(HttpServletRequest request) {
        Long userId = (Long)request.getAttribute("userId");
        List<Item> itemList = itemService.getMyItems(userId);
        return Result.success(itemList);
    }

    /**
     * 更新商品状态
     * 需要 JWT 认证，仅发布者可操作
     */
    @PutMapping("/{id}/status")
    public Result<Map<String, Object>> updateItemStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body,
            HttpServletRequest request) {
        Integer status = body.get("status");
        Long userId = (Long)request.getAttribute("userId");
        itemService.updateItemStatus(id, status, userId);
        Map<String, Object> result = new HashMap<>();
        return Result.success(result);
    }

}