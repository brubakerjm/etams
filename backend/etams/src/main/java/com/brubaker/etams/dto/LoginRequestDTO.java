package com.brubaker.etams.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for handling user login requests.
 */
public class LoginRequestDTO {

    @NotBlank(message = "Username or email must not be blank")
    private String username;

    @NotBlank(message = "Password must not be blank")
    private String password;

    // Constructor
    public LoginRequestDTO() {}

    public LoginRequestDTO(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}