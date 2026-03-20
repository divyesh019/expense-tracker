package com.div.ExpenseTracker.Security;


import com.div.ExpenseTracker.Entity.ProfileEntity;
import com.div.ExpenseTracker.Repository.ProfileRepository;
import com.div.ExpenseTracker.Util.AuthUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final ProfileRepository profileRepository;
    private final AuthUtils authUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        log.info("Incoming request : {}",request.getRequestURI());
        final String requestTokenHeader = request.getHeader("Authorization");

        if(requestTokenHeader == null || !requestTokenHeader.startsWith("Bearer ")){
            filterChain.doFilter(request,response);
            return;
        }
        String token = requestTokenHeader.split("Bearer ")[1];
        String userEmail = authUtils.getEmailFromToken(token);

        if(userEmail!=null && SecurityContextHolder.getContext().getAuthentication()==null){
            ProfileEntity profileEntity = profileRepository.findByEmail(userEmail).orElseThrow();
            UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                    new UsernamePasswordAuthenticationToken(profileEntity,null,profileEntity.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
        }
        filterChain.doFilter(request,response);
    }
}
