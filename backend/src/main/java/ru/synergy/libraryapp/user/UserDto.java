package ru.synergy.libraryapp.user;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserDto(
        UUID id,
        String username,
        String email,
        UserRole role,
        OffsetDateTime createdAt
) {
}
