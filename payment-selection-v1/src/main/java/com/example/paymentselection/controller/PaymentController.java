package com.example.paymentselection.controller;

import com.example.paymentselection.entity.Payment;
import com.example.paymentselection.service.PaymentService;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador REST para gerenciamento de pagamentos.
 */
@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

  @Autowired
  private PaymentService paymentService;

  /**
   * Busca pagamentos com filtros e paginação.
   */
  @GetMapping("/search")
  public ResponseEntity<Page<Payment>> searchPayments(
      @RequestParam(required = false) String status, //
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate vencimentoAte,
      @PageableDefault(sort = "id", direction = Sort.Direction.ASC) Pageable pageable
  ) {
    Page<Payment> payments = paymentService.searchPayments(status, vencimentoAte, pageable);

    return ResponseEntity.ok(payments);
  }

}

