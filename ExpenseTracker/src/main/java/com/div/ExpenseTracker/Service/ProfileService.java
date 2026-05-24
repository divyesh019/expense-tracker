package com.div.ExpenseTracker.Service;

import com.div.ExpenseTracker.Dto.LoginRequestDto;
import com.div.ExpenseTracker.Dto.ProfileRequestDto;
import com.div.ExpenseTracker.Dto.ProfileResponseDto;
import com.div.ExpenseTracker.Entity.ProfileEntity;
import com.div.ExpenseTracker.Repository.ProfileRepository;
import com.div.ExpenseTracker.Util.AuthUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final AuthUtils authUtils;

    @Value("${app.public-url:http://localhost:8080}")
    private String appPublicUrl;

    public ProfileResponseDto registerProfile(ProfileRequestDto profileRequestDto) {
        if(profileRepository.findByEmail(profileRequestDto.getEmail()).isPresent()){
            throw new RuntimeException("User already exists");
        }
        ProfileEntity newProfile = toEntity(profileRequestDto);
        newProfile.setActivationToken(UUID.randomUUID().toString());
        sendActivationEmail(newProfile);
        profileRepository.save(newProfile);
        return toDto(newProfile);
    }


    public ProfileEntity toEntity(ProfileRequestDto profileRequestDto){
        return ProfileEntity.builder().
                email(profileRequestDto.getEmail()).
                fullName(profileRequestDto.getFullName()).
                password(passwordEncoder.encode(profileRequestDto.getPassword())).
                profileImageUrl(profileRequestDto.getProfileImageUrl()).build();
    }
    public ProfileResponseDto toDto(ProfileEntity profileEntity){
        return ProfileResponseDto.builder().
                id(profileEntity.getId()).
                fullName(profileEntity.getFullName()).
                email(profileEntity.getEmail()).
                profileImageUrl(profileEntity.getProfileImageUrl()).
                createdAt(profileEntity.getCreatedAt()).
                updatedAt(profileEntity.getUpdatedAt()).
                build();

    }
    public boolean activateProfile(String token){
        return profileRepository.findByActivationToken(token).map(
                profile-> {
                    profile.setIsActive(true);
                    profileRepository.save(profile);
                    return true;
                }).orElse(false);
    }

    private void sendActivationEmail(ProfileEntity profileEntity){
        String subject = "Activate your expense tracker account";
        String baseUrl = appPublicUrl.endsWith("/") ? appPublicUrl.substring(0, appPublicUrl.length() - 1) : appPublicUrl;
        String activationLink = baseUrl + "/api/v1.0/auth/activate?token=" + profileEntity.getActivationToken();
        String body = "Hi " +profileEntity.getFullName() + " Click on the following link to activate your account: " + activationLink;
        emailService.sendEmail(
                profileEntity.getEmail(),
                subject,
                body
        );
    }

    public boolean isAccountActive(String email){
        return profileRepository.findByEmail(email).map(
                ProfileEntity::getIsActive
        ).orElse(false);
    }

    public Map<String,Object> authenticateAndGenerateToken(LoginRequestDto loginRequestDto){
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequestDto.getUsername(), loginRequestDto.getPassword()));
            return Map.of(
                    "token", authUtils.generateAccessToken(loginRequestDto.getUsername()),
                    "user", profileRepository.findByEmail(loginRequestDto.getUsername()).get().getFullName()
            );
        }catch (Exception e){
            log.error("Error while authenticating and generating token {}",e.getMessage());
            return Map.of("message","Incorrect Username or Password");
        }
    }
}
