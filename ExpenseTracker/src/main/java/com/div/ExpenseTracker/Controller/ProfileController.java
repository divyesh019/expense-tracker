package com.div.ExpenseTracker.Controller;

import com.div.ExpenseTracker.Dto.LoginRequestDto;
import com.div.ExpenseTracker.Dto.ProfileRequestDto;
import com.div.ExpenseTracker.Dto.ProfileResponseDto;
import com.div.ExpenseTracker.Service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class ProfileController {

        private final ProfileService profileService;

        @PostMapping("/register")
        public ResponseEntity<ProfileResponseDto> registerProfile(@RequestBody ProfileRequestDto profileRequestDto){
            ProfileResponseDto profileResponseDto = profileService.registerProfile(profileRequestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(profileResponseDto);
        }

        @GetMapping("/activate")
        public ResponseEntity<String> activateProfile(@RequestParam String token){
            if(profileService.activateProfile(token))return ResponseEntity.status(HttpStatus.ACCEPTED)
                    .body("Account activated successfully");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Invalid Token");
        }
        @PostMapping("/login")
        public ResponseEntity<Map<String,Object>> login(@RequestBody LoginRequestDto loginRequestDto){
            try{
                if(!profileService.isAccountActive(loginRequestDto.getUsername())){
                return ResponseEntity.status((HttpStatus.FORBIDDEN)).body(
                        Map.of("message","Account not active. Please activate your account first"));
                }
                else{
                Map<String,Object> response = profileService.authenticateAndGenerateToken(loginRequestDto);
                return ResponseEntity.ok(response);
                }
            }
            catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "message",e.getMessage())
                );
            }
        }
}
