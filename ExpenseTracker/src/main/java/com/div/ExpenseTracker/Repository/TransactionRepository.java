package com.div.ExpenseTracker.Repository;

import com.div.ExpenseTracker.Entity.TransactionEntity;
import com.div.ExpenseTracker.Entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {

    List<TransactionEntity> findByProfileEntity_IdAndTypeOrderByTransactionDateDescCreatedAtDesc(
            Long profileId, TransactionType type);

    Optional<TransactionEntity> findByIdAndProfileEntity_IdAndType(
            Long id, Long profileId, TransactionType type);

    boolean existsByIdAndProfileEntity_IdAndType(Long id, Long profileId, TransactionType type);

    long countByProfileEntity_IdAndType(Long profileId, TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM TransactionEntity t WHERE t.profileEntity.id = :profileId AND t.type = :type")
    BigDecimal sumAmountByProfileAndType(@Param("profileId") Long profileId, @Param("type") TransactionType type);

    @Query("""
            SELECT COALESCE(c.name, 'Uncategorized'), COALESCE(SUM(t.amount), 0)
            FROM TransactionEntity t
            LEFT JOIN t.categoryEntity c
            WHERE t.profileEntity.id = :profileId AND t.type = :type
            GROUP BY c.id, c.name
            ORDER BY SUM(t.amount) DESC
            """)
    List<Object[]> sumByCategoryForProfileAndType(
            @Param("profileId") Long profileId, @Param("type") TransactionType type);
}
