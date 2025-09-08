package com.example.paymentselection.controller;

import com.example.paymentselection.dto.ApplySelectionRequest;
import com.example.paymentselection.dto.CreateSelectionRequest;
import com.example.paymentselection.dto.SelectionResponse;
import com.example.paymentselection.dto.UpdateSelectionRequest;
import com.example.paymentselection.service.SelectionService;
import com.example.paymentselection.service.UserService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador REST para gerenciamento de seleções de pagamentos.
 */
@RestController
@RequestMapping("/selections")
@CrossOrigin(origins = "*")
public class SelectionController {

  @Autowired
  private SelectionService selectionService;

  @Autowired
  private UserService userService;

  /**
   * Cria uma nova sessão de seleção.
   */
  @PostMapping
  public ResponseEntity<SelectionResponse> create(@Valid @RequestBody CreateSelectionRequest request) {
    UUID userId = userService.getCurrentUserId();
    SelectionResponse response = selectionService.create(request, userId);

    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  /**
   * Atualiza uma sessão de seleção.
   */
  @PatchMapping("/{id}")
  public ResponseEntity<SelectionResponse> update(
      @PathVariable UUID id, //
      @RequestBody UpdateSelectionRequest request //
  ) {
    UUID userId = userService.getCurrentUserId();
      SelectionResponse response = selectionService.update(id, userId, request);

    return ResponseEntity.ok(response);
  }

  /**
   * Aplica a ação em lote.
   */
  @PostMapping("/{id}/apply")
  public ResponseEntity<Void> apply(
      @PathVariable UUID id, //
      @Valid @RequestBody ApplySelectionRequest request //
  ) {
    UUID userId = userService.getCurrentUserId();
    selectionService.apply(id, userId, request);

    return ResponseEntity.ok().build();
  }

}

