package com.example.xyzmarket.mapper;

import com.example.xyzmarket.entity.User;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户 Mapper
 * 使用 MyBatis 注解方式
 */
@Mapper
public interface UserMapper {

    @Insert("""
        INSERT INTO `user`(openid, nickname, avatar_url, credit_score, completed_deals, cancelled_deals, role, create_time, update_time)
        VALUES (#{openid}, #{nickname}, #{avatarUrl}, #{creditScore}, #{completedDeals}, #{cancelledDeals}, #{role}, #{createTime}, #{updateTime})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int insert(User user);

    @Select("SELECT * FROM `user` WHERE openid = #{openid}")
    User findByOpenid(@Param("openid") String openid);

    @Select("SELECT * FROM `user` WHERE id = #{id}")
    User findById(@Param("id") Long id);

    @Update("UPDATE `user` SET student_id = #{studentId}, is_certified = 1, certified_at = #{certifiedAt} WHERE id = #{id}")
    int certify(@Param("id") Long id, @Param("studentId") String studentId, @Param("certifiedAt") LocalDateTime certifiedAt);

    @Update("UPDATE `user` SET nickname = #{nickname}, avatar_url = #{avatarUrl}, grade = #{grade}, update_time = #{updateTime} WHERE id = #{id}")
    int updateProfile(@Param("id") Long id,
                      @Param("nickname") String nickname,
                      @Param("avatarUrl") String avatarUrl,
                      @Param("grade") String grade,
                      @Param("updateTime") LocalDateTime updateTime);

    @Select("SELECT * FROM `user` ORDER BY id")
    List<User> listAll();

    @Update("UPDATE `user` SET credit_score = #{score}, completed_deals = #{completed}, cancelled_deals = #{cancelled}, update_time = #{updateTime} WHERE id = #{id}")
    int updateCreditScore(@Param("id") Long id,
                          @Param("score") Integer score,
                          @Param("completed") Integer completed,
                          @Param("cancelled") Integer cancelled,
                          @Param("updateTime") LocalDateTime updateTime);

    @Update("UPDATE `user` SET role = #{role} WHERE id = #{id}")
    int updateRole(@Param("id") Long id, @Param("role") String role);

    @Select("SELECT * FROM `user` WHERE role = #{role} LIMIT 1")
    @Results({
        @Result(column = "id", property = "id", id = true),
        @Result(column = "openid", property = "openid"),
        @Result(column = "nickname", property = "nickname"),
        @Result(column = "avatar_url", property = "avatarUrl"),
        @Result(column = "student_id", property = "studentId"),
        @Result(column = "is_certified", property = "isCertified"),
        @Result(column = "credit_score", property = "creditScore"),
        @Result(column = "completed_deals", property = "completedDeals"),
        @Result(column = "cancelled_deals", property = "cancelledDeals"),
        @Result(column = "role", property = "role"),
        @Result(column = "create_time", property = "createTime"),
        @Result(column = "update_time", property = "updateTime")
    })
    User findByRole(@Param("role") String role);

    @Update("UPDATE `user` SET admin_login_attempts = admin_login_attempts + 1, update_time = #{updateTime} WHERE openid = 'admin_fixed'")
    void incrementAdminLoginAttempts(LocalDateTime updateTime);

    @Update("UPDATE `user` SET admin_login_attempts = 0, update_time = #{updateTime} WHERE openid = 'admin_fixed'")
    void resetAdminLoginAttempts(LocalDateTime updateTime);

    @Select("SELECT admin_login_attempts FROM `user` WHERE openid = 'admin_fixed'")
    Integer getAdminLoginAttempts();

}