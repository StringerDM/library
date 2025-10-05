package ru.synergy.libraryapp.book;

import java.math.BigDecimal;
import java.util.UUID;

public record BookListItemDto(
        UUID id,
        String title,
        String author,
        String category,
        Integer year,
        BigDecimal purchasePrice,
        BookStatus status,
        String coverUrl
) {
}
