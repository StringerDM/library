package ru.synergy.libraryapp.reminder;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReminderRepository extends JpaRepository<ReminderEntity, UUID> {
    boolean existsByOrder_Id(UUID orderId);
    List<ReminderEntity> findByDeliveredFalseOrderByRemindAtAsc();
}
