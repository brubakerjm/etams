package com.brubaker.etams.controller;

import com.brubaker.etams.dto.LoginRequestDTO;
import com.brubaker.etams.dto.LoginResponseDTO;
import com.brubaker.etams.entity.Employee;
import com.brubaker.etams.repository.EmployeeRepo;
import com.brubaker.etams.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Controller for handling authentication-related requests.
 * <p>
 * Provides login functionality and generates JWT tokens upon successful authentication.
 * Also includes error handling for incorrect credentials, missing users, and server errors.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmployeeRepo employeeRepo;

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
        if (loginRequest.getUsername() == null || loginRequest.getPassword() == null) {
            return ResponseEntity.badRequest().body("Invalid request. Username and password are required.");
        }

        Optional<Employee> employeeOpt = employeeRepo.findByUsername(loginRequest.getUsername());

        if (employeeOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found. Please check your username.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            User userDetails = (User) authentication.getPrincipal();

            Employee employee = employeeOpt.get();
            boolean isAdmin = employee.isAdmin();

            String jwtToken = jwtUtil.generateToken(employee.getId(), userDetails.getUsername(), isAdmin);

            return ResponseEntity.ok(new LoginResponseDTO(jwtToken, userDetails.getUsername(), isAdmin, employee.getId()));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Incorrect username or password.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Something went wrong on our end. Please try again later.");
        }
    }
}