package com.farmxchain.controller;

import com.farmxchain.service.GeminiService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gemini")
public class GeminiController {

    private final GeminiService geminiService;

    // Constructor injection of GeminiService
    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    // GET endpoint to send a prompt to Gemini and get a response
    @GetMapping("/ask")
    public String ask(@RequestParam String prompt) {
        return geminiService.askGemini(prompt);
    }
}
