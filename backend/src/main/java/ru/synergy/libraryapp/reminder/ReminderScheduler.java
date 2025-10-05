package ru.synergy.libraryapp.reminder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.synergy.libraryapp.order.OrderEntity;
import ru.synergy.libraryapp.order.OrderService;

import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {
    private final OrderService orderService;
    private final ReminderService reminderService;

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void prepareReminders() {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime windowEnd = now.plusHours(48);

        orderService.refreshStatuses();
        List<OrderEntity> expiring = orderService.findRentalsExpiringInWindow(now, windowEnd);
        for (OrderEntity order : expiring) {
            if (order.getEndDate() == null) {
                continue;
            }
            OffsetDateTime remindAt = order.getEndDate().minusHours(24);
            if (remindAt.isBefore(now)) {
                remindAt = now;
            }
            reminderService.createReminderIfAbsent(order, remindAt);
        }

        reminderService.findDueReminders(now).forEach(reminder -> {
            log.info("[AUTOMATED] Р В РЎСљР В Р’В°Р В РЎвЂ”Р В РЎвЂўР В РЎВР В РЎвЂР В Р вЂ¦Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂў Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В Р’В·Р В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р РЋР вЂ№ {}: Р РЋР С“Р РЋР вЂљР В РЎвЂўР В РЎвЂќ Р В Р’В°Р РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РўвЂР РЋРІР‚в„– Р В РЎвЂќР В Р вЂ¦Р В РЎвЂР В РЎвЂ“Р В РЎвЂ '{}' Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р В Р’ВµР В РЎвЂќР В Р’В°Р В Р’ВµР РЋРІР‚С™ {}",
                    reminder.getOrder().getUser().getEmail(),
                    reminder.getOrder().getBook().getTitle(),
                    reminder.getOrder().getEndDate());
            reminderService.markDelivered(reminder);
        });
    }
}
