package com.example.paymentselection.service;

import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Serviço para gerenciamento de usuários.
 * Esta é uma implementação simplificada para demonstração.
 */
@Service
public class UserService {

    /**
     * Retorna o ID do usuário atual.
     * Em uma implementação real, isso seria obtido do contexto de segurança.
     */
    public UUID getCurrentUserId() {
        // Para demonstração, retorna um UUID fixo
        // Em produção, isso seria obtido do JWT token ou sessão
        return UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
    }
}

