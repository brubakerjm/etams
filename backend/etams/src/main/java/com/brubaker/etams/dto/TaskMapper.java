package com.brubaker.etams.dto;

import com.brubaker.etams.entity.Task;
import com.brubaker.etams.entity.TaskStatus;

public class TaskMapper {

    public TaskDTO toDTO(Task task) {
        if (task == null) {
            return null;
        }

        String assignedEmployeeName = null;
        if (task.getAssignedEmployee() != null) {
            assignedEmployeeName = task.getAssignedEmployee().getFirstName() + " " + task.getAssignedEmployee().getLastName();
        }

        return new TaskDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus().toString(),
                task.getDeadline(),
                task.getAssignedEmployee() != null ? task.getAssignedEmployee().getId() : null,
                assignedEmployeeName,
                task.getCreatedAt() != null ? task.getCreatedAt().toString() : null,
                task.getUpdatedAt() != null ? task.getUpdatedAt().toString() : null
        );
    }

    public Task toEntity(TaskDTO taskDTO) {
        if (taskDTO == null) {
            return null;
        }

        Task task = new Task();
        task.setId(taskDTO.getId());
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setStatus(taskDTO.getStatus() != null
                ? TaskStatus.valueOf(taskDTO.getStatus().toUpperCase())
                : TaskStatus.UNASSIGNED);
        task.setDeadline(taskDTO.getDeadline());
        return task;
    }
}