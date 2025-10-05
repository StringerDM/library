package ru.synergy.libraryapp.book;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.synergy.libraryapp.common.ResourceNotFoundException;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;

    @Transactional(readOnly = true)
    public BookPageDto findBooks(BookFilter filter, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, buildSort(filter.normalizedSort()));
        Specification<BookEntity> spec = buildSpecification(filter);
        Page<BookListItemDto> result = bookRepository.findAll(spec, pageable)
                .map(this::toListItemDto);
        return new BookPageDto(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.hasNext()
        );
    }

    @Transactional(readOnly = true)
    public BookDetailsDto getBook(UUID id) {
        return bookRepository.findById(id)
                .map(this::toDetailsDto)
                .orElseThrow(() -> new ResourceNotFoundException("Книга не найдена"));
    }

    @Transactional
    public BookDetailsDto create(BookRequest request) {
        BookEntity entity = new BookEntity();
        applyRequest(entity, request);
        entity.setStatus(BookStatus.AVAILABLE);
        BookEntity saved = bookRepository.save(entity);
        return toDetailsDto(saved);
    }

    @Transactional
    public BookDetailsDto update(UUID id, BookRequest request) {
        BookEntity entity = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Книга не найдена"));
        applyRequest(entity, request);
        BookEntity saved = bookRepository.save(entity);
        return toDetailsDto(saved);
    }

    @Transactional
    public BookDetailsDto changeStatus(UUID id, BookStatus status) {
        BookEntity entity = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Книга не найдена"));
        entity.setStatus(status);
        return toDetailsDto(entity);
    }

    private Specification<BookEntity> buildSpecification(BookFilter filter) {
        Specification<BookEntity> spec = Specification.where(null);
        if (filter.includeInactive()) {
            if (filter.status() != null) {
                spec = spec.and(statusIs(filter.status()));
            }
        } else {
            spec = spec.and(statusIs(BookStatus.AVAILABLE));
        }
        spec = spec
                .and(optionalEquals("category", filter.category()))
                .and(optionalEquals("author", filter.author()))
                .and(optionalEquals("year", filter.year()));
        return spec;
    }

    private Specification<BookEntity> statusIs(BookStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    private Specification<BookEntity> optionalEquals(String field, Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof String s) {
            String normalized = s.trim();
            if (normalized.isEmpty()) {
                return null;
            }
            return (root, query, cb) -> cb.equal(cb.lower(root.get(field)), normalized.toLowerCase());
        }
        return (root, query, cb) -> cb.equal(root.get(field), value);
    }

    private Sort buildSort(String sortKey) {
        return switch (sortKey) {
            case "author" -> Sort.by(Sort.Direction.ASC, "author", "title");
            case "year" -> Sort.by(Sort.Direction.DESC, "year", "title");
            default -> Sort.by(Sort.Direction.ASC, "title");
        };
    }

    private void applyRequest(BookEntity entity, BookRequest request) {
        entity.setTitle(request.title().trim());
        entity.setAuthor(request.author().trim());
        entity.setCategory(request.category().trim());
        entity.setYear(request.year());
        entity.setDescription(Optional.ofNullable(request.description()).map(String::trim).orElse(null));
        entity.setCoverUrl(Optional.ofNullable(request.coverUrl()).map(String::trim).orElse(null));

        BookPricing pricing = Optional.ofNullable(entity.getPricing()).orElseGet(BookPricing::new);
        pricing.setPurchasePrice(normalizePrice(request.purchasePrice()));
        pricing.setRentTwoWeeks(normalizePrice(request.rentTwoWeeks()));
        pricing.setRentOneMonth(normalizePrice(request.rentOneMonth()));
        pricing.setRentThreeMonths(normalizePrice(request.rentThreeMonths()));
        entity.setPricing(pricing);
    }

    private BigDecimal normalizePrice(BigDecimal price) {
        return price == null ? null : price.stripTrailingZeros();
    }

    private BookListItemDto toListItemDto(BookEntity entity) {
        BookPricing pricing = entity.getPricing();
        BigDecimal purchasePrice = pricing != null ? pricing.getPurchasePrice() : null;
        return new BookListItemDto(
                entity.getId(),
                entity.getTitle(),
                entity.getAuthor(),
                entity.getCategory(),
                entity.getYear(),
                purchasePrice,
                entity.getStatus(),
                entity.getCoverUrl()
        );
    }

    private BookDetailsDto toDetailsDto(BookEntity entity) {
        BookPricing pricing = entity.getPricing();
        BigDecimal purchase = pricing != null ? pricing.getPurchasePrice() : null;
        BigDecimal twoWeeks = pricing != null ? pricing.getRentTwoWeeks() : null;
        BigDecimal oneMonth = pricing != null ? pricing.getRentOneMonth() : null;
        BigDecimal threeMonths = pricing != null ? pricing.getRentThreeMonths() : null;

        return new BookDetailsDto(
                entity.getId(),
                entity.getTitle(),
                entity.getAuthor(),
                entity.getCategory(),
                entity.getYear(),
                entity.getDescription(),
                entity.getCoverUrl(),
                purchase,
                twoWeeks,
                oneMonth,
                threeMonths,
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}