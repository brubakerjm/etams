package com.brubaker.etams.service;

import com.brubaker.etams.dto.LoginRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

public interface AuthService {
    ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest);
}
