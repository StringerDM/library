package ru.synergy.libraryapp.book;

import java.util.List;

public record BookPageDto(
        List<BookListItemDto> items,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext
) {
}
