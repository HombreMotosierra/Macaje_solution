package com.example.demo.ecommerce;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class EcommerceInitializer {

    private final EcommerceService ecommerceService;

    public EcommerceInitializer(EcommerceService ecommerceService) {
        this.ecommerceService = ecommerceService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        ecommerceService.initialize();
    }
}
