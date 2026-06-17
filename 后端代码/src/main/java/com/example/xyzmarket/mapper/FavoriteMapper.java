package com.example.xyzmarket.mapper;

import com.example.xyzmarket.entity.Favorite;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 收藏 Mapper
 */
@Mapper
public interface FavoriteMapper {

    @Insert("INSERT INTO favorite (user_id, item_id, create_time) VALUES (#{userId}, #{itemId}, #{createTime})")
    int insert(Favorite favorite);

    @Delete("DELETE FROM favorite WHERE user_id = #{userId} AND item_id = #{itemId}")
    int delete(@Param("userId") Long userId, @Param("itemId") Long itemId);

    @Select("SELECT * FROM favorite WHERE user_id = #{userId} ORDER BY create_time DESC")
    List<Favorite> findByUserId(@Param("userId") Long userId);

    @Select("SELECT COUNT(*) FROM favorite WHERE item_id = #{itemId}")
    int countByItem(@Param("itemId") Long itemId);

    @Select("SELECT COUNT(*) FROM favorite WHERE user_id = #{userId} AND item_id = #{itemId}")
    int exists(@Param("userId") Long userId, @Param("itemId") Long itemId);

}