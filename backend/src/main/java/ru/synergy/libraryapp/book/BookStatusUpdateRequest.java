package ru.synergy.libraryapp.book;

import jakarta.validation.constraints.NotNull;

public record BookStatusUpdateRequest(
        @NotNull(message = "Р В Р в‚¬Р В РЎвЂќР В Р’В°Р В Р’В¶Р В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р РЋРІР‚С™Р РЋРЎвЂњР РЋР С“")
        BookStatus status
) {
}
