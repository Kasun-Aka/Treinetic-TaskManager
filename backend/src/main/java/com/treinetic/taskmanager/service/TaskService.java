package com.treinetic.taskmanager.service;

import com.treinetic.taskmanager.dto.TaskDTO;
import com.treinetic.taskmanager.entity.Task;
import com.treinetic.taskmanager.entity.TaskStatus;
import com.treinetic.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public List<Task> getAllTasks(String status) {
        if (status != null && !status.isBlank()) {
            try {
                TaskStatus taskStatus = TaskStatus.valueOf(status.toUpperCase());
                return taskRepository.findByStatus(taskStatus);
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        }
        return taskRepository.findAll();
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public Task createTask(TaskDTO dto) {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus() != null
                ? TaskStatus.valueOf(dto.getStatus().toUpperCase())
                : TaskStatus.TO_DO);
        return taskRepository.save(task);
    }

    // Returns null if task not found
    public Task updateTask(Long id, TaskDTO dto) {
        Optional<Task> existing = taskRepository.findById(id);
        if (existing.isEmpty()) {
            return null;
        }
        Task task = existing.get();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        if (dto.getStatus() != null) {
            task.setStatus(TaskStatus.valueOf(dto.getStatus().toUpperCase()));
        }
        return taskRepository.save(task);
    }

    // Returns false if task not found
    public boolean deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            return false;
        }
        taskRepository.deleteById(id);
        return true;
    }
}