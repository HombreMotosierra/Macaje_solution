package com.example.demo;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

	private final JdbcTemplate jdbcTemplate;

	public HealthController(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@GetMapping("/health")
	public ResponseEntity<Map<String, Object>> health() {
		Map<String, Object> response = new LinkedHashMap<>();
		response.put("service", "backend");
		response.put("timestamp", Instant.now().toString());

		try {
			Integer queryResult = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
			String databaseName = jdbcTemplate.queryForObject("SELECT current_database()", String.class);
			response.put("status", "UP");
			response.put("database", "UP");
			response.put("databaseName", databaseName);
			response.put("queryResult", queryResult);
			return ResponseEntity.ok(response);
		} catch (Exception exception) {
			response.put("status", "DOWN");
			response.put("database", "DOWN");
			response.put("error", exception.getMessage());
			return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
		}
	}
}