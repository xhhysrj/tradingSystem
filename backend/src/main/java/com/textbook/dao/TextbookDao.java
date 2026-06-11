package com.textbook.dao;

import com.textbook.model.Textbook;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import java.util.List;

/**
 * 教材数据访问层
 */
@Mapper
public interface TextbookDao extends BaseMapper<Textbook>{

    int insert(Textbook textbook);

    int insertImage(@Param("id") String id,
                    @Param("textbookId") String textbookId,
                    @Param("imageUrl") String imageUrl,
                    @Param("imageType") String imageType);

    Textbook findById(@Param("id") String id);

    List<Textbook> findBySellerId(@Param("sellerId") String sellerId);

    List<Textbook> search(@Param("keyword") String keyword,
                          @Param("major") String major,
                          @Param("grade") String grade,
                          @Param("priceRange") String priceRange,
                          @Param("condition") String condition,
                          @Param("sortBy") String sortBy,
                          @Param("offset") int offset,
                          @Param("limit") int limit);

    int count(@Param("keyword") String keyword,
              @Param("major") String major,
              @Param("grade") String grade,
              @Param("priceRange") String priceRange,
              @Param("condition") String condition);

    int updateApprovalStatus(@Param("id") String id,
                             @Param("status") String status,
                             @Param("approvalReason") String approvalReason);

    List<Textbook> findPendingTextbooks();

    List<Textbook> findByCourseCode(@Param("courseCode") String courseCode,
                                    @Param("major") String major);

    List<Textbook> findRecommendedByCourseCode(@Param("courseCode") String courseCode,
                                               @Param("major") String major,
                                               @Param("excludeSellerId") String excludeSellerId);

    List<Textbook> findRecommendedByCourseCodeNoMajor(@Param("courseCode") String courseCode,
                                                      @Param("excludeSellerId") String excludeSellerId);

    int updateStatusToSold(@Param("id") String id);

    List<Textbook> findFreeTextbooks(@Param("limit") int limit);

    int deleteImagesByTextbookId(@Param("textbookId") String textbookId);

    int deleteById(@Param("id") String id);
}