package com.example.demo.ecommerce;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException exception) {
        HttpStatus status = HttpStatus.resolve(exception.getStatus());
        HttpStatus finalStatus = status == null ? HttpStatus.BAD_REQUEST : status;

        Map<String, Object> body = baseBody(finalStatus.value(), exception.getMessage());
        return ResponseEntity.status(finalStatus).body(body);
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<Map<String, Object>> handleMissingHeader(MissingRequestHeaderException exception) {
        Map<String, Object> body = baseBody(400, "Header faltante: " + exception.getHeaderName());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUpload(MaxUploadSizeExceededException exception) {
        Map<String, Object> body = baseBody(
            413,
            "La imagen supera el tamano maximo permitido (20 MB). Reduce peso o usa el editor de redimension en el dashboard."
        );
        return ResponseEntity.status(413).body(body);
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<Map<String, Object>> handleMultipart(MultipartException exception) {
        String message = exception.getMessage() == null
            ? "Error procesando la imagen"
            : exception.getMessage();
        if (message.toLowerCase().contains("maximum upload size") || message.toLowerCase().contains("too large")) {
            Map<String, Object> body = baseBody(
                413,
                "La imagen supera el tamano maximo permitido (20 MB). Reduce peso o usa el editor de redimension en el dashboard."
            );
            return ResponseEntity.status(413).body(body);
        }
        Map<String, Object> body = baseBody(400, "No se pudo procesar la imagen enviada");
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception exception) {
        log.error("Unhandled exception", exception);
        Map<String, Object> body = baseBody(500, "Error interno del servidor");
        return ResponseEntity.internalServerError().body(body);
    }

    private Map<String, Object> baseBody(int status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status);
        body.put("message", message);
        body.put("timestamp", Instant.now().toString());
        return body;
    }
}
