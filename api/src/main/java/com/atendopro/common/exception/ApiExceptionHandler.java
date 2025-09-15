package com.atendopro.common.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.Instant;
import java.util.*;
import java.util.UUID;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> badReq(IllegalArgumentException ex, HttpServletRequest req) {
        return ResponseEntity.badRequest().body(basicBody(HttpStatus.BAD_REQUEST, ex.getMessage(), req.getRequestURI()));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> notFound(NotFoundException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(basicBody(HttpStatus.NOT_FOUND, ex.getMessage(), req.getRequestURI()));
    }

    // Handles malformed JSON and invalid field formats (e.g., UUID fields receiving non-UUID strings)
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> unreadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        Map<String, Object> body;
        Throwable cause = ex.getCause();
        if (cause instanceof InvalidFormatException ife) {
            String field = ife.getPath() != null && !ife.getPath().isEmpty() ? ife.getPath().get(0).getFieldName() : null;
            String expected = simpleTypeName(ife.getTargetType());
            String received = Objects.toString(ife.getValue(), null);

            String msg;
            if (UUID.class.equals(ife.getTargetType())) {
                msg = String.format("Formato inválido para o campo '%s': esperado UUID (36 chars), recebido '%s'.", field, received);
            } else {
                msg = String.format("Formato inválido para o campo '%s': esperado %s, recebido '%s'.", field, expected, received);
            }

            body = basicBody(HttpStatus.BAD_REQUEST, msg, req.getRequestURI());
            if (field != null) body.put("field", field);
            body.put("expected", expected);
            body.put("received", received);
        } else {
            body = basicBody(HttpStatus.BAD_REQUEST, "JSON do request inválido.", req.getRequestURI());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // Handles invalid parameter types (e.g., @PathVariable/@RequestParam UUID receiving "2")
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> typeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        String name = ex.getName();
        String value = Objects.toString(ex.getValue(), null);
        Class<?> required = ex.getRequiredType();
        String expected = simpleTypeName(required);
        String message;
        if (UUID.class.equals(required)) {
            message = String.format("Parâmetro '%s' deve ser um UUID (36 chars); recebido '%s'.", name, value);
        } else {
            message = String.format("Parâmetro '%s' com tipo inválido: esperado %s; recebido '%s'.", name, expected, value);
        }
        Map<String, Object> body = basicBody(HttpStatus.BAD_REQUEST, message, req.getRequestURI());
        body.put("parameter", name);
        body.put("expected", expected);
        body.put("received", value);
        return ResponseEntity.badRequest().body(body);
    }

    // Handles @Valid annotated request body errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, Object> body = basicBody(HttpStatus.BAD_REQUEST, "Dados inválidos.", req.getRequestURI());
        List<Map<String, String>> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> Map.of(
                        "field", fe.getField(),
                        "message", Optional.ofNullable(fe.getDefaultMessage()).orElse("Inválido")
                ))
                .toList();
        body.put("errors", errors);
        return ResponseEntity.badRequest().body(body);
    }

    // Handles DB unique constraint (e.g., unique email for patients)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> integrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        String msg = "Violação de integridade de dados.";
        String lower = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage().toLowerCase() : "";
        if (lower.contains("unique") && lower.contains("patients") && lower.contains("email")) {
            msg = "Já existe um paciente cadastrado com este e-mail.";
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(basicBody(HttpStatus.BAD_REQUEST, msg, req.getRequestURI()));
    }

    private Map<String, Object> basicBody(HttpStatus status, String message, String path) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("path", path);
        return body;
    }

    private String simpleTypeName(Class<?> clazz) {
        if (clazz == null) return "desconhecido";
        if (UUID.class.equals(clazz)) return "UUID";
        return clazz.getSimpleName();
    }
}