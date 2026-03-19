package com.treinetic.taskmanager.repository;

import com.treinetic.taskmanager.entity.Task;
import com.treinetic.taskmanager.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatus(TaskStatus status);
}
