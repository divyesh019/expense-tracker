package com.div.ExpenseTracker.Controller;

import com.div.ExpenseTracker.Dto.TransactionRequestDto;
import com.div.ExpenseTracker.Dto.TransactionResponseDto;
import com.div.ExpenseTracker.Entity.TransactionType;
import com.div.ExpenseTracker.Service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/expenses")
public class ExpenseController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponseDto> createExpense(@RequestBody TransactionRequestDto dto) {
        TransactionResponseDto created = transactionService.create(TransactionType.EXPENSE, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponseDto>> getAllExpenses() {
        return ResponseEntity.ok(transactionService.findAllForCurrentUser(TransactionType.EXPENSE));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponseDto> getExpenseById(@PathVariable Long id) {
        return transactionService.findById(id, TransactionType.EXPENSE)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponseDto> updateExpense(
            @PathVariable Long id,
            @RequestBody TransactionRequestDto dto) {
        return transactionService.update(id, TransactionType.EXPENSE, dto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        if (transactionService.delete(id, TransactionType.EXPENSE)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
