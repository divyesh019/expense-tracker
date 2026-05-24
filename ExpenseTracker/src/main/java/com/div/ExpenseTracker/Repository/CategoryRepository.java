package com.div.ExpenseTracker.Repository;

import com.div.ExpenseTracker.Entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {

    List<CategoryEntity> findByProfileEntity_IdOrderByNameAsc(Long profileId);

    Optional<CategoryEntity> findByIdAndProfileEntity_Id(Long id, Long profileId);

    boolean existsByIdAndProfileEntity_Id(Long id, Long profileId);

    boolean existsByProfileEntity_IdAndNameIgnoreCase(Long profileId, String name);

    boolean existsByProfileEntity_IdAndNameIgnoreCaseAndIdNot(Long profileId, String name, Long id);
}
