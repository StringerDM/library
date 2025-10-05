package ru.synergy.libraryapp.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.synergy.libraryapp.common.ResourceNotFoundException;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserDto registerUser(String username, String email, String rawPassword, UserRole role) {
        String normalizedUsername = username.trim();
        String normalizedEmail = email.trim().toLowerCase();

        validateUnique(normalizedUsername, normalizedEmail);

        UserEntity user = new UserEntity();
        user.setUsername(normalizedUsername);
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);

        UserEntity saved = userRepository.save(user);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public Optional<UserEntity> findByIdentifier(String identifier) {
        return userRepository.findByEmailIgnoreCase(identifier)
                .or(() -> userRepository.findByUsernameIgnoreCase(identifier));
    }

    @Transactional(readOnly = true)
    public UserEntity getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserDto toDto(UserEntity entity) {
        return new UserDto(
                entity.getId(),
                entity.getUsername(),
                entity.getEmail(),
                entity.getRole(),
                entity.getCreatedAt()
        );
    }

    private void validateUnique(String username, String email) {
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new UserAlreadyExistsException("Username is already taken");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new UserAlreadyExistsException("Email is already registered");
        }
    }
}