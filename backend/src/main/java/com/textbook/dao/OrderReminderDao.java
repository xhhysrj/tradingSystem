package com.textbook.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.textbook.model.OrderReminder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 订单提醒数据访问层
 */
@Mapper
public interface OrderReminderDao extends BaseMapper<OrderReminder> {

    /**
     * 查询用户未读提醒
     */
    List<OrderReminder> findUnreadByReceiverId(@Param("receiverId") String receiverId);
}