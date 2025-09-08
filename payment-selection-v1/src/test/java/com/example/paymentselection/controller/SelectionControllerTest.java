package com.example.paymentselection.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.paymentselection.dto.CreateSelectionRequest;
import com.example.paymentselection.dto.SelectionResponse;
import com.example.paymentselection.enums.Mode;
import com.example.paymentselection.service.SelectionService;
import com.example.paymentselection.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SelectionController.class)
class SelectionControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private SelectionService selectionService;

  @MockitoBean
  private UserService userService;

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  void testCreateSelection() throws Exception {
    // Arrange
    UUID userId = UUID.randomUUID();
    UUID selectionId = UUID.randomUUID();
    Map<String, Object> filter = Map.of("status", "A_PAGAR");
    CreateSelectionRequest request = new CreateSelectionRequest(filter, Mode.NONE);
    SelectionResponse response = new SelectionResponse(selectionId, 10L);

    when(userService.getCurrentUserId()).thenReturn(userId);
    when(selectionService.create(any(CreateSelectionRequest.class), eq(userId)))
        .thenReturn(response);

    // Act & Assert
    mockMvc.perform(post("/selections")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.selectionId").value(selectionId.toString()))
        .andExpect(jsonPath("$.selectedCount").value(10));
  }

  @Test
  void testUpdateSelection() throws Exception {
    // Arrange
    UUID userId = UUID.randomUUID();
    UUID selectionId = UUID.randomUUID();
    SelectionResponse response = new SelectionResponse(selectionId, 15L);

    when(userService.getCurrentUserId()).thenReturn(userId);
    when(selectionService.update(eq(selectionId), eq(userId), any()))
        .thenReturn(response);

    String requestBody = "{\"mode\":\"ALL\"}";

    // Act & Assert
    mockMvc.perform(patch("/selections/" + selectionId)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.selectionId").value(selectionId.toString()))
        .andExpect(jsonPath("$.selectedCount").value(15));
  }

  @Test
  void testApplySelection() throws Exception {
    // Arrange
    UUID userId = UUID.randomUUID();
    UUID selectionId = UUID.randomUUID();

    when(userService.getCurrentUserId()).thenReturn(userId);

    String requestBody = "{\"action\":\"PAY\"}";

    // Act & Assert
    mockMvc.perform(post("/selections/" + selectionId + "/apply")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody))
        .andExpect(status().isOk());
  }

}

