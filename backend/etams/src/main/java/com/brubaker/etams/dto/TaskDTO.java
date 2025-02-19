package com.brubaker.etams.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

/**
 * Data Transfer Object for transferring task data between the backend and frontend.
 */
public class TaskDTO {

    private Integer id;

    @NotBlank(message = "Title must not be blank")
    private String title;

    private String description;

    /**
     * Status of the task.
     * Stored as a String (e.g., PENDING, IN_PROGRESS).
     */
    @NotBlank(message = "Status must not be blank")
    private String status;

    private LocalDate deadline;

    private Integer assignedEmployeeId;

    /**
     * Full name of the assigned employee, for display purposes.
     */
    private String assignedEmployeeName;

    private String createdAt;

    private String updatedAt;

    // Constructors
    public TaskDTO() {
    }

    public TaskDTO(Integer id, String title, String description, String status, LocalDate deadline, Integer assignedEmployeeId, String assignedEmployeeName, String createdAt, String updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.deadline = deadline;
        this.assignedEmployeeId = assignedEmployeeId;
        this.assignedEmployeeName = assignedEmployeeName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public Integer getAssignedEmployeeId() {
        return assignedEmployeeId;
    }

    public void setAssignedEmployeeId(Integer assignedEmployeeId) {
        this.assignedEmployeeId = assignedEmployeeId;
    }

    public String getAssignedEmployeeName() {
        return assignedEmployeeName;
    }

    public void setAssignedEmployeeName(String assignedEmployeeName) {
        this.assignedEmployeeName = assignedEmployeeName;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}