package com.example.xyzmarket.controller;

import com.example.xyzmarket.common.Result;
import com.example.xyzmarket.service.FavoriteService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorite")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    /**
     * 收藏商品
     */
    @PostMapping("/{itemId}")
    public Result<Void> addFavorite(@PathVariable Long itemId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        favoriteService.addFavorite(userId, itemId);
        return Result.success();
    }

    /**
     * 取消收藏
     */
    @DeleteMapping("/{itemId}")
    public Result<Void> removeFavorite(@PathVariable Long itemId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        favoriteService.removeFavorite(userId, itemId);
        return Result.success();
    }

    /**
     * 我的收藏列表
     */
    @GetMapping("/my")
    public Result<List<Map<String, Object>>> getMyFavorites(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        List<Map<String, Object>> favorites = favoriteService.getMyFavorites(userId);
        return Result.success(favorites);
    }

    /**
     * 检查是否收藏
     */
    @GetMapping("/check/{itemId}")
    public Result<Map<String, Boolean>> checkFavorited(@PathVariable Long itemId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        boolean favorited = favoriteService.isFavorited(userId, itemId);
        return Result.success(Map.of("favorited", favorited));
    }

}