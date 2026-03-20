package com.div.ExpenseTracker.Util;

import com.div.ExpenseTracker.Entity.ProfileEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class AuthUtils {

    @Value("${jwt.secretKey}")
    private String secretKey;

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String email){
        return Jwts.builder()
                .subject(email)
                .claim("Email",email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+ 1000*60*5))
                .signWith(getSecretKey())
                .compact();
    }

    public String getEmailFromToken(String token){
        Claims claims =Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }


}
