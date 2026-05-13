package com.div.ExpenseTracker.Service;

import com.div.ExpenseTracker.Entity.ProfileEntity;
import com.div.ExpenseTracker.Entity.TransactionEntity;
import com.div.ExpenseTracker.Repository.TransactionRepository;
import com.div.ExpenseTracker.Util.ExcelUtility;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelService {

    private final TransactionRepository transactionRepository;

    public ByteArrayInputStream getExcelData() throws IOException {
        ProfileEntity profile = currentProfile();
        Long profileId = profile.getId();
        List<TransactionEntity> transactionEntities =
                transactionRepository.findAllByProfileEntity_Id(profileId);

        return ExcelUtility.dataToExcel(transactionEntities);
    }


    private ProfileEntity currentProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof ProfileEntity profile)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return profile;
    }

}
