package com.example.paymentselection.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

/**
 * Entidade que representa um pagamento no sistema.
 */
@Entity
@Table(name = "payment")
@Getter
@Setter
public class Payment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String status = "A_PAGAR";

  private LocalDate vencimento;

  @Column(precision = 10, scale = 2)
  private BigDecimal valor;

  private String descricao;

  @Column(name = "created_at")
  private Instant createdAt;

  @Column(name = "updated_at")
  private Instant updatedAt;

  public Payment() {
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
  }

  public Payment(String status, LocalDate vencimento, BigDecimal valor, String descricao) {
    this();
    this.status = status;
    this.vencimento = vencimento;
    this.valor = valor;
    this.descricao = descricao;
  }

  public void setStatus(String status) {
    this.status = status;
    this.updatedAt = Instant.now();
  }

}

