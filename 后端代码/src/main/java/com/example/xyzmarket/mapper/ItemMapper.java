package com.example.xyzmarket.mapper;

import com.example.xyzmarket.entity.Item;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ItemMapper {

    @Insert("""
        INSERT INTO item (title,description,price,image_url,category_id,seller_id,status,pickup,tradeable,create_time,update_time)
        VALUES (#{title}, #{description}, #{price}, #{imageUrl}, #{categoryId}, #{sellerId}, #{status}, #{pickup}, #{tradeable}, #{createTime}, #{updateTime})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int insert(Item item);

    @Select("SELECT i.*, u.nickname AS seller_name, u.credit_score AS seller_credit_score, u.student_id AS seller_student_id, u.is_certified AS seller_is_certified " +
            "FROM item i LEFT JOIN `user` u ON i.seller_id = u.id WHERE i.id = #{id}")
    @Results({
        @Result(property = "sellerName", column = "seller_name"),
        @Result(property = "sellerCreditScore", column = "seller_credit_score"),
        @Result(property = "sellerStudentId", column = "seller_student_id"),
        @Result(property = "sellerIsCertified", column = "seller_is_certified")
    })
    Item findById(@Param("id") Long id);

    @Select("<script>SELECT i.*, u.nickname AS seller_name, u.credit_score AS seller_credit_score, u.student_id AS seller_student_id, u.is_certified AS seller_is_certified " +
            "FROM item i LEFT JOIN `user` u ON i.seller_id = u.id " +
            "WHERE i.status = 0 " +
            "<choose>" +
            "<when test='sortBy == \"price_asc\"'>ORDER BY i.price ASC</when>" +
            "<when test='sortBy == \"price_desc\"'>ORDER BY i.price DESC</when>" +
            "<otherwise>ORDER BY i.create_time DESC</otherwise>" +
            "</choose>" +
            "LIMIT #{size} OFFSET #{offset}</script>")
    @Results({
        @Result(property = "sellerName", column = "seller_name"),
        @Result(property = "sellerCreditScore", column = "seller_credit_score"),
        @Result(property = "sellerStudentId", column = "seller_student_id"),
        @Result(property = "sellerIsCertified", column = "seller_is_certified")
    })
    List<Item> findList(@Param("offset") int offset, @Param("size") int size, @Param("sortBy") String sortBy);

    @Select("SELECT COUNT(*) FROM item WHERE status = 0")
    long countItems();

    @Select("<script>SELECT i.*, u.nickname AS seller_name, u.credit_score AS seller_credit_score, u.student_id AS seller_student_id, u.is_certified AS seller_is_certified " +
            "FROM item i LEFT JOIN `user` u ON i.seller_id = u.id " +
            "WHERE i.status = 0 AND (i.title LIKE #{keyword} OR i.description LIKE #{keyword}) " +
            "<choose>" +
            "<when test='sortBy == \"price_asc\"'>ORDER BY i.price ASC</when>" +
            "<when test='sortBy == \"price_desc\"'>ORDER BY i.price DESC</when>" +
            "<otherwise>ORDER BY i.create_time DESC</otherwise>" +
            "</choose>" +
            "LIMIT #{size} OFFSET #{offset}</script>")
    @Results({
        @Result(property = "sellerName", column = "seller_name"),
        @Result(property = "sellerCreditScore", column = "seller_credit_score"),
        @Result(property = "sellerStudentId", column = "seller_student_id"),
        @Result(property = "sellerIsCertified", column = "seller_is_certified")
    })
    List<Item> searchItems(@Param("keyword") String keyword, @Param("offset") int offset, @Param("size") int size, @Param("sortBy") String sortBy);

    @Select("SELECT COUNT(*) FROM item WHERE status = 0 AND (title LIKE #{keyword} OR description LIKE #{keyword})")
    long countSearchResults(@Param("keyword") String keyword);

    @Select("SELECT * FROM item WHERE seller_id = #{sellerId}")
    List<Item> findBySellerId(@Param("sellerId") Long sellerId);

    @Update("UPDATE item SET status=#{status}, update_time = #{updateTime} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status, @Param("updateTime")LocalDateTime updateTime);

    @Select("SELECT * FROM item ORDER BY create_time DESC")
    List<Item> findAll();

}