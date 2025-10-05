package ru.synergy.libraryapp.auth;

import ru.synergy.libraryapp.user.UserDto;

public record AuthResponse(UserDto user) {
}
