package com.example.paymentselection.repository.spec;

import com.example.paymentselection.entity.Payment;
import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class PaymentSpecifications {

  public static Specification<Payment> statusEquals(String status) {
    return (root, query, cb) ->
        StringUtils.hasText(status) ? cb.equal(root.get("status"), status) : null;
  }

  public static Specification<Payment> vencimentoLte(LocalDate vencimentoAte) {
    return (root, query, cb) ->
        vencimentoAte != null ? cb.lessThanOrEqualTo(root.get("vencimento"), vencimentoAte) : null;
  }

}
