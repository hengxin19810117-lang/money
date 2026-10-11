package com.finance.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_channels")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentChannel {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 50)
    private String icon;

    @Column(length = 20)
    private String color;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (id == null) {
            id = "channel_" + System.currentTimeMillis();
        }
    }
}
