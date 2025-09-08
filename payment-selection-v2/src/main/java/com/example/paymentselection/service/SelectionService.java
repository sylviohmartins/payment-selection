package com.example.paymentselection.service;

import static com.example.paymentselection.repository.spec.PaymentSpecifications.statusEquals;
import static com.example.paymentselection.repository.spec.PaymentSpecifications.vencimentoLte;

import com.example.paymentselection.dto.ApplySelectionRequest;
import com.example.paymentselection.dto.CreateSelectionRequest;
import com.example.paymentselection.dto.SelectionResponse;
import com.example.paymentselection.dto.UpdateSelectionRequest;
import com.example.paymentselection.entity.Payment;
import com.example.paymentselection.entity.Selection;
import com.example.paymentselection.enums.Action;
import com.example.paymentselection.enums.Mode;
import com.example.paymentselection.repository.PaymentRepository;
import com.example.paymentselection.repository.SelectionRepository;
import com.example.paymentselection.util.JsonUtils;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço para gerenciamento de seleções de pagamentos.
 */
@Service
public class SelectionService {

  @Autowired
  private SelectionRepository selectionRepository;

  @Autowired
  private PaymentRepository paymentRepository;

  /**
   * Cria uma nova sessão de seleção.
   */
  @Transactional
  public SelectionResponse create(CreateSelectionRequest request, UUID userId) {
    Selection selection = new Selection();
    selection.setId(UUID.randomUUID());
    selection.setUserId(userId);
    selection.setMode(request.mode());
    selection.setFilterJson(JsonUtils.toJson(request.filter()));
    selection.setIncludeIds("[]");
    selection.setExcludeIds("[]");
    selection.setVersion(0);
    selection.setCreatedAt(Instant.now());
    selection.setExpiresAt(Instant.now().plus(Duration.ofHours(4)));

    selectionRepository.save(selection);

    long count = countByFilter(request.filter());
    return new SelectionResponse(selection.getId(), count);
  }

  /**
   * Atualiza uma sessão de seleção.
   */
  @Transactional
  public SelectionResponse update(UUID id, UUID userId, UpdateSelectionRequest request) {
    Selection selection = selectionRepository.findByIdAndUserId(id, userId) //
        .orElseThrow(() -> new RuntimeException("Seleção não encontrada"));

    // Mudança de modo (pode ser enviado "ALL" para selecionar todos ou "NONE" para desmarcar todos)
    if (request.mode() != null) {
      selection.setMode(request.mode());
      selection.setIncludeIds("[]");
      selection.setExcludeIds("[]");
    }

    // Inclui IDs se estiver em modo NONE (selecionar página ou registros individuais)
    if (request.includeIds() != null && !request.includeIds().isEmpty()) {
      if (selection.getMode() == Mode.NONE) {
        selection.setIncludeIds(JsonUtils.mergeJsonArray(selection.getIncludeIds(), request.includeIds()));
      } else if (selection.getMode() == Mode.ALL) {
        // Se estamos em modo ALL e queremos incluir IDs, na verdade estamos removendo da lista de exclusão
        selection.setExcludeIds(JsonUtils.removeFromJsonArray(selection.getExcludeIds(), request.includeIds()));
      }
    }

    // Exclui IDs se estiver em modo ALL (desmarcar página ou registros individuais)
    if (request.excludeIds() != null && !request.excludeIds().isEmpty()) {
      if (selection.getMode() == Mode.ALL) {
        selection.setExcludeIds(JsonUtils.mergeJsonArray(selection.getExcludeIds(), request.excludeIds()));
      } else if (selection.getMode() == Mode.NONE) {
        // Se estamos em modo NONE e queremos excluir IDs, na verdade estamos removendo da lista de inclusão
        selection.setIncludeIds(JsonUtils.removeFromJsonArray(selection.getIncludeIds(), request.excludeIds()));
      }
    }

    selection.setVersion(selection.getVersion() + 1);
    selectionRepository.save(selection);

    long count = recalculateCount(selection);
    return new SelectionResponse(selection.getId(), count);
  }

  /**
   * Aplica a ação em lote.
   */
  @Transactional
  public void apply(UUID id, UUID userId, ApplySelectionRequest request) {
    Selection selection = selectionRepository.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new RuntimeException("Seleção não encontrada"));

    if (request.action() == Action.PAY) {
      applyPayments(selection);
    } else if (request.action() == Action.CANCEL) {
      applyCancellations(selection);
    }

    selectionRepository.delete(selection);
  }

  /**
   * Aplica pagamentos em lote.
   */
  private void applyPayments(Selection selection) {
    Map<String, Object> filter = JsonUtils.fromJson(selection.getFilterJson());
    List<Long> excluded = JsonUtils.fromJsonArray(selection.getExcludeIds());
    List<Long> included = JsonUtils.fromJsonArray(selection.getIncludeIds());

    String status = (String) filter.get("status");
    LocalDate vencimentoAte = filter.get("vencimentoAte") != null ?
        LocalDate.parse((String) filter.get("vencimentoAte")) : null;

    if (selection.getMode() == Mode.ALL) {
      // Atualiza todos que se enquadram no filtro menos os excluídos
      paymentRepository.bulkUpdateByFilter(status, vencimentoAte);
    } else {
      // Atualiza apenas os incluídos
      if (!included.isEmpty()) {
        paymentRepository.bulkUpdateByIds(included);
      }
    }
  }

  /**
   * Aplica cancelamentos em lote.
   */
  private void applyCancellations(Selection selection) {
    Map<String, Object> filter = JsonUtils.fromJson(selection.getFilterJson());
    List<Long> excluded = JsonUtils.fromJsonArray(selection.getExcludeIds());
    List<Long> included = JsonUtils.fromJsonArray(selection.getIncludeIds());

    LocalDate vencimentoAte = filter.get("vencimentoAte") != null ?
        LocalDate.parse((String) filter.get("vencimentoAte")) : null;

    if (selection.getMode() == Mode.ALL) {
      // Cancela todos que se enquadram no filtro menos os excluídos
      paymentRepository.bulkCancelByFilter(vencimentoAte);
    } else {
      // Cancela apenas os incluídos
      if (!included.isEmpty()) {
        paymentRepository.bulkCancelByIds(included);
      }
    }
  }

  /**
   * Conta itens que atendem ao filtro.
   */
  private long countByFilter(Map<String, Object> filter) {
    String status = asText(filter.get("status"));
    LocalDate vencimentoAte = asLocalDate(filter.get("vencimentoAte"));

    Specification<Payment> spec = Specification
        .where(statusEquals(status))
        .and(vencimentoLte(vencimentoAte));

    return paymentRepository.count(spec);
  }

  /**
   * Recalcula a contagem de itens selecionados.
   */
  private long recalculateCount(Selection selection) {
    Map<String, Object> filter = JsonUtils.fromJson(selection.getFilterJson());
    long totalFiltered = countByFilter(filter);

    List<Long> excluded = JsonUtils.fromJsonArray(selection.getExcludeIds());
    List<Long> included = JsonUtils.fromJsonArray(selection.getIncludeIds());

    if (selection.getMode() == Mode.ALL) {
      // Todos menos os excluídos
      return totalFiltered - excluded.size();
    } else {
      // Apenas os incluídos
      return included.size();
    }
  }

  private static String asText(Object v) {
    if (v instanceof String s) {
      s = s.trim();
      return s.isEmpty() ? null : s;
    }
    return null;
  }

  private static LocalDate asLocalDate(Object v) {
    if (v == null) return null;
    String s = v.toString().trim();
    return s.isEmpty() ? null : LocalDate.parse(s); // espere "yyyy-MM-dd"
  }

}

