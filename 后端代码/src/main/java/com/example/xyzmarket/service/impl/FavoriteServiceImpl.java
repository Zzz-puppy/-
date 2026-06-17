package com.example.xyzmarket.service.impl;

import com.example.xyzmarket.exception.BusinessException;
import com.example.xyzmarket.common.ErrorCode;
import com.example.xyzmarket.entity.Favorite;
import com.example.xyzmarket.entity.Item;
import com.example.xyzmarket.entity.User;
import com.example.xyzmarket.mapper.FavoriteMapper;
import com.example.xyzmarket.mapper.ItemMapper;
import com.example.xyzmarket.mapper.UserMapper;
import com.example.xyzmarket.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class FavoriteServiceImpl implements FavoriteService {

    @Autowired
    private FavoriteMapper favoriteMapper;

    @Autowired
    private ItemMapper itemMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    public void addFavorite(Long userId, Long itemId) {
        Item item = itemMapper.findById(itemId);
        if (item == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "商品不存在");
        }
        if (favoriteMapper.exists(userId, itemId) > 0) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "已收藏该商品");
        }
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setItemId(itemId);
        favorite.setCreateTime(LocalDateTime.now());
        favoriteMapper.insert(favorite);
    }

    @Override
    public void removeFavorite(Long userId, Long itemId) {
        int rows = favoriteMapper.delete(userId, itemId);
        if (rows == 0) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "未收藏该商品");
        }
    }

    @Override
    public List<Map<String, Object>> getMyFavorites(Long userId) {
        List<Favorite> favorites = favoriteMapper.findByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Favorite fav : favorites) {
            Item item = itemMapper.findById(fav.getItemId());
            if (item == null) continue;
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", fav.getId());
            map.put("itemId", item.getId());
            map.put("title", item.getTitle());
            map.put("price", item.getPrice());
            map.put("imageUrl", item.getImageUrl());
            map.put("status", item.getStatus());
            map.put("categoryId", item.getCategoryId());
            map.put("createTime", fav.getCreateTime());
            User seller = userMapper.findById(item.getSellerId());
            map.put("sellerName", seller != null ? seller.getNickname() : "未知");
            map.put("sellerAvatar", seller != null ? seller.getAvatarUrl() : "");
            result.add(map);
        }
        return result;
    }

    @Override
    public boolean isFavorited(Long userId, Long itemId) {
        return favoriteMapper.exists(userId, itemId) > 0;
    }

    @Override
    public int getFavoriteCount(Long itemId) {
        return favoriteMapper.countByItem(itemId);
    }

}