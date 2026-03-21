package com.example.demo.ecommerce;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/store")
public class StoreController {

    private final EcommerceService ecommerceService;

    public StoreController(EcommerceService ecommerceService) {
        this.ecommerceService = ecommerceService;
    }

    @GetMapping("/home")
    public Map<String, Object> home() {
        return ecommerceService.home();
    }

    @GetMapping("/categorias")
    public List<CategoryView> categories() {
        return ecommerceService.categories();
    }

    @GetMapping("/categorias/{slug}/productos")
    public List<ProductCardView> productsByCategory(@PathVariable String slug) {
        return ecommerceService.productsByCategory(slug);
    }

    @GetMapping("/productos/{id}")
    public ProductDetailView productById(@PathVariable Long id) {
        return ecommerceService.productById(id);
    }

    @PostMapping("/tickets")
    public TicketResponse createTicket(@RequestBody CreateTicketRequest request) {
        return ecommerceService.createTicket(request);
    }

    @GetMapping("/branding")
    public BrandingView branding() {
        return ecommerceService.branding();
    }
}
