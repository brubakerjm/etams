package com.brubaker.etams.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO for updating an employee's password.
 */
public class PasswordUpdateDTO {

    @NotBlank(message = "Password must not be blank")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$", message = "Password must be at least 8 characters long, include a letter and a number.")
    private String password;

    // Getter
    public String getPassword() {
        return password;
    }

    // Setter
    public void setPassword(String password) {
        this.password = password;
    }

    // Optional: Override toString (if needed for logging/debugging)
    @Override
    public String toString() {
        return "PasswordUpdateDTO{" +
                "password='***'" +  // Mask the password for security
                '}';
    }
}