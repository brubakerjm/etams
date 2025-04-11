package com.brubaker.etams.service;

import com.brubaker.etams.dto.LoginRequestDTO;
import com.brubaker.etams.dto.LoginResponseDTO;
import com.brubaker.etams.entity.Employee;
import com.brubaker.etams.repository.EmployeeRepo;
import com.brubaker.etams.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final EmployeeRepo employeeRepo;

    public AuthServiceImpl(AuthenticationManager authenticationManager, JwtUtil jwtUtil, EmployeeRepo employeeRepo) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.employeeRepo = employeeRepo;
    }

    @Override
    public ResponseEntity<?> login(LoginRequestDTO loginRequest) {
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
