package com.example.xyzmarket.service;

import com.example.xyzmarket.dto.ItemDTO;
import com.example.xyzmarket.entity.Item;
import com.example.xyzmarket.vo.PageResult;

import java.util.List;

public interface ItemService {

    /**
     * 发布商品
     * @param itemDTO 商品信息
     * @param sellerId 发布者ID（从 token 获取）
     * @return 商品ID
     */
    Long publishItem(ItemDTO itemDTO, Long sellerId);

    /**
     * 获取商品列表（分页+排序）
     * @param page 页码
     * @param size 每页数量
     * @param sortBy 排序方式（price_asc/price_desc/null为默认时间倒序）
     * @return 分页结果（包含商品列表和总数）
     */
    PageResult<Item> getItemList(Integer page, Integer size, String sortBy);

    /**
     * 获取商品详情
     * @param id 商品ID
     * @return 商品信息
     */
    Item getItemById(Long id);

    /**
     * 我的发布
     * @param sellerId 发布者ID（从 token 获取）
     * @return 商品列表
     */
    List<Item> getMyItems(Long sellerId);

    /**
     * 更新商品状态
     * @param id 商品ID
     * @param status 状态
     * @param userId 操作用户ID（从 token 获取，用于权限校验）
     */
    void updateItemStatus(Long id, Integer status, Long userId);

    /**
     * 搜索商品（分页+排序）
     * @param keyword 搜索关键词
     * @param page 页码
     * @param size 每页数量
     * @param sortBy 排序方式（price_asc/price_desc/null为默认时间倒序）
     * @return 分页结果（包含商品列表和总数）
     */
    PageResult<Item> searchItems(String keyword, Integer page, Integer size, String sortBy);

}