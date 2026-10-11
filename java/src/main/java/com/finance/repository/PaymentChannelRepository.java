package com.finance.repository;

import com.finance.entity.PaymentChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentChannelRepository extends JpaRepository<PaymentChannel, String> {

    @Query("SELECT c FROM PaymentChannel c WHERE c.userId IS NULL OR c.userId = :userId ORDER BY c.sortOrder")
    List<PaymentChannel> findUserChannels(@Param("userId") String userId);

    @Query("SELECT c FROM PaymentChannel c WHERE (c.userId IS NULL OR c.userId = :userId) AND c.userId IS NOT NULL ORDER BY c.sortOrder")
    List<PaymentChannel> findCustomChannels(@Param("userId") String userId);

    List<PaymentChannel> findByUserIdOrderBySortOrder(String userId);
}
