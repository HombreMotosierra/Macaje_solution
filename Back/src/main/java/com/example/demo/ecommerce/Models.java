package com.example.demo.ecommerce;

import java.util.List;

record CategoryView(
    Long id,
    String name,
    String slug,
    String description,
    String imageUrl,
    boolean featured
) {}

record ProductCardView(
    Long id,
    String name,
    String slug,
    String detail,
    String technicalSheet,
    Integer stock,
    boolean inStock,
    String imageUrl,
    boolean weeklyOffer,
    Integer discountPercent,
    String offerDeadline,
    String categoryName,
    String categorySlug
) {}

record ProductDetailView(
    Long id,
    String name,
    String slug,
    String detail,
    String technicalSheet,
    Integer stock,
    boolean inStock,
    String imageUrl,
    boolean weeklyOffer,
    Integer discountPercent,
    String offerDeadline,
    boolean active,
    boolean featured,
    String categoryName,
    String categorySlug,
    List<String> imageUrls
) {}

record TicketItemRequest(Long productId, Integer quantity) {}

record CreateTicketRequest(
    String customerName,
    String customerPhone,
    String customerEmail,
    String customerDocument,
    String companyName,
    String deliveryType,
    String deliveryAddress,
    String deliveryCity,
    String deliveryReference,
    String preferredContactTime,
    String notes,
    List<TicketItemRequest> items
) {}

record TicketItemResponse(
    Long productId,
    String productName,
    Integer quantity,
    boolean inStock
) {}

record TicketResponse(
    String ticketCode,
    String status,
    String whatsappLink,
    List<TicketItemResponse> items
) {}

record TicketView(
    Long id,
    String ticketCode,
    String customerName,
    String customerPhone,
    String customerEmail,
    String customerDocument,
    String companyName,
    String deliveryType,
    String deliveryAddress,
    String deliveryCity,
    String deliveryReference,
    String preferredContactTime,
    String status,
    String notes,
    String whatsappLink,
    String createdAt,
    List<TicketItemResponse> items
) {}

record CreateProductRequest(
    String categorySlug,
    String name,
    String slug,
    String detail,
    String technicalSheet,
    Integer stock,
    String imageUrl,
    List<String> imageUrls,
    Boolean featured,
    Boolean weeklyOffer,
    Integer discountPercent,
    String offerDeadline
) {}

record CreateCategoryRequest(
    String name,
    String slug,
    String description,
    String imageUrl,
    Boolean featured
) {}

record UpdateCategoryRequest(
    String name,
    String slug,
    String description,
    String imageUrl,
    Boolean featured,
    Boolean active
) {}

record AdminActionResponse(String message) {}

record UpdateProductRequest(
    String categorySlug,
    String name,
    String slug,
    String detail,
    String technicalSheet,
    Integer stock,
    String imageUrl,
    List<String> imageUrls,
    Boolean active,
    Boolean featured,
    Boolean weeklyOffer,
    Integer discountPercent,
    String offerDeadline
) {}

record CreateAdminUserRequest(
    String name,
    String email,
    String password,
    String roleName
) {}

record AdminUserView(
    Long id,
    String name,
    String email,
    String roleName,
    boolean active
) {}

record UpdateTicketStatusRequest(String status) {}

record LoginRequest(String email, String password) {}

record LoginResponse(
    String token,
    String tokenType,
    long expiresAt,
    String name,
    String email,
    String roleName
) {}

record AuthUserView(
    Long id,
    String name,
    String email,
    String roleName
) {}

record AuditView(
    Long id,
    String action,
    String detail,
    String actorName,
    String actorEmail,
    String createdAt
) {}

record UploadResponse(
    String fileName,
    String url,
    long size
) {}

record BrandingView(
    String storeName,
    String tagline,
    String logoUrl
) {}

record UpdateBrandingRequest(
    String storeName,
    String tagline,
    String logoUrl
) {}

record CarouselConfigView(
    int intervalMs,
    String effect,
    String slide1BgImage,
    String slide2BgImage
) {}

record SaveCarouselConfigRequest(
    Integer intervalMs,
    String effect,
    String slide1BgImage,
    String slide2BgImage
) {}

record UpdateAdminUserRequest(
    String name,
    String email,
    String roleName,
    String password,
    Boolean active
) {}

record HeroSlideView(
    String eyebrow,
    String title,
    String text,
    String cta,
    String bgImageUrl
) {}

record SiteTextItemView(
    String id,
    String label,
    String helper,
    String value
) {}

record PromoBannerView(
    String eyebrow,
    String title,
    String text,
    String bgColor,
    String textColor,
    String imageUrl
) {}

record ThemeTokenView(
    String id,
    String label,
    String type,
    String value
) {}

record SiteContentView(
    String searchPlaceholder,
    String homeCategoriesKicker,
    String homeCategoriesTitle,
    String homeProductsKicker,
    String homeProductsTitle,
    String themeFontPreset,
    String headingFontPreset,
    String headingColor,
    String bodyTextColor,
    String homePromoPrimaryEyebrow,
    String homePromoPrimaryTitle,
    String homePromoPrimaryText,
    String homePromoPrimaryBgColor,
    String homePromoPrimaryTextColor,
    String homePromoSecondaryEyebrow,
    String homePromoSecondaryTitle,
    String homePromoSecondaryText,
    String homePromoSecondaryBgColor,
    String homePromoSecondaryTextColor,
    String adminIntroText,
    List<SiteTextItemView> textItems,
    List<PromoBannerView> promoBanners,
    List<ThemeTokenView> themeTokens,
    String customCss,
    List<HeroSlideView> heroSlides
) {}

record SaveSiteContentRequest(
    String searchPlaceholder,
    String homeCategoriesKicker,
    String homeCategoriesTitle,
    String homeProductsKicker,
    String homeProductsTitle,
    String themeFontPreset,
    String headingFontPreset,
    String headingColor,
    String bodyTextColor,
    String homePromoPrimaryEyebrow,
    String homePromoPrimaryTitle,
    String homePromoPrimaryText,
    String homePromoPrimaryBgColor,
    String homePromoPrimaryTextColor,
    String homePromoSecondaryEyebrow,
    String homePromoSecondaryTitle,
    String homePromoSecondaryText,
    String homePromoSecondaryBgColor,
    String homePromoSecondaryTextColor,
    String adminIntroText,
    List<SiteTextItemView> textItems,
    List<PromoBannerView> promoBanners,
    List<ThemeTokenView> themeTokens,
    String customCss,
    List<HeroSlideView> heroSlides
) {}
