package com.brubaker.etams.controller;

import com.brubaker.etams.dto.LoginRequestDTO;
import com.brubaker.etams.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for handling authentication-related requests.
 * <p>
 * Provides login functionality and generates JWT tokens upon successful authentication.
 * Also includes error handling for incorrect credentials, missing users, and server errors.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {


    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Handles user login authentication.
     * <p>
     * This method verifies the provided username and password, authenticates the user,
     * retrieves employee details, and generates a JWT token for authorized access.
     * It also includes proper HTTP error responses for invalid credentials and server errors.
     *
     * @param loginRequest The login request containing username and password.
     * @return A `ResponseEntity<LoginResponseDTO>` containing the JWT token and user details if authentication is successful.
     * Returns error responses for failed authentication scenarios.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        return authService.login(loginRequest);
    }
}