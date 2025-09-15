package com.atendopro.api.controller;

import com.atendopro.application.service.ReportService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService svc;

    public ReportController(ReportService s) {
        this.svc = s;
    }

    @GetMapping(value = "/finance.csv", produces = MediaType.TEXT_PLAIN_VALUE)
    public String csv() {
        return svc.financeCsvStub();
    }

    @GetMapping(value = "/finance.pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> pdf() {
        return ResponseEntity.ok(svc.financePdfStub());
    }
}