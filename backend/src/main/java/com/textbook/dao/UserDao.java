package com.textbook.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.textbook.model.User;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户数据访问接口，更多实现在 MyBatis-Plus BaseMapper中
 */
@Mapper
public interface UserDao extends BaseMapper<User> {
}