package com.brubaker.etams.controller;

import com.brubaker.etams.dto.LoginRequestDTO;
import com.brubaker.etams.dto.LoginResponseDTO;
import com.brubaker.etams.entity.Employee;
import com.brubaker.etams.repository.EmployeeRepo;
import com.brubaker.etams.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit test for {@link AuthController}, validating authentication logic.
 * This test ensures that login functionality behaves correctly under different scenarios.
 */
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private EmployeeRepo employeeRepo;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthController authController;

    private Employee employee;
    private LoginRequestDTO loginRequest;
    private String mockJwtToken;

    /**
     * Initializes mock test data before each test.
     * Sets up an Employee object and a mock login request.
     */
    @BeforeEach
    void setUp() {
        employee = new Employee();
        employee.setId(1);
        employee.setUsername("testuser");
        employee.setPasswordHash("hashedpassword");
        employee.setAdmin(false);

        loginRequest = new LoginRequestDTO("testuser", "password");
        mockJwtToken = "mocked.jwt.token";
    }

    /**
     * Tests successful login with a valid username and password.
     * Ensures that authentication and JWT generation function correctly.
     */
    @Test
    void login_Success() {
        when(employeeRepo.findByUsername("testuser"))
                .thenReturn(Optional.of(employee));

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenAnswer(invocation -> {
                    UsernamePasswordAuthenticationToken token = invocation.getArgument(0);
                    User userDetails = new User(token.getPrincipal().toString(), "hashedpassword", Collections.emptyList());
                    return new UsernamePasswordAuthenticationToken(userDetails, token.getCredentials(), userDetails.getAuthorities());
                });

        when(jwtUtil.generateToken(anyInt(), anyString(), anyBoolean()))
                .thenReturn(mockJwtToken);

        ResponseEntity<?> response = authController.login(loginRequest);

        assertEquals(200, response.getStatusCodeValue());
        assertInstanceOf(LoginResponseDTO.class, response.getBody());

        LoginResponseDTO loginResponse = (LoginResponseDTO) response.getBody();
        assertEquals("mocked.jwt.token", loginResponse.getToken());
        assertEquals("testuser", loginResponse.getUsername());
        assertFalse(loginResponse.isAdmin());

        verify(employeeRepo, times(1)).findByUsername("testuser");
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtil, times(1)).generateToken(anyInt(), anyString(), anyBoolean());
    }

    /**
     * Tests login failure due to a non-existent user.
     * Ensures that a 404 status code is returned when the username is not found.
     */
    @Test
    void login_UserNotFound() {
        when(employeeRepo.findByUsername("testuser"))
                .thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.login(loginRequest);

        assertEquals(404, response.getStatusCodeValue());
        assertEquals("User not found. Please check your username.", response.getBody());
    }

    /**
     * Tests login failure due to an incorrect password.
     * Ensures that authentication fails and returns a 401 status code.
     */
    @Test
    void login_IncorrectPassword() {
        when(employeeRepo.findByUsername("testuser"))
                .thenReturn(Optional.of(employee));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Incorrect password"));

        ResponseEntity<?> response = authController.login(loginRequest);

        assertEquals(401, response.getStatusCodeValue());
        assertEquals("Incorrect username or password.", response.getBody());
    }

    /**
     * Tests login failure due to missing credentials.
     * Ensures that an appropriate 400 status code is returned.
     */
    @Test
    void login_MissingCredentials() {
        LoginRequestDTO invalidRequest = new LoginRequestDTO(null, null);

        ResponseEntity<?> response = authController.login(invalidRequest);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Invalid request. Username and password are required.", response.getBody());
    }
}