package com.example.xyzmarket.mapper;

import com.example.xyzmarket.entity.Report;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 举报 Mapper
 */
@Mapper
public interface ReportMapper {

    @Insert("INSERT INTO report (reporter_id, item_id, type, description, image_urls, status, create_time) " +
            "VALUES (#{reporterId}, #{itemId}, #{type}, #{description}, #{imageUrls}, #{status}, #{createTime})")
    int insert(Report report);

    @Select("SELECT * FROM report WHERE id = #{id}")
    Report findById(@Param("id") Long id);

    @Select("SELECT * FROM report WHERE reporter_id = #{reporterId} ORDER BY create_time DESC")
    List<Report> findByReporterId(@Param("reporterId") Long reporterId);

    @Select("SELECT * FROM report WHERE status = #{status} ORDER BY create_time DESC")
    List<Report> findByStatus(@Param("status") String status);

    @Select("SELECT * FROM report ORDER BY create_time DESC")
    List<Report> findAll();

    @Select("SELECT COUNT(*) FROM report WHERE reporter_id = #{reporterId} AND item_id = #{itemId}")
    int countByUserAndItem(@Param("reporterId") Long reporterId, @Param("itemId") Long itemId);

    @Update("UPDATE report SET status = #{status}, reviewer_id = #{reviewerId}, review_time = #{reviewTime} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") String status,
                     @Param("reviewerId") Long reviewerId, @Param("reviewTime") LocalDateTime reviewTime);

    @Update("UPDATE report SET status = #{status}, reject_reason = #{rejectReason}, " +
            "reviewer_id = #{reviewerId}, review_time = #{reviewTime} WHERE id = #{id}")
    int reject(@Param("id") Long id, @Param("status") String status, @Param("rejectReason") String rejectReason,
               @Param("reviewerId") Long reviewerId, @Param("reviewTime") LocalDateTime reviewTime);

}