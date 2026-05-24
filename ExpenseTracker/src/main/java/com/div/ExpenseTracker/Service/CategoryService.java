package com.div.ExpenseTracker.Service;

import com.div.ExpenseTracker.Dto.CategoryRequestDto;
import com.div.ExpenseTracker.Dto.CategoryResponseDto;
import com.div.ExpenseTracker.Entity.CategoryEntity;
import com.div.ExpenseTracker.Entity.ProfileEntity;
import com.div.ExpenseTracker.Repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryResponseDto createCategory(CategoryRequestDto categoryRequestDto) {
        ProfileEntity profile = currentProfile();
        validateName(categoryRequestDto.getName());
        if (categoryRepository.existsByProfileEntity_IdAndNameIgnoreCase(profile.getId(), categoryRequestDto.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You already have a category with this name");
        }
        CategoryEntity category = CategoryEntity.builder()
                .name(categoryRequestDto.getName().trim())
                .description(categoryRequestDto.getDescription())
                .profileEntity(profile)
                .build();
        categoryRepository.save(category);
        return toDto(category);
    }

    public List<CategoryResponseDto> getAllCategories() {
        Long profileId = currentProfile().getId();
        return categoryRepository.findByProfileEntity_IdOrderByNameAsc(profileId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public Optional<CategoryResponseDto> getCategoryById(Long id) {
        Long profileId = currentProfile().getId();
        return categoryRepository.findByIdAndProfileEntity_Id(id, profileId).map(this::toDto);
    }

    public Optional<CategoryResponseDto> updateCategory(Long id, CategoryRequestDto categoryRequestDto) {
        ProfileEntity profile = currentProfile();
        validateName(categoryRequestDto.getName());
        return categoryRepository.findByIdAndProfileEntity_Id(id, profile.getId()).map(
                category -> {
                    if (categoryRepository.existsByProfileEntity_IdAndNameIgnoreCaseAndIdNot(
                            profile.getId(), categoryRequestDto.getName(), id)) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You already have a category with this name");
                    }
                    category.setName(categoryRequestDto.getName().trim());
                    category.setDescription(categoryRequestDto.getDescription());
                    categoryRepository.save(category);
                    return toDto(category);
                }
        );
    }

    public boolean deleteCategory(Long id) {
        Long profileId = currentProfile().getId();
        if (!categoryRepository.existsByIdAndProfileEntity_Id(id, profileId)) {
            return false;
        }
        categoryRepository.deleteById(id);
        return true;
    }

    private void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name is required");
        }
    }

    private ProfileEntity currentProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof ProfileEntity profile)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return profile;
    }

    private CategoryResponseDto toDto(CategoryEntity categoryEntity) {
        return CategoryResponseDto.builder()
                .id(categoryEntity.getId())
                .name(categoryEntity.getName())
                .description(categoryEntity.getDescription())
                .createdAt(categoryEntity.getCreatedAt())
                .updatedAt(categoryEntity.getUpdatedAt())
                .build();
    }
}
