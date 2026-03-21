package com.example.demo.ecommerce;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EcommerceService {

    private static final Set<String> ADMIN_ALLOWED_ROLES = Set.of("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");
    private static final Set<String> SUPER_ADMIN_ONLY = Set.of("SUPER_ADMIN");

    private final JdbcTemplate jdbcTemplate;
    private final String whatsappNumber;
    private final EmailService emailService;
    private final PasswordService passwordService;

    public EcommerceService(
        JdbcTemplate jdbcTemplate,
        @Value("${app.whatsapp.number:573001112233}") String whatsappNumber,
        EmailService emailService,
        PasswordService passwordService
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.whatsappNumber = whatsappNumber;
        this.emailService = emailService;
        this.passwordService = passwordService;
    }

    @Transactional
    public void initialize() {
        createTables();
        ensureColumns();
        createIndexes();
        seedBaseData();
        migratePasswordsIfNeeded();
    }

    public Map<String, Object> home() {
        BrandingView branding = branding();
        SiteContentView siteContent = getSiteContent();
        CarouselConfigView carouselConfig = getCarouselConfig();
        List<CategoryView> featuredCategories = jdbcTemplate.query(
            """
            SELECT id, nombre, slug, descripcion, imagen_url, destacada
            FROM categorias
            WHERE activo = true
            ORDER BY destacada DESC, nombre ASC
            LIMIT 8
            """,
            categoryRowMapper()
        );

        List<ProductCardView> featuredProducts = jdbcTemplate.query(
            """
             SELECT p.id, p.nombre, p.slug, p.detalle, p.ficha_tecnica, p.stock, p.imagen_url,
                                 p.oferta_semanal, p.descuento_porcentaje, p.oferta_fecha_limite,
                                     c.nombre AS categoria_nombre, c.slug AS categoria_slug
                        FROM productos p
                        JOIN categorias c ON c.id = p.categoria_id
                        WHERE p.activo = true
                        ORDER BY p.destacado DESC, p.created_at DESC
                        LIMIT 12
            """,
            productCardRowMapper()
        );

         List<ProductCardView> weeklyOffers = jdbcTemplate.query(
             """
             SELECT p.id, p.nombre, p.slug, p.detalle, p.ficha_tecnica, p.stock, p.imagen_url,
                 p.oferta_semanal, p.descuento_porcentaje, p.oferta_fecha_limite,
                 c.nombre AS categoria_nombre, c.slug AS categoria_slug
             FROM productos p
             JOIN categorias c ON c.id = p.categoria_id
             WHERE p.activo = true
            AND p.oferta_semanal = true
            AND coalesce(p.descuento_porcentaje, 0) > 0
            AND (p.oferta_fecha_limite IS NULL OR p.oferta_fecha_limite > now())
             ORDER BY p.descuento_porcentaje DESC, p.updated_at DESC
             LIMIT 8
             """,
             productCardRowMapper()
         );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("storeName", branding.storeName());
        response.put("branding", branding);
        response.put("siteContent", siteContent);
        response.put("featuredCategories", featuredCategories);
        response.put("featuredProducts", featuredProducts);
        response.put("weeklyOffers", weeklyOffers);
        response.put("whatsapp", corporateWhatsappLink("Quiero%20mas%20informacion%20del%20catalogo"));
        response.put("carouselConfig", carouselConfig);
        response.put("serverTime", Instant.now().toString());
        return response;
    }

    public BrandingView branding() {
        String storeName = getConfigValue("store.name", "ATR Group");
        String tagline = getConfigValue("store.tagline", "Impulsando con tecnologia");
        String logoUrl = getConfigValue("store.logo_url", "/logo.jpeg");
        return new BrandingView(storeName, tagline, logoUrl);
    }

    public List<CategoryView> categories() {
        return jdbcTemplate.query(
            """
            SELECT id, nombre, slug, descripcion, imagen_url, destacada
            FROM categorias
            WHERE activo = true
            ORDER BY destacada DESC, nombre ASC
            """,
            categoryRowMapper()
        );
    }

    public List<ProductCardView> productsByCategory(String categorySlug) {
        Long categoryId = jdbcTemplate.queryForObject(
            "SELECT id FROM categorias WHERE slug = ? AND activo = true",
            Long.class,
            normalizeSlug(categorySlug)
        );

        if (categoryId == null) {
            throw new ApiException(404, "Categoria no encontrada");
        }

        return jdbcTemplate.query(
            """
             SELECT p.id, p.nombre, p.slug, p.detalle, p.ficha_tecnica, p.stock, p.imagen_url,
                                 p.oferta_semanal, p.descuento_porcentaje, p.oferta_fecha_limite,
                                     c.nombre AS categoria_nombre, c.slug AS categoria_slug
                        FROM productos p
                        JOIN categorias c ON c.id = p.categoria_id
                        WHERE p.categoria_id = ? AND p.activo = true
            ORDER BY p.destacado DESC, p.created_at DESC
            """,
            productCardRowMapper(),
            categoryId
        );
    }

    public ProductDetailView productById(Long productId) {
        try {
            ProductDetailView base = jdbcTemplate.queryForObject(
                """
                  SELECT p.id, p.nombre, p.slug, p.detalle, p.ficha_tecnica, p.stock, p.imagen_url,
                      p.oferta_semanal, p.descuento_porcentaje, p.oferta_fecha_limite,
                       p.activo, p.destacado, c.nombre AS categoria_nombre, c.slug AS categoria_slug
                FROM productos p
                JOIN categorias c ON c.id = p.categoria_id
                WHERE p.id = ?
                """,
                (rs, rowNum) -> new ProductDetailView(
                    rs.getLong("id"),
                    rs.getString("nombre"),
                    rs.getString("slug"),
                    rs.getString("detalle"),
                    rs.getString("ficha_tecnica"),
                    rs.getInt("stock"),
                    rs.getInt("stock") > 0,
                    rs.getString("imagen_url"),
                    rs.getBoolean("oferta_semanal"),
                    rs.getInt("descuento_porcentaje"),
                    (rs.getTimestamp("oferta_fecha_limite") != null ? rs.getTimestamp("oferta_fecha_limite").toInstant().toString() : null),
                    rs.getBoolean("activo"),
                    rs.getBoolean("destacado"),
                    rs.getString("categoria_nombre"),
                    rs.getString("categoria_slug"),
                    List.of()
                ),
                productId
            );

            if (base == null) {
                throw new ApiException(404, "Producto no encontrado");
            }

            List<String> imageUrls = loadProductImageUrls(productId, base.imageUrl());
            return new ProductDetailView(
                base.id(),
                base.name(),
                base.slug(),
                base.detail(),
                base.technicalSheet(),
                base.stock(),
                base.inStock(),
                base.imageUrl(),
                base.weeklyOffer(),
                base.discountPercent(),
                base.offerDeadline(),
                base.active(),
                base.featured(),
                base.categoryName(),
                base.categorySlug(),
                imageUrls
            );
        } catch (EmptyResultDataAccessException exception) {
            throw new ApiException(404, "Producto no encontrado");
        }
    }

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new ApiException(400, "Debes seleccionar al menos un producto");
        }

        String ticketCode = generateTicketCode();
        String customerName = safeText(request.customerName(), 140, "El nombre es obligatorio");
        String customerPhone = safeText(request.customerPhone(), 40, "El telefono es obligatorio");
        String customerEmail = trimNullable(request.customerEmail());
        String customerDocument = safeText(request.customerDocument(), 60, "El documento de identificacion es obligatorio");
        String companyName = trimNullable(request.companyName());
        String deliveryType = parseDeliveryType(request.deliveryType());
        String deliveryAddress = trimNullable(request.deliveryAddress());
        String deliveryCity = trimNullable(request.deliveryCity());
        String deliveryReference = trimNullable(request.deliveryReference());
        String preferredContactTime = trimNullable(request.preferredContactTime());
        String notes = trimNullable(request.notes());

        if ("DOMICILIO".equals(deliveryType)) {
            deliveryAddress = safeText(deliveryAddress, 240, "La direccion de entrega es obligatoria para envio a domicilio");
            deliveryCity = safeText(deliveryCity, 120, "La ciudad de entrega es obligatoria para envio a domicilio");
        }

        String message = String.format(
            Locale.ROOT,
            "Hola, soy %s y quiero consultar el ticket %s (%s)",
            customerName,
            ticketCode,
            deliveryType
        );
        String whatsappLink = corporateWhatsappLink(urlEncode(message));

        Long ticketId;
        if (hasColumn("pedidos", "codigo_pedido")) {
            ticketId = jdbcTemplate.queryForObject(
                """
                INSERT INTO pedidos (
                    codigo_pedido, codigo_ticket, cliente_nombre, cliente_telefono, cliente_email,
                    cliente_documento, cliente_empresa, tipo_entrega, direccion_entrega, ciudad_entrega,
                    referencia_entrega, horario_contacto, estado, comentario, whatsapp_link, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NUEVO', ?, ?, now())
                RETURNING id
                """,
                Long.class,
                ticketCode,
                ticketCode,
                customerName,
                customerPhone,
                customerEmail,
                customerDocument,
                companyName,
                deliveryType,
                deliveryAddress,
                deliveryCity,
                deliveryReference,
                preferredContactTime,
                notes,
                whatsappLink
            );
        } else {
            ticketId = jdbcTemplate.queryForObject(
                """
                INSERT INTO pedidos (
                    codigo_ticket, cliente_nombre, cliente_telefono, cliente_email,
                    cliente_documento, cliente_empresa, tipo_entrega, direccion_entrega, ciudad_entrega,
                    referencia_entrega, horario_contacto, estado, comentario, whatsapp_link, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NUEVO', ?, ?, now())
                RETURNING id
                """,
                Long.class,
                ticketCode,
                customerName,
                customerPhone,
                customerEmail,
                customerDocument,
                companyName,
                deliveryType,
                deliveryAddress,
                deliveryCity,
                deliveryReference,
                preferredContactTime,
                notes,
                whatsappLink
            );
        }

        if (ticketId == null) {
            throw new ApiException(500, "No se pudo crear el ticket");
        }

        List<TicketItemResponse> persistedItems = new ArrayList<>();
        for (TicketItemRequest item : request.items()) {
            if (item.productId() == null || item.quantity() == null || item.quantity() <= 0) {
                throw new ApiException(400, "Producto o cantidad invalida en el ticket");
            }

            ProductSnapshot snapshot = jdbcTemplate.query(
                """
                SELECT id, nombre, stock
                FROM productos
                WHERE id = ? AND activo = true
                """,
                rs -> rs.next() ? new ProductSnapshot(rs.getLong("id"), rs.getString("nombre"), rs.getInt("stock")) : null,
                item.productId()
            );

            if (snapshot == null) {
                throw new ApiException(404, "Uno de los productos no existe o no esta activo");
            }

            jdbcTemplate.update(
                """
                INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, snapshot_nombre, snapshot_stock)
                VALUES (?, ?, ?, ?, ?)
                """,
                ticketId,
                snapshot.id(),
                item.quantity(),
                snapshot.name(),
                snapshot.stock()
            );

            persistedItems.add(new TicketItemResponse(snapshot.id(), snapshot.name(), item.quantity(), snapshot.stock() > 0));
        }

        List<String> adminEmails = getAllAdminEmails();
        emailService.sendTicketNotification(ticketCode, customerName, customerPhone, adminEmails);
        return new TicketResponse(ticketCode, "NUEVO", whatsappLink, persistedItems);
    }

    public List<TicketView> listTickets(String adminEmail, String status, String queryText) {
        ensureAdmin(adminEmail, ADMIN_ALLOWED_ROLES);

        String normalizedStatus = trimNullable(status);
        String normalizedQuery = trimNullable(queryText);

        boolean hasStatus = normalizedStatus != null && !normalizedStatus.isBlank();
        boolean hasQuery = normalizedQuery != null && !normalizedQuery.isBlank();

        if (hasStatus && hasQuery) {
            return jdbcTemplate.query(
                """
                                SELECT id, codigo_ticket, cliente_nombre, cliente_telefono, cliente_email,
                                             cliente_documento, cliente_empresa, tipo_entrega, direccion_entrega, ciudad_entrega,
                                             referencia_entrega, horario_contacto, estado, comentario, whatsapp_link, created_at
                FROM pedidos
                WHERE upper(estado) = upper(?)
                  AND (
                    lower(codigo_ticket) LIKE lower(?)
                    OR lower(cliente_nombre) LIKE lower(?)
                    OR lower(cliente_telefono) LIKE lower(?)
                                        OR lower(coalesce(cliente_documento, '')) LIKE lower(?)
                  )
                ORDER BY created_at DESC
                LIMIT 200
                """,
                this::mapTicket,
                normalizedStatus,
                "%" + normalizedQuery + "%",
                "%" + normalizedQuery + "%",
                                "%" + normalizedQuery + "%",
                                "%" + normalizedQuery + "%"
            );
        }

        if (hasStatus) {
            return jdbcTemplate.query(
                """
                  SELECT id, codigo_ticket, cliente_nombre, cliente_telefono, cliente_email,
                      cliente_documento, cliente_empresa, tipo_entrega, direccion_entrega, ciudad_entrega,
                      referencia_entrega, horario_contacto, estado, comentario, whatsapp_link, created_at
                FROM pedidos
                WHERE upper(estado) = upper(?)
                ORDER BY created_at DESC
                LIMIT 200
                """,
                this::mapTicket,
                normalizedStatus
            );
        }

        if (hasQuery) {
            return jdbcTemplate.query(
                """
                SELECT id, codigo_ticket, cliente_nombre, cliente_telefono, cliente_email,
                       cliente_documento, cliente_empresa, tipo_entrega, direccion_entrega, ciudad_entrega,
                       referencia_entrega, horario_contacto, estado, comentario, whatsapp_link, created_at
                FROM pedidos
                WHERE lower(codigo_ticket) LIKE lower(?)
                   OR lower(cliente_nombre) LIKE lower(?)
                   OR lower(cliente_telefono) LIKE lower(?)
                   OR lower(coalesce(cliente_documento, '')) LIKE lower(?)
                ORDER BY created_at DESC
                LIMIT 200
                """,
                this::mapTicket,
                "%" + normalizedQuery + "%",
                "%" + normalizedQuery + "%",
                "%" + normalizedQuery + "%",
                "%" + normalizedQuery + "%"
            );
        }

        return jdbcTemplate.query(
            """
            SELECT id, codigo_ticket, cliente_nombre, cliente_telefono, cliente_email,
                   cliente_documento, cliente_empresa, tipo_entrega, direccion_entrega, ciudad_entrega,
                   referencia_entrega, horario_contacto, estado, comentario, whatsapp_link, created_at
            FROM pedidos
            ORDER BY created_at DESC
            LIMIT 200
            """,
            this::mapTicket
        );
    }

    public List<AuditView> listAudits(String adminEmail, Integer limit) {
        ensureAdmin(adminEmail, Set.of("SUPER_ADMIN"));
        int safeLimit = limit == null ? 100 : Math.min(Math.max(limit, 1), 500);

        return jdbcTemplate.query(
            """
            SELECT a.id, a.accion, a.detalle, u.nombre AS actor_nombre, u.email AS actor_email, a.created_at
            FROM auditoria_admin a
            LEFT JOIN usuarios u ON u.id = a.usuario_id
            ORDER BY a.created_at DESC
            LIMIT ?
            """,
            (rs, rowNum) -> new AuditView(
                rs.getLong("id"),
                rs.getString("accion"),
                rs.getString("detalle"),
                rs.getString("actor_nombre"),
                rs.getString("actor_email"),
                rs.getTimestamp("created_at").toInstant().toString()
            ),
            safeLimit
        );
    }

    @Transactional
    public ProductDetailView createProduct(CreateProductRequest request, String adminEmail) {
        AdminContext admin = ensureAdmin(adminEmail, ADMIN_ALLOWED_ROLES);

        String categorySlug = safeText(request.categorySlug(), 120, "La categoria es obligatoria");
        Long categoryId = jdbcTemplate.query(
            "SELECT id FROM categorias WHERE slug = ? AND activo = true",
            rs -> rs.next() ? rs.getLong("id") : null,
            normalizeSlug(categorySlug)
        );

        if (categoryId == null) {
            throw new ApiException(400, "La categoria enviada no existe");
        }

        String name = safeText(request.name(), 180, "El nombre del producto es obligatorio");
        String slug = normalizeSlug(request.slug() == null || request.slug().isBlank() ? name : request.slug());
        List<String> imageUrls = sanitizeImageUrls(request.imageUrls());
        String coverImage = trimNullable(request.imageUrl());
        if ((coverImage == null || coverImage.isBlank()) && !imageUrls.isEmpty()) {
            coverImage = imageUrls.get(0);
        }
        boolean weeklyOffer = request.weeklyOffer() != null && request.weeklyOffer();
        int discountPercent = normalizeDiscountPercent(request.discountPercent());
        if (weeklyOffer && discountPercent <= 0) {
            throw new ApiException(400, "Una oferta semanal debe tener descuento mayor a 0");
        }
        java.sql.Timestamp offerDeadline = parseOfferDeadline(request.offerDeadline());

        Long productId = jdbcTemplate.queryForObject(
            """
            INSERT INTO productos (
                categoria_id, nombre, slug, detalle, ficha_tecnica, stock, imagen_url,
                activo, destacado, oferta_semanal, descuento_porcentaje, oferta_fecha_limite, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, true, ?, ?, ?, ?, now(), now())
            RETURNING id
            """,
            Long.class,
            categoryId,
            name,
            slug,
            trimNullable(request.detail()),
            trimNullable(request.technicalSheet()),
            request.stock() == null ? 0 : request.stock(),
            coverImage,
            request.featured() != null && request.featured(),
            weeklyOffer,
            discountPercent,
            offerDeadline
        );

        if (productId == null) {
            throw new ApiException(500, "No se pudo crear el producto");
        }

        replaceProductImages(productId, imageUrls, coverImage);

        audit(admin.id(), "CREATE_PRODUCT", "Producto creado: " + name);
        return productById(productId);
    }

    @Transactional
    public ProductDetailView updateProduct(Long productId, UpdateProductRequest request, String adminEmail) {
        AdminContext admin = ensureAdmin(adminEmail, ADMIN_ALLOWED_ROLES);

        ProductDetailView current = productById(productId);

        Long categoryId = jdbcTemplate.query(
            "SELECT id FROM categorias WHERE slug = ? AND activo = true",
            rs -> rs.next() ? rs.getLong("id") : null,
            normalizeSlug(request.categorySlug() == null ? current.categorySlug() : request.categorySlug())
        );

        if (categoryId == null) {
            throw new ApiException(400, "La categoria enviada no existe");
        }

        String name = request.name() == null || request.name().isBlank() ? current.name() : request.name().trim();
        String slug = normalizeSlug(request.slug() == null || request.slug().isBlank() ? current.slug() : request.slug());
        String detail = request.detail() == null ? current.detail() : request.detail().trim();
        String technicalSheet = request.technicalSheet() == null ? current.technicalSheet() : request.technicalSheet().trim();
        Integer stock = request.stock() == null ? current.stock() : request.stock();
        List<String> nextImageUrls = request.imageUrls() == null
            ? loadProductImageUrls(productId, current.imageUrl())
            : sanitizeImageUrls(request.imageUrls());
        String imageUrl = request.imageUrl() == null ? current.imageUrl() : request.imageUrl().trim();
        if ((imageUrl == null || imageUrl.isBlank()) && !nextImageUrls.isEmpty()) {
            imageUrl = nextImageUrls.get(0);
        }
        boolean active = request.active() == null ? current.active() : request.active();
        boolean featured = request.featured() == null ? current.featured() : request.featured();
        boolean weeklyOffer = request.weeklyOffer() == null ? current.weeklyOffer() : request.weeklyOffer();
        int discountPercent = request.discountPercent() == null
            ? normalizeDiscountPercent(current.discountPercent())
            : normalizeDiscountPercent(request.discountPercent());
        if (weeklyOffer && discountPercent <= 0) {
            throw new ApiException(400, "Una oferta semanal debe tener descuento mayor a 0");
        }
        // If request sends null deadline → keep existing; if blank string → clear it; otherwise parse new value
        java.sql.Timestamp offerDeadline = request.offerDeadline() == null
            ? (current.offerDeadline() != null ? java.sql.Timestamp.from(java.time.Instant.parse(current.offerDeadline())) : null)
            : parseOfferDeadline(request.offerDeadline());

        jdbcTemplate.update(
            """
            UPDATE productos
            SET categoria_id = ?, nombre = ?, slug = ?, detalle = ?, ficha_tecnica = ?, stock = ?,
                imagen_url = ?, activo = ?, destacado = ?, oferta_semanal = ?, descuento_porcentaje = ?,
                oferta_fecha_limite = ?, updated_at = now()
            WHERE id = ?
            """,
            categoryId,
            name,
            slug,
            detail,
            technicalSheet,
            stock,
            imageUrl,
            active,
            featured,
            weeklyOffer,
            discountPercent,
            offerDeadline,
            productId
        );

        replaceProductImages(productId, nextImageUrls, imageUrl);

        audit(admin.id(), "UPDATE_PRODUCT", "Producto actualizado ID " + productId);
        return productById(productId);
    }

    @Transactional
    public AdminActionResponse deactivateProduct(Long productId, String adminEmail) {
        AdminContext admin = ensureAdmin(adminEmail, ADMIN_ALLOWED_ROLES);

        String productName = jdbcTemplate.query(
            "SELECT nombre FROM productos WHERE id = ? AND activo = true",
            rs -> rs.next() ? rs.getString("nombre") : null,
            productId
        );

        if (productName == null) {
            throw new ApiException(404, "Producto no encontrado o ya inactivo");
        }

        jdbcTemplate.update(
            "UPDATE productos SET activo = false, updated_at = now() WHERE id = ?",
            productId
        );

        audit(admin.id(), "DELETE_PRODUCT", "Producto desactivado: " + productName + " (ID " + productId + ")");
        return new AdminActionResponse("Producto eliminado del catalogo");
    }

    @Transactional
    public CategoryView createCategory(CreateCategoryRequest request, String adminEmail) {
        AdminContext admin = ensureAdmin(adminEmail, ADMIN_ALLOWED_ROLES);

        String name = safeText(request.name(), 140, "El nombre de la categoria es obligatorio");
        String slug = normalizeSlug(request.slug() == null || request.slug().isBlank() ? name : request.slug());

        Long categoryId;
        try {
            categoryId = jdbcTemplate.queryForObject(
                """
                INSERT INTO categorias (nombre, slug, descripcion, imagen_url, activo, destacada, created_at)
                VALUES (?, ?, ?, ?, true, ?, now())
                RETURNING id
                """,
                Long.class,
                name,
                slug,
                trimNullable(request.description()),
                trimNullable(request.imageUrl()),
                request.featured() != null && request.featured()
            );
        } catch (Exception exception) {
            throw new ApiException(400, "No se pudo crear la categoria. Revisa si el slug ya existe");
        }

        if (categoryId == null) {
            throw new ApiException(500, "No se pudo crear la categoria");
        }

        audit(admin.id(), "CREATE_CATEGORY", "Categoria creada: " + name);
        return findCategoryById(categoryId);
    }

    @Transactional
    public AdminActionResponse deactivateCategory(String categorySlug, String adminEmail) {
        AdminContext admin = ensureAdmin(adminEmail, ADMIN_ALLOWED_ROLES);
        String normalizedSlug = normalizeSlug(categorySlug);

        CategoryView category = jdbcTemplate.query(
            """
            SELECT id, nombre, slug, descripcion, imagen_url, destacada
            FROM categorias
            WHERE slug = ? AND activo = true
            """,
            rs -> rs.next()
                ? new CategoryView(
                    rs.getLong("id"),
                    rs.getString("nombre"),
                    rs.getString("slug"),
                    rs.getString("descripcion"),
                    rs.getString("imagen_url"),
                    rs.getBoolean("destacada")
                )
                : null,
            normalizedSlug
        );

        if (category == null) {
            throw new ApiException(404, "Categoria no encontrada o ya inactiva");
        }

        jdbcTemplate.update(
            "UPDATE productos SET activo = false, updated_at = now() WHERE categoria_id = ?",
            category.id()
        );

        jdbcTemplate.update(
            "UPDATE categorias SET activo = false WHERE id = ?",
            category.id()
        );

        audit(admin.id(), "DELETE_CATEGORY", "Categoria desactivada: " + category.name());
        return new AdminActionResponse("Categoria eliminada del catalogo");
    }

    @Transactional
    public CategoryView updateCategory(String categorySlug, UpdateCategoryRequest request, String adminEmail) {
        AdminContext admin = ensureAdmin(adminEmail, ADMIN_ALLOWED_ROLES);
        String normalizedSlug = normalizeSlug(categorySlug);

        CategoryView current = jdbcTemplate.query(
            """
            SELECT id, nombre, slug, descripcion, imagen_url, destacada
            FROM categorias
            WHERE slug = ?
            """,
            rs -> rs.next()
                ? new CategoryView(
                    rs.getLong("id"),
                    rs.getString("nombre"),
                    rs.getString("slug"),
                    rs.getString("descripcion"),
                    rs.getString("imagen_url"),
                    rs.getBoolean("destacada")
                )
                : null,
            normalizedSlug
        );

        if (current == null) {
            throw new ApiException(404, "Categoria no encontrada");
        }

        String nextName = request.name() == null || request.name().isBlank()
            ? current.name()
            : safeText(request.name(), 140, "Nombre invalido");
        String nextSlug = request.slug() == null || request.slug().isBlank()
            ? current.slug()
            : normalizeSlug(request.slug());
        String nextDescription = request.description() == null ? current.description() : trimNullable(request.description());
        String nextImageUrl = request.imageUrl() == null ? current.imageUrl() : trimNullable(request.imageUrl());
        boolean nextFeatured = request.featured() == null ? current.featured() : request.featured();
        boolean nextActive = request.active() == null ? true : request.active();

        try {
            jdbcTemplate.update(
                """
                UPDATE categorias
                SET nombre = ?, slug = ?, descripcion = ?, imagen_url = ?, destacada = ?, activo = ?
                WHERE id = ?
                """,
                nextName,
                nextSlug,
                nextDescription,
                nextImageUrl,
                nextFeatured,
                nextActive,
                current.id()
            );
        } catch (Exception exception) {
            throw new ApiException(400, "No se pudo actualizar la categoria. Revisa si el slug ya existe");
        }

        if (!nextActive) {
            jdbcTemplate.update(
                "UPDATE productos SET activo = false, updated_at = now() WHERE categoria_id = ?",
                current.id()
            );
        }

        audit(admin.id(), "UPDATE_CATEGORY", "Categoria actualizada: " + nextName);
        return findCategoryById(current.id());
    }

    @Transactional
    public AdminUserView createAdminUser(CreateAdminUserRequest request, String adminEmail) {
        AdminContext admin = ensureAdmin(adminEmail, SUPER_ADMIN_ONLY);

        String roleName = safeText(request.roleName(), 80, "El rol es obligatorio").toUpperCase(Locale.ROOT);
        if (!ADMIN_ALLOWED_ROLES.contains(roleName)) {
            throw new ApiException(400, "Rol no permitido");
        }

        Long roleId = jdbcTemplate.query(
            "SELECT id FROM roles WHERE nombre = ?",
            rs -> rs.next() ? rs.getLong("id") : null,
            roleName
        );

        if (roleId == null) {
            throw new ApiException(400, "El rol no existe");
        }

        String name = safeText(request.name(), 140, "El nombre es obligatorio");
        String email = safeText(request.email(), 180, "El correo es obligatorio").toLowerCase(Locale.ROOT);
        String passwordHash = passwordService.encode(safeText(request.password(), 255, "La clave es obligatoria"));

        Long userId = jdbcTemplate.queryForObject(
            """
            INSERT INTO usuarios (nombre, email, password_hash, rol_id, activo, created_at)
            VALUES (?, ?, ?, ?, true, now())
            RETURNING id
            """,
            Long.class,
            name,
            email,
            passwordHash,
            roleId
        );

        if (userId == null) {
            throw new ApiException(500, "No se pudo crear el usuario administrador");
        }

        audit(admin.id(), "CREATE_ADMIN_USER", "Admin creado: " + email + " con rol " + roleName);
        return new AdminUserView(userId, name, email, roleName, true);
    }

    @Transactional
    public BrandingView updateBranding(UpdateBrandingRequest request, String adminEmail) {
        AdminContext admin = ensureAdmin(adminEmail, SUPER_ADMIN_ONLY);
        BrandingView current = branding();

        String requestedStoreName = trimNullable(request.storeName());
        String requestedTagline = trimNullable(request.tagline());
        String requestedLogoUrl = trimNullable(request.logoUrl());

        String storeName = requestedStoreName == null || requestedStoreName.isBlank()
            ? current.storeName()
            : safeText(requestedStoreName, 160, "El nombre de la tienda es obligatorio");
        String tagline = requestedTagline == null || requestedTagline.isBlank()
            ? current.tagline()
            : safeText(requestedTagline, 180, "El tagline es obligatorio");
        String logoUrl = requestedLogoUrl == null || requestedLogoUrl.isBlank()
            ? current.logoUrl()
            : safeText(requestedLogoUrl, 400, "La URL del logo es obligatoria");

        upsertConfigValue("store.name", storeName);
        upsertConfigValue("store.tagline", tagline);
        upsertConfigValue("store.logo_url", logoUrl);

        audit(admin.id(), "UPDATE_BRANDING", "Branding actualizado a " + storeName);
        return new BrandingView(storeName, tagline, logoUrl);
    }

    @Transactional
    public TicketView updateTicketStatus(String ticketCode, UpdateTicketStatusRequest request, String adminEmail) {
        AdminContext admin = ensureAdmin(adminEmail, Set.of("SUPER_ADMIN", "ADMIN"));
        String status = safeText(request.status(), 80, "El estado es obligatorio").toUpperCase(Locale.ROOT);

        int affected = jdbcTemplate.update(
            "UPDATE pedidos SET estado = ? WHERE codigo_ticket = ?",
            status,
            ticketCode
        );

        if (affected == 0) {
            throw new ApiException(404, "Ticket no encontrado");
        }

        audit(admin.id(), "UPDATE_TICKET_STATUS", "Ticket " + ticketCode + " actualizado a " + status);

        return jdbcTemplate.queryForObject(
            """
            SELECT id, codigo_ticket, cliente_nombre, cliente_telefono, cliente_email,
                   cliente_documento, cliente_empresa, tipo_entrega, direccion_entrega, ciudad_entrega,
                   referencia_entrega, horario_contacto, estado, comentario, whatsapp_link, created_at
            FROM pedidos
            WHERE codigo_ticket = ?
            """,
            this::mapTicket,
            ticketCode
        );
    }

    public CarouselConfigView getCarouselConfig() {
        SiteContentView siteContent = getSiteContent();
        String intervalStr = getConfigValue("carousel.interval_ms", "5000");
        int intervalMs;
        try {
            intervalMs = Integer.parseInt(intervalStr);
        } catch (NumberFormatException ignored) {
            intervalMs = 5000;
        }
        String effect = getConfigValue("carousel.effect", "fade");
        String slide1BgImage = siteContent.heroSlides().isEmpty()
            ? ""
            : trimNullable(siteContent.heroSlides().get(0).bgImageUrl());
        String slide2BgImage = siteContent.heroSlides().size() < 2
            ? ""
            : trimNullable(siteContent.heroSlides().get(1).bgImageUrl());
        return new CarouselConfigView(intervalMs, effect, slide1BgImage, slide2BgImage);
    }

    @Transactional
    public CarouselConfigView saveCarouselConfig(SaveCarouselConfigRequest request, String adminEmail) {
        AdminContext admin = ensureAdmin(adminEmail, ADMIN_ALLOWED_ROLES);
        if (request.intervalMs() != null) {
            int interval = Math.max(1000, Math.min(30000, request.intervalMs()));
            upsertConfigValue("carousel.interval_ms", String.valueOf(interval));
        }
        if (request.effect() != null && !request.effect().isBlank()) {
            String effect = "slide".equals(request.effect()) ? "slide" : "fade";
            upsertConfigValue("carousel.effect", effect);
        }
        if (request.slide1BgImage() != null) {
            upsertConfigValue("site.hero.slide.1.bg", trimNullable(request.slide1BgImage()));
        }
        if (request.slide2BgImage() != null) {
            upsertConfigValue("site.hero.slide.2.bg", trimNullable(request.slide2BgImage()));
        }
        audit(admin.id(), "UPDATE_CAROUSEL", "Configuracion de carrusel actualizada");
        return getCarouselConfig();
    }

    public SiteContentView getSiteContent() {
        String searchPlaceholder = getConfigValue("site.search.placeholder", "Que solucion de tecnologia estas buscando?");
        String homeCategoriesKicker = getConfigValue("site.home.categories.kicker", "Lineas destacadas");
        String homeCategoriesTitle = getConfigValue("site.home.categories.title", "Categorias principales");
        String homeProductsKicker = getConfigValue("site.home.products.kicker", "Top picks");
        String homeProductsTitle = getConfigValue("site.home.products.title", "Productos destacados");
        String themeFontPreset = getConfigValue("site.theme.font_preset", "inter");
        String headingFontPreset = getConfigValue("site.theme.heading_font_preset", "montserrat");
        String headingColor = getConfigValue("site.theme.heading_color", "#10223c");
        String bodyTextColor = getConfigValue("site.theme.body_text_color", "#51627f");
        String homePromoPrimaryEyebrow = getConfigValue("site.home.promo.primary.eyebrow", "Integracion comercial");
        String homePromoPrimaryTitle = getConfigValue("site.home.promo.primary.title", "Catalogo orientado a empresas y compras asistidas");
        String homePromoPrimaryText = getConfigValue("site.home.promo.primary.text", "Fichas tecnicas, detalle claro y contacto directo con el equipo comercial.");
        String homePromoPrimaryBgColor = getConfigValue("site.home.promo.primary.bg_color", "#185dc2");
        String homePromoPrimaryTextColor = getConfigValue("site.home.promo.primary.text_color", "#ffffff");
        String homePromoSecondaryEyebrow = getConfigValue("site.home.promo.secondary.eyebrow", "Operacion");
        String homePromoSecondaryTitle = getConfigValue("site.home.promo.secondary.title", "Inventario visible y flujo sin registro de clientes");
        String homePromoSecondaryText = getConfigValue("site.home.promo.secondary.text", "Carrito consultivo, ticket unico y seguimiento por WhatsApp corporativo.");
        String homePromoSecondaryBgColor = getConfigValue("site.home.promo.secondary.bg_color", "#f4f6fa");
        String homePromoSecondaryTextColor = getConfigValue("site.home.promo.secondary.text_color", "#10223c");
        String adminIntroText = getConfigValue("site.admin.intro", "Gestion profesional de catalogo, pedidos y configuracion.");
        List<ThemeTokenView> themeTokens = loadThemeTokens();
        String customCss = getConfigValue("site.theme.custom_css", "");

        List<SiteTextItemView> textItems = loadSiteTextItems(
            searchPlaceholder,
            homeCategoriesKicker,
            homeCategoriesTitle,
            homeProductsKicker,
            homeProductsTitle,
            adminIntroText
        );
        List<PromoBannerView> promoBanners = loadPromoBanners(
            homePromoPrimaryEyebrow,
            homePromoPrimaryTitle,
            homePromoPrimaryText,
            homePromoPrimaryBgColor,
            homePromoPrimaryTextColor,
            homePromoSecondaryEyebrow,
            homePromoSecondaryTitle,
            homePromoSecondaryText,
            homePromoSecondaryBgColor,
            homePromoSecondaryTextColor
        );

        PromoBannerView primaryBanner = promoBanners.isEmpty()
            ? new PromoBannerView("Integracion comercial", "Catalogo orientado a empresas y compras asistidas", "Fichas tecnicas, detalle claro y contacto directo con el equipo comercial.", "#185dc2", "#ffffff", "")
            : promoBanners.get(0);
        PromoBannerView secondaryBanner = promoBanners.size() > 1
            ? promoBanners.get(1)
            : new PromoBannerView("Operacion", "Inventario visible y flujo sin registro de clientes", "Carrito consultivo, ticket unico y seguimiento por WhatsApp corporativo.", "#f4f6fa", "#10223c", "");

        int slideCount = getConfigInt("site.hero.slide.count", 2, 1, 12);
        List<HeroSlideView> slides = new ArrayList<>();
        for (int i = 1; i <= slideCount; i++) {
            String prefix = "site.hero.slide." + i + ".";
            String eyebrow = getConfigValue(prefix + "eyebrow", i == 1 ? "ATR Group" : "Compra consultiva");
            String title = getConfigValue(
                prefix + "title",
                i == 1
                    ? "Tecnologia corporativa para empresas que exigen respuesta inmediata"
                    : "Carrito sin precios publicos y ticket unico para cada solicitud"
            );
            String text = getConfigValue(
                prefix + "text",
                i == 1
                    ? "Explora computo, redes, infraestructura y perifericos con experiencia de ecommerce moderna, stock visible y cierre comercial por WhatsApp."
                    : "Tus clientes agregan productos, generan una solicitud y continuan el proceso con el equipo comercial de ATR Group."
            );
            String cta = getConfigValue(prefix + "cta", i == 1 ? "Explorar catalogo" : "Ir al carrito");
            String bgImageUrl = getConfigValue(prefix + "bg", "");
            slides.add(new HeroSlideView(eyebrow, title, text, cta, bgImageUrl));
        }

        return new SiteContentView(
            searchPlaceholder,
            homeCategoriesKicker,
            homeCategoriesTitle,
            homeProductsKicker,
            homeProductsTitle,
            themeFontPreset,
            headingFontPreset,
            headingColor,
            bodyTextColor,
            primaryBanner.eyebrow(),
            primaryBanner.title(),
            primaryBanner.text(),
            primaryBanner.bgColor(),
            primaryBanner.textColor(),
            secondaryBanner.eyebrow(),
            secondaryBanner.title(),
            secondaryBanner.text(),
            secondaryBanner.bgColor(),
            secondaryBanner.textColor(),
            adminIntroText,
            textItems,
            promoBanners,
            themeTokens,
            customCss,
            slides
        );
    }

    @Transactional
    public SiteContentView saveSiteContent(SaveSiteContentRequest request, String adminEmail) {
        AdminContext admin = ensureAdmin(adminEmail, ADMIN_ALLOWED_ROLES);

        if (request.searchPlaceholder() != null) {
            upsertConfigValue("site.search.placeholder", trimNullable(request.searchPlaceholder()));
        }
        if (request.homeCategoriesKicker() != null) {
            upsertConfigValue("site.home.categories.kicker", trimNullable(request.homeCategoriesKicker()));
        }
        if (request.homeCategoriesTitle() != null) {
            upsertConfigValue("site.home.categories.title", trimNullable(request.homeCategoriesTitle()));
        }
        if (request.homeProductsKicker() != null) {
            upsertConfigValue("site.home.products.kicker", trimNullable(request.homeProductsKicker()));
        }
        if (request.homeProductsTitle() != null) {
            upsertConfigValue("site.home.products.title", trimNullable(request.homeProductsTitle()));
        }
        if (request.themeFontPreset() != null) {
            upsertConfigValue("site.theme.font_preset", trimNullable(request.themeFontPreset()));
        }
        if (request.headingFontPreset() != null) {
            upsertConfigValue("site.theme.heading_font_preset", trimNullable(request.headingFontPreset()));
        }
        if (request.headingColor() != null) {
            upsertConfigValue("site.theme.heading_color", trimNullable(request.headingColor()));
        }
        if (request.bodyTextColor() != null) {
            upsertConfigValue("site.theme.body_text_color", trimNullable(request.bodyTextColor()));
        }
        if (request.homePromoPrimaryEyebrow() != null) {
            upsertConfigValue("site.home.promo.primary.eyebrow", trimNullable(request.homePromoPrimaryEyebrow()));
        }
        if (request.homePromoPrimaryTitle() != null) {
            upsertConfigValue("site.home.promo.primary.title", trimNullable(request.homePromoPrimaryTitle()));
        }
        if (request.homePromoPrimaryText() != null) {
            upsertConfigValue("site.home.promo.primary.text", trimNullable(request.homePromoPrimaryText()));
        }
        if (request.homePromoPrimaryBgColor() != null) {
            upsertConfigValue("site.home.promo.primary.bg_color", trimNullable(request.homePromoPrimaryBgColor()));
        }
        if (request.homePromoPrimaryTextColor() != null) {
            upsertConfigValue("site.home.promo.primary.text_color", trimNullable(request.homePromoPrimaryTextColor()));
        }
        if (request.homePromoSecondaryEyebrow() != null) {
            upsertConfigValue("site.home.promo.secondary.eyebrow", trimNullable(request.homePromoSecondaryEyebrow()));
        }
        if (request.homePromoSecondaryTitle() != null) {
            upsertConfigValue("site.home.promo.secondary.title", trimNullable(request.homePromoSecondaryTitle()));
        }
        if (request.homePromoSecondaryText() != null) {
            upsertConfigValue("site.home.promo.secondary.text", trimNullable(request.homePromoSecondaryText()));
        }
        if (request.homePromoSecondaryBgColor() != null) {
            upsertConfigValue("site.home.promo.secondary.bg_color", trimNullable(request.homePromoSecondaryBgColor()));
        }
        if (request.homePromoSecondaryTextColor() != null) {
            upsertConfigValue("site.home.promo.secondary.text_color", trimNullable(request.homePromoSecondaryTextColor()));
        }
        if (request.adminIntroText() != null) {
            upsertConfigValue("site.admin.intro", trimNullable(request.adminIntroText()));
        }

        if (request.textItems() != null && !request.textItems().isEmpty()) {
            int textItemCount = Math.min(Math.max(request.textItems().size(), 1), 20);
            upsertConfigValue("site.text.items.count", String.valueOf(textItemCount));
            for (int i = 0; i < textItemCount; i++) {
                SiteTextItemView item = request.textItems().get(i);
                int index = i + 1;
                String prefix = "site.text.item." + index + ".";
                upsertConfigValue(prefix + "id", trimNullable(item.id()));
                upsertConfigValue(prefix + "label", trimNullable(item.label()));
                upsertConfigValue(prefix + "helper", trimNullable(item.helper()));
                upsertConfigValue(prefix + "value", trimNullable(item.value()));
            }

            String searchText = findTextItemValue(request.textItems(), "searchPlaceholder");
            String categoriesKickerText = findTextItemValue(request.textItems(), "homeCategoriesKicker");
            String categoriesTitleText = findTextItemValue(request.textItems(), "homeCategoriesTitle");
            String productsKickerText = findTextItemValue(request.textItems(), "homeProductsKicker");
            String productsTitleText = findTextItemValue(request.textItems(), "homeProductsTitle");
            String adminIntro = findTextItemValue(request.textItems(), "adminIntroText");

            if (searchText != null) upsertConfigValue("site.search.placeholder", trimNullable(searchText));
            if (categoriesKickerText != null) upsertConfigValue("site.home.categories.kicker", trimNullable(categoriesKickerText));
            if (categoriesTitleText != null) upsertConfigValue("site.home.categories.title", trimNullable(categoriesTitleText));
            if (productsKickerText != null) upsertConfigValue("site.home.products.kicker", trimNullable(productsKickerText));
            if (productsTitleText != null) upsertConfigValue("site.home.products.title", trimNullable(productsTitleText));
            if (adminIntro != null) upsertConfigValue("site.admin.intro", trimNullable(adminIntro));
        }

        if (request.promoBanners() != null && !request.promoBanners().isEmpty()) {
            int bannerCount = Math.min(Math.max(request.promoBanners().size(), 1), 8);
            upsertConfigValue("site.home.banner.count", String.valueOf(bannerCount));
            for (int i = 0; i < bannerCount; i++) {
                PromoBannerView banner = request.promoBanners().get(i);
                int index = i + 1;
                String prefix = "site.home.banner." + index + ".";
                upsertConfigValue(prefix + "eyebrow", trimNullable(banner.eyebrow()));
                upsertConfigValue(prefix + "title", trimNullable(banner.title()));
                upsertConfigValue(prefix + "text", trimNullable(banner.text()));
                upsertConfigValue(prefix + "bg_color", trimNullable(banner.bgColor()));
                upsertConfigValue(prefix + "text_color", trimNullable(banner.textColor()));
                upsertConfigValue(prefix + "image_url", trimNullable(banner.imageUrl()));
            }

            PromoBannerView firstBanner = request.promoBanners().get(0);
            upsertConfigValue("site.home.promo.primary.eyebrow", trimNullable(firstBanner.eyebrow()));
            upsertConfigValue("site.home.promo.primary.title", trimNullable(firstBanner.title()));
            upsertConfigValue("site.home.promo.primary.text", trimNullable(firstBanner.text()));
            upsertConfigValue("site.home.promo.primary.bg_color", trimNullable(firstBanner.bgColor()));
            upsertConfigValue("site.home.promo.primary.text_color", trimNullable(firstBanner.textColor()));
            upsertConfigValue("site.home.promo.primary.image_url", trimNullable(firstBanner.imageUrl()));

            if (request.promoBanners().size() > 1) {
                PromoBannerView secondBanner = request.promoBanners().get(1);
                upsertConfigValue("site.home.promo.secondary.eyebrow", trimNullable(secondBanner.eyebrow()));
                upsertConfigValue("site.home.promo.secondary.title", trimNullable(secondBanner.title()));
                upsertConfigValue("site.home.promo.secondary.text", trimNullable(secondBanner.text()));
                upsertConfigValue("site.home.promo.secondary.bg_color", trimNullable(secondBanner.bgColor()));
                upsertConfigValue("site.home.promo.secondary.text_color", trimNullable(secondBanner.textColor()));
                upsertConfigValue("site.home.promo.secondary.image_url", trimNullable(secondBanner.imageUrl()));
            }
        }

        if (request.themeTokens() != null && !request.themeTokens().isEmpty()) {
            int tokenCount = Math.min(Math.max(request.themeTokens().size(), 1), 40);
            upsertConfigValue("site.theme.token.count", String.valueOf(tokenCount));
            for (int i = 0; i < tokenCount; i++) {
                ThemeTokenView token = request.themeTokens().get(i);
                int index = i + 1;
                String prefix = "site.theme.token." + index + ".";
                upsertConfigValue(prefix + "id", trimNullable(token.id()));
                upsertConfigValue(prefix + "label", trimNullable(token.label()));
                upsertConfigValue(prefix + "type", trimNullable(token.type()));
                upsertConfigValue(prefix + "value", trimNullable(token.value()));
            }
        }

        if (request.customCss() != null) {
            upsertConfigValue("site.theme.custom_css", request.customCss());
        }

        if (request.heroSlides() != null && !request.heroSlides().isEmpty()) {
            int slideCount = Math.min(Math.max(request.heroSlides().size(), 1), 12);
            upsertConfigValue("site.hero.slide.count", String.valueOf(slideCount));
            for (int i = 0; i < slideCount; i++) {
                HeroSlideView slide = request.heroSlides().get(i);
                int index = i + 1;
                String prefix = "site.hero.slide." + index + ".";
                upsertConfigValue(prefix + "eyebrow", trimNullable(slide.eyebrow()));
                upsertConfigValue(prefix + "title", trimNullable(slide.title()));
                upsertConfigValue(prefix + "text", trimNullable(slide.text()));
                upsertConfigValue(prefix + "cta", trimNullable(slide.cta()));
                upsertConfigValue(prefix + "bg", trimNullable(slide.bgImageUrl()));
            }
        }

        audit(admin.id(), "UPDATE_SITE_CONTENT", "Textos y carrusel actualizados");
        return getSiteContent();
    }

    public List<AdminUserView> listAdminUsers(String adminEmail) {
        ensureAdmin(adminEmail, SUPER_ADMIN_ONLY);
        return jdbcTemplate.query(
            """
            SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.activo
            FROM usuarios u
            JOIN roles r ON r.id = u.rol_id
            ORDER BY r.nivel DESC, u.nombre ASC
            """,
            (rs, rowNum) -> new AdminUserView(
                rs.getLong("id"),
                rs.getString("nombre"),
                rs.getString("email"),
                rs.getString("rol"),
                rs.getBoolean("activo")
            )
        );
    }

    @Transactional
    public AdminUserView updateAdminUser(Long userId, UpdateAdminUserRequest request, String adminEmail) {
        AdminContext admin = ensureAdmin(adminEmail, SUPER_ADMIN_ONLY);
        if (admin.id().equals(userId) && Boolean.FALSE.equals(request.active())) {
            throw new ApiException(400, "No puedes desactivar tu propio usuario");
        }
        AdminUserView current = jdbcTemplate.query(
            """
            SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.activo
            FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = ?
            """,
            rs -> rs.next() ? new AdminUserView(
                rs.getLong("id"), rs.getString("nombre"), rs.getString("email"),
                rs.getString("rol"), rs.getBoolean("activo")
            ) : null,
            userId
        );
        if (current == null) {
            throw new ApiException(404, "Usuario no encontrado");
        }
        String name = (request.name() == null || request.name().isBlank()) ? current.name() : request.name().trim();
        String email = (request.email() == null || request.email().isBlank()) ? current.email() : request.email().trim().toLowerCase(Locale.ROOT);
        boolean active = request.active() == null ? current.active() : request.active();
        boolean hasPassword = request.password() != null && !request.password().isBlank();
        String hashedNewPassword = hasPassword ? passwordService.encode(request.password()) : null;
        if (request.roleName() != null && !request.roleName().isBlank()) {
            String roleName = request.roleName().toUpperCase(Locale.ROOT);
            if (!ADMIN_ALLOWED_ROLES.contains(roleName)) {
                throw new ApiException(400, "Rol no permitido");
            }
            Long roleId = jdbcTemplate.query(
                "SELECT id FROM roles WHERE nombre = ?",
                rs -> rs.next() ? rs.getLong("id") : null, roleName
            );
            if (roleId == null) {
                throw new ApiException(400, "El rol no existe");
            }
            if (hasPassword) {
                jdbcTemplate.update(
                    "UPDATE usuarios SET nombre=?, email=?, rol_id=?, activo=?, password_hash=? WHERE id=?",
                    name, email, roleId, active, hashedNewPassword, userId
                );
            } else {
                jdbcTemplate.update(
                    "UPDATE usuarios SET nombre=?, email=?, rol_id=?, activo=? WHERE id=?",
                    name, email, roleId, active, userId
                );
            }
            audit(admin.id(), "UPDATE_ADMIN_USER", "Usuario " + email + " actualizado con rol " + roleName);
        } else {
            if (hasPassword) {
                jdbcTemplate.update(
                    "UPDATE usuarios SET nombre=?, email=?, activo=?, password_hash=? WHERE id=?",
                    name, email, active, hashedNewPassword, userId
                );
            } else {
                jdbcTemplate.update(
                    "UPDATE usuarios SET nombre=?, email=?, activo=? WHERE id=?",
                    name, email, active, userId
                );
            }
            audit(admin.id(), "UPDATE_ADMIN_USER", "Usuario " + email + " actualizado");
        }
        return jdbcTemplate.query(
            """
            SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.activo
            FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = ?
            """,
            rs -> rs.next() ? new AdminUserView(
                rs.getLong("id"), rs.getString("nombre"), rs.getString("email"),
                rs.getString("rol"), rs.getBoolean("activo")
            ) : null,
            userId
        );
    }

    @Transactional
    public AdminUserView toggleAdminUser(Long userId, boolean active, String adminEmail) {
        AdminContext admin = ensureAdmin(adminEmail, SUPER_ADMIN_ONLY);
        if (!active && admin.id().equals(userId)) {
            throw new ApiException(400, "No puedes desactivarte a ti mismo");
        }
        int affected = jdbcTemplate.update("UPDATE usuarios SET activo = ? WHERE id = ?", active, userId);
        if (affected == 0) {
            throw new ApiException(404, "Usuario no encontrado");
        }
        audit(admin.id(), active ? "ACTIVATE_USER" : "DEACTIVATE_USER",
            "Usuario ID " + userId + (active ? " activado" : " desactivado"));
        return jdbcTemplate.query(
            """
            SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.activo
            FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = ?
            """,
            rs -> rs.next() ? new AdminUserView(
                rs.getLong("id"), rs.getString("nombre"), rs.getString("email"),
                rs.getString("rol"), rs.getBoolean("activo")
            ) : null,
            userId
        );
    }

    @Transactional
    public AdminActionResponse deleteAdminUser(Long userId, String adminEmail) {
        AdminContext admin = ensureAdmin(adminEmail, SUPER_ADMIN_ONLY);
        if (admin.id().equals(userId)) {
            throw new ApiException(400, "No puedes eliminar tu propio usuario");
        }
        AdminContext target = jdbcTemplate.query(
            """
            SELECT u.id, u.nombre, u.email, r.nombre as rol
            FROM usuarios u
            JOIN roles r ON r.id = u.rol_id
            WHERE u.id = ?
            """,
            rs -> rs.next()
                ? new AdminContext(rs.getLong("id"), rs.getString("nombre"), rs.getString("email"), rs.getString("rol"))
                : null,
            userId
        );
        if (target == null) {
            throw new ApiException(404, "Usuario no encontrado");
        }
        jdbcTemplate.update("DELETE FROM reset_password WHERE usuario_id = ?", userId);
        jdbcTemplate.update("DELETE FROM auditoria_admin WHERE usuario_id = ?", userId);
        int affected = jdbcTemplate.update("DELETE FROM usuarios WHERE id = ?", userId);
        if (affected == 0) {
            throw new ApiException(404, "Usuario no encontrado");
        }
        audit(admin.id(), "DELETE_USER", "Usuario eliminado: " + target.email() + " (" + target.role() + ")");
        return new AdminActionResponse("Usuario eliminado correctamente");
    }

    private List<String> getAllAdminEmails() {
        return jdbcTemplate.queryForList(
            "SELECT email FROM usuarios WHERE activo = true",
            String.class
        );
    }

    private AdminContext ensureAdmin(String adminEmail, Set<String> allowedRoles) {
        String email = trimNullable(adminEmail);
        if (email == null || email.isBlank()) {
            throw new ApiException(401, "Debes enviar el header X-Admin-Email");
        }

        AdminContext admin = jdbcTemplate.query(
            """
            SELECT u.id, u.nombre, u.email, r.nombre as rol
            FROM usuarios u
            JOIN roles r ON r.id = u.rol_id
            WHERE u.email = ? AND u.activo = true
            """,
            rs -> rs.next()
                ? new AdminContext(rs.getLong("id"), rs.getString("nombre"), rs.getString("email"), rs.getString("rol"))
                : null,
            email.toLowerCase(Locale.ROOT)
        );

        if (admin == null) {
            throw new ApiException(403, "Usuario administrador no encontrado o inactivo");
        }

        if (!allowedRoles.contains(admin.role())) {
            throw new ApiException(403, "No tienes permisos para esta operacion");
        }

        return admin;
    }

    private void audit(Long userId, String action, String detail) {
        jdbcTemplate.update(
            """
            INSERT INTO auditoria_admin (usuario_id, accion, detalle, created_at)
            VALUES (?, ?, ?, now())
            """,
            userId,
            action,
            detail
        );
    }

    private void createTables() {
        jdbcTemplate.execute(
            """
            CREATE TABLE IF NOT EXISTS roles (
                id BIGSERIAL PRIMARY KEY,
                nombre VARCHAR(80) NOT NULL UNIQUE,
                nivel INTEGER NOT NULL DEFAULT 1
            )
            """
        );

        jdbcTemplate.execute(
            """
            CREATE TABLE IF NOT EXISTS usuarios (
                id BIGSERIAL PRIMARY KEY,
                nombre VARCHAR(140) NOT NULL,
                email VARCHAR(180) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                rol_id BIGINT NOT NULL REFERENCES roles(id),
                activo BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP NOT NULL DEFAULT now()
            )
            """
        );

        jdbcTemplate.execute(
            """
            CREATE TABLE IF NOT EXISTS categorias (
                id BIGSERIAL PRIMARY KEY,
                nombre VARCHAR(140) NOT NULL,
                slug VARCHAR(160) NOT NULL UNIQUE,
                descripcion TEXT,
                imagen_url TEXT,
                activo BOOLEAN NOT NULL DEFAULT true,
                destacada BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP NOT NULL DEFAULT now()
            )
            """
        );

        jdbcTemplate.execute(
            """
            CREATE TABLE IF NOT EXISTS productos (
                id BIGSERIAL PRIMARY KEY,
                categoria_id BIGINT NOT NULL REFERENCES categorias(id),
                nombre VARCHAR(180) NOT NULL,
                slug VARCHAR(200) NOT NULL UNIQUE,
                detalle TEXT,
                ficha_tecnica TEXT,
                stock INTEGER NOT NULL DEFAULT 0,
                imagen_url TEXT,
                activo BOOLEAN NOT NULL DEFAULT true,
                destacado BOOLEAN NOT NULL DEFAULT false,
                oferta_semanal BOOLEAN NOT NULL DEFAULT false,
                descuento_porcentaje INTEGER NOT NULL DEFAULT 0,
                oferta_fecha_limite TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
            """
        );

        jdbcTemplate.execute(
            """
            CREATE TABLE IF NOT EXISTS producto_imagenes (
                id BIGSERIAL PRIMARY KEY,
                producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
                imagen_url TEXT NOT NULL,
                orden INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT now()
            )
            """
        );

        jdbcTemplate.execute(
            """
            CREATE TABLE IF NOT EXISTS pedidos (
                id BIGSERIAL PRIMARY KEY,
                codigo_ticket VARCHAR(64) NOT NULL UNIQUE,
                cliente_nombre VARCHAR(140) NOT NULL,
                cliente_telefono VARCHAR(40) NOT NULL,
                cliente_email VARCHAR(180),
                cliente_documento VARCHAR(60),
                cliente_empresa VARCHAR(180),
                tipo_entrega VARCHAR(30),
                direccion_entrega TEXT,
                ciudad_entrega VARCHAR(120),
                referencia_entrega TEXT,
                horario_contacto VARCHAR(120),
                estado VARCHAR(80) NOT NULL,
                comentario TEXT,
                whatsapp_link TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT now()
            )
            """
        );

        jdbcTemplate.execute(
            """
            CREATE TABLE IF NOT EXISTS detalle_pedido (
                id BIGSERIAL PRIMARY KEY,
                pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
                producto_id BIGINT NOT NULL REFERENCES productos(id),
                cantidad INTEGER NOT NULL,
                snapshot_nombre VARCHAR(180) NOT NULL,
                snapshot_stock INTEGER NOT NULL
            )
            """
        );

        jdbcTemplate.execute(
            """
            CREATE TABLE IF NOT EXISTS auditoria_admin (
                id BIGSERIAL PRIMARY KEY,
                usuario_id BIGINT REFERENCES usuarios(id),
                accion VARCHAR(120) NOT NULL,
                detalle TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT now()
            )
            """
        );

        jdbcTemplate.execute(
            """
            CREATE TABLE IF NOT EXISTS reset_password (
                id BIGSERIAL PRIMARY KEY,
                usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
                token VARCHAR(255) NOT NULL UNIQUE,
                expira_en TIMESTAMP NOT NULL,
                usado BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP NOT NULL DEFAULT now()
            )
            """
        );

        jdbcTemplate.execute(
            """
            CREATE TABLE IF NOT EXISTS configuracion_tienda (
                clave VARCHAR(120) PRIMARY KEY,
                valor TEXT,
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
            """
        );
    }

    private void createIndexes() {
        executeSafe("CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id)");
        executeSafe("CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo)");
        executeSafe("CREATE INDEX IF NOT EXISTS idx_producto_imagenes_producto ON producto_imagenes(producto_id)");
        executeSafe("CREATE INDEX IF NOT EXISTS idx_pedidos_codigo ON pedidos(codigo_ticket)");
        executeSafe("CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)");
    }

    private void ensureColumns() {
        executeSafe("ALTER TABLE roles ADD COLUMN IF NOT EXISTS nombre VARCHAR(80)");
        executeSafe("ALTER TABLE roles ADD COLUMN IF NOT EXISTS nivel INTEGER DEFAULT 1");

        executeSafe("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre VARCHAR(140)");
        executeSafe("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email VARCHAR(180)");
        executeSafe("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)");
        executeSafe("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol_id BIGINT");
        executeSafe("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true");
        executeSafe("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now()");

        executeSafe("ALTER TABLE categorias ADD COLUMN IF NOT EXISTS nombre VARCHAR(140)");
        executeSafe("ALTER TABLE categorias ADD COLUMN IF NOT EXISTS slug VARCHAR(160)");
        executeSafe("ALTER TABLE categorias ADD COLUMN IF NOT EXISTS descripcion TEXT");
        executeSafe("ALTER TABLE categorias ADD COLUMN IF NOT EXISTS imagen_url TEXT");
        executeSafe("ALTER TABLE categorias ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true");
        executeSafe("ALTER TABLE categorias ADD COLUMN IF NOT EXISTS destacada BOOLEAN DEFAULT false");
        executeSafe("ALTER TABLE categorias ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now()");

        executeSafe("ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria_id BIGINT");
        executeSafe("ALTER TABLE productos ADD COLUMN IF NOT EXISTS nombre VARCHAR(180)");
        executeSafe("ALTER TABLE productos ADD COLUMN IF NOT EXISTS slug VARCHAR(200)");
        executeSafe("ALTER TABLE productos ADD COLUMN IF NOT EXISTS detalle TEXT");
        executeSafe("ALTER TABLE productos ADD COLUMN IF NOT EXISTS ficha_tecnica TEXT");
        executeSafe("ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0");
        executeSafe("ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url TEXT");
        executeSafe("ALTER TABLE productos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true");
        executeSafe("ALTER TABLE productos ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT false");
        executeSafe("ALTER TABLE productos ADD COLUMN IF NOT EXISTS oferta_semanal BOOLEAN DEFAULT false");
        executeSafe("ALTER TABLE productos ADD COLUMN IF NOT EXISTS descuento_porcentaje INTEGER DEFAULT 0");
        executeSafe("ALTER TABLE productos ADD COLUMN IF NOT EXISTS oferta_fecha_limite TIMESTAMP");
        executeSafe("ALTER TABLE productos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now()");
        executeSafe("ALTER TABLE productos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now()");

        executeSafe("CREATE TABLE IF NOT EXISTS producto_imagenes (id BIGSERIAL PRIMARY KEY)");
        executeSafe("ALTER TABLE producto_imagenes ADD COLUMN IF NOT EXISTS producto_id BIGINT");
        executeSafe("ALTER TABLE producto_imagenes ADD COLUMN IF NOT EXISTS imagen_url TEXT");
        executeSafe("ALTER TABLE producto_imagenes ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0");
        executeSafe("ALTER TABLE producto_imagenes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now()");

        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS codigo_ticket VARCHAR(64)");
        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_nombre VARCHAR(140)");
        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_telefono VARCHAR(40)");
        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_email VARCHAR(180)");
        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_documento VARCHAR(60)");
        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_empresa VARCHAR(180)");
        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo_entrega VARCHAR(30)");
        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS direccion_entrega TEXT");
        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS ciudad_entrega VARCHAR(120)");
        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS referencia_entrega TEXT");
        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS horario_contacto VARCHAR(120)");
        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS estado VARCHAR(80)");
        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS comentario TEXT");
        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS whatsapp_link TEXT");
        executeSafe("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now()");

        executeSafe("ALTER TABLE detalle_pedido ADD COLUMN IF NOT EXISTS pedido_id BIGINT");
        executeSafe("ALTER TABLE detalle_pedido ADD COLUMN IF NOT EXISTS producto_id BIGINT");
        executeSafe("ALTER TABLE detalle_pedido ADD COLUMN IF NOT EXISTS cantidad INTEGER");
        executeSafe("ALTER TABLE detalle_pedido ADD COLUMN IF NOT EXISTS snapshot_nombre VARCHAR(180)");
        executeSafe("ALTER TABLE detalle_pedido ADD COLUMN IF NOT EXISTS snapshot_stock INTEGER");

        executeSafe("ALTER TABLE auditoria_admin ADD COLUMN IF NOT EXISTS usuario_id BIGINT");
        executeSafe("ALTER TABLE auditoria_admin ADD COLUMN IF NOT EXISTS accion VARCHAR(120)");
        executeSafe("ALTER TABLE auditoria_admin ADD COLUMN IF NOT EXISTS detalle TEXT");
        executeSafe("ALTER TABLE auditoria_admin ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now()");

        executeSafe("ALTER TABLE reset_password ADD COLUMN IF NOT EXISTS usuario_id BIGINT");
        executeSafe("ALTER TABLE reset_password ADD COLUMN IF NOT EXISTS token VARCHAR(255)");
        executeSafe("ALTER TABLE reset_password ADD COLUMN IF NOT EXISTS expira_en TIMESTAMP");
        executeSafe("ALTER TABLE reset_password ADD COLUMN IF NOT EXISTS usado BOOLEAN DEFAULT false");
        executeSafe("ALTER TABLE reset_password ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now()");

        executeSafe("ALTER TABLE configuracion_tienda ADD COLUMN IF NOT EXISTS clave VARCHAR(120)");
        executeSafe("ALTER TABLE configuracion_tienda ADD COLUMN IF NOT EXISTS valor TEXT");
        executeSafe("ALTER TABLE configuracion_tienda ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now()");

        executeSafe("CREATE UNIQUE INDEX IF NOT EXISTS uq_roles_nombre ON roles(nombre)");
        executeSafe("CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_email ON usuarios(email)");
        executeSafe("CREATE UNIQUE INDEX IF NOT EXISTS uq_categorias_slug ON categorias(slug)");
        executeSafe("CREATE UNIQUE INDEX IF NOT EXISTS uq_productos_slug ON productos(slug)");
        executeSafe("CREATE UNIQUE INDEX IF NOT EXISTS uq_pedidos_codigo_ticket ON pedidos(codigo_ticket)");
        executeSafe("CREATE UNIQUE INDEX IF NOT EXISTS uq_configuracion_tienda_clave ON configuracion_tienda(clave)");
    }

    private void executeSafe(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception ignored) {
            // Keep startup resilient with pre-existing schemas that do not match exactly.
        }
    }

    private void seedBaseData() {
        jdbcTemplate.update("INSERT INTO roles (nombre, nivel) VALUES ('SUPER_ADMIN', 100) ON CONFLICT (nombre) DO NOTHING");
        jdbcTemplate.update("INSERT INTO roles (nombre, nivel) VALUES ('ADMIN', 70) ON CONFLICT (nombre) DO NOTHING");
        jdbcTemplate.update("INSERT INTO roles (nombre, nivel) VALUES ('CONTENT_MANAGER', 40) ON CONFLICT (nombre) DO NOTHING");

        upsertConfigValue("store.name", "ATR Group");
        upsertConfigValue("store.tagline", "Impulsando con tecnologia");
        upsertConfigValue("store.logo_url", "/logo.jpeg");

        jdbcTemplate.update(
            """
            INSERT INTO usuarios (nombre, email, password_hash, rol_id, activo, created_at)
            SELECT 'Super Administrador', 'superadmin@macaje.local', ?, r.id, true, now()
            FROM roles r
            WHERE r.nombre = 'SUPER_ADMIN'
            ON CONFLICT (email) DO NOTHING
            """,
            passwordService.encode("Cambiar123!")
        );

        seedCategory("Laptops", "laptops", "Portatiles para trabajo y alto rendimiento.", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853", true);
        seedCategory("Componentes", "componentes", "Tarjetas, memorias, procesadores y mas.", "https://images.unsplash.com/photo-1518770660439-4636190af475", true);
        seedCategory("Perifericos", "perifericos", "Mouse, teclados, monitores y audio.", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf", false);

        seedProduct("laptops", "Ultrabook Pro 14", "ultrabook-pro-14", "Equipo liviano para oficina y movilidad.", "Intel Core i7, 16GB RAM, SSD 512GB, pantalla 14 pulgadas.", 14, "https://images.unsplash.com/photo-1517336714739-489689fd1ca8", true, true, 18);
        seedProduct("componentes", "GPU Nova X8", "gpu-nova-x8", "Tarjeta grafica para creacion de contenido.", "12GB GDDR6, HDMI 2.1, DisplayPort 1.4.", 6, "https://images.unsplash.com/photo-1591488320449-011701bb6704", true, true, 12);
        seedProduct("perifericos", "Teclado Mecanico Orion", "teclado-mecanico-orion", "Switch tactil y formato compacto.", "Switch Brown, retroiluminacion blanca, USB-C.", 22, "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae", false, false, 0);
        ensureDefaultWeeklyOffers();
        ensureDemoVisualAssets();
    }

    private void migratePasswordsIfNeeded() {
        // One-time migration: hash any plain-text passwords (those that don't start with BCrypt prefix $2).
        List<Map<String, Object>> plainTextUsers = jdbcTemplate.queryForList(
            "SELECT id, password_hash FROM usuarios WHERE password_hash IS NOT NULL AND password_hash NOT LIKE '$2%'"
        );
        for (Map<String, Object> row : plainTextUsers) {
            Number userIdNumber = (Number) row.get("id");
            Long userId = userIdNumber == null ? null : userIdNumber.longValue();
            String rawPassword = (String) row.get("password_hash");
            if (userId != null && rawPassword != null && !rawPassword.isBlank()) {
                String hashed = passwordService.encode(rawPassword);
                jdbcTemplate.update("UPDATE usuarios SET password_hash = ? WHERE id = ?", hashed, userId);
            }
        }
    }

    private void ensureDefaultWeeklyOffers() {
        jdbcTemplate.update(
            """
            WITH ranked AS (
                SELECT id, row_number() OVER (ORDER BY destacado DESC, updated_at DESC, created_at DESC, id DESC) AS rn
                FROM productos
                WHERE activo = true
            ),
            fallback AS (
                SELECT id,
                       CASE WHEN rn = 1 THEN 18 WHEN rn = 2 THEN 15 ELSE 12 END AS discount
                FROM ranked
                WHERE rn <= 3
            )
            UPDATE productos p
            SET oferta_semanal = true,
                descuento_porcentaje = f.discount,
                updated_at = now()
            FROM fallback f
            WHERE p.id = f.id
              AND NOT EXISTS (
                SELECT 1
                FROM productos existing
                WHERE existing.activo = true
                  AND existing.oferta_semanal = true
                  AND coalesce(existing.descuento_porcentaje, 0) > 0
              )
            """
        );
    }

    private void ensureDemoVisualAssets() {
        jdbcTemplate.update(
            """
            UPDATE categorias
            SET imagen_url = CASE
                WHEN slug = 'laptops' THEN 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853'
                WHEN slug = 'componentes' THEN 'https://images.unsplash.com/photo-1518770660439-4636190af475'
                WHEN slug = 'perifericos' THEN 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf'
                ELSE 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6'
            END
            WHERE coalesce(trim(imagen_url), '') = ''
              AND activo = true
            """
        );

        jdbcTemplate.update(
            """
            UPDATE productos
            SET imagen_url = CASE
                WHEN slug LIKE '%laptop%' OR slug LIKE '%ultrabook%' THEN 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8'
                WHEN slug LIKE '%gpu%' OR slug LIKE '%tarjeta%' OR slug LIKE '%componente%' THEN 'https://images.unsplash.com/photo-1591488320449-011701bb6704'
                WHEN slug LIKE '%teclado%' OR slug LIKE '%mouse%' OR slug LIKE '%periferico%' THEN 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae'
                ELSE 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'
            END
            WHERE coalesce(trim(imagen_url), '') = ''
              AND activo = true
            """
        );

        jdbcTemplate.update(
            """
            INSERT INTO producto_imagenes (producto_id, imagen_url, orden, created_at)
            SELECT p.id, p.imagen_url, 0, now()
            FROM productos p
            WHERE p.activo = true
              AND coalesce(trim(p.imagen_url), '') <> ''
              AND NOT EXISTS (
                SELECT 1
                FROM producto_imagenes pi
                WHERE pi.producto_id = p.id
              )
            """
        );

        upsertConfigValueIfBlank("site.hero.slide.count", "2");
        upsertConfigValueIfBlank("site.hero.slide.1.bg", "https://images.unsplash.com/photo-1518773553398-650c184e0bb3");
        upsertConfigValueIfBlank("site.hero.slide.2.bg", "https://images.unsplash.com/photo-1519389950473-47ba0277781c");
    }

    private void seedCategory(String name, String slug, String description, String imageUrl, boolean featured) {
        jdbcTemplate.update(
            """
            INSERT INTO categorias (nombre, slug, descripcion, imagen_url, activo, destacada, created_at)
            VALUES (?, ?, ?, ?, true, ?, now())
            ON CONFLICT (slug) DO NOTHING
            """,
            name,
            slug,
            description,
            imageUrl,
            featured
        );
    }

    private void seedProduct(String categorySlug, String name, String slug, String detail, String technicalSheet, int stock, String imageUrl, boolean featured, boolean weeklyOffer, int discountPercent) {
        Long categoryId = jdbcTemplate.query(
            "SELECT id FROM categorias WHERE slug = ?",
            rs -> rs.next() ? rs.getLong("id") : null,
            categorySlug
        );

        if (categoryId == null) {
            return;
        }

        jdbcTemplate.update(
            """
            INSERT INTO productos (
                categoria_id, nombre, slug, detalle, ficha_tecnica, stock, imagen_url,
                activo, destacado, oferta_semanal, descuento_porcentaje, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, true, ?, ?, ?, now(), now())
            ON CONFLICT (slug) DO NOTHING
            """,
            categoryId,
            name,
            slug,
            detail,
            technicalSheet,
            stock,
            imageUrl,
            featured,
            weeklyOffer,
            normalizeDiscountPercent(discountPercent)
        );
    }

    private RowMapper<CategoryView> categoryRowMapper() {
        return (ResultSet rs, int rowNum) -> new CategoryView(
            rs.getLong("id"),
            rs.getString("nombre"),
            rs.getString("slug"),
            rs.getString("descripcion"),
            rs.getString("imagen_url"),
            rs.getBoolean("destacada")
        );
    }

    private CategoryView findCategoryById(Long categoryId) {
        CategoryView category = jdbcTemplate.query(
            """
            SELECT id, nombre, slug, descripcion, imagen_url, destacada
            FROM categorias
            WHERE id = ?
            """,
            rs -> rs.next()
                ? new CategoryView(
                    rs.getLong("id"),
                    rs.getString("nombre"),
                    rs.getString("slug"),
                    rs.getString("descripcion"),
                    rs.getString("imagen_url"),
                    rs.getBoolean("destacada")
                )
                : null,
            categoryId
        );

        if (category == null) {
            throw new ApiException(404, "Categoria no encontrada");
        }

        return category;
    }

    private RowMapper<ProductCardView> productCardRowMapper() {
        return (ResultSet rs, int rowNum) -> new ProductCardView(
            rs.getLong("id"),
            rs.getString("nombre"),
            rs.getString("slug"),
            rs.getString("detalle"),
            rs.getString("ficha_tecnica"),
            rs.getInt("stock"),
            rs.getInt("stock") > 0,
            rs.getString("imagen_url"),
            rs.getBoolean("oferta_semanal"),
            rs.getInt("descuento_porcentaje"),
            (rs.getTimestamp("oferta_fecha_limite") != null ? rs.getTimestamp("oferta_fecha_limite").toInstant().toString() : null),
            rs.getString("categoria_nombre"),
            rs.getString("categoria_slug")
        );
    }

    private int normalizeDiscountPercent(Integer value) {
        if (value == null) {
            return 0;
        }
        int parsed = value;
        if (parsed < 0 || parsed > 90) {
            throw new ApiException(400, "El descuento debe estar entre 0 y 90");
        }
        return parsed;
    }

    private java.sql.Timestamp parseOfferDeadline(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return java.sql.Timestamp.from(java.time.Instant.parse(value));
        } catch (Exception ignored) {}
        try {
            return java.sql.Timestamp.valueOf(java.time.LocalDateTime.parse(value));
        } catch (Exception ignored) {}
        return null;
    }

    private List<SiteTextItemView> loadSiteTextItems(
        String searchPlaceholder,
        String homeCategoriesKicker,
        String homeCategoriesTitle,
        String homeProductsKicker,
        String homeProductsTitle,
        String adminIntroText
    ) {
        int count = getConfigInt("site.text.items.count", 0, 0, 20);
        if (count <= 0) {
            return List.of(
                new SiteTextItemView("searchPlaceholder", "Busqueda", "Texto dentro del buscador", searchPlaceholder),
                new SiteTextItemView("homeCategoriesKicker", "Categorias · etiqueta", "Etiqueta corta sobre categorias", homeCategoriesKicker),
                new SiteTextItemView("homeCategoriesTitle", "Categorias · titulo", "Titulo principal de categorias", homeCategoriesTitle),
                new SiteTextItemView("homeProductsKicker", "Productos · etiqueta", "Etiqueta corta sobre productos", homeProductsKicker),
                new SiteTextItemView("homeProductsTitle", "Productos · titulo", "Titulo principal de productos", homeProductsTitle),
                new SiteTextItemView("adminIntroText", "Panel admin", "Texto introductorio del dashboard", adminIntroText)
            );
        }

        List<SiteTextItemView> items = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            String prefix = "site.text.item." + i + ".";
            String id = getConfigValue(prefix + "id", "custom_" + i);
            String label = getConfigValue(prefix + "label", "Texto " + i);
            String helper = getConfigValue(prefix + "helper", "");
            String value = getConfigValue(prefix + "value", "");
            items.add(new SiteTextItemView(id, label, helper, value));
        }
        return items;
    }

    private List<PromoBannerView> loadPromoBanners(
        String homePromoPrimaryEyebrow,
        String homePromoPrimaryTitle,
        String homePromoPrimaryText,
        String homePromoPrimaryBgColor,
        String homePromoPrimaryTextColor,
        String homePromoSecondaryEyebrow,
        String homePromoSecondaryTitle,
        String homePromoSecondaryText,
        String homePromoSecondaryBgColor,
        String homePromoSecondaryTextColor
    ) {
        int count = getConfigInt("site.home.banner.count", 0, 0, 8);
        if (count <= 0) {
            return List.of(
                new PromoBannerView(
                    homePromoPrimaryEyebrow,
                    homePromoPrimaryTitle,
                    homePromoPrimaryText,
                    homePromoPrimaryBgColor,
                    homePromoPrimaryTextColor,
                    getConfigValue("site.home.promo.primary.image_url", "")
                ),
                new PromoBannerView(
                    homePromoSecondaryEyebrow,
                    homePromoSecondaryTitle,
                    homePromoSecondaryText,
                    homePromoSecondaryBgColor,
                    homePromoSecondaryTextColor,
                    getConfigValue("site.home.promo.secondary.image_url", "")
                )
            );
        }

        List<PromoBannerView> banners = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            String prefix = "site.home.banner." + i + ".";
            banners.add(new PromoBannerView(
                getConfigValue(prefix + "eyebrow", "Banner " + i),
                getConfigValue(prefix + "title", "Nuevo banner"),
                getConfigValue(prefix + "text", ""),
                getConfigValue(prefix + "bg_color", i == 1 ? "#185dc2" : "#f4f6fa"),
                getConfigValue(prefix + "text_color", i == 1 ? "#ffffff" : "#10223c"),
                getConfigValue(prefix + "image_url", "")
            ));
        }
        return banners;
    }

    private List<ThemeTokenView> loadThemeTokens() {
        int count = getConfigInt("site.theme.token.count", 0, 0, 40);
        if (count <= 0) {
            return List.of(
                new ThemeTokenView("carousel.bg", "Fondo del carrusel", "text", "radial-gradient(circle at top right, rgba(52, 199, 217, 0.24), transparent 32%), linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 239, 229, 0.92))"),
                new ThemeTokenView("carousel.border", "Borde del carrusel", "color", "rgba(255,255,255,0.74)"),
                new ThemeTokenView("carousel.titleColor", "Color titulo carrusel", "color", "#10223c"),
                new ThemeTokenView("carousel.textColor", "Color texto carrusel", "color", "#51627f"),
                new ThemeTokenView("carousel.titleSize", "Tamano titulo carrusel", "text", "clamp(2.2rem, 4vw, 4.5rem)"),
                new ThemeTokenView("carousel.textSize", "Tamano texto carrusel", "text", "1rem"),
                new ThemeTokenView("banner.cardBorder", "Borde tarjetas banner", "color", "rgba(255,255,255,0.7)"),
                new ThemeTokenView("banner.titleSize", "Tamano titulo banner", "text", "1.25rem"),
                new ThemeTokenView("banner.textSize", "Tamano texto banner", "text", "1rem"),
                new ThemeTokenView("category.cardBg", "Fondo tarjetas categorias", "color", "rgba(255, 255, 255, 0.88)"),
                new ThemeTokenView("category.cardBorder", "Borde tarjetas categorias", "color", "rgba(255,255,255,0.78)"),
                new ThemeTokenView("category.titleColor", "Color titulo categorias", "color", "#10223c"),
                new ThemeTokenView("category.textColor", "Color texto categorias", "color", "#51627f"),
                new ThemeTokenView("category.titleSize", "Tamano titulo categorias", "text", "1.32rem"),
                new ThemeTokenView("product.cardBg", "Fondo tarjetas productos", "color", "rgba(255, 255, 255, 0.88)"),
                new ThemeTokenView("product.cardBorder", "Borde tarjetas productos", "color", "rgba(255,255,255,0.78)"),
                new ThemeTokenView("product.titleColor", "Color titulo productos", "color", "#10223c"),
                new ThemeTokenView("product.textColor", "Color texto productos", "color", "#51627f"),
                new ThemeTokenView("product.titleSize", "Tamano titulo productos", "text", "1.24rem"),
                new ThemeTokenView("product.textSize", "Tamano texto productos", "text", "1rem"),
                new ThemeTokenView("product.buttonBg", "Fondo boton productos", "text", "linear-gradient(135deg, #1164d8, #0b4696)"),
                new ThemeTokenView("product.buttonText", "Texto boton productos", "color", "#ffffff")
            );
        }

        List<ThemeTokenView> tokens = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            String prefix = "site.theme.token." + i + ".";
            String id = getConfigValue(prefix + "id", "token_" + i);
            String label = getConfigValue(prefix + "label", "Token " + i);
            String type = getConfigValue(prefix + "type", "text");
            String value = getConfigValue(prefix + "value", "");
            tokens.add(new ThemeTokenView(id, label, type, value));
        }
        return tokens;
    }

    private String findTextItemValue(List<SiteTextItemView> items, String id) {
        for (SiteTextItemView item : items) {
            if (id.equals(trimNullable(item.id()))) {
                return item.value();
            }
        }
        return null;
    }

    private TicketView mapTicket(ResultSet rs, int rowNum) throws SQLException {
        Long ticketId = rs.getLong("id");
        return new TicketView(
            ticketId,
            rs.getString("codigo_ticket"),
            rs.getString("cliente_nombre"),
            rs.getString("cliente_telefono"),
            rs.getString("cliente_email"),
            rs.getString("cliente_documento"),
            rs.getString("cliente_empresa"),
            rs.getString("tipo_entrega"),
            rs.getString("direccion_entrega"),
            rs.getString("ciudad_entrega"),
            rs.getString("referencia_entrega"),
            rs.getString("horario_contacto"),
            rs.getString("estado"),
            rs.getString("comentario"),
            rs.getString("whatsapp_link"),
            rs.getTimestamp("created_at").toInstant().toString(),
            loadTicketItems(ticketId)
        );
    }

    private List<TicketItemResponse> loadTicketItems(Long ticketId) {
        return jdbcTemplate.query(
            """
            SELECT producto_id, cantidad, snapshot_nombre, snapshot_stock
            FROM detalle_pedido
            WHERE pedido_id = ?
            ORDER BY id ASC
            """,
            (rs, rowNum) -> new TicketItemResponse(
                rs.getLong("producto_id"),
                rs.getString("snapshot_nombre"),
                rs.getInt("cantidad"),
                rs.getInt("snapshot_stock") > 0
            ),
            ticketId
        );
    }

    private String parseDeliveryType(String value) {
        String normalized = safeText(value, 30, "Debes indicar el tipo de entrega").toUpperCase(Locale.ROOT);
        if (!normalized.equals("DOMICILIO") && !normalized.equals("RETIRO")) {
            throw new ApiException(400, "El tipo de entrega debe ser DOMICILIO o RETIRO");
        }
        return normalized;
    }

    private String generateTicketCode() {
        String dayPrefix = DateTimeFormatter.BASIC_ISO_DATE.format(LocalDate.now());
        String shortRandom = UUID.randomUUID().toString().replace("-", "").substring(0, 7).toUpperCase(Locale.ROOT);
        return "TCK-" + dayPrefix + "-" + shortRandom;
    }

    private String safeText(String value, int maxLength, String errorMessage) {
        String trimmed = trimNullable(value);
        if (trimmed == null || trimmed.isBlank()) {
            throw new ApiException(400, errorMessage);
        }

        if (trimmed.length() > maxLength) {
            return trimmed.substring(0, maxLength);
        }

        return trimmed;
    }

    private String trimNullable(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizeSlug(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value
            .toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-|-$)", "");

        if (normalized.isBlank()) {
            throw new ApiException(400, "Slug invalido");
        }

        return normalized;
    }

    private String corporateWhatsappLink(String encodedMessage) {
        return "https://wa.me/" + whatsappNumber + "?text=" + encodedMessage;
    }

    private String urlEncode(String text) {
        return URLEncoder.encode(text, StandardCharsets.UTF_8);
    }

    private boolean hasColumn(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = ? AND column_name = ?
            """,
            Integer.class,
            tableName,
            columnName
        );

        return count != null && count > 0;
    }

    private String getConfigValue(String key, String fallback) {
        String value = jdbcTemplate.query(
            "SELECT valor FROM configuracion_tienda WHERE clave = ?",
            rs -> rs.next() ? rs.getString("valor") : null,
            key
        );
        return value == null || value.isBlank() ? fallback : value;
    }

    private List<String> sanitizeImageUrls(List<String> imageUrls) {
        List<String> result = new ArrayList<>();
        if (imageUrls == null) {
            return result;
        }
        for (String raw : imageUrls) {
            String value = trimNullable(raw);
            if (value == null || value.isBlank()) {
                continue;
            }
            if (!result.contains(value)) {
                result.add(value);
            }
        }
        return result;
    }

    private void replaceProductImages(Long productId, List<String> imageUrls, String fallbackCover) {
        jdbcTemplate.update("DELETE FROM producto_imagenes WHERE producto_id = ?", productId);
        List<String> safeUrls = sanitizeImageUrls(imageUrls);
        if (safeUrls.isEmpty() && fallbackCover != null && !fallbackCover.isBlank()) {
            safeUrls = List.of(fallbackCover);
        }
        for (int i = 0; i < safeUrls.size(); i++) {
            jdbcTemplate.update(
                "INSERT INTO producto_imagenes (producto_id, imagen_url, orden, created_at) VALUES (?, ?, ?, now())",
                productId,
                safeUrls.get(i),
                i
            );
        }
    }

    private List<String> loadProductImageUrls(Long productId, String fallbackCover) {
        List<String> urls = jdbcTemplate.queryForList(
            "SELECT imagen_url FROM producto_imagenes WHERE producto_id = ? ORDER BY orden ASC, id ASC",
            String.class,
            productId
        );
        List<String> safeUrls = sanitizeImageUrls(urls);
        String cover = trimNullable(fallbackCover);
        if ((safeUrls.isEmpty() || !safeUrls.contains(cover)) && cover != null && !cover.isBlank()) {
            List<String> merged = new ArrayList<>();
            merged.add(cover);
            merged.addAll(safeUrls);
            return merged;
        }
        return safeUrls;
    }

    private int getConfigInt(String key, int fallback, int min, int max) {
        String raw = getConfigValue(key, String.valueOf(fallback));
        int value;
        try {
            value = Integer.parseInt(raw);
        } catch (NumberFormatException exception) {
            value = fallback;
        }
        return Math.max(min, Math.min(max, value));
    }

    private void upsertConfigValue(String key, String value) {
        jdbcTemplate.update(
            """
            INSERT INTO configuracion_tienda (clave, valor, updated_at)
            VALUES (?, ?, now())
            ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, updated_at = now()
            """,
            key,
            value
        );
    }

    private void upsertConfigValueIfBlank(String key, String value) {
        String current = jdbcTemplate.query(
            "SELECT valor FROM configuracion_tienda WHERE clave = ?",
            rs -> rs.next() ? rs.getString("valor") : null,
            key
        );

        if (current == null || current.trim().isBlank()) {
            upsertConfigValue(key, value);
        }
    }

    private record ProductSnapshot(Long id, String name, Integer stock) {}

    private record AdminContext(Long id, String name, String email, String role) {}
}
