package com.textbook.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.textbook.model.Review;
import org.apache.ibatis.annotations.Mapper;

/**
 * 评价数据访问层
 */
@Mapper
public interface ReviewDao extends BaseMapper<Review> {
}