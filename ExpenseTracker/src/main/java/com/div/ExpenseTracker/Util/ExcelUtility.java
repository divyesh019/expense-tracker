package com.div.ExpenseTracker.Util;


import com.div.ExpenseTracker.Entity.TransactionEntity;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Slf4j
@Configuration
public class ExcelUtility {

    public static String[] HEADERS = {"Date","Description","Amount","Type"};

    public static String SHEET_NAME = "expense_report";

    public static ByteArrayInputStream dataToExcel(List<TransactionEntity> list) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try{

             Sheet sheet = workbook.createSheet(SHEET_NAME);
             Row row = sheet.createRow(0);

             //header row
             for(int i=0;i<HEADERS.length;i++){
                 Cell cell = row.createCell(i);
                 cell.setCellValue(HEADERS[i]);
             }
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(workbook.getCreationHelper().createDataFormat().getFormat("dd-MM-yyyy"));
             //value rows
             int rowIndex = 1;
             for(TransactionEntity transactionEntity : list){
                 Row dataRow = sheet.createRow(rowIndex++);
                 Cell dateCell = dataRow.createCell(0);
                 dateCell.setCellValue(transactionEntity.getTransactionDate());
                 dateCell.setCellStyle(dateStyle);

                 dataRow.createCell(1).setCellValue(transactionEntity.getDescription());
                 dataRow.createCell(2).setCellValue(transactionEntity.getAmount().doubleValue());
                 dataRow.createCell(3).setCellValue(transactionEntity.getType().toString());
             }

             workbook.write(outputStream);
             return new ByteArrayInputStream(outputStream.toByteArray());

         }catch(Exception e){
             log.error("Error in creating excel: {} ",e.getMessage());
             return null;
         }
         finally {
             workbook.close();
             outputStream.close();
         }


    }
}
