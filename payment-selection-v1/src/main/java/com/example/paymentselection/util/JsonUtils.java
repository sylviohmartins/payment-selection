package com.example.paymentselection.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Classe utilitária para operações com JSON.
 */
public class JsonUtils {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Converte um objeto para JSON string.
     */
    public static String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erro ao converter objeto para JSON", e);
        }
    }

    /**
     * Converte JSON string para Map.
     */
    public static Map<String, Object> fromJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erro ao converter JSON para Map", e);
        }
    }

    /**
     * Converte JSON string para lista de Long.
     */
    public static List<Long> fromJsonArray(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<Long>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erro ao converter JSON para List<Long>", e);
        }
    }

    /**
     * Mescla uma lista de IDs com um array JSON existente.
     */
    public static String mergeJsonArray(String existingJson, List<Long> newIds) {
        try {
            List<Long> existingIds = fromJsonArray(existingJson);
            List<Long> mergedIds = new ArrayList<>(existingIds);
            
            // Adiciona apenas IDs que não existem
            for (Long id : newIds) {
                if (!mergedIds.contains(id)) {
                    mergedIds.add(id);
                }
            }
            
            return toJson(mergedIds);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao mesclar arrays JSON", e);
        }
    }

    /**
     * Remove IDs de um array JSON.
     */
    public static String removeFromJsonArray(String existingJson, List<Long> idsToRemove) {
        try {
            List<Long> existingIds = fromJsonArray(existingJson);
            List<Long> filteredIds = new ArrayList<>();
            
            // Mantém apenas IDs que não estão na lista de remoção
            for (Long id : existingIds) {
                if (!idsToRemove.contains(id)) {
                    filteredIds.add(id);
                }
            }
            
            return toJson(filteredIds);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao remover IDs do array JSON", e);
        }
    }
}

