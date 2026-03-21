package com.example.demo.ecommerce;

import java.util.List;
import java.util.Set;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final EcommerceService ecommerceService;
    private final AdminAuthService adminAuthService;
    private final FileStorageService fileStorageService;

    public AdminController(
        EcommerceService ecommerceService,
        AdminAuthService adminAuthService,
        FileStorageService fileStorageService
    ) {
        this.ecommerceService = ecommerceService;
        this.adminAuthService = adminAuthService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/usuarios")
    public List<AdminUserView> listUsers(
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN")
        );
        return ecommerceService.listAdminUsers(authUser.email());
    }

    @PostMapping("/usuarios")
    public AdminUserView createAdminUser(
        @RequestBody CreateAdminUserRequest request,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN")
        );
        String adminEmail = authUser.email();
        return ecommerceService.createAdminUser(request, adminEmail);
    }

    @PostMapping("/productos")
    public ProductDetailView createProduct(
        @RequestBody CreateProductRequest request,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        String adminEmail = authUser.email();
        return ecommerceService.createProduct(request, adminEmail);
    }

    @DeleteMapping("/productos/{id}")
    public AdminActionResponse deleteProduct(
        @PathVariable Long id,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        return ecommerceService.deactivateProduct(id, authUser.email());
    }

    @PostMapping("/productos/{id}/eliminar")
    public AdminActionResponse deleteProductWithPost(
        @PathVariable Long id,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        return ecommerceService.deactivateProduct(id, authUser.email());
    }

    @PostMapping("/categorias")
    public CategoryView createCategory(
        @RequestBody CreateCategoryRequest request,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        return ecommerceService.createCategory(request, authUser.email());
    }

    @DeleteMapping("/categorias/{slug}")
    public AdminActionResponse deleteCategory(
        @PathVariable String slug,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        return ecommerceService.deactivateCategory(slug, authUser.email());
    }

    @PostMapping("/categorias/{slug}/eliminar")
    public AdminActionResponse deleteCategoryWithPost(
        @PathVariable String slug,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        return ecommerceService.deactivateCategory(slug, authUser.email());
    }

    @PutMapping("/categorias/{slug}")
    public CategoryView updateCategory(
        @PathVariable String slug,
        @RequestBody UpdateCategoryRequest request,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        return ecommerceService.updateCategory(slug, request, authUser.email());
    }

    @PutMapping("/productos/{id}")
    public ProductDetailView updateProduct(
        @PathVariable Long id,
        @RequestBody UpdateProductRequest request,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        String adminEmail = authUser.email();
        return ecommerceService.updateProduct(id, request, adminEmail);
    }

    @PutMapping("/usuarios/{id}")
    public AdminUserView updateUser(
        @PathVariable Long id,
        @RequestBody UpdateAdminUserRequest request,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN")
        );
        return ecommerceService.updateAdminUser(id, request, authUser.email());
    }

    @PostMapping("/usuarios/{id}/desactivar")
    public AdminUserView deactivateUser(
        @PathVariable Long id,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN")
        );
        return ecommerceService.toggleAdminUser(id, false, authUser.email());
    }

    @PostMapping("/usuarios/{id}/activar")
    public AdminUserView activateUser(
        @PathVariable Long id,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN")
        );
        return ecommerceService.toggleAdminUser(id, true, authUser.email());
    }

    @DeleteMapping("/usuarios/{id}")
    public AdminActionResponse deleteUser(
        @PathVariable Long id,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN")
        );
        return ecommerceService.deleteAdminUser(id, authUser.email());
    }

    @PostMapping("/usuarios/{id}/eliminar")
    public AdminActionResponse deleteUserWithPost(
        @PathVariable Long id,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN")
        );
        return ecommerceService.deleteAdminUser(id, authUser.email());
    }

    @GetMapping("/carrusel")
    public CarouselConfigView getCarouselConfig(
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        return ecommerceService.getCarouselConfig();
    }

    @PutMapping("/carrusel")
    public CarouselConfigView saveCarouselConfig(
        @RequestBody SaveCarouselConfigRequest request,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        return ecommerceService.saveCarouselConfig(request, authUser.email());
    }

    @GetMapping("/contenido")
    public SiteContentView getSiteContent(
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        return ecommerceService.getSiteContent();
    }

    @PutMapping("/contenido")
    public SiteContentView saveSiteContent(
        @RequestBody SaveSiteContentRequest request,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        return ecommerceService.saveSiteContent(request, authUser.email());
    }

    @GetMapping("/tickets")
    public List<TicketView> listTickets(
        @RequestHeader("Authorization") String authorizationHeader,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String q
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        return ecommerceService.listTickets(authUser.email(), status, q);
    }

    @PatchMapping("/tickets/{code}/estado")
    public TicketView updateTicketStatus(
        @PathVariable String code,
        @RequestBody UpdateTicketStatusRequest request,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN")
        );
        String adminEmail = authUser.email();
        return ecommerceService.updateTicketStatus(code, request, adminEmail);
    }

    @GetMapping("/auditoria")
    public List<AuditView> listAudit(
        @RequestHeader("Authorization") String authorizationHeader,
        @RequestParam(defaultValue = "100") Integer limit
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN")
        );
        return ecommerceService.listAudits(authUser.email(), limit);
    }

    @PostMapping("/uploads/imagen")
    public UploadResponse uploadImage(
        @RequestHeader("Authorization") String authorizationHeader,
        @RequestParam("file") MultipartFile file
    ) {
        adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        return fileStorageService.storeImage(file);
    }

    @GetMapping("/branding")
    public BrandingView getBranding(@RequestHeader("Authorization") String authorizationHeader) {
        adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER")
        );
        return ecommerceService.branding();
    }

    @PutMapping("/branding")
    public BrandingView updateBranding(
        @RequestBody UpdateBrandingRequest request,
        @RequestHeader("Authorization") String authorizationHeader
    ) {
        AuthUserView authUser = adminAuthService.requireAuthenticatedAdmin(
            authorizationHeader,
            Set.of("SUPER_ADMIN")
        );
        return ecommerceService.updateBranding(request, authUser.email());
    }
}
