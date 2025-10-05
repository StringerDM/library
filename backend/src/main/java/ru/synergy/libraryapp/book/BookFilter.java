package ru.synergy.libraryapp.book;

public record BookFilter(
        String category,
        String author,
        Integer year,
        String sort,
        BookStatus status,
        boolean includeInactive
) {
    public String normalizedSort() {
        return sort == null ? "title" : sort;
    }
}