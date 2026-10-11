package com.finance.service;

import com.finance.dto.CreateChannelRequest;
import com.finance.entity.PaymentChannel;
import com.finance.repository.PaymentChannelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PaymentChannelService {

    private final PaymentChannelRepository channelRepository;

    public PaymentChannelService(PaymentChannelRepository channelRepository) {
        this.channelRepository = channelRepository;
    }

    /**
     * 获取用户所有支付渠道（系统+自定义）
     */
    @Transactional(readOnly = true)
    public List<PaymentChannel> getUserChannels(String userId) {
        return channelRepository.findUserChannels(userId);
    }

    /**
     * 创建自定义支付渠道
     */
    @Transactional
    public PaymentChannel createChannel(String userId, CreateChannelRequest request) {
        PaymentChannel channel = new PaymentChannel();
        channel.setId("channel_" + System.currentTimeMillis());
        channel.setName(request.getName());
        channel.setIcon(request.getIcon());
        channel.setColor(request.getColor());
        channel.setUserId(userId);

        // 获取当前最大排序值
        List<PaymentChannel> existingChannels = channelRepository.findByUserIdOrderBySortOrder(userId);
        int maxSort = existingChannels.stream()
                .mapToInt(c -> c.getSortOrder() != null ? c.getSortOrder() : 0)
                .max()
                .orElse(0);
        channel.setSortOrder(maxSort + 1);

        return channelRepository.save(channel);
    }

    /**
     * 删除自定义支付渠道（系统渠道不能删除）
     */
    @Transactional
    public boolean deleteChannel(String channelId, String userId) {
        Optional<PaymentChannel> channelOpt = channelRepository.findById(channelId);
        if (channelOpt.isEmpty()) {
            return false;
        }

        PaymentChannel channel = channelOpt.get();
        // 系统渠道没有userId，不能删除
        if (channel.getUserId() == null) {
            return false;
        }

        // 只能删除自己的渠道
        if (!userId.equals(channel.getUserId())) {
            return false;
        }

        channelRepository.delete(channel);
        return true;
    }
}
