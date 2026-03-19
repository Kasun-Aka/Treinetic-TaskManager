package com.treinetic.taskmanager.service;

import com.treinetic.taskmanager.config.JwtUtil;
import com.treinetic.taskmanager.dto.AuthDTO;
import com.treinetic.taskmanager.entity.User;
import com.treinetic.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Returns null if username is already taken
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return null;
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthDTO.AuthResponse(token, user.getUsername());
    }

    // Returns null if credentials are wrong
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            return null;
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return null;
        }
        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthDTO.AuthResponse(token, user.getUsername());
    }
}