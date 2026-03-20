package com.div.ExpenseTracker.Security;


import com.div.ExpenseTracker.Entity.ProfileEntity;
import com.div.ExpenseTracker.Repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final ProfileRepository profileRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        ProfileEntity profileEntity = profileRepository.findByEmail(email).orElse(null);
        if(profileEntity!=null){
            return User.builder()
                    .username(profileEntity.getEmail())
                    .password(profileEntity.getPassword())
                    .authorities(Collections.emptyList())
                    .build();
        }
        throw new UsernameNotFoundException("User not found with email : " + email);

    }
}
