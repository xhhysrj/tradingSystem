package com.textbook.dao;

import com.textbook.model.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import java.util.Date;
import java.util.List;

/**
 * 订单数据访问层
 */
@Mapper
public interface OrderDao extends BaseMapper<Order> {

    int insert(Order order);

    Order findById(@Param("id") String id);

    List<Order> findByBuyerId(@Param("buyerId") String buyerId);

    List<Order> findBySellerId(@Param("sellerId") String sellerId);

    int updateStatus(@Param("id") String id,
                     @Param("status") String status,
                     @Param("cancelReason") String cancelReason);

    boolean hasPendingOrder(@Param("textbookId") String textbookId);

    List<Order> findByBuyerIdAndStatus(@Param("buyerId") String buyerId,
                                       @Param("status") String status);

    List<Order> findBySellerIdAndStatus(@Param("sellerId") String sellerId,
                                        @Param("status") String status);

    int markBuyerDeleted(@Param("orderId") String orderId);

    int markSellerDeleted(@Param("orderId") String orderId);

    int deleteById(@Param("orderId") String orderId);

    /**
     * 删除指定日期之前的所有订单
     */
    int deleteOlderThan(@Param("beforeDate") Date beforeDate);
}