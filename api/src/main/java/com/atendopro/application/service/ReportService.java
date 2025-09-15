package com.atendopro.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.*;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;

@Service
@RequiredArgsConstructor
public class ReportService {
    public byte[] financePdfStub() {
        try (var baos = new ByteArrayOutputStream()) {
            Document doc = new Document();
            PdfWriter.getInstance(doc, baos);
            doc.open();
            doc.add(new Paragraph("Relatório Financeiro (stub)"));
            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String financeCsvStub() {
        return "mes,total_recebido,total_pendente\n2025-08,1200.00,200.00\n";
    }
}