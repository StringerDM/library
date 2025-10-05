package ru.synergy.libraryapp.order;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.synergy.libraryapp.book.BookEntity;
import ru.synergy.libraryapp.book.BookRepository;
import ru.synergy.libraryapp.book.BookStatus;
import ru.synergy.libraryapp.common.ResourceNotFoundException;
import ru.synergy.libraryapp.user.UserEntity;
import ru.synergy.libraryapp.user.UserService;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserService userService;

    @Transactional
    public OrderDto createOrder(UUID userId, CreateOrderRequest request) {
        UserEntity user = userService.getById(userId);
        BookEntity book = bookRepository.findById(request.bookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        if (book.getStatus() != BookStatus.AVAILABLE) {
            throw new IllegalArgumentException("Book is not available");
        }

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setBook(book);
        order.setType(request.type());

        BigDecimal price = resolvePrice(book, request.type());
        if (price == null) {
            throw new IllegalArgumentException("Pricing for the selected option is not configured");
        }
        order.setPrice(price);

        OffsetDateTime now = OffsetDateTime.now();
        order.setStartDate(now);

        switch (request.type()) {
            case PURCHASE -> {
                order.setEndDate(null);
                order.setStatus(OrderStatus.COMPLETED);
            }
            case RENT_TWO_WEEKS -> {
                order.setEndDate(now.plusWeeks(2));
                order.setStatus(OrderStatus.ACTIVE);
            }
            case RENT_ONE_MONTH -> {
                order.setEndDate(now.plusMonths(1));
                order.setStatus(OrderStatus.ACTIVE);
            }
            case RENT_THREE_MONTHS -> {
                order.setEndDate(now.plusMonths(3));
                order.setStatus(OrderStatus.ACTIVE);
            }
        }

        OrderEntity saved = orderRepository.save(order);
        log.info("Order created. orderId={}, userId={}, bookId={}, type={}", saved.getId(), userId, book.getId(), request.type());
        return toDto(saved);
    }

    @Transactional
    public List<OrderDto> userOrders(UUID userId) {
        refreshStatuses();
        return orderRepository.findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public List<OrderDto> adminActiveOrders() {
        refreshStatuses();
        List<OrderDto> active = orderRepository.findByStatus(OrderStatus.ACTIVE)
                .stream()
                .map(this::toDto)
                .toList();
        List<OrderDto> overdue = orderRepository.findByStatus(OrderStatus.OVERDUE)
                .stream()
                .map(this::toDto)
                .toList();
        return Stream.concat(active.stream(), overdue.stream()).toList();
    }

    @Transactional
    public void refreshStatuses() {
        OffsetDateTime now = OffsetDateTime.now();
        List<OrderEntity> overdue = orderRepository.findByStatusAndEndDateBefore(OrderStatus.ACTIVE, now);
        for (OrderEntity entity : overdue) {
            entity.setStatus(OrderStatus.OVERDUE);
        }
    }

    @Transactional(readOnly = true)
    public List<OrderEntity> findRentalsExpiringInWindow(OffsetDateTime from, OffsetDateTime to) {
        return orderRepository.findByStatusAndEndDateBetween(OrderStatus.ACTIVE, from, to);
    }

    private BigDecimal resolvePrice(BookEntity book, OrderType type) {
        if (book.getPricing() == null) {
            return null;
        }
        return switch (type) {
            case PURCHASE -> book.getPricing().getPurchasePrice();
            case RENT_TWO_WEEKS -> book.getPricing().getRentTwoWeeks();
            case RENT_ONE_MONTH -> book.getPricing().getRentOneMonth();
            case RENT_THREE_MONTHS -> book.getPricing().getRentThreeMonths();
        };
    }

    private OrderDto toDto(OrderEntity entity) {
        return new OrderDto(
                entity.getId(),
                entity.getBook().getId(),
                entity.getBook().getTitle(),
                entity.getType(),
                entity.getStatus(),
                entity.getPrice(),
                entity.getStartDate(),
                entity.getEndDate()
        );
    }
}