package ru.synergy.libraryapp.reminder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.synergy.libraryapp.order.OrderEntity;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderService {
    private final ReminderRepository reminderRepository;

    @Transactional
    public void createReminderIfAbsent(OrderEntity order, OffsetDateTime remindAt) {
        UUID orderId = order.getId();
        if (reminderRepository.existsByOrder_Id(orderId)) {
            return;
        }
        ReminderEntity reminder = new ReminderEntity();
        reminder.setOrder(order);
        reminder.setRemindAt(remindAt);
        reminderRepository.save(reminder);
        log.info("Reminder scheduled. orderId={}, remindAt={}", orderId, remindAt);
    }

    @Transactional(readOnly = true)
    public List<ReminderDto> pendingReminders() {
        return reminderRepository.findByDeliveredFalseOrderByRemindAtAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReminderEntity> findDueReminders(OffsetDateTime now) {
        return reminderRepository.findByDeliveredFalseOrderByRemindAtAsc()
                .stream()
                .filter(reminder -> !reminder.getRemindAt().isAfter(now))
                .toList();
    }

    @Transactional
    public void markDelivered(ReminderEntity reminder) {
        reminder.setDelivered(true);
    }

    private ReminderDto toDto(ReminderEntity entity) {
        return new ReminderDto(
                entity.getId(),
                entity.getOrder().getId(),
                entity.getOrder().getBook().getTitle(),
                entity.getOrder().getUser().getEmail(),
                entity.getRemindAt(),
                entity.isDelivered()
        );
    }
}
