package ru.synergy.libraryapp.book;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Embeddable
public class BookPricing {
    @Column(name = "purchase_price", precision = 10, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "rent_two_weeks_price", precision = 10, scale = 2)
    private BigDecimal rentTwoWeeks;

    @Column(name = "rent_one_month_price", precision = 10, scale = 2)
    private BigDecimal rentOneMonth;

    @Column(name = "rent_three_months_price", precision = 10, scale = 2)
    private BigDecimal rentThreeMonths;
}
