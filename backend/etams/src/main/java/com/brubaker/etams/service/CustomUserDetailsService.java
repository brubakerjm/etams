package com.brubaker.etams.service;

import com.brubaker.etams.entity.Employee;
import com.brubaker.etams.repository.EmployeeRepo;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Custom implementation of UserDetailsService to load user details from the database.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final EmployeeRepo employeeRepository;

    public CustomUserDetailsService(EmployeeRepo employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    /**
     * Loads a user from the database by username.
     *
     * @param username The username used for authentication.
     * @return UserDetails object for authentication.
     * @throws UsernameNotFoundException If the user is not found.
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Employee employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return new User(
                employee.getUsername(),
                employee.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority(employee.isAdmin() ? "ROLE_ADMIN" : "ROLE_USER"))
        );
    }
}