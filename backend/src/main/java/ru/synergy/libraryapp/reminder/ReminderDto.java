package ru.synergy.libraryapp.reminder;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ReminderDto(
        UUID id,
        UUID orderId,
        String bookTitle,
        String userEmail,
        OffsetDateTime remindAt,
        boolean delivered
) {
}
