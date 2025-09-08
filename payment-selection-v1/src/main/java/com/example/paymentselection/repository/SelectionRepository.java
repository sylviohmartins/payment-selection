package com.example.paymentselection.repository;

import com.example.paymentselection.entity.Selection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositório para operações com a entidade Selection.
 */
@Repository
public interface SelectionRepository extends JpaRepository<Selection, UUID> {

    /**
     * Busca uma seleção por ID e ID do usuário.
     */
    Optional<Selection> findByIdAndUserId(UUID id, UUID userId);
}

