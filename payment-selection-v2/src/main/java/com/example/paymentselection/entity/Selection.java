package com.example.paymentselection.entity;

import com.example.paymentselection.enums.Mode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entidade que representa uma sessão de seleção de pagamentos.
 */
@Entity
@Table(name = "selection")
@Getter
@Setter
public class Selection {

  @Id
  private UUID id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Mode mode;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "filter_json", nullable = false, columnDefinition = "jsonb")
  private String filterJson;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "include_ids", columnDefinition = "jsonb")
  private String includeIds = "[]";

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "exclude_ids", columnDefinition = "jsonb")
  private String excludeIds = "[]";

  @Version
  @Column(nullable = false)
  private Integer version = 0;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "expires_at")
  private Instant expiresAt;

  public Selection() {
    this.id = UUID.randomUUID();
    this.createdAt = Instant.now();
  }

  public Selection(UUID userId, Mode mode, String filterJson) {
    this();
    this.userId = userId;
    this.mode = mode;
    this.filterJson = filterJson;
  }


}

