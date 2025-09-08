package com.example.paymentselection.dto;

import com.example.paymentselection.enums.Action;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para requisição de aplicação de uma ação em lote.
 */
public record ApplySelectionRequest(
        @NotNull
        Action action
) {}

