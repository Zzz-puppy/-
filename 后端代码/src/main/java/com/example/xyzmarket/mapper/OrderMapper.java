package com.example.xyzmarket.mapper;

import com.example.xyzmarket.entity.Order;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface OrderMapper {

    @Insert("""
        INSERT INTO orders (item_id, buyer_id, seller_id, status, create_time, update_time)
        VALUES (#{itemId}, #{buyerId}, #{sellerId}, #{status}, #{createTime}, #{updateTime})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int insert(Order order);

    @Select("SELECT * FROM orders WHERE buyer_id = #{buyerId}")
    List<Order> findByBuyerId(@Param("buyerId") Long buyerId);

    @Select("SELECT * FROM orders WHERE seller_id = #{sellerId}")
    List<Order> findBySellerId(@Param("sellerId") Long sellerId);

    @Select("SELECT * FROM orders WHERE item_id = #{itemId} AND status = #{status}")
    @Results({
        @Result(column = "id", property = "id", id = true),
        @Result(column = "item_id", property = "itemId"),
        @Result(column = "buyer_id", property = "buyerId"),
        @Result(column = "seller_id", property = "sellerId"),
        @Result(column = "create_time", property = "createTime"),
        @Result(column = "update_time", property = "updateTime")
    })
    List<Order> findByItemIdAndStatus(@Param("itemId") Long itemId, @Param("status") Integer status);

    @Select("SELECT * FROM orders WHERE buyer_id = #{buyerId} AND item_id = #{itemId} AND status = #{status} LIMIT 1")
    @Results({
        @Result(column = "id", property = "id", id = true),
        @Result(column = "item_id", property = "itemId"),
        @Result(column = "buyer_id", property = "buyerId"),
        @Result(column = "seller_id", property = "sellerId"),
        @Result(column = "create_time", property = "createTime"),
        @Result(column = "update_time", property = "updateTime")
    })
    Order findByBuyerIdAndItemIdAndStatus(@Param("buyerId") Long buyerId, @Param("itemId") Long itemId, @Param("status") Integer status);

    @Select("SELECT * FROM orders WHERE id = #{id}")
    Order findById(@Param("id") Long id);

    @Update("UPDATE orders SET status = #{status}, update_time = #{updateTime} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status, @Param("updateTime")LocalDateTime updateTime);

}