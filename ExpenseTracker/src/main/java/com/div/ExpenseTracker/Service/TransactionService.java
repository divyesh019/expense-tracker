package com.div.ExpenseTracker.Service;

import com.div.ExpenseTracker.Dto.TransactionRequestDto;
import com.div.ExpenseTracker.Dto.TransactionResponseDto;
import com.div.ExpenseTracker.Entity.CategoryEntity;
import com.div.ExpenseTracker.Entity.ProfileEntity;
import com.div.ExpenseTracker.Entity.TransactionEntity;
import com.div.ExpenseTracker.Entity.TransactionType;
import com.div.ExpenseTracker.Repository.CategoryRepository;
import com.div.ExpenseTracker.Repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public TransactionResponseDto create(TransactionType type, TransactionRequestDto dto) {
        validateRequest(dto);
        ProfileEntity profile = currentProfile();
        TransactionEntity entity = TransactionEntity.builder()
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .transactionDate(dto.getTransactionDate())
                .type(type)
                .profileEntity(profile)
                .categoryEntity(resolveCategory(profile, dto.getCategoryId()))
                .build();
        transactionRepository.save(entity);
        return toDto(entity);
    }

    public List<TransactionResponseDto> findAllForCurrentUser(TransactionType type) {
        Long profileId = currentProfile().getId();
        return transactionRepository
                .findByProfileEntity_IdAndTypeOrderByTransactionDateDescCreatedAtDesc(profileId, type)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public Optional<TransactionResponseDto> findById(Long id, TransactionType type) {
        Long profileId = currentProfile().getId();
        return transactionRepository.findByIdAndProfileEntity_IdAndType(id, profileId, type).map(this::toDto);
    }

    public Optional<TransactionResponseDto> update(Long id, TransactionType type, TransactionRequestDto dto) {
        validateRequest(dto);
        ProfileEntity profile = currentProfile();
        return transactionRepository.findByIdAndProfileEntity_IdAndType(id, profile.getId(), type).map(
                entity -> {
                    entity.setAmount(dto.getAmount());
                    entity.setDescription(dto.getDescription());
                    entity.setTransactionDate(dto.getTransactionDate());
                    entity.setCategoryEntity(resolveCategory(profile, dto.getCategoryId()));
                    transactionRepository.save(entity);
                    return toDto(entity);
                }
        );
    }

    public boolean delete(Long id, TransactionType type) {
        Long profileId = currentProfile().getId();
        if (!transactionRepository.existsByIdAndProfileEntity_IdAndType(id, profileId, type)) {
            return false;
        }
        transactionRepository.deleteById(id);
        return true;
    }

    private void validateRequest(TransactionRequestDto dto) {
        if (dto.getAmount() == null || dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be positive");
        }
        if (dto.getTransactionDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction date is required");
        }
    }

    private ProfileEntity currentProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof ProfileEntity profile)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return profile;
    }

    private CategoryEntity resolveCategory(ProfileEntity profile, Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        CategoryEntity category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));
        if (category.getProfileEntity() != null
                && !category.getProfileEntity().getId().equals(profile.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category does not belong to current user");
        }
        return category;
    }

    private TransactionResponseDto toDto(TransactionEntity entity) {
        CategoryEntity cat = entity.getCategoryEntity();
        return TransactionResponseDto.builder()
                .id(entity.getId())
                .amount(entity.getAmount())
                .description(entity.getDescription())
                .transactionDate(entity.getTransactionDate())
                .type(entity.getType())
                .categoryId(cat != null ? cat.getId() : null)
                .categoryName(cat != null ? cat.getName() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
