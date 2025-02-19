package com.brubaker.etams.dto;

/**
 * DTO for sending authentication response containing JWT token.
 */
public class LoginResponseDTO {

    private String token;
    private String username;
    private boolean admin;
    private Integer employeeId;

    public LoginResponseDTO(String token, String username, boolean isAdmin, Integer employeeId) {
        this.token = token;
        this.username = username;
        this.admin = isAdmin;
        this.employeeId = employeeId;
    }

    // Getters
    public String getToken() {
        return token;
    }

    public boolean isAdmin() {
        return admin;
    }

    public String getUsername() {
        return username;
    }

    public Integer getEmployeeId() {
        return employeeId;
    }
}