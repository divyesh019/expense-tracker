package com.div.ExpenseTracker.Service;

import com.div.ExpenseTracker.Dto.CategoryRequestDto;
import com.div.ExpenseTracker.Dto.CategoryResponseDto;
import com.div.ExpenseTracker.Entity.CategoryEntity;
import com.div.ExpenseTracker.Repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryResponseDto createCategory(CategoryRequestDto categoryRequestDto) {
        CategoryEntity category = toEntity(categoryRequestDto);
        categoryRepository.save(category);
        return toDto(category);
    }

    public List<CategoryResponseDto> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public Optional<CategoryResponseDto> getCategoryById(Long id) {
        return categoryRepository.findById(id).map(this::toDto);
    }

    public Optional<CategoryResponseDto> updateCategory(Long id, CategoryRequestDto categoryRequestDto) {
        return categoryRepository.findById(id).map(
                category -> {
                    category.setName(categoryRequestDto.getName());
                    category.setDescription(categoryRequestDto.getDescription());
                    categoryRepository.save(category);
                    return toDto(category);
                }
        );
    }

    public boolean deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            return false;
        }
        categoryRepository.deleteById(id);
        return true;
    }

    private CategoryEntity toEntity(CategoryRequestDto categoryRequestDto) {
        return CategoryEntity.builder()
                .name(categoryRequestDto.getName())
                .description(categoryRequestDto.getDescription())
                .build();
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
