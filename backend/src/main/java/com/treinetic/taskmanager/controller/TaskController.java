package com.treinetic.taskmanager.controller;

import com.treinetic.taskmanager.dto.TaskDTO;
import com.treinetic.taskmanager.entity.Task;
import com.treinetic.taskmanager.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(taskService.getAllTasks(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTask(@PathVariable Long id) {
        Optional<Task> task = taskService.getTaskById(id);

        if (task.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Task not found with id: " + id));
        }

        return ResponseEntity.ok(task.get());
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody TaskDTO dto) {
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
        }
        if (dto.getTitle().length() > 100) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title must be under 100 characters"));
        }
        if (dto.getDescription() != null && dto.getDescription().length() > 500) {
            return ResponseEntity.badRequest().body(Map.of("error", "Description must be under 500 characters"));
        }

        Task created = taskService.createTask(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody TaskDTO dto) {
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
        }
        if (dto.getTitle().length() > 100) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title must be under 100 characters"));
        }
        if (dto.getDescription() != null && dto.getDescription().length() > 500) {
            return ResponseEntity.badRequest().body(Map.of("error", "Description must be under 500 characters"));
        }

        Task updated = taskService.updateTask(id, dto);

        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Task not found with id: " + id));
        }

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        boolean deleted = taskService.deleteTask(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Task not found with id: " + id));
        }

        return ResponseEntity.noContent().build();
    }
}