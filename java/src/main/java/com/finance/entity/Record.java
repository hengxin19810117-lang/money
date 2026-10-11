package com.finance.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Record {

    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    @Column(nullable = false, length = 20)
    private String type;  // expense or income

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "category_id", length = 50)
    private String categoryId;

    @Column(length = 255)
    private String note;

    @Column(length = 100)
    private String merchant;

    @Column(name = "payment_channel", length = 50)
    private String paymentChannel;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (id == null) {
            id = "rec_" + System.currentTimeMillis();
        }
    }
}
