package com.example.xyzmarket.mapper;

import com.example.xyzmarket.entity.Certification;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 认证记录 Mapper
 * 使用 MyBatis 注解方式
 */
@Mapper
public interface CertificationMapper {

    /**
     * 插入认证记录
     */
    @Insert("""
        INSERT INTO certification (user_id, student_id, email, status, create_time)
        VALUES (#{userId}, #{studentId}, #{email}, #{status}, #{createTime})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int insert(Certification certification);

    /**
     * 根据用户ID查询最新的认证记录
     */
    @Select("SELECT * FROM certification WHERE user_id = #{userId} ORDER BY create_time DESC LIMIT 1")
    Certification findByUserId(@Param("userId") Long userId);

    /**
     * 查询待处理的认证申请列表
     */
    @Select("SELECT * FROM certification WHERE status = 'pending' ORDER BY create_time ASC")
    List<Certification> findPendingList();

    /**
     * 更新认证状态
     */
    @Update("UPDATE certification SET status = #{status}, reject_reason = #{rejectReason}, reviewer_id = #{reviewerId}, review_time = #{reviewTime} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id,
                     @Param("status") String status,
                     @Param("rejectReason") String rejectReason,
                     @Param("reviewerId") Long reviewerId,
                     @Param("reviewTime") LocalDateTime reviewTime);

    /**
     * 根据ID查询认证记录
     */
    @Select("SELECT * FROM certification WHERE id = #{id}")
    Certification findById(@Param("id") Long id);
}