package com.example.paymentselection.dto;

import com.example.paymentselection.enums.Mode;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * DTO para requisição de criação de uma nova sessão de seleção.
 */
public record CreateSelectionRequest(
        @NotNull
        Map<String, Object> filter,
        
        @NotNull
        Mode mode
) {}

