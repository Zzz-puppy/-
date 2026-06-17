package com.example.xyzmarket.service;

import java.util.List;
import java.util.Map;

/**
 * 收藏服务接口
 */
public interface FavoriteService {

    /**
     * 收藏商品
     */
    void addFavorite(Long userId, Long itemId);

    /**
     * 取消收藏
     */
    void removeFavorite(Long userId, Long itemId);

    /**
     * 我的收藏列表
     */
    List<Map<String, Object>> getMyFavorites(Long userId);

    /**
     * 是否已收藏
     */
    boolean isFavorited(Long userId, Long itemId);

    /**
     * 商品收藏数
     */
    int getFavoriteCount(Long itemId);

}