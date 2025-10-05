package ru.synergy.libraryapp.order;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record OrderDto(
        UUID id,
        UUID bookId,
        String bookTitle,
        OrderType type,
        OrderStatus status,
        BigDecimal price,
        OffsetDateTime startDate,
        OffsetDateTime endDate
) {
}
