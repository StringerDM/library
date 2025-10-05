package ru.synergy.libraryapp.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Р В Р в‚¬Р В РЎвЂќР В Р’В°Р В Р’В¶Р В РЎвЂР РЋРІР‚С™Р В Р’Вµ email Р В РЎвЂР В Р’В»Р В РЎвЂ Р В Р’В»Р В РЎвЂўР В РЎвЂ“Р В РЎвЂР В Р вЂ¦")
        String identifier,
        @NotBlank(message = "Р В Р в‚¬Р В РЎвЂќР В Р’В°Р В Р’В¶Р В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р В РЎвЂ”Р В Р’В°Р РЋР вЂљР В РЎвЂўР В Р’В»Р РЋР Р‰")
        String password
) {
}
