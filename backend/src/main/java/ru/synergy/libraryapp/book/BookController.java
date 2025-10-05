package ru.synergy.libraryapp.book;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.synergy.libraryapp.security.AppUserDetails;
import ru.synergy.libraryapp.user.UserRole;

import java.util.UUID;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {
    private final BookService bookService;

    @GetMapping
    public ResponseEntity<BookPageDto> catalog(@RequestParam(required = false) String category,
                                               @RequestParam(required = false) String author,
                                               @RequestParam(required = false) Integer year,
                                               @RequestParam(required = false) String sort,
                                               @RequestParam(required = false) String status,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size,
                                               @AuthenticationPrincipal AppUserDetails principal) {
        boolean includeInactive = principal != null && principal.getUser().getRole() == UserRole.ADMIN;
        BookStatus statusFilter = null;
        if (includeInactive && status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            try {
                statusFilter = BookStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                statusFilter = null;
            }
        }
        BookFilter filter = new BookFilter(category, author, year, sort, statusFilter, includeInactive);
        BookPageDto result = bookService.findBooks(filter, Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDetailsDto> byId(@PathVariable UUID id) {
        return ResponseEntity.ok(bookService.getBook(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookDetailsDto> create(@Valid @RequestBody BookRequest request) {
        BookDetailsDto dto = bookService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookDetailsDto> update(@PathVariable UUID id,
                                                 @Valid @RequestBody BookRequest request) {
        BookDetailsDto dto = bookService.update(id, request);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookDetailsDto> updateStatus(@PathVariable UUID id,
                                                       @Valid @RequestBody BookStatusUpdateRequest request) {
        BookDetailsDto dto = bookService.changeStatus(id, request.status());
        return ResponseEntity.ok(dto);
    }
}