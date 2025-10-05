package ru.synergy.libraryapp.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {
    List<OrderEntity> findByUser_IdOrderByCreatedAtDesc(UUID userId);
    List<OrderEntity> findByStatus(OrderStatus status);
    List<OrderEntity> findByStatusAndEndDateBefore(OrderStatus status, OffsetDateTime moment);
    List<OrderEntity> findByStatusAndEndDateBetween(OrderStatus status, OffsetDateTime from, OffsetDateTime to);
}
