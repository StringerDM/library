package ru.synergy.libraryapp.order;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateOrderRequest(
        @NotNull(message = "Р В Р в‚¬Р В РЎвЂќР В Р’В°Р В Р’В¶Р В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р В РЎвЂќР В Р вЂ¦Р В РЎвЂР В РЎвЂ“Р РЋРЎвЂњ")
        UUID bookId,
        @NotNull(message = "Р В Р в‚¬Р В РЎвЂќР В Р’В°Р В Р’В¶Р В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р РЋРІР‚С™Р В РЎвЂР В РЎвЂ” Р В РЎвЂўР В РЎвЂ”Р В Р’ВµР РЋР вЂљР В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ")
        OrderType type
) {
}
