package com.textbook.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.textbook.model.UserChangeRequest;
import com.textbook.model.UserChangeRequestView;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 用户信息变更申请数据访问层
 */
@Mapper
public interface UserChangeRequestDao extends BaseMapper<UserChangeRequest> {
    /**
     * 管理员查看待审核列表
     */
    List<UserChangeRequestView> findPendingViews();
}