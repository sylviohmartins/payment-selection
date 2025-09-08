package com.example.paymentselection.service;

import com.example.paymentselection.entity.Payment;
import com.example.paymentselection.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * Serviço para gerenciamento de pagamentos.
 */
@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    /**
     * Busca pagamentos com filtros e paginação.
     */
    public Page<Payment> searchPayments(String status, LocalDate vencimentoAte, Pageable pageable) {
        boolean hasStatus = status != null && !status.isBlank();
        boolean hasDate = vencimentoAte != null;

        if (hasStatus && hasDate) {
            return paymentRepository.findByStatusAndVencimentoLessThanEqual(status, vencimentoAte, pageable);
        }
        if (hasStatus) {
            return paymentRepository.findByStatus(status, pageable);
        }
        if (hasDate) {
            return paymentRepository.findByVencimentoLessThanEqual(vencimentoAte, pageable);
        }
        return paymentRepository.findAll(pageable);
    }

}

