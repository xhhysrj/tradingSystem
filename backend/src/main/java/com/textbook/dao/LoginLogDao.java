package com.textbook.dao;

import com.textbook.model.LoginLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import java.util.Date;
import java.util.List;

/**
 * 登录日志数据访问层
 */
@Mapper
public interface LoginLogDao extends BaseMapper<LoginLog> {

    /**
     * 删除指定日期之前的所有登录日志
     */
    int deleteOlderThan(@Param("beforeDate") Date beforeDate);

    int insert(LoginLog loginLog);

    List<LoginLog> findAll(@Param("offset") int offset, @Param("limit") int limit);

    List<LoginLog> search(@Param("studentId") String studentId,
                          @Param("userName") String userName,
                          @Param("loginStatus") String loginStatus,
                          @Param("startDate") String startDate,
                          @Param("endDate") String endDate,
                          @Param("offset") int offset,
                          @Param("limit") int limit);

    int count(@Param("studentId") String studentId,
              @Param("userName") String userName,
              @Param("loginStatus") String loginStatus,
              @Param("startDate") String startDate,
              @Param("endDate") String endDate);

    List<LoginLog> findByUserId(@Param("userId") String userId, @Param("limit") int limit);

    int deleteById(@Param("id") String id);

    int deleteByIds(@Param("ids") List<String> ids);
}