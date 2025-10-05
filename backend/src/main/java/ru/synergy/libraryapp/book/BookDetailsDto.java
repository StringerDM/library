package ru.synergy.libraryapp.book;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record BookDetailsDto(
        UUID id,
        String title,
        String author,
        String category,
        Integer year,
        String description,
        String coverUrl,
        BigDecimal purchasePrice,
        BigDecimal rentTwoWeeks,
        BigDecimal rentOneMonth,
        BigDecimal rentThreeMonths,
        BookStatus status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
