package com.example.xyzmarket.mapper;

import com.example.xyzmarket.entity.Wanted;
import org.apache.ibatis.annotations.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface WantedMapper {

    @Insert("INSERT INTO wanted (user_id, title, description, category_id, budget, status, create_time, update_time) " +
            "VALUES (#{userId}, #{title}, #{description}, #{categoryId}, #{budget}, #{status}, #{createTime}, #{updateTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int insert(Wanted wanted);

    @Select("SELECT w.*, u.nickname AS user_name, u.is_certified AS is_certified FROM wanted w " +
            "LEFT JOIN `user` u ON w.user_id = u.id WHERE w.id = #{id}")
    @Results({
        @Result(property = "userName", column = "user_name"),
        @Result(property = "userIsCertified", column = "is_certified")
    })
    Wanted findById(@Param("id") Long id);

    @Select("<script>SELECT w.*, u.nickname AS user_name, u.is_certified AS is_certified FROM wanted w " +
            "LEFT JOIN `user` u ON w.user_id = u.id WHERE w.status = 0 " +
            "ORDER BY w.create_time DESC LIMIT #{size} OFFSET #{offset}</script>")
    @Results({
        @Result(property = "userName", column = "user_name"),
        @Result(property = "userIsCertified", column = "is_certified")
    })
    List<Wanted> findList(@Param("offset") int offset, @Param("size") int size);

    @Select("SELECT COUNT(*) FROM wanted WHERE status = 0")
    long countActive();

    @Select("<script>SELECT w.*, u.nickname AS user_name, u.is_certified AS is_certified FROM wanted w " +
            "LEFT JOIN `user` u ON w.user_id = u.id WHERE w.user_id = #{userId} " +
            "ORDER BY w.create_time DESC</script>")
    @Results({
        @Result(property = "userName", column = "user_name"),
        @Result(property = "userIsCertified", column = "is_certified")
    })
    List<Wanted> findByUserId(@Param("userId") Long userId);

    @Update("UPDATE wanted SET status = #{status}, update_time = #{updateTime} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status, @Param("updateTime") LocalDateTime updateTime);

    @Update("UPDATE wanted SET title = #{title}, description = #{description}, category_id = #{categoryId}, " +
            "budget = #{budget}, update_time = #{updateTime} WHERE id = #{id}")
    int update(@Param("id") Long id, @Param("title") String title, @Param("description") String description,
               @Param("categoryId") Integer categoryId, @Param("budget") BigDecimal budget,
               @Param("updateTime") LocalDateTime updateTime);

    @Select("SELECT w.*, u.nickname AS user_name, u.is_certified AS is_certified FROM wanted w " +
            "LEFT JOIN `user` u ON w.user_id = u.id " +
            "WHERE w.status = 0 AND w.category_id = #{categoryId} " +
            "ORDER BY w.create_time DESC LIMIT #{size} OFFSET #{offset}")
    @Results({
        @Result(property = "userName", column = "user_name"),
        @Result(property = "userIsCertified", column = "is_certified")
    })
    List<Wanted> findListByCategory(@Param("offset") int offset, @Param("size") int size, @Param("categoryId") int categoryId);

    @Select("SELECT COUNT(*) FROM wanted WHERE status = 0 AND category_id = #{categoryId}")
    int countActiveByCategory(@Param("categoryId") int categoryId);

    @Delete("DELETE FROM wanted WHERE id = #{id}")
    int delete(@Param("id") Long id);
}