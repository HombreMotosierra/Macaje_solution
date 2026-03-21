import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const TOKEN_KEY = 'macaje_admin_token'

const initialSiteContent = {
  searchPlaceholder: 'Que solucion de tecnologia estas buscando?',
  homeCategoriesKicker: 'Lineas destacadas',
  homeCategoriesTitle: 'Categorias principales',
  homeProductsKicker: 'Top picks',
  homeProductsTitle: 'Productos destacados',
  themeFontPreset: 'inter',
  headingFontPreset: 'montserrat',
  headingColor: '#10223c',
  bodyTextColor: '#51627f',
  homePromoPrimaryEyebrow: 'Integracion comercial',
  homePromoPrimaryTitle: 'Catalogo orientado a empresas y compras asistidas',
  homePromoPrimaryText: 'Fichas tecnicas, detalle claro y contacto directo con el equipo comercial.',
  homePromoPrimaryBgColor: '#185dc2',
  homePromoPrimaryTextColor: '#ffffff',
  homePromoSecondaryEyebrow: 'Operacion',
  homePromoSecondaryTitle: 'Inventario visible y flujo sin registro de clientes',
  homePromoSecondaryText: 'Carrito consultivo, ticket unico y seguimiento por WhatsApp corporativo.',
  homePromoSecondaryBgColor: '#f4f6fa',
  homePromoSecondaryTextColor: '#10223c',
  adminIntroText: 'Gestion profesional de catalogo, pedidos y configuracion.',
  primaryWeeklyOfferProductId: null,
  primaryWeeklyOfferImageFit: 'cover',
  primaryWeeklyOfferImageZoom: 1,
  primaryWeeklyOfferImageOffsetX: 0,
  primaryWeeklyOfferImageOffsetY: 0,
  themeTokens: [
    { id: 'carousel.bg', label: 'Fondo del carrusel', type: 'text', value: 'radial-gradient(circle at top right, rgba(52, 199, 217, 0.24), transparent 32%), linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 239, 229, 0.92))' },
    { id: 'carousel.border', label: 'Borde del carrusel', type: 'color', value: 'rgba(255,255,255,0.74)' },
    { id: 'carousel.titleColor', label: 'Color titulo carrusel', type: 'color', value: '#10223c' },
    { id: 'carousel.textColor', label: 'Color texto carrusel', type: 'color', value: '#51627f' },
    { id: 'carousel.titleSize', label: 'Tamano titulo carrusel', type: 'text', value: 'clamp(2.2rem, 4vw, 4.5rem)' },
    { id: 'carousel.textSize', label: 'Tamano texto carrusel', type: 'text', value: '1rem' },
    { id: 'banner.cardBorder', label: 'Borde tarjetas banner', type: 'color', value: 'rgba(255,255,255,0.7)' },
    { id: 'banner.titleSize', label: 'Tamano titulo banner', type: 'text', value: '1.25rem' },
    { id: 'banner.textSize', label: 'Tamano texto banner', type: 'text', value: '1rem' },
    { id: 'category.cardBg', label: 'Fondo tarjetas categorias', type: 'color', value: 'rgba(255, 255, 255, 0.88)' },
    { id: 'category.cardBorder', label: 'Borde tarjetas categorias', type: 'color', value: 'rgba(255,255,255,0.78)' },
    { id: 'category.titleColor', label: 'Color titulo categorias', type: 'color', value: '#10223c' },
    { id: 'category.textColor', label: 'Color texto categorias', type: 'color', value: '#51627f' },
    { id: 'category.titleSize', label: 'Tamano titulo categorias', type: 'text', value: '1.32rem' },
    { id: 'product.cardBg', label: 'Fondo tarjetas productos', type: 'color', value: 'rgba(255, 255, 255, 0.88)' },
    { id: 'product.cardBorder', label: 'Borde tarjetas productos', type: 'color', value: 'rgba(255,255,255,0.78)' },
    { id: 'product.titleColor', label: 'Color titulo productos', type: 'color', value: '#10223c' },
    { id: 'product.textColor', label: 'Color texto productos', type: 'color', value: '#51627f' },
    { id: 'product.titleSize', label: 'Tamano titulo productos', type: 'text', value: '1.24rem' },
    { id: 'product.textSize', label: 'Tamano texto productos', type: 'text', value: '1rem' },
    { id: 'product.buttonBg', label: 'Fondo boton productos', type: 'text', value: 'linear-gradient(135deg, #1164d8, #0b4696)' },
    { id: 'product.buttonText', label: 'Texto boton productos', type: 'color', value: '#ffffff' },
  ],
  customCss: '',
  textItems: [
    { id: 'searchPlaceholder', label: 'Busqueda', helper: 'Texto dentro del buscador', value: 'Que solucion de tecnologia estas buscando?' },
    { id: 'homeCategoriesKicker', label: 'Categorias · etiqueta', helper: 'Texto corto sobre la seccion', value: 'Lineas destacadas' },
    { id: 'homeCategoriesTitle', label: 'Categorias · titulo', helper: 'Titulo principal de categorias', value: 'Categorias principales' },
    { id: 'homeProductsKicker', label: 'Productos · etiqueta', helper: 'Texto corto sobre la seccion', value: 'Top picks' },
    { id: 'homeProductsTitle', label: 'Productos · titulo', helper: 'Titulo principal de productos', value: 'Productos destacados' },
    { id: 'adminIntroText', label: 'Panel admin', helper: 'Texto introductorio del dashboard', value: 'Gestion profesional de catalogo, pedidos y configuracion.' },
  ],
  promoBanners: [
    {
      eyebrow: 'Integracion comercial',
      title: 'Catalogo orientado a empresas y compras asistidas',
      text: 'Fichas tecnicas, detalle claro y contacto directo con el equipo comercial.',
      bgColor: '#185dc2',
      textColor: '#ffffff',
      imageUrl: '',
    },
    {
      eyebrow: 'Operacion',
      title: 'Inventario visible y flujo sin registro de clientes',
      text: 'Carrito consultivo, ticket unico y seguimiento por WhatsApp corporativo.',
      bgColor: '#f4f6fa',
      textColor: '#10223c',
      imageUrl: '',
    },
  ],
  heroSlides: [
    {
      eyebrow: 'ATR Group',
      title: 'Tecnologia corporativa para empresas que exigen respuesta inmediata',
      text: 'Explora computo, redes, infraestructura y perifericos con experiencia de ecommerce moderna, stock visible y cierre comercial por WhatsApp.',
      cta: 'Explorar catalogo',
      bgImageUrl: '',
    },
    {
      eyebrow: 'Compra consultiva',
      title: 'Carrito sin precios publicos y ticket unico para cada solicitud',
      text: 'Tus clientes agregan productos, generan una solicitud y continuan el proceso con el equipo comercial de ATR Group.',
      cta: 'Ir al carrito',
      bgImageUrl: '',
    },
  ],
}

const fontPresetMap = {
  inter: "'Inter', 'Segoe UI', sans-serif",
  poppins: "'Poppins', 'Segoe UI', sans-serif",
  manrope: "'Manrope', 'Segoe UI', sans-serif",
  montserrat: "'Montserrat', 'Segoe UI', sans-serif",
  merriweather: "'Merriweather', Georgia, serif",
}

const themePresetMap = {
  corporate: {
    label: 'Corporate Indigo',
    values: {
      themeFontPreset: 'inter',
      headingFontPreset: 'montserrat',
      headingColor: '#0f2a4f',
      bodyTextColor: '#465d7f',
      homePromoPrimaryBgColor: '#155cc4',
      homePromoPrimaryTextColor: '#ffffff',
      homePromoSecondaryBgColor: '#eef3fb',
      homePromoSecondaryTextColor: '#10223c',
    },
  },
  slate: {
    label: 'Slate Editorial',
    values: {
      themeFontPreset: 'manrope',
      headingFontPreset: 'merriweather',
      headingColor: '#1f2937',
      bodyTextColor: '#4b5563',
      homePromoPrimaryBgColor: '#334155',
      homePromoPrimaryTextColor: '#f8fafc',
      homePromoSecondaryBgColor: '#f1f5f9',
      homePromoSecondaryTextColor: '#1f2937',
    },
  },
  sunrise: {
    label: 'Sunrise Commerce',
    values: {
      themeFontPreset: 'poppins',
      headingFontPreset: 'montserrat',
      headingColor: '#1d3557',
      bodyTextColor: '#4f5d75',
      homePromoPrimaryBgColor: '#d95d39',
      homePromoPrimaryTextColor: '#fff7f0',
      homePromoSecondaryBgColor: '#f6efe4',
      homePromoSecondaryTextColor: '#1d3557',
    },
  },
  contrast: {
    label: 'High Contrast',
    values: {
      themeFontPreset: 'inter',
      headingFontPreset: 'inter',
      headingColor: '#0a0a0a',
      bodyTextColor: '#222222',
      homePromoPrimaryBgColor: '#0a0a0a',
      homePromoPrimaryTextColor: '#ffffff',
      homePromoSecondaryBgColor: '#ffffff',
      homePromoSecondaryTextColor: '#0a0a0a',
    },
  },
}

const knownTextItemIds = new Set([
  'searchPlaceholder',
  'homeCategoriesKicker',
  'homeCategoriesTitle',
  'homeProductsKicker',
  'homeProductsTitle',
  'adminIntroText',
])

const sectionTokenLabels = {
  carousel: 'Carrusel',
  banner: 'Banners',
  category: 'Categorias',
  product: 'Productos',
}

function normalizeSiteContent(content) {
  const merged = { ...initialSiteContent, ...(content || {}) }

  const textItems = Array.isArray(content?.textItems) && content.textItems.length > 0
    ? content.textItems
    : initialSiteContent.textItems

  const promoBanners = Array.isArray(content?.promoBanners) && content.promoBanners.length > 0
    ? content.promoBanners
    : [
        {
          eyebrow: merged.homePromoPrimaryEyebrow,
          title: merged.homePromoPrimaryTitle,
          text: merged.homePromoPrimaryText,
          bgColor: merged.homePromoPrimaryBgColor,
          textColor: merged.homePromoPrimaryTextColor,
          imageUrl: merged.homePromoPrimaryImageUrl || '',
        },
        {
          eyebrow: merged.homePromoSecondaryEyebrow,
          title: merged.homePromoSecondaryTitle,
          text: merged.homePromoSecondaryText,
          bgColor: merged.homePromoSecondaryBgColor,
          textColor: merged.homePromoSecondaryTextColor,
          imageUrl: merged.homePromoSecondaryImageUrl || '',
        },
      ]

  const incomingTokens = Array.isArray(content?.themeTokens) && content.themeTokens.length > 0
    ? content.themeTokens
    : initialSiteContent.themeTokens
  const hasSectionScopedTokens = incomingTokens.some((token) => String(token?.id || '').includes('.'))
  const themeTokens = hasSectionScopedTokens ? incomingTokens : initialSiteContent.themeTokens

  return {
    ...merged,
    textItems,
    promoBanners,
    themeTokens,
    customCss: content?.customCss ?? merged.customCss ?? '',
  }
}

const initialTicketForm = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerDocument: '',
  companyName: '',
  deliveryType: 'DOMICILIO',
  deliveryAddress: '',
  deliveryCity: '',
  deliveryReference: '',
  preferredContactTime: '',
  notes: '',
}

const initialProductForm = {
  categorySlug: '',
  name: '',
  slug: '',
  detail: '',
  technicalSheet: '',
  stock: 0,
  imageUrl: '',
  imageUrls: [],
  featured: false,
  weeklyOffer: false,
  discountPercent: 0,
  offerDeadline: '',
}

const initialLoginForm = {
  email: 'superadmin@macaje.local',
  password: 'Cambiar123!',
}

const initialBrandingForm = {
  storeName: 'ATR Group',
  tagline: 'Impulsando con tecnologia',
  logoUrl: '/logo.jpeg',
}

const initialCategoryForm = {
  name: '',
  slug: '',
  description: '',
  imageUrl: '',
  featured: false,
}

const initialAdminUserForm = {
  name: '',
  email: '',
  password: '',
  roleName: 'ADMIN',
}

const initialCarouselForm = {
  intervalMs: 5000,
  effect: 'fade',
  slide1BgImage: '',
  slide2BgImage: '',
}

const initialEditUserForm = {
  name: '',
  email: '',
  roleName: 'ADMIN',
  password: '',
  active: true,
}

const initialImageEditor = {
  open: false,
  context: null,
  file: null,
  previewUrl: '',
  fit: 'cover',
  outputFormat: 'image/jpeg',
  quality: 85,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  removeBackground: false,
  width: 1200,
  height: 800,
}

function resolveAssetUrl(url) {
  const value = String(url || '').trim()
  if (!value) {
    return '/tiny-test.png'
  }

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value
  }

  if (value.startsWith('/uploads/') && window.location.port === '5173') {
    return `http://localhost:8080${value}`
  }

  return value
}

function handleImageFallback(event) {
  event.currentTarget.src = '/tiny-test.png'
}

function formatDateTime(value) {
  if (!value) {
    return 'Sin fecha'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toDateTimeLocalValue(value) {
  if (!value) {
    return ''
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return String(value).slice(0, 16)
  }

  const pad = (part) => String(part).padStart(2, '0')
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`
}

async function fetchJson(url, options = {}) {
  let response
  try {
    response = await fetch(url, { cache: 'no-store', ...options })
  } catch (networkError) {
    throw new Error('No se pudo conectar con el servidor. Verifica que backend y frontend esten activos.')
  }
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data?.message || `Error ${response.status}`
    throw new Error(message)
  }

  return data
}

function CountdownTimer({ deadline }) {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (!deadline) return
    function tick() {
      const diff = new Date(deadline).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({ expired: true })
        return
      }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ days, hours, minutes, seconds, expired: false })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadline])

  if (!deadline || !timeLeft) return null
  if (timeLeft.expired) return <p className="countdown-expired">¡Oferta finalizada!</p>

  return (
    <div className="offer-countdown">
      <span className="countdown-label">Vence en:</span>
      <div className="countdown-units">
        {timeLeft.days > 0 && (
          <span className="countdown-unit"><strong>{String(timeLeft.days).padStart(2, '0')}</strong><small>d</small></span>
        )}
        <span className="countdown-unit"><strong>{String(timeLeft.hours).padStart(2, '0')}</strong><small>h</small></span>
        <span className="countdown-unit"><strong>{String(timeLeft.minutes).padStart(2, '0')}</strong><small>m</small></span>
        <span className="countdown-unit"><strong>{String(timeLeft.seconds).padStart(2, '0')}</strong><small>s</small></span>
      </div>
    </div>
  )
}

function App() {
  const [view, setView] = useState('home')
  const [homeData, setHomeData] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categoryProducts, setCategoryProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [detailActiveImage, setDetailActiveImage] = useState('')
  const [ticketForm, setTicketForm] = useState(initialTicketForm)
  const [ticketItems, setTicketItems] = useState([])
  const [ticketResult, setTicketResult] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [activeHero, setActiveHero] = useState(0)
  const [loginForm, setLoginForm] = useState(initialLoginForm)
  const [adminToken, setAdminToken] = useState(localStorage.getItem(TOKEN_KEY) || '')
  const [authUser, setAuthUser] = useState(null)
  const [adminTickets, setAdminTickets] = useState([])
  const [auditRows, setAuditRows] = useState([])
  const [ticketStatusFilter, setTicketStatusFilter] = useState('')
  const [ticketSearchFilter, setTicketSearchFilter] = useState('')
  const [ticketViewTab, setTicketViewTab] = useState('ALL')
  const [adminProductForm, setAdminProductForm] = useState(initialProductForm)
  const [adminCategoryForm, setAdminCategoryForm] = useState(initialCategoryForm)
  const [editCategoryForm, setEditCategoryForm] = useState(initialCategoryForm)
  const [editProductForm, setEditProductForm] = useState(initialProductForm)
  const [adminUserForm, setAdminUserForm] = useState(initialAdminUserForm)
  const [branding, setBranding] = useState(initialBrandingForm)
  const [brandingForm, setBrandingForm] = useState(initialBrandingForm)
  const [adminTab, setAdminTab] = useState('overview')
  const [editingCategorySlug, setEditingCategorySlug] = useState('')
  const [editingProductId, setEditingProductId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [loadingAdminData, setLoadingAdminData] = useState(false)
  const [submittingTicket, setSubmittingTicket] = useState(false)
  const [submittingProduct, setSubmittingProduct] = useState(false)
  const [submittingCategory, setSubmittingCategory] = useState(false)
  const [deletingCategorySlug, setDeletingCategorySlug] = useState('')
  const [deletingProductId, setDeletingProductId] = useState(null)
  const [savingBranding, setSavingBranding] = useState(false)
  const [savingCategoryEdit, setSavingCategoryEdit] = useState(false)
  const [savingProductEdit, setSavingProductEdit] = useState(false)
  const [creatingAdminUser, setCreatingAdminUser] = useState(false)
  const [loadingOffers, setLoadingOffers] = useState(false)
  const [savingOfferProductId, setSavingOfferProductId] = useState(null)
  const [savingAllOffers, setSavingAllOffers] = useState(false)
  const [offerSearch, setOfferSearch] = useState('')
  const [adminOfferProducts, setAdminOfferProducts] = useState([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [carouselConfig, setCarouselConfig] = useState(initialCarouselForm)
  const [carouselForm, setCarouselForm] = useState(initialCarouselForm)
  const [savingCarousel, setSavingCarousel] = useState(false)
  const [siteContentForm, setSiteContentForm] = useState(initialSiteContent)
  const [savingSiteContent, setSavingSiteContent] = useState(false)
  const [contentSection, setContentSection] = useState('textos')
  const [uploadingSlideIndex, setUploadingSlideIndex] = useState(null)
  const [adminUsers, setAdminUsers] = useState([])
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false)
  const [adminEntryEnabled, setAdminEntryEnabled] = useState(() => {
    const hash = String(window.location.hash || '').toLowerCase()
    const params = new URLSearchParams(window.location.search || '')
    return hash === '#admin' || params.get('admin') === '1'
  })
  const [editingUserId, setEditingUserId] = useState(null)
  const [editUserForm, setEditUserForm] = useState(initialEditUserForm)
  const [savingUserEdit, setSavingUserEdit] = useState(false)
  const [togglingUserId, setTogglingUserId] = useState(null)
  const [deletingUserId, setDeletingUserId] = useState(null)
  const [imageEditor, setImageEditor] = useState(initialImageEditor)
  const imageDragRef = useRef(null)
  const primaryOfferDragRef = useRef(null)
  const [isPrimaryOfferDragging, setIsPrimaryOfferDragging] = useState(false)

  const isAdminAuthenticated = Boolean(adminToken)
  const isSuperAdmin = authUser?.roleName === 'SUPER_ADMIN'
  const canManageTicketStatus = authUser?.roleName === 'SUPER_ADMIN' || authUser?.roleName === 'ADMIN'
  const canShowAdminEntry = isAdminAuthenticated || adminEntryEnabled
  const isAdminView = view === 'admin'
  const cartCount = ticketItems.reduce((sum, item) => sum + item.quantity, 0)
  const normalizedSearch = searchText.trim().toLowerCase()

  const categoryMap = useMemo(() => {
    const map = new Map()
    categories.forEach((category) => map.set(category.slug, category))
    return map
  }, [categories])

  const filteredFeaturedProducts = useMemo(() => {
    const products = homeData?.featuredProducts ?? []
    if (!normalizedSearch) {
      return products
    }

    return products.filter((product) =>
      [product.name, product.detail, product.categoryName].some((field) =>
        String(field || '').toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [homeData, normalizedSearch])

  const filteredWeeklyOffers = useMemo(() => {
    const offers = homeData?.weeklyOffers ?? []
    if (!normalizedSearch) {
      return offers
    }

    return offers.filter((product) =>
      [product.name, product.detail, product.categoryName].some((field) =>
        String(field || '').toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [homeData, normalizedSearch])

  const filteredCategoryProducts = useMemo(() => {
    if (!normalizedSearch) {
      return categoryProducts
    }

    return categoryProducts.filter((product) =>
      [product.name, product.detail, product.technicalSheet, product.categoryName].some((field) =>
        String(field || '').toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [categoryProducts, normalizedSearch])

  const filteredAdminOffers = useMemo(() => {
    if (!isAdminView || adminTab !== 'offers') {
      return []
    }
    const needle = String(offerSearch || '').trim().toLowerCase()
    if (!needle) {
      return adminOfferProducts
    }

    return adminOfferProducts.filter((product) =>
      [product.name, product.categoryName, product.slug].some((field) =>
        String(field || '').toLowerCase().includes(needle),
      ),
    )
  }, [adminOfferProducts, offerSearch, isAdminView, adminTab])

  const selectedPrimaryOffer = useMemo(() => {
    const primaryId = String(siteContentForm.primaryWeeklyOfferProductId || '').trim()
    if (!primaryId) {
      return null
    }
    return adminOfferProducts.find((product) => String(product.id) === primaryId) || null
  }, [adminOfferProducts, siteContentForm.primaryWeeklyOfferProductId])

  const primaryOfferImageMaxOffset = useMemo(() => {
    const zoom = clamp(Number(siteContentForm.primaryWeeklyOfferImageZoom ?? 1), 0.2, 5)
    return Math.max(0, (zoom - 1) * 100)
  }, [siteContentForm.primaryWeeklyOfferImageZoom])

  const primaryOfferImageSettings = useMemo(() => {
    const legacyOffsetX = (Number(siteContentForm.primaryWeeklyOfferImagePosX ?? 50) - 50) * 2
    const legacyOffsetY = (Number(siteContentForm.primaryWeeklyOfferImagePosY ?? 50) - 50) * 2
    return {
      fit: siteContentForm.primaryWeeklyOfferImageFit === 'contain' ? 'contain' : 'cover',
      zoom: clamp(Number(siteContentForm.primaryWeeklyOfferImageZoom ?? 1), 0.2, 5),
      offsetX: clamp(Number(siteContentForm.primaryWeeklyOfferImageOffsetX ?? legacyOffsetX), -primaryOfferImageMaxOffset, primaryOfferImageMaxOffset),
      offsetY: clamp(Number(siteContentForm.primaryWeeklyOfferImageOffsetY ?? legacyOffsetY), -primaryOfferImageMaxOffset, primaryOfferImageMaxOffset),
    }
  }, [siteContentForm, primaryOfferImageMaxOffset])
  const primaryOfferImageTransform = `translate(${primaryOfferImageSettings.offsetX}%, ${primaryOfferImageSettings.offsetY}%) scale(${primaryOfferImageSettings.zoom})`

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) {
      return []
    }

    return categoryProducts.filter((product) => product.id !== selectedProduct.id).slice(0, 4)
  }, [categoryProducts, selectedProduct])

  const ticketStatusGroups = useMemo(() => {
    if (!isAdminView || adminTab !== 'tickets') {
      return {
        NUEVO: [],
        EN_PROCESO: [],
        CERRADO: [],
        OTROS: [],
      }
    }
    const groups = {
      NUEVO: [],
      EN_PROCESO: [],
      CERRADO: [],
      OTROS: [],
    }

    adminTickets.forEach((ticket) => {
      const status = String(ticket.status || '').toUpperCase()
      if (status === 'NUEVO' || status === 'EN_PROCESO' || status === 'CERRADO') {
        groups[status].push(ticket)
      } else {
        groups.OTROS.push(ticket)
      }
    })

    return groups
  }, [adminTickets, isAdminView, adminTab])

  const ticketSections = useMemo(() => {
    if (!isAdminView || adminTab !== 'tickets') {
      return []
    }
    const allSections = [
      { key: 'NUEVO', title: 'Tickets abiertos', items: ticketStatusGroups.NUEVO },
      { key: 'EN_PROCESO', title: 'Tickets en proceso', items: ticketStatusGroups.EN_PROCESO },
      { key: 'CERRADO', title: 'Tickets cerrados', items: ticketStatusGroups.CERRADO },
      { key: 'OTROS', title: 'Otros estados', items: ticketStatusGroups.OTROS },
    ]

    if (ticketViewTab === 'ALL') {
      return allSections
    }

    return allSections.filter((section) => section.key === ticketViewTab)
  }, [ticketStatusGroups, ticketViewTab, isAdminView, adminTab])

  const heroSlides = useMemo(() => {
    const slides = siteContentForm.heroSlides || []
    return slides.length > 0 ? slides : initialSiteContent.heroSlides
  }, [siteContentForm])

  const contentTextItems = useMemo(() => {
    const items = siteContentForm.textItems || []
    return items.length > 0 ? items : initialSiteContent.textItems
  }, [siteContentForm])

  const promoBanners = useMemo(() => {
    const banners = siteContentForm.promoBanners || []
    return banners.length > 0 ? banners : initialSiteContent.promoBanners
  }, [siteContentForm])

  const themeTokenMap = useMemo(() => {
    const tokens = siteContentForm.themeTokens || []
    return tokens.reduce((acc, token) => {
      if (token?.id) {
        acc[token.id] = token.value || ''
      }
      return acc
    }, {})
  }, [siteContentForm])

  const themeTokensBySection = useMemo(() => {
    const groups = {}
    ;(siteContentForm.themeTokens || []).forEach((token) => {
      const section = String(token?.id || '').split('.')[0] || 'otros'
      if (!groups[section]) {
        groups[section] = []
      }
      groups[section].push(token)
    })
    return groups
  }, [siteContentForm])

  const appThemeStyle = useMemo(() => {
    const bodyFont = fontPresetMap[siteContentForm.themeFontPreset] || fontPresetMap.inter
    const headingFont = fontPresetMap[siteContentForm.headingFontPreset] || fontPresetMap.montserrat
    return {
      '--font-body': bodyFont,
      '--font-heading': headingFont,
    }
  }, [siteContentForm, themeTokenMap])

  function tokenValue(tokenId, fallback) {
    const raw = themeTokenMap[tokenId]
    return raw == null || String(raw).trim() === '' ? fallback : raw
  }

  const sectionStyles = useMemo(() => ({
    carouselPanel: {
      background: tokenValue('carousel.bg', 'radial-gradient(circle at top right, rgba(52, 199, 217, 0.24), transparent 32%), linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 239, 229, 0.92))'),
      border: `1px solid ${tokenValue('carousel.border', 'rgba(255,255,255,0.74)')}`,
    },
    carouselTitle: {
      color: tokenValue('carousel.titleColor', '#10223c'),
      fontSize: tokenValue('carousel.titleSize', 'clamp(2.2rem, 4vw, 4.5rem)'),
    },
    carouselText: {
      color: tokenValue('carousel.textColor', '#51627f'),
      fontSize: tokenValue('carousel.textSize', '1rem'),
    },
    bannerCard: {
      borderColor: tokenValue('banner.cardBorder', 'rgba(255,255,255,0.7)'),
    },
    bannerTitle: {
      fontSize: tokenValue('banner.titleSize', '1.25rem'),
    },
    bannerText: {
      fontSize: tokenValue('banner.textSize', '1rem'),
    },
    categoryCard: {
      background: tokenValue('category.cardBg', 'rgba(255, 255, 255, 0.88)'),
      border: `1px solid ${tokenValue('category.cardBorder', 'rgba(255,255,255,0.78)')}`,
    },
    categoryTitle: {
      color: tokenValue('category.titleColor', '#10223c'),
      fontSize: tokenValue('category.titleSize', '1.32rem'),
    },
    categoryText: {
      color: tokenValue('category.textColor', '#51627f'),
    },
    productCard: {
      background: tokenValue('product.cardBg', 'rgba(255, 255, 255, 0.88)'),
      border: `1px solid ${tokenValue('product.cardBorder', 'rgba(255,255,255,0.78)')}`,
    },
    productTitle: {
      color: tokenValue('product.titleColor', '#10223c'),
      fontSize: tokenValue('product.titleSize', '1.24rem'),
    },
    productText: {
      color: tokenValue('product.textColor', '#51627f'),
      fontSize: tokenValue('product.textSize', '1rem'),
    },
    productButton: {
      background: tokenValue('product.buttonBg', 'linear-gradient(135deg, #1164d8, #0b4696)'),
      color: tokenValue('product.buttonText', '#ffffff'),
    },
  }), [themeTokenMap])

  function resolveCarouselPanelStyle(bgImageUrl) {
    const baseStyle = { ...sectionStyles.carouselPanel }
    const image = String(bgImageUrl || '').trim()
    if (!image) {
      return baseStyle
    }

    const baseBackground = tokenValue('carousel.bg', 'radial-gradient(circle at top right, rgba(52, 199, 217, 0.24), transparent 32%), linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 239, 229, 0.92))')
    return {
      ...baseStyle,
      backgroundImage: `${baseBackground}, url(${resolveAssetUrl(image)})`,
      backgroundSize: 'cover, cover',
      backgroundPosition: 'center, center',
      backgroundBlendMode: 'normal, normal',
    }
  }

  function adminHeaders(extraHeaders = {}, tokenOverride = null) {
    const token = tokenOverride || adminToken
    return {
      ...extraHeaders,
      Authorization: `Bearer ${token}`,
    }
  }

  useEffect(() => {
    const abortController = new AbortController()

    const loadInitialData = async () => {
      try {
        setLoading(true)
        const [home, categoryList] = await Promise.all([
          fetchJson('/api/store/home', { signal: abortController.signal }),
          fetchJson('/api/store/categorias', { signal: abortController.signal }),
        ])

        setHomeData(home)
        setBranding(home.branding || initialBrandingForm)
        setBrandingForm(home.branding || initialBrandingForm)
        setSiteContentForm(normalizeSiteContent(home.siteContent || initialSiteContent))
        const loadedCarousel = home.carouselConfig || initialCarouselForm
        setCarouselConfig(loadedCarousel)
        setCarouselForm(loadedCarousel)
        setCategories(categoryList)
        if (categoryList.length > 0) {
          setSelectedCategory(categoryList[0].slug)
        }
        setError('')
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadInitialData()

    return () => abortController.abort()
  }, [])

  useEffect(() => {
    const syncAdminEntryFromUrl = () => {
      const hash = String(window.location.hash || '').toLowerCase()
      const params = new URLSearchParams(window.location.search || '')
      const enabled = hash === '#admin' || params.get('admin') === '1'
      setAdminEntryEnabled(enabled)
      if (hash === '#admin') {
        setView('admin')
      }
    }

    syncAdminEntryFromUrl()
    window.addEventListener('hashchange', syncAdminEntryFromUrl)
    return () => window.removeEventListener('hashchange', syncAdminEntryFromUrl)
  }, [])

  useEffect(() => {
    const isAdminHash = String(window.location.hash || '').toLowerCase() === '#admin'
    if (view === 'admin' && !isAdminHash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#admin`)
      return
    }

    if (view !== 'admin' && isAdminHash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
  }, [view])

  useEffect(() => {
    if (!isPrimaryOfferDragging) {
      return undefined
    }
    const previousBodyOverflow = document.body.style.overflow
    const preventScroll = (event) => event.preventDefault()
    document.body.style.overflow = 'hidden'
    window.addEventListener('wheel', preventScroll, { passive: false, capture: true })
    return () => {
      document.body.style.overflow = previousBodyOverflow
      window.removeEventListener('wheel', preventScroll, { capture: true })
    }
  }, [isPrimaryOfferDragging])

  useEffect(() => {
    if (
      !Number.isFinite(activeHero) ||
      activeHero < 0 ||
      activeHero >= heroSlides.length
    ) {
      setActiveHero(0)
    }
  }, [activeHero, heroSlides.length])

  useEffect(() => {
    if (view !== 'home' || !heroSlides.length || heroSlides.length === 1) {
      return undefined
    }

    const timerId = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % heroSlides.length)
    }, carouselConfig.intervalMs || 5000)

    return () => window.clearInterval(timerId)
  }, [carouselConfig.intervalMs, heroSlides.length, view])

  function goToPreviousHero() {
    if (!heroSlides.length) {
      return
    }
    setActiveHero((current) => (current - 1 + heroSlides.length) % heroSlides.length)
  }

  function goToNextHero() {
    if (!heroSlides.length) {
      return
    }
    setActiveHero((current) => (current + 1) % heroSlides.length)
  }

  useEffect(() => {
    if (!adminToken) {
      setAuthUser(null)
      return
    }

    let mounted = true
    fetchJson('/api/auth/me', { headers: adminHeaders() })
      .then((user) => {
        if (mounted) {
          setAuthUser(user)
        }
      })
      .catch(() => {
        if (mounted) {
          localStorage.removeItem(TOKEN_KEY)
          setAdminToken('')
          setAuthUser(null)
        }
      })

    return () => {
      mounted = false
    }
  }, [adminToken])

  useEffect(() => {
    if (!selectedCategory) {
      return
    }

    let mounted = true
    fetchJson(`/api/store/categorias/${selectedCategory}/productos`)
      .then((products) => {
        if (mounted) {
          setCategoryProducts(products)
          setError('')
        }
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError.message)
        }
      })

    return () => {
      mounted = false
    }
  }, [selectedCategory])

  async function openProduct(productId) {
    try {
      const product = await fetchJson(`/api/store/productos/${productId}`)
      setSelectedProduct(product)
      const images = product?.imageUrls || []
      setDetailActiveImage(images[0] || product?.imageUrl || '')
      setView('detail')
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function addToCart(product) {
    setTicketItems((current) => {
      const existing = current.find((item) => item.productId === product.id)
      if (existing) {
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [...current, { productId: product.id, name: product.name, quantity: 1 }]
    })
  }

  function addToCartAndOpen(product) {
    addToCart(product)
    setView('cart')
  }

  function updateCartItemQuantity(productId, quantity) {
    if (quantity <= 0) {
      setTicketItems((current) => current.filter((item) => item.productId !== productId))
      return
    }

    setTicketItems((current) =>
      current.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    )
  }

  async function submitTicket(event) {
    event.preventDefault()
    if (ticketItems.length === 0) {
      return
    }

    setSubmittingTicket(true)
    try {
      const payload = {
        ...ticketForm,
        items: ticketItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }

      const result = await fetchJson('/api/store/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setTicketResult(result)
      setTicketItems([])
      setTicketForm(initialTicketForm)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmittingTicket(false)
    }
  }

  async function submitAdminProduct(event) {
    event.preventDefault()
    if (!isAdminAuthenticated) {
      setError('Debes iniciar sesion como administrador')
      return
    }

    setSubmittingProduct(true)
    try {
      const normalizedImageUrls = (adminProductForm.imageUrls || []).filter(Boolean)
      const coverImage = adminProductForm.imageUrl || normalizedImageUrls[0] || ''
      const payload = {
        ...adminProductForm,
        imageUrl: coverImage,
        imageUrls: normalizedImageUrls,
        stock: Number(adminProductForm.stock),
        discountPercent: Number(adminProductForm.discountPercent || 0),
        offerDeadline: adminProductForm.offerDeadline || null,
      }

      await fetchJson('/api/admin/productos', {
        method: 'POST',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      })

      const [home, products] = await Promise.all([
        fetchJson('/api/store/home'),
        fetchJson(`/api/store/categorias/${adminProductForm.categorySlug}/productos`),
      ])

      setHomeData(home)
      setBranding(home.branding || initialBrandingForm)
      setCategoryProducts(products)
      setAdminProductForm(initialProductForm)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmittingProduct(false)
    }
  }

  async function submitCategory(event) {
    event.preventDefault()
    if (!isAdminAuthenticated) {
      setError('Debes iniciar sesion como administrador')
      return
    }

    setSubmittingCategory(true)
    try {
      await fetchJson('/api/admin/categorias', {
        method: 'POST',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(adminCategoryForm),
      })

      const [home, categoryList] = await Promise.all([
        fetchJson('/api/store/home'),
        fetchJson('/api/store/categorias'),
      ])

      setHomeData(home)
      setBranding(home.branding || initialBrandingForm)
      setCategories(categoryList)
      if (!selectedCategory && categoryList.length > 0) {
        setSelectedCategory(categoryList[0].slug)
      }
      setAdminCategoryForm(initialCategoryForm)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmittingCategory(false)
    }
  }

  async function removeCategory(slug) {
    if (!isAdminAuthenticated) {
      setError('Debes iniciar sesion como administrador')
      return
    }

    setDeletingCategorySlug(slug)
    try {
      await fetchJson(`/api/admin/categorias/${slug}/eliminar`, {
        method: 'POST',
        headers: adminHeaders(),
      })

      const [home, categoryList] = await Promise.all([
        fetchJson('/api/store/home'),
        fetchJson('/api/store/categorias'),
      ])

      setHomeData(home)
      setBranding(home.branding || initialBrandingForm)
      setCategories(categoryList)

      const stillExists = categoryList.some((category) => category.slug === selectedCategory)
      if (!stillExists) {
        setSelectedCategory(categoryList[0]?.slug || '')
        setCategoryProducts([])
      }
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingCategorySlug('')
    }
  }

  async function removeProduct(productId) {
    if (!isAdminAuthenticated) {
      setError('Debes iniciar sesion como administrador')
      return
    }

    setDeletingProductId(productId)
    try {
      await fetchJson(`/api/admin/productos/${productId}/eliminar`, {
        method: 'POST',
        headers: adminHeaders(),
      })

      const [home, products] = await Promise.all([
        fetchJson('/api/store/home'),
        selectedCategory ? fetchJson(`/api/store/categorias/${selectedCategory}/productos`) : Promise.resolve([]),
      ])

      setHomeData(home)
      setBranding(home.branding || initialBrandingForm)
      setCategoryProducts(products)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingProductId(null)
    }
  }

  async function loadAdminOfferProducts() {
    if (!isAdminAuthenticated) {
      return
    }

    setLoadingOffers(true)
    try {
      const [categoryList, adminContent] = await Promise.all([
        fetchJson('/api/store/categorias'),
        fetchJson('/api/admin/contenido', { headers: adminHeaders() }),
      ])
      const contentPrimaryOfferId = String(adminContent?.primaryWeeklyOfferProductId || '').trim()
      const draftPrimaryOfferId = String(
        siteContentForm.primaryWeeklyOfferProductId
          || (adminOfferProducts.find((product) => Boolean(product.weeklyOffer) && Boolean(product.featured)) || {}).id
          || '',
      ).trim()
      const productBuckets = await Promise.all(
        categoryList.map((category) =>
          fetchJson(`/api/store/categorias/${category.slug}/productos`)
            .then((products) => products.map((product) => ({ ...product, categorySlug: category.slug }))),
        ),
      )
      const flatProducts = productBuckets.flat()

      const featuredWeeklyOffer = flatProducts.find((product) => Boolean(product.weeklyOffer) && Boolean(product.featured)) || null
      const resolvedPrimaryOfferId = contentPrimaryOfferId || String(featuredWeeklyOffer?.id || '').trim() || draftPrimaryOfferId
      const allProducts = flatProducts
        .map((product) => ({
          ...product,
          featured: resolvedPrimaryOfferId ? String(product.id) === resolvedPrimaryOfferId : false,
          discountPercent: Number(product.discountPercent || 0),
          offerDeadline: toDateTimeLocalValue(product.offerDeadline),
        }))
        .sort((a, b) => {
          if (Boolean(a.weeklyOffer) !== Boolean(b.weeklyOffer)) {
            return a.weeklyOffer ? -1 : 1
          }
          return String(a.name || '').localeCompare(String(b.name || ''), 'es')
        })

      setAdminOfferProducts(allProducts)
      setSiteContentForm((current) => ({
        ...current,
        primaryWeeklyOfferProductId: resolvedPrimaryOfferId || current.primaryWeeklyOfferProductId || null,
      }))
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoadingOffers(false)
    }
  }

  function updateOfferDraft(productId, key, value) {
    setAdminOfferProducts((current) =>
      current.map((product) => {
        if (String(product.id) !== String(productId)) {
          return product
        }

        if (key === 'weeklyOffer') {
          const shouldBeOffer = Boolean(value)
          return {
            ...product,
            weeklyOffer: shouldBeOffer,
            featured: shouldBeOffer ? Boolean(product.featured) : false,
            discountPercent: shouldBeOffer ? Math.max(1, Number(product.discountPercent || 0)) : Number(product.discountPercent || 0),
          }
        }

        if (key === 'featured') {
          const shouldBePrimary = Boolean(value)
          return {
            ...product,
            featured: shouldBePrimary,
            weeklyOffer: shouldBePrimary ? true : Boolean(product.weeklyOffer),
            discountPercent: shouldBePrimary ? Math.max(1, Number(product.discountPercent || 0)) : Number(product.discountPercent || 0),
          }
        }

        return { ...product, [key]: value }
      }).map((product) => (key === 'featured' && value && String(product.id) !== String(productId) ? { ...product, featured: false } : product)),
    )
    if (key === 'featured') {
      setSiteContentForm((current) => ({
        ...current,
        primaryWeeklyOfferProductId: value ? String(productId) : (String(current.primaryWeeklyOfferProductId || '') === String(productId) ? null : current.primaryWeeklyOfferProductId),
      }))
    }
  }

  async function saveOfferProduct(product) {
    if (!isAdminAuthenticated) {
      setError('Debes iniciar sesion como administrador')
      return
    }

    const discount = Number(product.discountPercent || 0)
    if (product.weeklyOffer && discount <= 0) {
      setError('Las ofertas activas deben tener descuento mayor a 0')
      return
    }

    const currentPrimaryOfferId = String(siteContentForm.primaryWeeklyOfferProductId || '').trim()
    const currentProductId = String(product.id)
    const featuredProductId = product.featured
      ? product.id
      : (currentPrimaryOfferId && currentPrimaryOfferId === currentProductId ? null : siteContentForm.primaryWeeklyOfferProductId)

    const persistOffer = async (offerProduct) => {
      const nextDiscount = Number(offerProduct.discountPercent || 0)
      await fetchJson(`/api/admin/productos/${offerProduct.id}`, {
        method: 'PUT',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          weeklyOffer: Boolean(offerProduct.weeklyOffer),
          featured: Boolean(offerProduct.featured),
          discountPercent: nextDiscount,
          offerDeadline: offerProduct.offerDeadline || null,
          active: true,
        }),
      })
    }

    const persistPrimaryOffer = async (primaryId) => {
      const contentPayload = normalizeSiteContent({
        ...siteContentForm,
        primaryWeeklyOfferProductId: primaryId || null,
      })
      await fetchJson('/api/admin/contenido', {
        method: 'PUT',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(contentPayload),
      })
      setSiteContentForm((current) => ({
        ...current,
        primaryWeeklyOfferProductId: primaryId || null,
      }))
    }

    setSavingOfferProductId(product.id)
    try {
      const productsToPersist = product.featured
        ? adminOfferProducts.map((entry) => {
            if (String(entry.id) === currentProductId) {
              return {
                ...product,
                featured: true,
                weeklyOffer: true,
                discountPercent: Math.max(1, Number(product.discountPercent || 0)),
              }
            }
            return { ...entry, featured: false }
          })
        : [product]

      for (const offerProduct of productsToPersist) {
        await persistOffer(offerProduct)
      }
      await persistPrimaryOffer(featuredProductId)

      const refreshTs = Date.now()
      const [home, products] = await Promise.all([
        fetchJson(`/api/store/home?ts=${refreshTs}`),
        selectedCategory ? fetchJson(`/api/store/categorias/${selectedCategory}/productos?ts=${refreshTs}`) : Promise.resolve([]),
      ])

      setHomeData(home)
      setCategoryProducts(products)
      await loadAdminOfferProducts()
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingOfferProductId(null)
    }
  }

  async function saveAllOffers() {
    if (!isAdminAuthenticated) {
      setError('Debes iniciar sesion como administrador')
      return
    }

    setSavingAllOffers(true)
    try {
      const selectedPrimaryId = String(siteContentForm.primaryWeeklyOfferProductId || '').trim()
      const featuredOffer = adminOfferProducts.find((product) => String(product.id) === selectedPrimaryId && Boolean(product.weeklyOffer))
        || adminOfferProducts.find((product) => Boolean(product.featured) && Boolean(product.weeklyOffer))
        || null
      for (const product of adminOfferProducts) {
        const discount = Number(product.discountPercent || 0)
        if (product.weeklyOffer && discount <= 0) {
          throw new Error(`El producto ${product.name} tiene oferta activa sin descuento valido`)
        }

        await fetchJson(`/api/admin/productos/${product.id}`, {
          method: 'PUT',
          headers: adminHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            weeklyOffer: Boolean(product.weeklyOffer),
            featured: Boolean(featuredOffer) && String(product.id) === String(featuredOffer.id),
            discountPercent: discount,
            offerDeadline: product.offerDeadline || null,
            active: true,
          }),
        })
      }

      const contentPayload = normalizeSiteContent({
        ...siteContentForm,
        primaryWeeklyOfferProductId: featuredOffer?.id || null,
      })
      await fetchJson('/api/admin/contenido', {
        method: 'PUT',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(contentPayload),
      })
      setSiteContentForm((current) => ({
        ...current,
        primaryWeeklyOfferProductId: featuredOffer?.id || null,
      }))

      const refreshTs = Date.now()
      const [home, products] = await Promise.all([
        fetchJson(`/api/store/home?ts=${refreshTs}`),
        selectedCategory ? fetchJson(`/api/store/categorias/${selectedCategory}/productos?ts=${refreshTs}`) : Promise.resolve([]),
      ])

      setHomeData(home)
      setCategoryProducts(products)
      await loadAdminOfferProducts()
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingAllOffers(false)
    }
  }

  function beginEditCategory(category) {
    setEditingCategorySlug(category.slug)
    setEditCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      featured: category.featured,
    })
    setAdminTab('categories')
  }

  async function submitCategoryEdit(event) {
    event.preventDefault()
    if (!editingCategorySlug) {
      return
    }

    setSavingCategoryEdit(true)
    try {
      await fetchJson(`/api/admin/categorias/${editingCategorySlug}`, {
        method: 'PUT',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(editCategoryForm),
      })

      const [home, categoryList] = await Promise.all([
        fetchJson('/api/store/home'),
        fetchJson('/api/store/categorias'),
      ])

      setHomeData(home)
      setBranding(home.branding || initialBrandingForm)
      setCategories(categoryList)
      setEditingCategorySlug('')
      setEditCategoryForm(initialCategoryForm)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingCategoryEdit(false)
    }
  }

  async function beginEditProduct(product) {
    try {
      const detail = await fetchJson(`/api/store/productos/${product.id}`)
      setEditingProductId(product.id)
      setEditProductForm({
        categorySlug: detail.categorySlug,
        name: detail.name,
        slug: detail.slug,
        detail: detail.detail || '',
        technicalSheet: detail.technicalSheet || '',
        stock: detail.stock || 0,
        imageUrl: detail.imageUrl || '',
        imageUrls: detail.imageUrls || (detail.imageUrl ? [detail.imageUrl] : []),
        featured: detail.featured || false,
        weeklyOffer: detail.weeklyOffer || false,
        discountPercent: detail.discountPercent || 0,
        offerDeadline: detail.offerDeadline ? detail.offerDeadline.slice(0, 16) : '',
      })
      setAdminTab('products')
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function submitProductEdit(event) {
    event.preventDefault()
    if (!editingProductId) {
      return
    }

    setSavingProductEdit(true)
    try {
      const normalizedImageUrls = (editProductForm.imageUrls || []).filter(Boolean)
      const coverImage = editProductForm.imageUrl || normalizedImageUrls[0] || ''
      await fetchJson(`/api/admin/productos/${editingProductId}`, {
        method: 'PUT',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          ...editProductForm,
          imageUrl: coverImage,
          imageUrls: normalizedImageUrls,
          stock: Number(editProductForm.stock),
          discountPercent: Number(editProductForm.discountPercent || 0),
          offerDeadline: editProductForm.offerDeadline || null,
          active: true,
        }),
      })

      const [home, products] = await Promise.all([
        fetchJson('/api/store/home'),
        selectedCategory ? fetchJson(`/api/store/categorias/${selectedCategory}/productos`) : Promise.resolve([]),
      ])

      setHomeData(home)
      setBranding(home.branding || initialBrandingForm)
      setCategoryProducts(products)
      setEditingProductId(null)
      setEditProductForm(initialProductForm)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingProductEdit(false)
    }
  }

  async function submitAdminUser(event) {
    event.preventDefault()
    if (!isSuperAdmin) {
      setError('Solo SUPER_ADMIN puede crear usuarios administrativos')
      return
    }

    setCreatingAdminUser(true)
    try {
      await fetchJson('/api/admin/usuarios', {
        method: 'POST',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(adminUserForm),
      })
      setAdminUserForm(initialAdminUserForm)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setCreatingAdminUser(false)
    }
  }

  async function loadAdminTickets(tokenOverride = null) {
    if (!isAdminAuthenticated && !tokenOverride) {
      setError('Debes iniciar sesion para cargar tickets')
      return
    }

    try {
      setLoadingAdminData(true)
      const params = new URLSearchParams()
      if (ticketStatusFilter) {
        params.set('status', ticketStatusFilter)
      }
      if (ticketSearchFilter) {
        params.set('q', ticketSearchFilter)
      }

      const endpoint = params.toString()
        ? `/api/admin/tickets?${params.toString()}`
        : '/api/admin/tickets'

      const [filteredTickets, audits] = await Promise.all([
        fetchJson(endpoint, {
          headers: adminHeaders({}, tokenOverride),
        }),
        isSuperAdmin
          ? fetchJson('/api/admin/auditoria?limit=80', {
            headers: adminHeaders({}, tokenOverride),
          })
          : Promise.resolve([]),
      ])

      setAdminTickets(filteredTickets)
      setAuditRows(audits)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoadingAdminData(false)
    }
  }

  async function submitBrandingUpdate(event) {
    event.preventDefault()
    if (!isSuperAdmin) {
      setError('Solo el super administrador puede editar la marca')
      return
    }

    setSavingBranding(true)
    try {
      const updatedBranding = await fetchJson('/api/admin/branding', {
        method: 'PUT',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(brandingForm),
      })

      setBranding(updatedBranding)
      setBrandingForm(updatedBranding)

      const refreshedHome = await fetchJson('/api/store/home')
      setHomeData(refreshedHome)
      setBranding(refreshedHome.branding || updatedBranding)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingBranding(false)
    }
  }

  async function updateTicketStatus(ticketCode, status) {
    if (!isAdminAuthenticated) {
      setError('Debes iniciar sesion para actualizar tickets')
      return
    }

    try {
      setLoadingAdminData(true)
      await fetchJson(`/api/admin/tickets/${ticketCode}/estado`, {
        method: 'PATCH',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status }),
      })
      await loadAdminTickets()
      setError('')
    } catch (requestError) {
        setError(requestError.message)
    } finally {
      setLoadingAdminData(false)
    }
  }

  async function submitLogin(event) {
    event.preventDefault()
    setAuthLoading(true)
    try {
      const loginResponse = await fetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })

      localStorage.setItem(TOKEN_KEY, loginResponse.token)
      setAdminToken(loginResponse.token)
      setAuthUser({
        id: null,
        name: loginResponse.name,
        email: loginResponse.email,
        roleName: loginResponse.roleName,
      })
      setError('')
      await loadAdminTickets(loginResponse.token)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setAuthLoading(false)
    }
  }

  function logoutAdmin() {
    localStorage.removeItem(TOKEN_KEY)
    setAdminToken('')
    setAuthUser(null)
    setAdminTickets([])
    setAuditRows([])
  }

  function openImageEditor(file, context, preset = {}) {
    const previewUrl = URL.createObjectURL(file)
    setImageEditor({
      ...initialImageEditor,
      ...preset,
      open: true,
      context,
      file,
      previewUrl,
    })
  }

  function closeImageEditor() {
    if (imageEditor.previewUrl) {
      URL.revokeObjectURL(imageEditor.previewUrl)
    }
    setImageEditor(initialImageEditor)
    imageDragRef.current = null
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value))
  }

  function startPrimaryOfferDrag(event) {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    primaryOfferDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      width: rect.width || 1,
      height: rect.height || 1,
      baseOffsetX: primaryOfferImageSettings.offsetX,
      baseOffsetY: primaryOfferImageSettings.offsetY,
    }
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    setIsPrimaryOfferDragging(true)
  }

  function movePrimaryOfferDrag(event) {
    const state = primaryOfferDragRef.current
    if (!state || state.pointerId !== event.pointerId) {
      return
    }
    const deltaX = event.clientX - state.startX
    const deltaY = event.clientY - state.startY
    const nextOffsetX = clamp(state.baseOffsetX + (deltaX / state.width) * 200, -primaryOfferImageMaxOffset, primaryOfferImageMaxOffset)
    const nextOffsetY = clamp(state.baseOffsetY + (deltaY / state.height) * 200, -primaryOfferImageMaxOffset, primaryOfferImageMaxOffset)
    setSiteContentForm((current) => ({
      ...current,
      primaryWeeklyOfferImageOffsetX: nextOffsetX,
      primaryWeeklyOfferImageOffsetY: nextOffsetY,
    }))
  }

  function endPrimaryOfferDrag(event) {
    setIsPrimaryOfferDragging(false)
    if (
      event?.currentTarget?.releasePointerCapture
      && event.currentTarget.hasPointerCapture
      && event.pointerId != null
      && event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    primaryOfferDragRef.current = null
  }

  function handlePrimaryOfferWheel(event) {
    event.preventDefault()
    const delta = event.deltaY < 0 ? 0.1 : -0.1
    setSiteContentForm((current) => {
      const currentZoom = clamp(Number(current.primaryWeeklyOfferImageZoom ?? 1), 0.2, 5)
      const nextZoom = clamp(currentZoom + delta, 0.2, 5)
      const nextMaxOffset = Math.max(0, (nextZoom - 1) * 100)
      return {
        ...current,
        primaryWeeklyOfferImageZoom: nextZoom,
        primaryWeeklyOfferImageOffsetX: clamp(Number(current.primaryWeeklyOfferImageOffsetX ?? 0), -nextMaxOffset, nextMaxOffset),
        primaryWeeklyOfferImageOffsetY: clamp(Number(current.primaryWeeklyOfferImageOffsetY ?? 0), -nextMaxOffset, nextMaxOffset),
      }
    })
  }

  function applyImagePreset(presetKey) {
    const presets = {
      'product-1-1': { width: 1200, height: 1200, fit: 'cover', outputFormat: 'image/jpeg', quality: 88, zoom: 1, offsetX: 0, offsetY: 0 },
      'category-3-2': { width: 1500, height: 1000, fit: 'cover', outputFormat: 'image/jpeg', quality: 88, zoom: 1, offsetX: 0, offsetY: 0 },
      'slide-21-9': { width: 2100, height: 900, fit: 'cover', outputFormat: 'image/jpeg', quality: 86, zoom: 1, offsetX: 0, offsetY: 0 },
      'logo-1-1': { width: 1024, height: 1024, fit: 'contain', outputFormat: 'image/png', quality: 95, zoom: 1, offsetX: 0, offsetY: 0 },
    }
    const preset = presets[presetKey]
    if (!preset) {
      return
    }
    setImageEditor((current) => ({ ...current, ...preset }))
  }

  function startPreviewDrag(event) {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    imageDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      width: rect.width || 1,
      height: rect.height || 1,
      baseOffsetX: imageEditor.offsetX,
      baseOffsetY: imageEditor.offsetY,
    }
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
  }

  function movePreviewDrag(event) {
    const state = imageDragRef.current
    if (!state || state.pointerId !== event.pointerId) {
      return
    }

    const deltaX = event.clientX - state.startX
    const deltaY = event.clientY - state.startY
    const nextOffsetX = clamp(state.baseOffsetX + (deltaX / state.width) * 200, -100, 100)
    const nextOffsetY = clamp(state.baseOffsetY + (deltaY / state.height) * 200, -100, 100)
    setImageEditor((current) => ({ ...current, offsetX: nextOffsetX, offsetY: nextOffsetY }))
  }

  function endPreviewDrag(event) {
    if (!imageDragRef.current) {
      return
    }
    if (event?.currentTarget?.releasePointerCapture && imageDragRef.current.pointerId != null) {
      try {
        event.currentTarget.releasePointerCapture(imageDragRef.current.pointerId)
      } catch {
        // no-op for browsers that throw if capture was not active
      }
    }
    imageDragRef.current = null
  }

  function dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(',')
    const mimeMatch = parts[0].match(/:(.*?);/)
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
    const binary = atob(parts[1])
    const array = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      array[i] = binary.charCodeAt(i)
    }
    return new Blob([array], { type: mime })
  }

  async function transformImageBeforeUpload() {
    if (!imageEditor.file) {
      throw new Error('No hay imagen seleccionada')
    }

    const isSlideImage = imageEditor.context?.type === 'slide'
    const outputWidth = isSlideImage ? 1920 : Math.max(120, Number(imageEditor.width) || 1200)
    const outputHeight = isSlideImage ? 800 : Math.max(120, Number(imageEditor.height) || 800)
    const outputFit = isSlideImage ? 'cover' : imageEditor.fit
    const outputFormat = isSlideImage
      ? 'image/jpeg'
      : (imageEditor.removeBackground ? 'image/png' : (imageEditor.outputFormat || 'image/jpeg'))
    const outputQuality = isSlideImage ? 0.86 : Math.max(0.45, Math.min(1, Number(imageEditor.quality || 85) / 100))

    const bitmap = await createImageBitmap(imageEditor.file)
    const canvas = document.createElement('canvas')
    canvas.width = outputWidth
    canvas.height = outputHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('No se pudo procesar la imagen')
    }

    const scaleBase = outputFit === 'contain'
      ? Math.min(canvas.width / bitmap.width, canvas.height / bitmap.height)
      : Math.max(canvas.width / bitmap.width, canvas.height / bitmap.height)
    const scale = Math.max(0.1, scaleBase * Number(imageEditor.zoom || 1))
    const drawWidth = bitmap.width * scale
    const drawHeight = bitmap.height * scale
    const offsetX = (Number(imageEditor.offsetX) / 100) * (canvas.width / 2)
    const offsetY = (Number(imageEditor.offsetY) / 100) * (canvas.height / 2)
    const x = (canvas.width - drawWidth) / 2 + offsetX
    const y = (canvas.height - drawHeight) / 2 + offsetY

    if (!imageEditor.removeBackground || outputFormat === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(bitmap, x, y, drawWidth, drawHeight)

    if (imageEditor.removeBackground) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const saturation = max === 0 ? 0 : (max - min) / max
        const isLight = r > 210 && g > 210 && b > 210
        if (isLight && saturation < 0.12) {
          pixels[i + 3] = 0
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }

    const dataUrl = canvas.toDataURL(outputFormat, outputQuality)
    return dataUrlToBlob(dataUrl)
  }

  async function uploadImageBlob(blob) {
    const formData = new FormData()
    const extension = blob.type === 'image/png' ? 'png' : 'jpg'
    formData.append('file', blob, `image-${Date.now()}.${extension}`)
    const uploadResult = await fetchJson('/api/admin/uploads/imagen', {
      method: 'POST',
      headers: adminHeaders(),
      body: formData,
    })
    return uploadResult.url
  }

  function applyUploadedImageToContext(url) {
    const context = imageEditor.context
    if (!context) {
      return
    }

    if (context.type === 'product') {
      if (editingProductId) {
        setEditProductForm((current) => ({
          ...current,
          imageUrl: current.imageUrl || url,
          imageUrls: [...(current.imageUrls || []), url],
        }))
      } else {
        setAdminProductForm((current) => ({
          ...current,
          imageUrl: current.imageUrl || url,
          imageUrls: [...(current.imageUrls || []), url],
        }))
      }
      return
    }

    if (context.type === 'category') {
      if (editingCategorySlug) {
        setEditCategoryForm((current) => ({ ...current, imageUrl: url }))
      } else {
        setAdminCategoryForm((current) => ({ ...current, imageUrl: url }))
      }
      return
    }

    if (context.type === 'branding') {
      setBrandingForm((current) => ({ ...current, logoUrl: url }))
      return
    }

    if (context.type === 'slide') {
      setSiteContentForm((current) => {
        const slides = [...(current.heroSlides || [])]
        if (!slides[context.slideIndex]) {
          return current
        }
        slides[context.slideIndex] = { ...slides[context.slideIndex], bgImageUrl: url }
        return { ...current, heroSlides: slides }
      })
      return
    }

    if (context.type === 'banner') {
      updatePromoBanner(context.bannerIndex, 'imageUrl', url)
    }
  }

  async function confirmImageEditorUpload() {
    if (!isAdminAuthenticated) {
      setError('Debes iniciar sesion para subir imagenes')
      return
    }

    setUploadingImage(true)
    try {
      const blob = await transformImageBeforeUpload()
      const url = await uploadImageBlob(blob)
      applyUploadedImageToContext(url)
      setError('')
      closeImageEditor()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUploadingImage(false)
      setUploadingSlideIndex(null)
    }
  }

  async function uploadProductImage(event) {
    if (!isAdminAuthenticated) {
      setError('Debes iniciar sesion para subir imagenes')
      return
    }

    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    openImageEditor(file, { type: 'product' }, { width: 1200, height: 900, fit: 'cover', outputFormat: 'image/png', removeBackground: true })
  }

  function removeProductImage(index) {
    if (editingProductId) {
      setEditProductForm((current) => {
        const next = [...(current.imageUrls || [])]
        next.splice(index, 1)
        return {
          ...current,
          imageUrls: next,
          imageUrl: next[0] || '',
        }
      })
      return
    }

    setAdminProductForm((current) => {
      const next = [...(current.imageUrls || [])]
      next.splice(index, 1)
      return {
        ...current,
        imageUrls: next,
        imageUrl: next[0] || '',
      }
    })
  }

  function setAsCoverImage(index) {
    if (editingProductId) {
      setEditProductForm((current) => {
        const next = [...(current.imageUrls || [])]
        return {
          ...current,
          imageUrl: next[index] || current.imageUrl,
        }
      })
      return
    }

    setAdminProductForm((current) => {
      const next = [...(current.imageUrls || [])]
      return {
        ...current,
        imageUrl: next[index] || current.imageUrl,
      }
    })
  }

  async function uploadBrandLogo(event) {
    if (!isSuperAdmin) {
      setError('Solo el super administrador puede editar el logo')
      return
    }

    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    openImageEditor(file, { type: 'branding' }, { width: 512, height: 512, fit: 'contain', outputFormat: 'image/png' })
  }

  function goToCategory(slug) {
    setSelectedCategory(slug)
    setView('categories')
  }

  async function uploadCategoryImage(event) {
    if (!isAdminAuthenticated) return
    const file = event.target.files?.[0]
    if (!file) return
    openImageEditor(file, { type: 'category' }, { width: 1200, height: 800, fit: 'cover' })
  }

  async function uploadCarouselBgImage(event, slideIndex) {
    if (!isAdminAuthenticated) return
    const file = event.target.files?.[0]
    if (!file) return
    setUploadingSlideIndex(slideIndex)
    openImageEditor(file, { type: 'slide', slideIndex }, { width: 1920, height: 800, fit: 'cover' })
  }

  async function uploadBannerImage(event, bannerIndex) {
    if (!isAdminAuthenticated) return
    const file = event.target.files?.[0]
    if (!file) return
    setUploadingSlideIndex(`banner-${bannerIndex}`)
    openImageEditor(file, { type: 'banner', bannerIndex }, { width: 1200, height: 800, fit: 'cover' })
  }

  async function submitCarouselUpdate(event) {
    event.preventDefault()
    if (!isAdminAuthenticated) return
    setSavingCarousel(true)
    setSavingSiteContent(true)
    try {
      const contentPayload = normalizeSiteContent(siteContentForm)
      await fetchJson('/api/admin/contenido', {
        method: 'PUT',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(contentPayload),
      })
      const updatedCarousel = await fetchJson('/api/admin/carrusel', {
        method: 'PUT',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...carouselForm, intervalMs: Number(carouselForm.intervalMs) }),
      })

      const refreshTs = Date.now()
      const [refreshedContent, refreshedHome] = await Promise.all([
        fetchJson(`/api/admin/contenido?ts=${refreshTs}`, { headers: adminHeaders() }),
        fetchJson(`/api/store/home?ts=${refreshTs}`),
      ])
      const normalizedRefreshedContent = normalizeSiteContent({
        ...contentPayload,
        ...refreshedContent,
        themeTokens: Array.isArray(refreshedContent?.themeTokens) && refreshedContent.themeTokens.length > 0
          ? refreshedContent.themeTokens
          : contentPayload.themeTokens,
      })

      setHomeData(refreshedHome)
      setBranding(refreshedHome.branding || initialBrandingForm)
      setSiteContentForm(normalizedRefreshedContent)
      setCarouselConfig(updatedCarousel)
      setCarouselForm(updatedCarousel)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingCarousel(false)
      setSavingSiteContent(false)
    }
  }

  function addHeroSlide() {
    setSiteContentForm((current) => ({
      ...current,
      heroSlides: [
        ...(current.heroSlides || []),
        {
          eyebrow: 'Nuevo slide',
          title: 'Nuevo titulo',
          text: 'Nuevo texto',
          cta: 'Ver mas',
          bgImageUrl: '',
        },
      ],
    }))
  }

  function removeHeroSlide(index) {
    setSiteContentForm((current) => {
      const slides = [...(current.heroSlides || [])]
      if (slides.length <= 1) {
        return current
      }
      slides.splice(index, 1)
      return { ...current, heroSlides: slides }
    })
  }

  function updateHeroSlide(index, field, value) {
    setSiteContentForm((current) => {
      const slides = [...(current.heroSlides || [])]
      if (!slides[index]) {
        return current
      }
      slides[index] = { ...slides[index], [field]: value }
      return { ...current, heroSlides: slides }
    })
  }

  function syncKnownTextFields(nextState, items) {
    const mapped = { ...nextState }
    items.forEach((item) => {
      if (knownTextItemIds.has(item.id)) {
        mapped[item.id] = item.value || ''
      }
    })
    return mapped
  }

  function addTextItem() {
    setSiteContentForm((current) => {
      const items = [...(current.textItems || [])]
      items.push({
        id: `custom_${Date.now()}`,
        label: `Nuevo texto ${items.length + 1}`,
        helper: 'Texto editable personalizado',
        value: '',
      })
      return { ...current, textItems: items }
    })
  }

  function removeTextItem(index) {
    setSiteContentForm((current) => {
      const items = [...(current.textItems || [])]
      if (items.length <= 1 || !items[index]) {
        return current
      }
      const removed = items[index]
      items.splice(index, 1)
      const nextState = syncKnownTextFields({ ...current, textItems: items }, items)
      if (removed?.id && knownTextItemIds.has(removed.id) && !items.some((item) => item.id === removed.id)) {
        nextState[removed.id] = ''
      }
      return nextState
    })
  }

  function updateTextItem(index, field, value) {
    setSiteContentForm((current) => {
      const items = [...(current.textItems || [])]
      if (!items[index]) {
        return current
      }
      items[index] = { ...items[index], [field]: value }
      return syncKnownTextFields({ ...current, textItems: items }, items)
    })
  }

  function addPromoBanner() {
    setSiteContentForm((current) => ({
      ...current,
      promoBanners: [
        ...(current.promoBanners || []),
        {
          eyebrow: 'Nuevo bloque',
          title: 'Titulo del banner',
          text: 'Descripcion del banner',
          bgColor: '#f4f6fa',
          textColor: '#10223c',
          imageUrl: '',
        },
      ],
    }))
  }

  function removePromoBanner(index) {
    setSiteContentForm((current) => {
      const banners = [...(current.promoBanners || [])]
      if (banners.length <= 1 || !banners[index]) {
        return current
      }
      banners.splice(index, 1)
      const first = banners[0] || {}
      const second = banners[1] || {}
      return {
        ...current,
        promoBanners: banners,
        homePromoPrimaryEyebrow: first.eyebrow || '',
        homePromoPrimaryTitle: first.title || '',
        homePromoPrimaryText: first.text || '',
        homePromoPrimaryBgColor: first.bgColor || '#185dc2',
        homePromoPrimaryTextColor: first.textColor || '#ffffff',
        homePromoSecondaryEyebrow: second.eyebrow || '',
        homePromoSecondaryTitle: second.title || '',
        homePromoSecondaryText: second.text || '',
        homePromoSecondaryBgColor: second.bgColor || '#f4f6fa',
        homePromoSecondaryTextColor: second.textColor || '#10223c',
      }
    })
  }

  function updatePromoBanner(index, field, value) {
    setSiteContentForm((current) => {
      const banners = [...(current.promoBanners || [])]
      if (!banners[index]) {
        return current
      }
      banners[index] = { ...banners[index], [field]: value }
      const first = banners[0] || {}
      const second = banners[1] || {}
      return {
        ...current,
        promoBanners: banners,
        homePromoPrimaryEyebrow: first.eyebrow || '',
        homePromoPrimaryTitle: first.title || '',
        homePromoPrimaryText: first.text || '',
        homePromoPrimaryBgColor: first.bgColor || '#185dc2',
        homePromoPrimaryTextColor: first.textColor || '#ffffff',
        homePromoSecondaryEyebrow: second.eyebrow || '',
        homePromoSecondaryTitle: second.title || '',
        homePromoSecondaryText: second.text || '',
        homePromoSecondaryBgColor: second.bgColor || '#f4f6fa',
        homePromoSecondaryTextColor: second.textColor || '#10223c',
      }
    })
  }

  function updateThemeToken(tokenId, value) {
    setSiteContentForm((current) => {
      const tokens = [...(current.themeTokens || [])]
      const idx = tokens.findIndex((token) => token.id === tokenId)
      if (idx === -1) {
        return current
      }
      tokens[idx] = { ...tokens[idx], value }
      return { ...current, themeTokens: tokens }
    })
  }

  function applyThemePreset(presetKey) {
    const preset = themePresetMap[presetKey]
    if (!preset) {
      return
    }

    setSiteContentForm((current) => ({
      ...current,
      ...preset.values,
    }))
  }

  function isThemePresetActive(presetKey) {
    const preset = themePresetMap[presetKey]
    if (!preset) {
      return false
    }

    return Object.entries(preset.values).every(([key, value]) => {
      const currentValue = siteContentForm[key]
      return String(currentValue || '').trim().toLowerCase() === String(value || '').trim().toLowerCase()
    })
  }

  const previewThemeStyle = {
    '--preview-font-body': fontPresetMap[siteContentForm.themeFontPreset] || fontPresetMap.inter,
    '--preview-font-heading': fontPresetMap[siteContentForm.headingFontPreset] || fontPresetMap.montserrat,
    '--preview-heading-color': siteContentForm.headingColor || '#10223c',
    '--preview-body-color': siteContentForm.bodyTextColor || '#51627f',
  }

  function renderContentPreview() {
    const previewSlide = heroSlides[0] || initialSiteContent.heroSlides[0]
    const previewCategoryTitle = contentTextItems.find((item) => item.id === 'homeCategoriesTitle')?.value || siteContentForm.homeCategoriesTitle || initialSiteContent.homeCategoriesTitle
    const previewCategoryKicker = contentTextItems.find((item) => item.id === 'homeCategoriesKicker')?.value || siteContentForm.homeCategoriesKicker || initialSiteContent.homeCategoriesKicker
    const previewProductTitle = contentTextItems.find((item) => item.id === 'homeProductsTitle')?.value || siteContentForm.homeProductsTitle || initialSiteContent.homeProductsTitle
    const previewProductKicker = contentTextItems.find((item) => item.id === 'homeProductsKicker')?.value || siteContentForm.homeProductsKicker || initialSiteContent.homeProductsKicker

    return (
      <aside className="content-preview-panel" style={previewThemeStyle}>
        <div className="content-preview-header">
          <p>Vista previa en vivo</p>
          <strong>
            {contentSection === 'textos' ? 'Textos del sitio' : contentSection === 'apariencia' ? 'Apariencia general' : contentSection === 'banners' ? 'Bloques promocionales' : 'Portada principal'}
          </strong>
          <small>Los cambios se reflejan aqui antes de guardar.</small>
        </div>

        {contentSection === 'textos' ? (
          <div className="content-preview-surface">
            <div className="content-preview-search">{siteContentForm.searchPlaceholder || 'Que solucion buscas?'}</div>
            <section className="content-preview-home-block">
              <div className="section-header compact preview-section-header">
                <div>
                  <p className="section-kicker">{previewCategoryKicker}</p>
                  <h2>{previewCategoryTitle}</h2>
                </div>
              </div>
              <div className="category-showcase preview-grid-two">
                {contentTextItems.slice(0, 2).map((item, index) => (
                  <article key={`preview-text-${item.id || index}`} className="category-showcase-card preview-card-compact">
                    <div className="category-showcase-copy">
                      <p className="section-kicker">{item.label || `Texto ${index + 1}`}</p>
                      <h3>{item.value || 'Sin contenido'}</h3>
                      {item.helper ? <p>{item.helper}</p> : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="content-preview-home-block">
              <div className="section-header compact preview-section-header">
                <div>
                  <p className="section-kicker">{previewProductKicker}</p>
                  <h2>{previewProductTitle}</h2>
                </div>
              </div>
              <div className="product-rail preview-grid-two">
                {contentTextItems.slice(2, 4).map((item, index) => (
                  <article key={`preview-product-text-${item.id || index}`} className="product-rail-card preview-card-compact">
                    <div className="product-rail-body">
                      <span className="product-category-chip">Texto editable</span>
                      <h3>{item.label || `Bloque ${index + 1}`}</h3>
                      <p>{item.value || 'Sin contenido'}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <div className="content-preview-text-list">
              {contentTextItems.map((item, index) => (
                <article key={`preview-text-list-${item.id || index}`} className="content-preview-text-item">
                  <span>{item.label || `Texto ${index + 1}`}</span>
                  <strong>{item.value || 'Sin contenido'}</strong>
                  {item.helper ? <small>{item.helper}</small> : null}
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {contentSection === 'apariencia' ? (
          <div className="content-preview-surface">
            <section className="hero-panel preview-home-hero" style={{ ...sectionStyles.carouselPanel, minHeight: 'auto' }}>
              <div className="hero-copy">
                <p className="hero-eyebrow">{branding.storeName || 'ATR Group'}</p>
                <h1 style={sectionStyles.carouselTitle}>{previewSlide?.title || 'Titulo principal del sitio'}</h1>
                <p style={sectionStyles.carouselText}>{previewSlide?.text || 'Texto descriptivo para validar tipografia y color.'}</p>
                <div className="hero-actions content-preview-actions">
                  <button type="button">Boton principal</button>
                  <button type="button" className="ghost">Secundario</button>
                </div>
              </div>
              <div className="hero-card-grid preview-grid-two">
                {promoBanners.slice(0, 2).map((banner, index) => (
                  <article
                    key={`preview-theme-banner-${index}`}
                    className={index === 0 ? 'mini-promo mini-promo-primary' : 'mini-promo'}
                    style={{
                      background: banner.bgColor || (index === 0 ? '#185dc2' : '#f4f6fa'),
                      color: banner.textColor || (index === 0 ? '#ffffff' : '#10223c'),
                      borderColor: sectionStyles.bannerCard.borderColor,
                    }}
                  >
                    <span>{banner.eyebrow || `Banner ${index + 1}`}</span>
                    <strong style={sectionStyles.bannerTitle}>{banner.title || 'Titulo del banner'}</strong>
                    <p style={sectionStyles.bannerText}>{banner.text || 'Descripcion de ejemplo'}</p>
                  </article>
                ))}
              </div>
            </section>
            <label className="content-preview-select-shell">
              <span>Control de ejemplo</span>
              <select value="corporate" readOnly>
                <option value="corporate">Corporate Indigo</option>
              </select>
            </label>
          </div>
        ) : null}

        {contentSection === 'banners' ? (
          <div className="content-preview-banner-list">
            {promoBanners.map((banner, index) => (
              <article
                key={`preview-banner-${index}`}
                className={banner.imageUrl ? 'content-preview-banner-card with-image' : 'content-preview-banner-card'}
                style={{
                  background: banner.imageUrl
                    ? `linear-gradient(180deg, rgba(8, 15, 26, 0.16), rgba(8, 15, 26, 0.52)), url(${resolveAssetUrl(banner.imageUrl)}) center / cover no-repeat, ${banner.bgColor || '#185dc2'}`
                    : banner.bgColor || '#185dc2',
                  color: banner.textColor || '#ffffff',
                }}
              >
                <span>{banner.eyebrow || `Banner ${index + 1}`}</span>
                <strong>{banner.title || 'Titulo del banner'}</strong>
                <p>{banner.text || 'Descripcion del banner'}</p>
              </article>
            ))}
          </div>
        ) : null}

        {contentSection === 'carrusel' ? (
          <div className="content-preview-surface">
            <article
              className="content-preview-hero"
              style={resolveCarouselPanelStyle(previewSlide?.bgImageUrl || '')}
            >
              <span>{previewSlide?.eyebrow || 'ATR Group'}</span>
              <strong style={sectionStyles.carouselTitle}>{previewSlide?.title || 'Titulo principal'}</strong>
              <p style={sectionStyles.carouselText}>{previewSlide?.text || 'Texto del slide'}</p>
              <button type="button">{previewSlide?.cta || 'Ver mas'}</button>
            </article>
            <div className="content-preview-slide-list">
              {heroSlides.map((slide, index) => (
                <div key={`preview-slide-${index}`} className="content-preview-slide-chip">
                  <strong>{index + 1}</strong>
                  <span>{slide.title || `Slide ${index + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    )
  }

  function renderCategoryFormPreview() {
    const draft = editingCategorySlug ? editCategoryForm : adminCategoryForm
    return (
      <aside className="entity-preview-panel">
        <div className="content-preview-header">
          <p>Vista previa</p>
          <strong>{editingCategorySlug ? 'Categoria en edicion' : 'Nueva categoria'}</strong>
          <small>Asi se vera dentro del home y del catalogo.</small>
        </div>
        <article className="category-showcase-card entity-preview-card" style={sectionStyles.categoryCard}>
          <img src={resolveAssetUrl(draft.imageUrl)} alt={draft.name || 'Categoria'} onError={handleImageFallback} />
          <div className="category-showcase-copy">
            <p className="section-kicker">{draft.featured ? 'Categoria destacada' : 'Categoria'}</p>
            <h3 style={sectionStyles.categoryTitle}>{draft.name || 'Nombre de la categoria'}</h3>
            <p style={sectionStyles.categoryText}>{draft.description || 'La descripcion aparecera aqui para que puedas validarla antes de guardar.'}</p>
            <button type="button">Ver linea</button>
          </div>
        </article>
      </aside>
    )
  }

  function renderProductFormPreview() {
    const draft = editingProductId ? editProductForm : adminProductForm
    const categoryName = categories.find((item) => item.slug === draft.categorySlug)?.name || 'Categoria'
    const previewImage = draft.imageUrl || draft.imageUrls?.[0] || ''

    return (
      <aside className="entity-preview-panel">
        <div className="content-preview-header">
          <p>Vista previa</p>
          <strong>{editingProductId ? 'Producto en edicion' : 'Nuevo producto'}</strong>
          <small>Tarjeta del catalogo y estado comercial antes de guardar.</small>
        </div>
        <article className="product-rail-card entity-preview-card" style={sectionStyles.productCard}>
          <img src={resolveAssetUrl(previewImage)} alt={draft.name || 'Producto'} onError={handleImageFallback} />
          <div className="product-rail-body">
            <span className="product-category-chip">{categoryName}</span>
            {draft.weeklyOffer && Number(draft.discountPercent) > 0 ? <span className="offer-pill">-{draft.discountPercent}%</span> : null}
            <h3 style={sectionStyles.productTitle}>{draft.name || 'Nombre del producto'}</h3>
            <p style={sectionStyles.productText}>{draft.detail || 'Aqui se mostrara el detalle breve del producto.'}</p>
            <p className={Number(draft.stock) > 0 ? 'stock-pill in' : 'stock-pill out'}>
              {Number(draft.stock) > 0 ? `Disponible: ${draft.stock} unidades` : 'Sin stock'}
            </p>
            {draft.weeklyOffer && draft.offerDeadline ? <CountdownTimer deadline={draft.offerDeadline} /> : null}
          </div>
          <div className="product-rail-actions">
            <button type="button" style={sectionStyles.productButton}>Ver detalle</button>
            <button type="button" className="ghost">Agregar</button>
          </div>
        </article>
      </aside>
    )
  }

  async function loadAdminUsers() {
    if (!isSuperAdmin) return
    setLoadingAdminUsers(true)
    try {
      const users = await fetchJson('/api/admin/usuarios', { headers: adminHeaders() })
      setAdminUsers(users)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoadingAdminUsers(false)
    }
  }

  function beginEditUser(user) {
    setEditingUserId(user.id)
    setEditUserForm({ name: user.name, email: user.email, roleName: user.roleName, password: '', active: user.active })
  }

  async function submitUserEdit(event) {
    event.preventDefault()
    if (!editingUserId) return
    setSavingUserEdit(true)
    try {
      await fetchJson(`/api/admin/usuarios/${editingUserId}`, {
        method: 'PUT',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(editUserForm),
      })
      await loadAdminUsers()
      setEditingUserId(null)
      setEditUserForm(initialEditUserForm)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingUserEdit(false)
    }
  }

  async function toggleUser(userId, activate) {
    setTogglingUserId(userId)
    try {
      await fetchJson(`/api/admin/usuarios/${userId}/${activate ? 'activar' : 'desactivar'}`, {
        method: 'POST',
        headers: adminHeaders(),
      })
      await loadAdminUsers()
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setTogglingUserId(null)
    }
  }

  async function deleteUser(user) {
    if (!window.confirm(`¿Eliminar al usuario ${user.name}? Esta accion no se puede deshacer.`)) {
      return
    }
    setDeletingUserId(user.id)
    try {
      try {
        await fetchJson(`/api/admin/usuarios/${user.id}`, {
          method: 'DELETE',
          headers: adminHeaders(),
        })
      } catch (deleteError) {
        await fetchJson(`/api/admin/usuarios/${user.id}/eliminar`, {
          method: 'POST',
          headers: adminHeaders(),
        })
      }
      await loadAdminUsers()
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingUserId(null)
    }
  }

  function renderBrand() {
    return (
      <button type="button" className="brand-shell" onClick={() => setView('home')}>
        <span className="brand-mark image-mark" aria-hidden="true">
          <img
            src={resolveAssetUrl(branding.logoUrl || '/logo.jpeg')}
            alt={branding.storeName}
            className="brand-logo"
            onError={handleImageFallback}
          />
        </span>
        <span className="brand-copy">
          <strong>{branding.storeName}</strong>
          <small>{branding.tagline}</small>
        </span>
      </button>
    )
  }

  function renderHeader() {
    return (
      <header className="site-header">
        <div className="header-top">
          {renderBrand()}

          <label className="search-shell">
            <span className="search-icon">⌕</span>
            <input
              placeholder={siteContentForm.searchPlaceholder || initialSiteContent.searchPlaceholder}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </label>

          <div className="header-actions">
            <button
              type="button"
              className={view === 'cart' ? 'cart-button active' : 'cart-button'}
              onClick={() => setView('cart')}
            >
              <span>Carrito</span>
              <strong>{cartCount}</strong>
            </button>
          </div>
        </div>

        <nav className="category-nav">
          <button type="button" className={view === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => setView('home')}>
            Inicio
          </button>
          <button type="button" className={view === 'offers' ? 'nav-link active' : 'nav-link'} onClick={() => setView('offers')}>
            Ofertas
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={selectedCategory === category.slug && view === 'categories' ? 'nav-link active' : 'nav-link'}
              onClick={() => goToCategory(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </header>
    )
  }

  function renderHome() {
    const slide = heroSlides[activeHero] || heroSlides[0] || initialSiteContent.heroSlides[0]
    const rawWeeklyOffers = homeData?.weeklyOffers ?? []
    const primaryOfferId = String(siteContentForm.primaryWeeklyOfferProductId || '').trim()
      || String((rawWeeklyOffers.find((product) => Boolean(product.featured)) || {}).id || '').trim()
    const topWeeklyOffer = rawWeeklyOffers.find((product) => String(product.id) === primaryOfferId) || null
    const highlightedRibbonOffers = topWeeklyOffer ? [topWeeklyOffer] : []
    const primaryOfferImageStyle = {
      objectFit: primaryOfferImageSettings.fit,
      transform: primaryOfferImageTransform,
      transformOrigin: 'center',
    }
    const carouselInterval = carouselConfig.intervalMs || 5000

    return (
      <section className="view-block">
        <div className="hero-panel-shell">
          <button type="button" className="hero-arrow hero-arrow-left" onClick={goToPreviousHero} aria-label="Slide anterior">
            ‹
          </button>
          <section
            className={`hero-panel home-hero-panel effect-${carouselConfig.effect || 'fade'}`}
            style={resolveCarouselPanelStyle(heroSlides[activeHero]?.bgImageUrl || '')}
          >
            <div className={`hero-copy carousel-enter-${carouselConfig.effect || 'fade'}`} key={activeHero}>
              <p className="hero-eyebrow">{branding.storeName || slide.eyebrow}</p>
              <h1 style={sectionStyles.carouselTitle}>{slide.title}</h1>
              <p style={sectionStyles.carouselText}>{slide.text}</p>
              <div className="hero-actions">
                <button type="button" onClick={() => setView(activeHero === 0 ? 'categories' : 'cart')}>
                  {slide.cta}
                </button>
                <button type="button" className="ghost" onClick={() => setView('cart')}>
                  Ver carrito
                </button>
              </div>
            </div>

            <div className="hero-card-grid">
              {promoBanners.map((banner, index) => (
                <article
                  key={`promo-${index}`}
                  className={banner.imageUrl ? (index === 0 ? 'mini-promo mini-promo-primary mini-promo-has-image' : 'mini-promo mini-promo-has-image') : (index === 0 ? 'mini-promo mini-promo-primary' : 'mini-promo')}
                  style={{
                    background: banner.imageUrl
                      ? `linear-gradient(180deg, rgba(8, 15, 26, 0.18), rgba(8, 15, 26, 0.55)), url(${resolveAssetUrl(banner.imageUrl)}) center / cover no-repeat, ${banner.bgColor || (index === 0 ? '#185dc2' : '#f4f6fa')}`
                      : banner.bgColor || (index === 0 ? '#185dc2' : '#f4f6fa'),
                    color: banner.textColor || (index === 0 ? '#ffffff' : '#10223c'),
                    borderColor: sectionStyles.bannerCard.borderColor,
                  }}
                >
                  <span>{banner.eyebrow || `Bloque ${index + 1}`}</span>
                  <strong style={sectionStyles.bannerTitle}>{banner.title || 'Titulo del banner'}</strong>
                  <p style={sectionStyles.bannerText}>{banner.text || ''}</p>
                </article>
              ))}
            </div>
            <div className="hero-dots">
              {heroSlides.map((_, index) => (
                <button
                  key={index === activeHero ? `hero-progress-${index}-${activeHero}` : `hero-progress-${index}`}
                  type="button"
                  className={index === activeHero ? 'hero-dot active' : 'hero-dot'}
                  onClick={() => setActiveHero(index)}
                  aria-label={`Cambiar slide ${index + 1}`}
                >
                  <span
                    className="hero-dot-fill"
                    style={index === activeHero ? { animationDuration: `${carouselInterval}ms` } : undefined}
                  />
                </button>
              ))}
            </div>
          </section>
          <button type="button" className="hero-arrow hero-arrow-right" onClick={goToNextHero} aria-label="Slide siguiente">
            ›
          </button>
        </div>

        <section className="flash-offers-banner home-flash-offers" aria-label="Ofertas destacadas">
          <div>
            <p className="section-kicker">Ofertas de la semana</p>
            <h2>{topWeeklyOffer ? `${topWeeklyOffer.name} con ${topWeeklyOffer.discountPercent}% de descuento` : 'Promociones activas cada semana'}</h2>
            <p>
              {topWeeklyOffer
                ? 'Aprovecha el destacado principal desde la primera vista de la tienda.'
                : 'Activa ofertas desde Administracion > Productos y se mostraran aqui automaticamente.'}
            </p>
            {topWeeklyOffer?.offerDeadline ? <CountdownTimer deadline={topWeeklyOffer.offerDeadline} /> : null}
          </div>
          <div className="flash-offers-side">
            {highlightedRibbonOffers.length > 0 ? (
              <div className="flash-offers-showcase">
                {highlightedRibbonOffers.map((product) => (
                  <button
                    key={`ribbon-offer-${product.id}`}
                    type="button"
                    className="flash-offer-chip"
                    onClick={() => openProduct(product.id)}
                  >
                    <div className="flash-offer-chip-media">
                      <img src={resolveAssetUrl(product.imageUrl)} alt={product.name} style={primaryOfferImageStyle} onError={handleImageFallback} />
                    </div>
                    <strong>-{product.discountPercent}%</strong>
                    {product.offerDeadline ? <small>Vence: {formatDateTime(product.offerDeadline)}</small> : <small>Sin limite definido</small>}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="status-actions">
              {topWeeklyOffer ? (
                <button type="button" onClick={() => openProduct(topWeeklyOffer.id)}>
                  Ver oferta principal
                </button>
              ) : null}
              <button type="button" className="ghost offer-banner-link" onClick={() => setView('offers')}>
                Explorar ofertas
              </button>
            </div>
          </div>
        </section>

        {filteredWeeklyOffers.length > 0 ? (
          <section className="weekly-offers-block">
            <div className="section-header compact">
              <div>
                <p className="section-kicker">Descuentos recomendados</p>
                <h2>Mas oportunidades para ahorrar</h2>
              </div>
              <p className="search-note">Seleccion curada de promociones activas</p>
            </div>

            <div className="weekly-offers-grid">
              {filteredWeeklyOffers.map((product) => (
                <article key={`offer-${product.id}`} className="weekly-offer-card">
                  <img src={resolveAssetUrl(product.imageUrl)} alt={product.name} loading="lazy" onError={handleImageFallback} />
                  <div className="weekly-offer-body">
                    <span className="offer-pill">-{product.discountPercent}%</span>
                    {product.offerDeadline ? <CountdownTimer deadline={product.offerDeadline} /> : null}
                    <h3>{product.name}</h3>
                    <p>{product.detail}</p>
                    <p className={product.inStock ? 'stock-pill in' : 'stock-pill out'}>
                      {product.inStock ? `Disponible: ${product.stock} unidades` : 'Sin stock'}
                    </p>
                    <div className="product-rail-actions">
                      <button type="button" onClick={() => openProduct(product.id)}>Ver detalle</button>
                      <button type="button" className="ghost" onClick={() => addToCartAndOpen(product)}>Aprovechar oferta</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section-header">
          <div>
            <p className="section-kicker">{siteContentForm.homeCategoriesKicker || initialSiteContent.homeCategoriesKicker}</p>
            <h2>{siteContentForm.homeCategoriesTitle || initialSiteContent.homeCategoriesTitle}</h2>
          </div>
        </section>

        <div className="category-showcase">
          {homeData?.featuredCategories?.map((category) => (
            <article key={category.id} className="category-showcase-card" style={sectionStyles.categoryCard}>
              <img
                src={resolveAssetUrl(category.imageUrl)}
                alt={category.name}
                loading="lazy"
                onError={handleImageFallback}
              />
              <div className="category-showcase-copy">
                <h3 style={sectionStyles.categoryTitle}>{category.name}</h3>
                <p style={sectionStyles.categoryText}>{category.description}</p>
                <button type="button" onClick={() => goToCategory(category.slug)}>
                  Ver linea
                </button>
              </div>
            </article>
          ))}
        </div>

        <section className="section-header compact">
          <div>
            <p className="section-kicker">{siteContentForm.homeProductsKicker || initialSiteContent.homeProductsKicker}</p>
            <h2>{siteContentForm.homeProductsTitle || initialSiteContent.homeProductsTitle}</h2>
          </div>
          {normalizedSearch ? <p className="search-note">Resultados para: {searchText}</p> : null}
        </section>

        <div className="product-rail">
          {filteredFeaturedProducts.map((product) => (
            <article key={product.id} className="product-rail-card" style={sectionStyles.productCard}>
              <img
                src={resolveAssetUrl(product.imageUrl)}
                alt={product.name}
                loading="lazy"
                onError={handleImageFallback}
              />
              <div className="product-rail-body">
                <span className="product-category-chip">{product.categoryName}</span>
                {product.weeklyOffer && Number(product.discountPercent) > 0 ? <span className="offer-pill">-{product.discountPercent}%</span> : null}
                <h3 style={sectionStyles.productTitle}>{product.name}</h3>
                <p style={sectionStyles.productText}>{product.detail}</p>
                <p className={product.inStock ? 'stock-pill in' : 'stock-pill out'}>
                  {product.inStock ? `Disponible: ${product.stock} unidades` : 'Sin stock'}
                </p>
              </div>
              <div className="product-rail-actions">
                <button type="button" style={sectionStyles.productButton} onClick={() => openProduct(product.id)}>
                  Ver detalle
                </button>
                <button type="button" className="ghost" onClick={() => addToCartAndOpen(product)}>
                  Agregar al carrito
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    )
  }

  function renderOffers() {
    const hasOffers = filteredWeeklyOffers.length > 0

    return (
      <section className="view-block offers-view-layout">
        <section className="flash-offers-banner offers-view-hero" aria-label="Vista de ofertas">
          <div>
            <p className="section-kicker">Vista exclusiva</p>
            <h2>Ofertas activas de la semana</h2>
            <p>
              Aqui solo ves productos marcados como oferta desde Administracion, con descuento y tiempo limite.
            </p>
          </div>
          <div className="status-actions offers-hero-actions">
            <button type="button" onClick={() => setView('home')}>Volver a inicio</button>
            <button type="button" className="ghost" onClick={() => setView('categories')}>Ir al catalogo</button>
          </div>
        </section>

        {!hasOffers ? (
          <article className="panel">
            <h3>No hay ofertas activas</h3>
            <p>Activa productos con oferta desde Admin / Ofertas para que aparezcan aqui.</p>
          </article>
        ) : null}

        {hasOffers ? (
          <section className="weekly-offers-block offers-only-block">
            <div className="weekly-offers-grid">
              {filteredWeeklyOffers.map((product) => (
                <article key={`offers-only-${product.id}`} className="weekly-offer-card">
                  <img src={resolveAssetUrl(product.imageUrl)} alt={product.name} loading="lazy" onError={handleImageFallback} />
                  <div className="weekly-offer-body">
                    <span className="offer-pill">-{product.discountPercent}%</span>
                    {product.offerDeadline ? <CountdownTimer deadline={product.offerDeadline} /> : null}
                    <h3>{product.name}</h3>
                    <p>{product.detail}</p>
                    <p className={product.inStock ? 'stock-pill in' : 'stock-pill out'}>
                      {product.inStock ? `Disponible: ${product.stock} unidades` : 'Sin stock'}
                    </p>
                    <div className="product-rail-actions">
                      <button type="button" onClick={() => openProduct(product.id)}>Ver detalle</button>
                      <button type="button" className="ghost" onClick={() => addToCartAndOpen(product)}>Agregar al carrito</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    )
  }

  function renderCategories() {
    return (
      <section className="view-block catalog-layout">
        <aside className="catalog-sidebar">
          <p className="section-kicker">Categorias</p>
          <h2>Catalogo {branding.storeName}</h2>
          <div className="sidebar-category-list">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={selectedCategory === category.slug ? 'sidebar-link active' : 'sidebar-link'}
                onClick={() => setSelectedCategory(category.slug)}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="sidebar-note">
            <strong>Carrito consultivo</strong>
            <p>No mostramos precios. El cliente arma una solicitud y el equipo comercial responde por WhatsApp.</p>
          </div>
        </aside>

        <div className="catalog-main">
          <div className="catalog-banner">
            <div>
              <p className="section-kicker">Linea actual</p>
              <h2>{categoryMap.get(selectedCategory)?.name || 'Selecciona una categoria'}</h2>
              <p>{categoryMap.get(selectedCategory)?.description || 'Explora productos y soluciones.'}</p>
            </div>
            <button type="button" onClick={() => setView('cart')}>
              Ver carrito ({cartCount})
            </button>
          </div>

          <div className="product-grid-modern">
            {filteredCategoryProducts.map((product) => (
              <article key={product.id} className="catalog-product-card" style={sectionStyles.productCard}>
                <img
                  src={resolveAssetUrl(product.imageUrl)}
                  alt={product.name}
                  loading="lazy"
                  onError={handleImageFallback}
                />
                <div className="catalog-product-body">
                  <span className="product-category-chip">{product.categoryName}</span>
                  {product.weeklyOffer && Number(product.discountPercent) > 0 ? <span className="offer-pill">-{product.discountPercent}%</span> : null}
                  <h3 style={sectionStyles.productTitle}>{product.name}</h3>
                  <p style={sectionStyles.productText}>{product.detail}</p>
                  <p className={product.inStock ? 'stock-pill in' : 'stock-pill out'}>
                    {product.inStock ? `Stock: ${product.stock}` : 'Sin stock'}
                  </p>
                </div>
                <div className="product-rail-actions">
                  <button type="button" style={sectionStyles.productButton} onClick={() => openProduct(product.id)}>
                    Ver detalle
                  </button>
                  <button type="button" className="ghost" onClick={() => addToCart(product)}>
                    Sumar al carrito
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  }

  function renderDetail() {
    if (!selectedProduct) {
      return (
        <section className="view-block">
          <p>Selecciona un producto para ver su detalle.</p>
        </section>
      )
    }

    const detailImages = selectedProduct.imageUrls?.length
      ? selectedProduct.imageUrls
      : selectedProduct.imageUrl
        ? [selectedProduct.imageUrl]
        : []

    return (
      <section className="view-block product-detail-layout">
        <article className="product-main-card">
          <div className="detail-gallery">
            <div className="detail-image-shell">
              <img
                src={resolveAssetUrl(detailActiveImage || detailImages[0] || selectedProduct.imageUrl)}
                alt={selectedProduct.name}
                loading="lazy"
                onError={handleImageFallback}
              />
            </div>
            {detailImages.length > 1 ? (
              <div className="detail-thumbs">
                {detailImages.map((imageUrl, index) => (
                  <button type="button" key={`${imageUrl}-${index}`} className={resolveAssetUrl(imageUrl) === resolveAssetUrl(detailActiveImage || detailImages[0]) ? 'detail-thumb active' : 'detail-thumb'} onClick={() => setDetailActiveImage(imageUrl)}>
                    <img src={resolveAssetUrl(imageUrl)} alt={`Vista ${index + 1}`} onError={handleImageFallback} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="detail-content">
            <span className="product-category-chip">{selectedProduct.categoryName}</span>
            <h1>{selectedProduct.name}</h1>
            <p className={selectedProduct.inStock ? 'stock-pill in' : 'stock-pill out'}>
              {selectedProduct.inStock ? `Inventario disponible: ${selectedProduct.stock}` : 'Actualmente sin stock'}
            </p>
            <p className="detail-summary">{selectedProduct.detail}</p>

            <div className="detail-actions">
              <button type="button" onClick={() => addToCartAndOpen(selectedProduct)}>
                Agregar al carrito
              </button>
              <button type="button" className="ghost" onClick={() => goToCategory(selectedProduct.categorySlug)}>
                Volver a categoria
              </button>
            </div>

            <div className="detail-tabs">
              <button type="button" className="detail-tab active">Product Details</button>
              <button type="button" className="detail-tab">Specifications</button>
              <button type="button" className="detail-tab">Similar Items</button>
            </div>

            <div className="detail-info-grid">
              <section className="detail-info-block wide">
                <h3>Descripcion</h3>
                <p>{selectedProduct.detail}</p>
              </section>
              <section className="detail-info-block">
                <h3>Ficha tecnica</h3>
                <ul>
                  {String(selectedProduct.technicalSheet || '')
                    .split(',')
                    .map((item, index) => (
                      <li key={index}>{item.trim()}</li>
                    ))}
                </ul>
              </section>
            </div>
          </div>
        </article>

        <section className="related-panel">
          <div className="section-header compact">
            <div>
              <p className="section-kicker">Similar items</p>
              <h2>Productos relacionados</h2>
            </div>
          </div>
          <div className="related-grid">
            {relatedProducts.map((product) => (
              <article key={product.id} className="related-card">
                <img
                  src={resolveAssetUrl(product.imageUrl)}
                  alt={product.name}
                  loading="lazy"
                  onError={handleImageFallback}
                />
                <h3>{product.name}</h3>
                <p>{product.detail}</p>
                <button type="button" onClick={() => openProduct(product.id)}>
                  Ver producto
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
    )
  }

  function renderCart() {
    return (
      <section className="view-block cart-layout">
        <article className="cart-panel">
          <div className="section-header compact">
            <div>
              <p className="section-kicker">Shopping cart</p>
              <h2>Carrito consultivo</h2>
            </div>
          </div>

          {ticketItems.length === 0 ? (
            <div className="empty-cart">
              <p>No hay productos en el carrito.</p>
              <button type="button" onClick={() => setView('categories')}>
                Ir al catalogo
              </button>
            </div>
          ) : null}

          {ticketItems.map((item) => (
            <div className="cart-row" key={item.productId}>
              <div>
                <strong>{item.name}</strong>
                <p>Producto agregado para cotizacion</p>
              </div>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(event) => updateCartItemQuantity(item.productId, Number(event.target.value))}
              />
              <button type="button" className="ghost" onClick={() => updateCartItemQuantity(item.productId, 0)}>
                Eliminar
              </button>
            </div>
          ))}
        </article>

        <article className="checkout-panel">
          <h2>Generar ticket</h2>
          <p>Completa los datos del cliente y envia la solicitud al canal comercial de {branding.storeName}.</p>
          <form onSubmit={submitTicket}>
            <label>
              Nombre completo
              <input
                value={ticketForm.customerName}
                onChange={(event) => setTicketForm((current) => ({ ...current, customerName: event.target.value }))}
                required
              />
            </label>
            <label>
              Telefono
              <input
                value={ticketForm.customerPhone}
                onChange={(event) => setTicketForm((current) => ({ ...current, customerPhone: event.target.value }))}
                required
              />
            </label>
            <label>
              Documento de identificacion
              <input
                value={ticketForm.customerDocument}
                onChange={(event) => setTicketForm((current) => ({ ...current, customerDocument: event.target.value }))}
                placeholder="INE, DNI, RFC, etc."
                required
              />
            </label>
            <label>
              Empresa (opcional)
              <input
                value={ticketForm.companyName}
                onChange={(event) => setTicketForm((current) => ({ ...current, companyName: event.target.value }))}
                placeholder="Nombre de empresa"
              />
            </label>
            <label>
              Correo
              <input
                type="email"
                value={ticketForm.customerEmail}
                onChange={(event) => setTicketForm((current) => ({ ...current, customerEmail: event.target.value }))}
              />
            </label>
            <label>
              Tipo de entrega
              <select
                value={ticketForm.deliveryType}
                onChange={(event) => setTicketForm((current) => ({ ...current, deliveryType: event.target.value }))}
              >
                <option value="DOMICILIO">Envio a domicilio</option>
                <option value="RETIRO">Recoger en tienda</option>
              </select>
            </label>
            <label>
              Direccion de entrega
              <input
                value={ticketForm.deliveryAddress}
                onChange={(event) => setTicketForm((current) => ({ ...current, deliveryAddress: event.target.value }))}
                placeholder={ticketForm.deliveryType === 'DOMICILIO' ? 'Calle, numero, colonia' : 'Opcional para retiro'}
                required={ticketForm.deliveryType === 'DOMICILIO'}
              />
            </label>
            <label>
              Ciudad
              <input
                value={ticketForm.deliveryCity}
                onChange={(event) => setTicketForm((current) => ({ ...current, deliveryCity: event.target.value }))}
                placeholder={ticketForm.deliveryType === 'DOMICILIO' ? 'Ciudad de entrega' : 'Opcional para retiro'}
                required={ticketForm.deliveryType === 'DOMICILIO'}
              />
            </label>
            <label>
              Referencia de entrega
              <input
                value={ticketForm.deliveryReference}
                onChange={(event) => setTicketForm((current) => ({ ...current, deliveryReference: event.target.value }))}
                placeholder="Punto de referencia, horario, acceso"
              />
            </label>
            <label>
              Horario preferido de contacto
              <input
                value={ticketForm.preferredContactTime}
                onChange={(event) => setTicketForm((current) => ({ ...current, preferredContactTime: event.target.value }))}
                placeholder="Ej. 9:00 a 12:00"
              />
            </label>
            <label>
              Comentarios para el asesor
              <textarea
                rows="4"
                value={ticketForm.notes}
                onChange={(event) => setTicketForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </label>
            <button type="submit" disabled={ticketItems.length === 0 || submittingTicket}>
              {submittingTicket ? 'Generando ticket...' : 'Finalizar solicitud'}
            </button>
          </form>

          {ticketResult ? (
            <div className="success-box order-success">
              <p>
                Ticket generado: <strong>{ticketResult.ticketCode}</strong>
              </p>
              <a href={ticketResult.whatsappLink} target="_blank" rel="noreferrer">
                Ir al chat corporativo de WhatsApp
              </a>
            </div>
          ) : null}
        </article>
      </section>
    )
  }

  function renderAdmin() {
    if (!isAdminAuthenticated) {
      return (
        <section className="view-block admin-login-layout">
          <article className="panel admin-login-panel">
            <h2>Acceso administrador</h2>
            <p>Ingresa con tu usuario para gestionar catalogo, categorias y elementos subidos.</p>
            <form onSubmit={submitLogin}>
              <label>
                Correo
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label>
                Clave
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                />
              </label>
              <button type="submit" disabled={authLoading}>
                {authLoading ? 'Ingresando...' : 'Iniciar sesion'}
              </button>
            </form>
          </article>
        </section>
      )
    }

    return (
      <section className="view-block admin-hub">
        <article className="panel admin-header-panel">
          <div className="admin-header-main">
            <div>
              <h2>Control Center</h2>
              <p>{siteContentForm.adminIntroText || initialSiteContent.adminIntroText}</p>
            </div>
            <div className="auth-chip">
              <p>
                <strong>{authUser?.name || 'Admin'}</strong> · {authUser?.roleName}
              </p>
              <button type="button" className="ghost" onClick={logoutAdmin}>
                Cerrar sesion
              </button>
            </div>
          </div>

          <div className="admin-tabs">
            <button type="button" className={adminTab === 'overview' ? 'header-link active' : 'header-link'} onClick={() => setAdminTab('overview')}>Resumen</button>
            <button type="button" className={adminTab === 'content' ? 'header-link active' : 'header-link'} onClick={() => setAdminTab('content')}>Contenido</button>
            <button type="button" className={adminTab === 'categories' ? 'header-link active' : 'header-link'} onClick={() => setAdminTab('categories')}>Categorias</button>
            <button type="button" className={adminTab === 'products' ? 'header-link active' : 'header-link'} onClick={() => setAdminTab('products')}>Productos</button>
            <button type="button" className={adminTab === 'offers' ? 'header-link active' : 'header-link'} onClick={() => { setAdminTab('offers'); loadAdminOfferProducts() }}>Ofertas</button>
            <button type="button" className={adminTab === 'tickets' ? 'header-link active' : 'header-link'} onClick={() => setAdminTab('tickets')}>Tickets</button>
            {isSuperAdmin ? (
              <button type="button" className={adminTab === 'super' ? 'header-link active' : 'header-link'} onClick={() => { setAdminTab('super'); loadAdminUsers() }}>Super Admin</button>
            ) : null}
          </div>
        </article>

        {adminTab === 'overview' ? (
          <section className="admin-grid-2">
            <article className="panel">
              <h3>Estado rapido</h3>
              <div className="admin-kpis">
                <div><strong>{categories.length}</strong><small>Categorias activas</small></div>
                <div><strong>{categoryProducts.length}</strong><small>Productos en categoria</small></div>
                <div><strong>{adminTickets.length}</strong><small>Tickets recientes</small></div>
              </div>
            </article>
            <article className="panel">
              <h3>Acciones rapidas</h3>
              <div className="admin-actions-grid">
                <button type="button" onClick={() => setAdminTab('categories')}>Gestionar categorias</button>
                <button type="button" onClick={() => setAdminTab('products')}>Gestionar productos</button>
                <button type="button" onClick={() => { setAdminTab('offers'); loadAdminOfferProducts() }}>Gestionar ofertas</button>
                <button type="button" onClick={() => setAdminTab('tickets')}>Ver tickets</button>
              </div>
            </article>
          </section>
        ) : null}

        {adminTab === 'content' ? (
          <section style={{ display: 'grid', gap: '20px' }}>

            {/* ── Section navigator ── */}
            <div className="content-section-nav">
              {[
                { key: 'textos',     icon: '✏️',  label: 'Textos',      desc: 'Titulos y busqueda' },
                { key: 'apariencia', icon: '🎨',  label: 'Apariencia',  desc: 'Colores y fuentes' },
                { key: 'banners',    icon: '📢',  label: 'Banners',     desc: 'Bloques de inicio' },
                { key: 'carrusel',   icon: '🖼️',  label: 'Portada',     desc: 'Slides e imagenes' },
              ].map(({ key, icon, label, desc }) => (
                <button
                  key={key}
                  type="button"
                  className={contentSection === key ? 'content-nav-card active' : 'content-nav-card'}
                  onClick={() => setContentSection(key)}
                >
                  <span className="content-nav-icon">{icon}</span>
                  <strong>{label}</strong>
                  <small>{desc}</small>
                </button>
              ))}
            </div>

            {/* ── TEXTOS ── */}
            {contentSection === 'textos' ? (
              <div className="content-editor-shell">
              <form className="content-section-form" onSubmit={submitCarouselUpdate}>
                <div className="content-section-header">
                  <h3>Textos del sitio</h3>
                  <p>Agrega, elimina y edita bloques de texto del sitio.</p>
                </div>
                <div className="status-actions content-actions-row">
                  <button type="button" onClick={addTextItem}>+ Agregar texto</button>
                </div>
                {contentTextItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="content-field-group">
                    <div className="content-field-group-title">
                      Texto {index + 1}
                      <span className="content-badge">{item.id || 'custom'}</span>
                    </div>
                    <label className="content-label">
                      <span>Nombre del bloque</span>
                      <input value={item.label || ''} onChange={(e) => updateTextItem(index, 'label', e.target.value)} />
                    </label>
                    <label className="content-label">
                      <span>Descripcion breve</span>
                      <input value={item.helper || ''} onChange={(e) => updateTextItem(index, 'helper', e.target.value)} />
                    </label>
                    <label className="content-label">
                      <span>Texto</span>
                      <textarea rows="2" value={item.value || ''} onChange={(e) => updateTextItem(index, 'value', e.target.value)} placeholder="Escribe el texto del bloque" />
                    </label>
                    <div className="status-actions">
                      <button type="button" className="ghost" onClick={() => removeTextItem(index)} disabled={contentTextItems.length <= 1}>Eliminar bloque</button>
                    </div>
                  </div>
                ))}
                <button type="submit" disabled={savingCarousel || savingSiteContent} className="content-save-btn">{(savingCarousel || savingSiteContent) ? 'Guardando...' : '💾 Guardar textos'}</button>
              </form>
              {renderContentPreview()}
              </div>
            ) : null}

            {/* ── APARIENCIA ── */}
            {contentSection === 'apariencia' ? (
              <div className="content-editor-shell">
              <form className="content-section-form" onSubmit={submitCarouselUpdate}>
                <div className="content-section-header">
                  <h3>Apariencia del sitio</h3>
                  <p>Cambia los colores y la tipografia. Los cambios se aplican en toda la pagina.</p>
                </div>
                <div className="content-field-group">
                  <div className="content-field-group-title">Paletas rapidas</div>
                  <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: 'var(--atr-ink-soft)' }}>Aplica un estilo completo con un solo clic.</p>
                  <div className="theme-preset-list">
                    {Object.entries(themePresetMap).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        className={isThemePresetActive(key) ? 'header-link active theme-preset-btn' : 'header-link theme-preset-btn'}
                        onClick={() => applyThemePreset(key)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="content-field-group">
                  <div className="content-field-group-title">Tipografia</div>
                  <label className="content-label">
                    <span>Fuente del cuerpo de texto</span>
                    <small>Se usa en parrafos, descripciones y formularios</small>
                    <select value={siteContentForm.themeFontPreset || 'inter'} onChange={(e) => setSiteContentForm((c) => ({ ...c, themeFontPreset: e.target.value }))}>
                      <option value="inter">Inter — moderna y legible</option>
                      <option value="poppins">Poppins — redondeada y amigable</option>
                      <option value="manrope">Manrope — geometrica y clara</option>
                      <option value="montserrat">Montserrat — elegante y profesional</option>
                      <option value="merriweather">Merriweather — clasica con serifa</option>
                    </select>
                  </label>
                  <label className="content-label">
                    <span>Fuente de los titulos</span>
                    <small>Se usa en encabezados grandes (H1, H2, H3)</small>
                    <select value={siteContentForm.headingFontPreset || 'montserrat'} onChange={(e) => setSiteContentForm((c) => ({ ...c, headingFontPreset: e.target.value }))}>
                      <option value="montserrat">Montserrat — elegante y profesional</option>
                      <option value="inter">Inter — moderna y legible</option>
                      <option value="poppins">Poppins — redondeada y amigable</option>
                      <option value="manrope">Manrope — geometrica y clara</option>
                      <option value="merriweather">Merriweather — clasica con serifa</option>
                    </select>
                  </label>
                </div>
                <div className="content-field-group">
                  <div className="content-field-group-title">Estilos por seccion (independientes)</div>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--atr-ink-soft)' }}>
                    Cada seccion se edita por separado. Cambios en Banners no afectan Productos, Carrusel ni Categorias.
                  </p>
                  {Object.entries(themeTokensBySection).map(([section, tokens]) => (
                    <div key={section} className="theme-token-section">
                      <div className="theme-token-section-title">{sectionTokenLabels[section] || section}</div>
                      <div className="theme-token-grid">
                        {tokens.map((token) => (
                          <label key={token.id} className="content-label theme-token-item">
                            <span>{token.label || token.id}</span>
                            {token.type === 'color' && String(token.value || '').trim().startsWith('#') ? (
                              <div className="color-field">
                                <input type="color" value={token.value || '#000000'} onChange={(e) => updateThemeToken(token.id, e.target.value)} />
                                <input className="theme-token-text" value={token.value || ''} onChange={(e) => updateThemeToken(token.id, e.target.value)} />
                              </div>
                            ) : (
                              <textarea rows="2" value={token.value || ''} onChange={(e) => updateThemeToken(token.id, e.target.value)} />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={savingCarousel || savingSiteContent} className="content-save-btn">{(savingCarousel || savingSiteContent) ? 'Guardando...' : '💾 Guardar apariencia'}</button>
              </form>
              {renderContentPreview()}
              </div>
            ) : null}

            {/* ── BANNERS ── */}
            {contentSection === 'banners' ? (
              <div className="content-editor-shell">
              <form className="content-section-form" onSubmit={submitCarouselUpdate}>
                <div className="content-section-header">
                  <h3>Banners de la pagina principal</h3>
                  <p>Agrega, elimina y personaliza los bloques visuales de inicio.</p>
                </div>
                <div className="status-actions content-actions-row">
                  <button type="button" onClick={addPromoBanner}>+ Agregar banner</button>
                </div>
                {promoBanners.map((banner, index) => (
                  <div key={`admin-banner-${index}`} className="content-field-group">
                    <div className="content-field-group-title">
                      Banner {index + 1}
                      <span className="content-badge" style={{ background: banner.bgColor || '#185dc2', color: banner.textColor || '#ffffff' }}>Vista previa</span>
                    </div>
                    <label className="content-label">
                      <span>Etiqueta</span>
                      <input value={banner.eyebrow || ''} onChange={(e) => updatePromoBanner(index, 'eyebrow', e.target.value)} />
                    </label>
                    <label className="content-label">
                      <span>Titulo</span>
                      <input value={banner.title || ''} onChange={(e) => updatePromoBanner(index, 'title', e.target.value)} />
                    </label>
                    <label className="content-label">
                      <span>Descripcion</span>
                      <textarea rows="2" value={banner.text || ''} onChange={(e) => updatePromoBanner(index, 'text', e.target.value)} />
                    </label>
                    <label className="content-label">
                      <span>Imagen del banner</span>
                      <input type="file" accept="image/*" onChange={(e) => uploadBannerImage(e, index)} />
                      {uploadingImage && uploadingSlideIndex === `banner-${index}` ? <small style={{ color: 'var(--atr-blue)' }}>Subiendo imagen...</small> : null}
                    </label>
                    {banner.imageUrl ? (
                      <div className="content-banner-preview">
                        <img src={resolveAssetUrl(banner.imageUrl)} alt={`Banner ${index + 1}`} onError={handleImageFallback} />
                        <div className="status-actions">
                          <button type="button" className="ghost" onClick={() => updatePromoBanner(index, 'imageUrl', '')}>Quitar imagen</button>
                        </div>
                      </div>
                    ) : null}
                    <div className="content-color-row">
                      <label className="content-label" style={{ flex: 1 }}>
                        <span>Color de fondo</span>
                        <div className="color-field">
                          <input type="color" value={banner.bgColor || '#185dc2'} onChange={(e) => updatePromoBanner(index, 'bgColor', e.target.value)} />
                          <span className="color-hex">{banner.bgColor || '#185dc2'}</span>
                        </div>
                      </label>
                      <label className="content-label" style={{ flex: 1 }}>
                        <span>Color del texto</span>
                        <div className="color-field">
                          <input type="color" value={banner.textColor || '#ffffff'} onChange={(e) => updatePromoBanner(index, 'textColor', e.target.value)} />
                          <span className="color-hex">{banner.textColor || '#ffffff'}</span>
                        </div>
                      </label>
                    </div>
                    <div className="status-actions">
                      <button type="button" className="ghost" onClick={() => removePromoBanner(index)} disabled={promoBanners.length <= 1}>Eliminar banner</button>
                    </div>
                  </div>
                ))}
                <button type="submit" disabled={savingCarousel || savingSiteContent} className="content-save-btn">{(savingCarousel || savingSiteContent) ? 'Guardando...' : '💾 Guardar banners'}</button>
              </form>
              {renderContentPreview()}
              </div>
            ) : null}

            {/* ── CARRUSEL / PORTADA ── */}
            {contentSection === 'carrusel' ? (
              <div className="content-editor-shell">
              <form className="content-section-form" onSubmit={submitCarouselUpdate}>
                <div className="content-section-header">
                  <h3>Portada principal (carrusel)</h3>
                  <p>Cada slide es una pantalla completa que ven los visitantes al entrar al sitio. Puedes tener hasta 12 slides.</p>
                </div>
                <div className="content-field-group">
                  <div className="content-field-group-title">Configuracion del carrusel</div>
                  <div className="content-color-row">
                    <label className="content-label" style={{ flex: 1 }}>
                      <span>Segundos por slide</span>
                      <small>Cuanto tiempo se muestra cada imagen antes de pasar a la siguiente</small>
                      <input type="number" min="1" max="30" value={Math.round((Number(carouselForm.intervalMs) || 5000) / 1000)} onChange={(e) => setCarouselForm((c) => ({ ...c, intervalMs: Number(e.target.value) * 1000 }))} />
                    </label>
                    <label className="content-label" style={{ flex: 1 }}>
                      <span>Efecto de transicion</span>
                      <small>Animacion al pasar de un slide al siguiente</small>
                      <select value={carouselForm.effect || 'fade'} onChange={(e) => setCarouselForm((c) => ({ ...c, effect: e.target.value }))}>
                        <option value="fade">Fundido (suave)</option>
                        <option value="slide">Deslizamiento</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div className="content-field-group">
                  <div className="content-field-group-title">Estilo visual del carrusel (solo esta seccion)</div>
                  <p style={{ margin: '0 0 10px', fontSize: '0.86rem', color: 'var(--atr-ink-soft)' }}>
                    Estos campos impactan unicamente la portada/carrusel y se reflejan en la vista previa de la derecha.
                  </p>
                  <label className="content-label">
                    <span>Fondo del carrusel (CSS)</span>
                    <textarea
                      rows="2"
                      value={themeTokenMap['carousel.bg'] || ''}
                      onChange={(e) => updateThemeToken('carousel.bg', e.target.value)}
                    />
                  </label>
                  <div className="content-color-row">
                    <label className="content-label" style={{ flex: 1 }}>
                      <span>Borde del carrusel</span>
                      <input
                        value={themeTokenMap['carousel.border'] || ''}
                        onChange={(e) => updateThemeToken('carousel.border', e.target.value)}
                      />
                    </label>
                    <label className="content-label" style={{ flex: 1 }}>
                      <span>Color titulo</span>
                      <input
                        value={themeTokenMap['carousel.titleColor'] || ''}
                        onChange={(e) => updateThemeToken('carousel.titleColor', e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="content-color-row">
                    <label className="content-label" style={{ flex: 1 }}>
                      <span>Color texto</span>
                      <input
                        value={themeTokenMap['carousel.textColor'] || ''}
                        onChange={(e) => updateThemeToken('carousel.textColor', e.target.value)}
                      />
                    </label>
                    <label className="content-label" style={{ flex: 1 }}>
                      <span>Tamano titulo</span>
                      <input
                        value={themeTokenMap['carousel.titleSize'] || ''}
                        onChange={(e) => updateThemeToken('carousel.titleSize', e.target.value)}
                      />
                    </label>
                  </div>
                  <label className="content-label">
                    <span>Tamano texto</span>
                    <input
                      value={themeTokenMap['carousel.textSize'] || ''}
                      onChange={(e) => updateThemeToken('carousel.textSize', e.target.value)}
                    />
                  </label>
                </div>
                <div className="content-field-group">
                  <div className="content-field-group-title">Slides ({heroSlides.length} en total)</div>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {heroSlides.map((slide, index) => (
                      <div key={index} className="slide-card">
                        <div className="slide-card-header">
                          <span className="slide-number">Slide {index + 1}</span>
                          <button type="button" className="ghost slide-remove-btn" onClick={() => removeHeroSlide(index)} disabled={heroSlides.length <= 1}>Eliminar</button>
                        </div>
                        {slide.bgImageUrl ? (
                          <img src={resolveAssetUrl(slide.bgImageUrl)} alt={`Slide ${index + 1}`} className="slide-thumb" onError={handleImageFallback} />
                        ) : (
                          <div className="slide-thumb-empty">Sin imagen de fondo</div>
                        )}
                        <div className="slide-card-body">
                          <label className="content-label">
                            <span>Imagen de fondo</span>
                            <input type="file" accept="image/*" onChange={(e) => uploadCarouselBgImage(e, index)} />
                            {uploadingImage && uploadingSlideIndex === index ? <small style={{ color: 'var(--atr-blue)' }}>Subiendo imagen...</small> : null}
                          </label>
                          <label className="content-label">
                            <span>Etiqueta pequena</span>
                            <small>Texto corto sobre el titulo. Ej: "ATR Group"</small>
                            <input maxLength={40} value={slide.eyebrow || ''} onChange={(e) => updateHeroSlide(index, 'eyebrow', e.target.value)} />
                          </label>
                          <label className="content-label">
                            <span>Titulo principal</span>
                            <input maxLength={72} value={slide.title || ''} onChange={(e) => updateHeroSlide(index, 'title', e.target.value)} />
                          </label>
                          <label className="content-label">
                            <span>Texto de apoyo</span>
                            <textarea maxLength={180} rows="2" value={slide.text || ''} onChange={(e) => updateHeroSlide(index, 'text', e.target.value)} />
                          </label>
                          <label className="content-label">
                            <span>Texto del boton</span>
                            <small>Lo que dice el boton de accion. Ej: "Ver catalogo"</small>
                            <input maxLength={32} value={slide.cta || ''} onChange={(e) => updateHeroSlide(index, 'cta', e.target.value)} />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="ghost" style={{ marginTop: '8px', width: '100%' }} onClick={addHeroSlide}>＋ Agregar slide</button>
                </div>
                <button type="submit" disabled={savingCarousel || savingSiteContent} className="content-save-btn">{(savingCarousel || savingSiteContent) ? 'Guardando...' : '💾 Guardar portada'}</button>
              </form>
              {renderContentPreview()}
              </div>
            ) : null}

          </section>
        ) : null}

        {adminTab === 'categories' ? (
          <section className="admin-grid-2">
            <article className="panel">
              <h3>{editingCategorySlug ? 'Editar categoria' : 'Crear categoria'}</h3>
              <div className="admin-form-preview-layout">
              <form onSubmit={editingCategorySlug ? submitCategoryEdit : submitCategory}>
                <label>Nombre<input value={editingCategorySlug ? editCategoryForm.name : adminCategoryForm.name} onChange={(event) => editingCategorySlug ? setEditCategoryForm((current) => ({ ...current, name: event.target.value })) : setAdminCategoryForm((current) => ({ ...current, name: event.target.value }))} required /></label>
                <label>Slug<input value={editingCategorySlug ? editCategoryForm.slug : adminCategoryForm.slug} onChange={(event) => editingCategorySlug ? setEditCategoryForm((current) => ({ ...current, slug: event.target.value })) : setAdminCategoryForm((current) => ({ ...current, slug: event.target.value }))} /></label>
                <label>Descripcion<textarea rows="2" value={editingCategorySlug ? editCategoryForm.description : adminCategoryForm.description} onChange={(event) => editingCategorySlug ? setEditCategoryForm((current) => ({ ...current, description: event.target.value })) : setAdminCategoryForm((current) => ({ ...current, description: event.target.value }))} /></label>
                <label>URL imagen<input value={editingCategorySlug ? editCategoryForm.imageUrl : adminCategoryForm.imageUrl} onChange={(event) => editingCategorySlug ? setEditCategoryForm((current) => ({ ...current, imageUrl: event.target.value })) : setAdminCategoryForm((current) => ({ ...current, imageUrl: event.target.value }))} /></label>
                <label>Subir imagen<input type="file" accept="image/*" onChange={uploadCategoryImage} /></label>
                <small>Maximo recomendado: 20 MB. Se abrira editor para recorte/redimension.</small>
                {uploadingImage ? <p>Subiendo imagen...</p> : null}
                <label className="inline-label"><input type="checkbox" checked={editingCategorySlug ? editCategoryForm.featured : adminCategoryForm.featured} onChange={(event) => editingCategorySlug ? setEditCategoryForm((current) => ({ ...current, featured: event.target.checked })) : setAdminCategoryForm((current) => ({ ...current, featured: event.target.checked }))} />Destacada</label>
                <button type="submit" disabled={submittingCategory || savingCategoryEdit}>{editingCategorySlug ? (savingCategoryEdit ? 'Guardando cambios...' : 'Actualizar categoria') : (submittingCategory ? 'Guardando categoria...' : 'Crear categoria')}</button>
                {editingCategorySlug ? <button type="button" className="ghost" onClick={() => { setEditingCategorySlug(''); setEditCategoryForm(initialCategoryForm) }}>Cancelar edicion</button> : null}
              </form>
              {renderCategoryFormPreview()}
              </div>
            </article>

            <article className="panel">
              <h3>Categorias activas</h3>
              <div className="admin-simple-list">
                {categories.map((category) => (
                  <article key={category.id} className="admin-simple-item">
                    <div>
                      <strong>{category.name}</strong>
                      <p>{category.slug}</p>
                    </div>
                    <div className="status-actions">
                      <button type="button" className="ghost" onClick={() => beginEditCategory(category)}>Editar</button>
                      <button type="button" className="ghost" onClick={() => removeCategory(category.slug)} disabled={deletingCategorySlug === category.slug}>{deletingCategorySlug === category.slug ? 'Eliminando...' : 'Eliminar'}</button>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </section>
        ) : null}

        {adminTab === 'products' ? (
          <section className="admin-grid-2">
            <article className="panel">
              <h3>{editingProductId ? 'Editar producto' : 'Crear producto'}</h3>
              <div className="admin-form-preview-layout">
              <form onSubmit={editingProductId ? submitProductEdit : submitAdminProduct}>
                <label>Categoria
                  <select value={editingProductId ? editProductForm.categorySlug : adminProductForm.categorySlug} onChange={(event) => editingProductId ? setEditProductForm((current) => ({ ...current, categorySlug: event.target.value })) : setAdminProductForm((current) => ({ ...current, categorySlug: event.target.value }))} required>
                    <option value="">-- Selecciona una categoria --</option>
                    {categories.map((cat) => (<option key={cat.id} value={cat.slug}>{cat.name}</option>))}
                  </select>
                </label>
                <label>Nombre<input value={editingProductId ? editProductForm.name : adminProductForm.name} onChange={(event) => editingProductId ? setEditProductForm((current) => ({ ...current, name: event.target.value })) : setAdminProductForm((current) => ({ ...current, name: event.target.value }))} required /></label>
                <label>Slug<input value={editingProductId ? editProductForm.slug : adminProductForm.slug} onChange={(event) => editingProductId ? setEditProductForm((current) => ({ ...current, slug: event.target.value })) : setAdminProductForm((current) => ({ ...current, slug: event.target.value }))} required /></label>
                <label>Detalle<textarea rows="2" value={editingProductId ? editProductForm.detail : adminProductForm.detail} onChange={(event) => editingProductId ? setEditProductForm((current) => ({ ...current, detail: event.target.value })) : setAdminProductForm((current) => ({ ...current, detail: event.target.value }))} /></label>
                <label>Ficha tecnica<textarea rows="3" value={editingProductId ? editProductForm.technicalSheet : adminProductForm.technicalSheet} onChange={(event) => editingProductId ? setEditProductForm((current) => ({ ...current, technicalSheet: event.target.value })) : setAdminProductForm((current) => ({ ...current, technicalSheet: event.target.value }))} /></label>
                <label>Stock<input type="number" min="0" value={editingProductId ? editProductForm.stock : adminProductForm.stock} onChange={(event) => editingProductId ? setEditProductForm((current) => ({ ...current, stock: event.target.value })) : setAdminProductForm((current) => ({ ...current, stock: event.target.value }))} /></label>
                <label className="inline-label"><input type="checkbox" checked={editingProductId ? editProductForm.weeklyOffer : adminProductForm.weeklyOffer} onChange={(event) => editingProductId ? setEditProductForm((current) => ({ ...current, weeklyOffer: event.target.checked })) : setAdminProductForm((current) => ({ ...current, weeklyOffer: event.target.checked }))} />Incluir en ofertas de la semana</label>
                <label>Descuento (%)
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={editingProductId ? editProductForm.discountPercent : adminProductForm.discountPercent}
                    onChange={(event) => editingProductId ? setEditProductForm((current) => ({ ...current, discountPercent: event.target.value })) : setAdminProductForm((current) => ({ ...current, discountPercent: event.target.value }))}
                  />
                </label>
                {(editingProductId ? editProductForm.weeklyOffer : adminProductForm.weeklyOffer) ? (
                  <label>Fecha y hora limite de la oferta
                    <input
                      type="datetime-local"
                      value={editingProductId ? editProductForm.offerDeadline : adminProductForm.offerDeadline}
                      onChange={(event) => editingProductId ? setEditProductForm((current) => ({ ...current, offerDeadline: event.target.value })) : setAdminProductForm((current) => ({ ...current, offerDeadline: event.target.value }))}
                    />
                  </label>
                ) : null}
                <label>URL imagen<input value={editingProductId ? editProductForm.imageUrl : adminProductForm.imageUrl} onChange={(event) => editingProductId ? setEditProductForm((current) => ({ ...current, imageUrl: event.target.value })) : setAdminProductForm((current) => ({ ...current, imageUrl: event.target.value }))} /></label>
                <label>Subir imagen<input type="file" accept="image/*" onChange={uploadProductImage} /></label>
                <small>Maximo recomendado: 20 MB. Puedes elegir portada y galeria.</small>
                {uploadingImage ? <p>Subiendo imagen...</p> : null}
                <div className="admin-simple-list">
                  {(editingProductId ? editProductForm.imageUrls : adminProductForm.imageUrls)?.map((imageUrl, index) => (
                    <article key={`${imageUrl}-${index}`} className="admin-simple-item">
                      <img src={resolveAssetUrl(imageUrl)} alt={`Imagen ${index + 1}`} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px' }} onError={handleImageFallback} />
                      <div>
                        <strong style={{ fontSize: '0.88rem' }}>Imagen {index + 1}</strong>
                        <p style={{ margin: 0, fontSize: '0.75rem' }}>{(editingProductId ? editProductForm.imageUrl : adminProductForm.imageUrl) === imageUrl ? 'Portada actual' : 'Galeria'}</p>
                      </div>
                      <div className="status-actions">
                        <button type="button" className="ghost" onClick={() => setAsCoverImage(index)}>Portada</button>
                        <button type="button" className="ghost" onClick={() => removeProductImage(index)}>Quitar</button>
                      </div>
                    </article>
                  ))}
                </div>
                <button type="submit" disabled={submittingProduct || savingProductEdit}>{editingProductId ? (savingProductEdit ? 'Guardando cambios...' : 'Actualizar producto') : (submittingProduct ? 'Guardando...' : 'Crear producto')}</button>
                {editingProductId ? <button type="button" className="ghost" onClick={() => { setEditingProductId(null); setEditProductForm(initialProductForm) }}>Cancelar edicion</button> : null}
              </form>
              {renderProductFormPreview()}
              </div>
            </article>

            <article className="panel">
              <h3>Elementos subidos</h3>
              <label>Categoria para revisar<select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>{categories.map((category) => (<option key={category.id} value={category.slug}>{category.name}</option>))}</select></label>
              <div className="admin-simple-list">
                {categoryProducts.map((product) => (
                  <article key={product.id} className="admin-simple-item">
                    <div>
                      <strong>{product.name}</strong>
                      <p>{product.categoryName} · stock {product.stock}</p>
                      <small>{product.weeklyOffer ? `Oferta activa ${product.discountPercent || 0}%` : 'Sin oferta'}</small>
                    </div>
                    <div className="status-actions">
                      <button type="button" className="ghost" onClick={() => beginEditProduct(product)}>Editar</button>
                      <button type="button" className="ghost" onClick={() => removeProduct(product.id)} disabled={deletingProductId === product.id}>{deletingProductId === product.id ? 'Eliminando...' : 'Eliminar'}</button>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </section>
        ) : null}

        {adminTab === 'offers' ? (
          <section className="admin-grid-1">
            <article className="panel">
              <h3>Ofertas de la semana</h3>
              <p style={{ marginTop: 0, color: 'var(--atr-ink-soft)' }}>
                Selecciona los productos que entran en oferta, define su descuento y fecha/hora limite.
              </p>

              <div className="ticket-filters">
                <label>
                  Buscar producto
                  <input
                    placeholder="Nombre, categoria o slug"
                    value={offerSearch}
                    onChange={(event) => setOfferSearch(event.target.value)}
                  />
                </label>
                <button type="button" onClick={loadAdminOfferProducts}>
                  {loadingOffers ? 'Actualizando...' : 'Actualizar lista'}
                </button>
                <button type="button" onClick={saveAllOffers} disabled={savingAllOffers || loadingOffers}>
                  {savingAllOffers ? 'Guardando todo...' : 'Guardar todas las ofertas'}
                </button>
              </div>

              <div className="offer-primary-preview-panel">
                <h4>Vista previa de oferta principal</h4>
                {selectedPrimaryOffer ? (
                  <>
                    <section className="flash-offers-banner home-flash-offers offer-primary-preview-live" aria-label="Preview oferta principal">
                      <div>
                        <p className="section-kicker">Ofertas de la semana</p>
                        <h2>{`${selectedPrimaryOffer.name} con ${selectedPrimaryOffer.discountPercent || 0}% de descuento`}</h2>
                        <p>Aprovecha el destacado principal desde la primera vista de la tienda.</p>
                      </div>
                      <div className="flash-offers-side">
                        <div className="flash-offers-showcase">
                          <article className="flash-offer-chip">
                            <div
                              className="flash-offer-chip-media"
                              onPointerDown={startPrimaryOfferDrag}
                              onPointerMove={movePrimaryOfferDrag}
                              onPointerUp={endPrimaryOfferDrag}
                              onPointerCancel={endPrimaryOfferDrag}
                              onWheel={handlePrimaryOfferWheel}
                            >
                              <img
                                src={resolveAssetUrl(selectedPrimaryOffer.imageUrl)}
                                alt={selectedPrimaryOffer.name}
                                style={{
                                  objectFit: primaryOfferImageSettings.fit,
                                  transform: primaryOfferImageTransform,
                                  transformOrigin: 'center',
                                }}
                                onError={handleImageFallback}
                              />
                            </div>
                            <strong>-{selectedPrimaryOffer.discountPercent || 0}%</strong>
                            {selectedPrimaryOffer.offerDeadline ? <small>Vence: {formatDateTime(selectedPrimaryOffer.offerDeadline)}</small> : <small>Sin limite definido</small>}
                          </article>
                        </div>
                      </div>
                    </section>
                    <div className="offer-primary-controls">
                      <label>
                        Ajuste
                        <select
                          value={primaryOfferImageSettings.fit}
                          onChange={(event) => setSiteContentForm((current) => ({ ...current, primaryWeeklyOfferImageFit: event.target.value }))}
                        >
                          <option value="cover">Recortar para llenar (cover)</option>
                          <option value="contain">Mostrar completa (contain)</option>
                        </select>
                      </label>
                      <label>
                        Zoom ({primaryOfferImageSettings.zoom.toFixed(2)}x)
                        <input
                          type="range"
                          min="0.2"
                          max="5"
                          step="0.05"
                          value={primaryOfferImageSettings.zoom}
                          onChange={(event) => setSiteContentForm((current) => ({ ...current, primaryWeeklyOfferImageZoom: Number(event.target.value) }))}
                        />
                      </label>
                      <label>
                        Desplazamiento horizontal ({Math.round(primaryOfferImageSettings.offsetX)}%)
                        <input
                          type="range"
                          min={-primaryOfferImageMaxOffset}
                          max={primaryOfferImageMaxOffset}
                          step="1"
                          value={primaryOfferImageSettings.offsetX}
                          onChange={(event) => setSiteContentForm((current) => ({ ...current, primaryWeeklyOfferImageOffsetX: Number(event.target.value) }))}
                        />
                      </label>
                      <label>
                        Desplazamiento vertical ({Math.round(primaryOfferImageSettings.offsetY)}%)
                        <input
                          type="range"
                          min={-primaryOfferImageMaxOffset}
                          max={primaryOfferImageMaxOffset}
                          step="1"
                          value={primaryOfferImageSettings.offsetY}
                          onChange={(event) => setSiteContentForm((current) => ({ ...current, primaryWeeklyOfferImageOffsetY: Number(event.target.value) }))}
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <p>Marca un solo producto como "Oferta principal (solo una)" para habilitar la previsualizacion.</p>
                )}
              </div>

              <div className="admin-simple-list">
                {loadingOffers ? <p>Cargando productos...</p> : null}
                {!loadingOffers && filteredAdminOffers.length === 0 ? <p>No hay productos para mostrar.</p> : null}

                {filteredAdminOffers.map((product) => (
                  <article className="admin-simple-item offer-admin-item" key={product.id}>
                    <div className="offer-admin-main">
                      <strong>{product.name}</strong>
                      <p>{product.categoryName} · stock {product.stock}</p>
                      <small>
                        {product.weeklyOffer
                          ? `Oferta activa: ${product.discountPercent || 0}%${product.offerDeadline ? ` · vence ${formatDateTime(product.offerDeadline)}` : ''}`
                          : 'Sin oferta activa'}
                      </small>
                    </div>

                    <label className="inline-label">
                      <input
                        type="checkbox"
                        checked={Boolean(product.featured)}
                        onChange={(event) => updateOfferDraft(product.id, 'featured', event.target.checked)}
                      />
                      Oferta principal (solo una)
                    </label>

                    <label className="inline-label">
                      <input
                        type="checkbox"
                        checked={Boolean(product.weeklyOffer)}
                        onChange={(event) => updateOfferDraft(product.id, 'weeklyOffer', event.target.checked)}
                      />
                      Incluir en ofertas
                    </label>

                    <label>
                      Descuento (%)
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={product.discountPercent ?? 0}
                        onChange={(event) => updateOfferDraft(product.id, 'discountPercent', Number(event.target.value || 0))}
                      />
                    </label>

                    <label>
                      Fecha y hora limite
                      <input
                        type="datetime-local"
                        value={product.offerDeadline || ''}
                        onChange={(event) => updateOfferDraft(product.id, 'offerDeadline', event.target.value)}
                      />
                    </label>

                  </article>
                ))}
              </div>
            </article>
          </section>
        ) : null}

        {adminTab === 'tickets' ? (
          <section className={isSuperAdmin ? 'admin-grid-2' : 'admin-grid-1'}>
            <article className="panel">
              <h3>Tickets y seguimiento</h3>
              <div className="admin-kpis">
                <div><strong>{ticketStatusGroups.NUEVO.length}</strong><small>Abiertos (NUEVO)</small></div>
                <div><strong>{ticketStatusGroups.EN_PROCESO.length}</strong><small>En proceso</small></div>
                <div><strong>{ticketStatusGroups.CERRADO.length}</strong><small>Cerrados</small></div>
              </div>
              <div className="ticket-filters">
                <label>Estado<select value={ticketStatusFilter} onChange={(event) => setTicketStatusFilter(event.target.value)}><option value="">Todos</option><option value="NUEVO">NUEVO</option><option value="EN_PROCESO">EN_PROCESO</option><option value="CERRADO">CERRADO</option></select></label>
                <label>Buscar<input placeholder="Ticket, nombre, telefono o documento" value={ticketSearchFilter} onChange={(event) => setTicketSearchFilter(event.target.value)} /></label>
              </div>
              <div className="ticket-status-tabs">
                <button type="button" className={ticketViewTab === 'ALL' ? 'header-link active' : 'header-link'} onClick={() => setTicketViewTab('ALL')}>Todos ({adminTickets.length})</button>
                <button type="button" className={ticketViewTab === 'NUEVO' ? 'header-link active' : 'header-link'} onClick={() => setTicketViewTab('NUEVO')}>Abiertos ({ticketStatusGroups.NUEVO.length})</button>
                <button type="button" className={ticketViewTab === 'EN_PROCESO' ? 'header-link active' : 'header-link'} onClick={() => setTicketViewTab('EN_PROCESO')}>En proceso ({ticketStatusGroups.EN_PROCESO.length})</button>
                <button type="button" className={ticketViewTab === 'CERRADO' ? 'header-link active' : 'header-link'} onClick={() => setTicketViewTab('CERRADO')}>Cerrados ({ticketStatusGroups.CERRADO.length})</button>
              </div>
              <button type="button" onClick={() => loadAdminTickets()}>{loadingAdminData ? 'Actualizando...' : 'Actualizar dashboard'}</button>
              <div className="ticket-list">
                {ticketSections.map((section) => {
                  const groupTickets = section.items || []
                  if (!groupTickets.length) {
                    return null
                  }

                  return (
                    <section key={section.key} className="ticket-status-group">
                      <div className="ticket-status-heading">
                        <strong>{section.title}</strong>
                        <small>{groupTickets.length} tickets</small>
                      </div>
                      {groupTickets.map((ticket) => (
                        <article className="ticket-card" key={ticket.id}>
                          <p><strong>{ticket.ticketCode}</strong> - {ticket.status}</p>
                          <p><strong>Fecha y hora:</strong> {formatDateTime(ticket.createdAt)}</p>
                          <p><strong>Cliente:</strong> {ticket.customerName}</p>
                          <p><strong>Documento:</strong> {ticket.customerDocument || 'No indicado'}</p>
                          <p><strong>Telefono:</strong> {ticket.customerPhone}</p>
                          <p><strong>Correo:</strong> {ticket.customerEmail || 'No indicado'}</p>
                          <p><strong>Empresa:</strong> {ticket.companyName || 'No indicada'}</p>
                          <p><strong>Entrega:</strong> {ticket.deliveryType === 'DOMICILIO' ? 'Domicilio' : 'Retiro en tienda'}</p>
                          <p><strong>Direccion:</strong> {ticket.deliveryAddress || 'No indicada'}</p>
                          <p><strong>Ciudad:</strong> {ticket.deliveryCity || 'No indicada'}</p>
                          <p><strong>Referencia:</strong> {ticket.deliveryReference || 'Sin referencia'}</p>
                          <p><strong>Horario preferido:</strong> {ticket.preferredContactTime || 'Sin preferencia'}</p>
                          <p><strong>Notas:</strong> {ticket.notes || 'Sin comentarios'}</p>
                          <p><strong>Productos solicitados:</strong></p>
                          <ul>
                            {(ticket.items || []).map((item) => (
                              <li key={`${ticket.id}-${item.productId}-${item.productName}`}>
                                {item.productName} · Cantidad: {item.quantity}
                              </li>
                            ))}
                          </ul>
                          {canManageTicketStatus ? (
                            <div className="status-actions">
                              <button type="button" className="ghost" onClick={() => updateTicketStatus(ticket.ticketCode, 'EN_PROCESO')}>EN_PROCESO</button>
                              <button type="button" className="ghost" onClick={() => updateTicketStatus(ticket.ticketCode, 'CERRADO')}>CERRADO</button>
                            </div>
                          ) : null}
                          <a href={ticket.whatsappLink} target="_blank" rel="noreferrer">Abrir WhatsApp</a>
                        </article>
                      ))}
                    </section>
                  )
                })}
              </div>
            </article>
            {isSuperAdmin ? (
              <article className="panel">
                <h3>Auditoria</h3>
                <div className="audit-list">
                  {auditRows.map((row) => (
                    <article key={row.id} className="audit-card">
                      <p><strong>{row.action}</strong> - {row.actorName || 'Sistema'}</p>
                      <p>{row.detail}</p>
                      <small>{row.createdAt}</small>
                    </article>
                  ))}
                </div>
              </article>
            ) : null}
          </section>
        ) : null}

        {adminTab === 'super' && isSuperAdmin ? (
          <>
            <section className="admin-grid-2">
              <article className="panel">
                <h3>Branding de tienda</h3>
                <form onSubmit={submitBrandingUpdate}>
                  <label>Nombre comercial<input value={brandingForm.storeName} onChange={(event) => setBrandingForm((current) => ({ ...current, storeName: event.target.value }))} /></label>
                  <label>Tagline<input value={brandingForm.tagline} onChange={(event) => setBrandingForm((current) => ({ ...current, tagline: event.target.value }))} /></label>
                  <label>URL de logo<input value={brandingForm.logoUrl} onChange={(event) => setBrandingForm((current) => ({ ...current, logoUrl: event.target.value }))} /></label>
                  <label>Subir logo<input type="file" accept="image/*" onChange={uploadBrandLogo} /></label>
                  <small>Maximo recomendado: 20 MB. Se abrira editor para ajustar dimensiones.</small>
                  <button type="submit" disabled={savingBranding}>{savingBranding ? 'Guardando marca...' : 'Guardar branding'}</button>
                </form>
              </article>

              <article className="panel">
                <h3>{editingUserId ? 'Editar usuario' : 'Crear usuario admin'}</h3>
                <form onSubmit={editingUserId ? submitUserEdit : submitAdminUser}>
                  <label>Nombre<input value={editingUserId ? editUserForm.name : adminUserForm.name} onChange={(event) => editingUserId ? setEditUserForm((c) => ({ ...c, name: event.target.value })) : setAdminUserForm((c) => ({ ...c, name: event.target.value }))} required /></label>
                  <label>Email<input type="email" value={editingUserId ? editUserForm.email : adminUserForm.email} onChange={(event) => editingUserId ? setEditUserForm((c) => ({ ...c, email: event.target.value })) : setAdminUserForm((c) => ({ ...c, email: event.target.value }))} required /></label>
                  <label>{editingUserId ? 'Nueva clave (dejar en blanco para no cambiar)' : 'Clave'}<input type="password" value={editingUserId ? editUserForm.password : adminUserForm.password} onChange={(event) => editingUserId ? setEditUserForm((c) => ({ ...c, password: event.target.value })) : setAdminUserForm((c) => ({ ...c, password: event.target.value }))} required={!editingUserId} /></label>
                  <label>Rol
                    <select value={editingUserId ? editUserForm.roleName : adminUserForm.roleName} onChange={(event) => editingUserId ? setEditUserForm((c) => ({ ...c, roleName: event.target.value })) : setAdminUserForm((c) => ({ ...c, roleName: event.target.value }))}>
                      <option value="ADMIN">ADMIN</option>
                      <option value="CONTENT_MANAGER">CONTENT_MANAGER</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </label>
                  {editingUserId ? (
                    <label className="inline-label"><input type="checkbox" checked={editUserForm.active} onChange={(event) => setEditUserForm((c) => ({ ...c, active: event.target.checked }))} />Usuario activo</label>
                  ) : null}
                  <button type="submit" disabled={creatingAdminUser || savingUserEdit}>{editingUserId ? (savingUserEdit ? 'Guardando...' : 'Actualizar usuario') : (creatingAdminUser ? 'Creando...' : 'Crear usuario')}</button>
                  {editingUserId ? <button type="button" className="ghost" onClick={() => { setEditingUserId(null); setEditUserForm(initialEditUserForm) }}>Cancelar edicion</button> : null}
                </form>
              </article>
            </section>

            <article className="panel" style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>Todos los usuarios ({adminUsers.length})</h3>
                <button type="button" className="ghost" onClick={loadAdminUsers} disabled={loadingAdminUsers}>{loadingAdminUsers ? 'Cargando...' : 'Recargar lista'}</button>
              </div>
              {adminUsers.length === 0 ? <p style={{ color: '#888' }}>Haz click en "Recargar lista" para ver los usuarios.</p> : null}
              <div className="admin-simple-list">
                {adminUsers.map((user) => (
                  <article key={user.id} className="admin-simple-item">
                    <div>
                      <strong>{user.name}</strong>
                      <p style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span>{user.email}</span>
                        <span className={`role-badge role-${user.roleName.toLowerCase()}`}>{user.roleName}</span>
                        {!user.active ? <span className="role-badge" style={{ background: '#ef5350', color: '#fff' }}>INACTIVO</span> : null}
                      </p>
                    </div>
                    <div className="status-actions">
                     <button type="button" className="ghost" onClick={() => beginEditUser(user)} disabled={editingUserId === user.id}>Editar</button>
                      {user.active ? (
                        <button type="button" className="ghost" style={{ color: '#ef5350' }} onClick={() => toggleUser(user.id, false)} disabled={togglingUserId === user.id}>{togglingUserId === user.id ? '...' : 'Desactivar'}</button>
                      ) : (
                        <button type="button" className="ghost" style={{ color: '#2e7d32' }} onClick={() => toggleUser(user.id, true)} disabled={togglingUserId === user.id}>{togglingUserId === user.id ? '...' : 'Activar'}</button>
                      )}
                      <button
                        type="button"
                        className="ghost"
                        style={{ color: '#b71c1c' }}
                        onClick={() => deleteUser(user)}
                        disabled={deletingUserId === user.id || authUser?.email === user.email}
                      >
                        {deletingUserId === user.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </>
        ) : null}
      </section>
    )
  }

  function renderCurrentView() {
    if (view === 'offers') {
      return renderOffers()
    }
    if (view === 'categories') {
      return renderCategories()
    }
    if (view === 'detail') {
      return renderDetail()
    }
    if (view === 'cart') {
      return renderCart()
    }
    if (view === 'admin') {
      return renderAdmin()
    }
    return renderHome()
  }

  function renderImageEditorModal() {
    if (!imageEditor.open) {
      return null
    }

    const isPresetActive = (key) => {
      const checks = {
        'product-1-1': imageEditor.width === 1200 && imageEditor.height === 1200,
        'category-3-2': imageEditor.width === 1500 && imageEditor.height === 1000,
        'slide-21-9': imageEditor.width === 2100 && imageEditor.height === 900,
        'logo-1-1': imageEditor.width === 1024 && imageEditor.height === 1024,
      }
      return Boolean(checks[key])
    }
    const previewTransform = `translate(${imageEditor.offsetX}%, ${imageEditor.offsetY}%) scale(${imageEditor.zoom})`

    return (
      <section className="image-editor-overlay" role="dialog" aria-modal="true">
        <article className="image-editor-panel">
          <h3>Editor de imagen</h3>
          <p>Ajusta recorte, tamano y calidad antes de subir. Puedes arrastrar la imagen con el mouse para encuadrar.</p>
          <div className="image-editor-presets">
            <button type="button" className={isPresetActive('product-1-1') ? 'header-link active' : 'header-link'} onClick={() => applyImagePreset('product-1-1')}>Producto 1:1</button>
            <button type="button" className={isPresetActive('category-3-2') ? 'header-link active' : 'header-link'} onClick={() => applyImagePreset('category-3-2')}>Categoria 3:2</button>
            <button type="button" className={isPresetActive('slide-21-9') ? 'header-link active' : 'header-link'} onClick={() => applyImagePreset('slide-21-9')}>Slide 21:9</button>
            <button type="button" className={isPresetActive('logo-1-1') ? 'header-link active' : 'header-link'} onClick={() => applyImagePreset('logo-1-1')}>Logo 1:1</button>
          </div>
          <div className="image-editor-grid">
            <div
              className="image-editor-preview-shell"
              onPointerDown={startPreviewDrag}
              onPointerMove={movePreviewDrag}
              onPointerUp={endPreviewDrag}
              onPointerCancel={endPreviewDrag}
            >
              <div className="image-editor-preview-viewport" style={{ aspectRatio: `${Math.max(1, imageEditor.width)} / ${Math.max(1, imageEditor.height)}` }}>
                <img
                  src={imageEditor.previewUrl}
                  alt="Preview"
                  className="image-editor-preview"
                  style={{ objectFit: imageEditor.fit, transform: previewTransform }}
                />
              </div>
            </div>
            <div className="image-editor-controls">
              <label>Ancho de salida (px)
                <input type="number" min="120" max="4000" value={imageEditor.width} onChange={(event) => setImageEditor((current) => ({ ...current, width: Number(event.target.value) || 1200 }))} />
              </label>
              <label>Alto de salida (px)
                <input type="number" min="120" max="4000" value={imageEditor.height} onChange={(event) => setImageEditor((current) => ({ ...current, height: Number(event.target.value) || 800 }))} />
              </label>
              <label>Ajuste
                <select value={imageEditor.fit} onChange={(event) => setImageEditor((current) => ({ ...current, fit: event.target.value }))}>
                  <option value="cover">Recortar para llenar (cover)</option>
                  <option value="contain">Completa sin recorte (contain)</option>
                </select>
              </label>
              <label>Zoom ({imageEditor.zoom.toFixed(2)}x)
                <input type="range" min="0.5" max="3" step="0.05" value={imageEditor.zoom} onChange={(event) => setImageEditor((current) => ({ ...current, zoom: Number(event.target.value) }))} />
              </label>
              <label>Desplazamiento horizontal
                <input type="range" min="-100" max="100" step="1" value={imageEditor.offsetX} onChange={(event) => setImageEditor((current) => ({ ...current, offsetX: Number(event.target.value) }))} />
              </label>
              <label>Desplazamiento vertical
                <input type="range" min="-100" max="100" step="1" value={imageEditor.offsetY} onChange={(event) => setImageEditor((current) => ({ ...current, offsetY: Number(event.target.value) }))} />
              </label>
              <label>Formato
                <select value={imageEditor.outputFormat} onChange={(event) => setImageEditor((current) => ({ ...current, outputFormat: event.target.value }))}>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WEBP</option>
                  <option value="image/png">PNG</option>
                </select>
              </label>
              {imageEditor.context?.type === 'product' ? (
                <label className="inline-label">
                  <input
                    type="checkbox"
                    checked={Boolean(imageEditor.removeBackground)}
                    onChange={(event) => setImageEditor((current) => ({ ...current, removeBackground: event.target.checked }))}
                  />
                  Quitar fondo automaticamente (experimental)
                </label>
              ) : null}
              <label>Calidad ({imageEditor.quality}%)
                <input type="range" min="45" max="100" step="1" value={imageEditor.quality} onChange={(event) => setImageEditor((current) => ({ ...current, quality: Number(event.target.value) }))} />
              </label>
            </div>
          </div>
          <div className="status-actions" style={{ marginTop: '14px' }}>
            <button type="button" className="ghost" onClick={closeImageEditor} disabled={uploadingImage}>Cancelar</button>
            <button type="button" onClick={confirmImageEditorUpload} disabled={uploadingImage}>{uploadingImage ? 'Subiendo...' : 'Aplicar y subir imagen'}</button>
          </div>
        </article>
      </section>
    )
  }

  function renderFooter() {
    return (
      <footer className="site-footer">
        <small>{branding.storeName || 'ATR Group'} · Plataforma comercial</small>
        <button
          type="button"
          className={view === 'admin' ? 'footer-admin-link active' : 'footer-admin-link'}
          onClick={() => setView('admin')}
          title="Acceso interno de administracion"
          aria-label="Acceso interno de administracion"
        >
          Acceso interno
        </button>
      </footer>
    )
  }

  return (
    <main className="app-shell atr-theme" style={appThemeStyle}>
      {renderHeader()}
      {loading ? <p className="loading">Cargando catalogo {branding.storeName}...</p> : renderCurrentView()}
      {renderImageEditorModal()}
      {error ? <p className="error-banner">{error}</p> : null}
      {renderFooter()}
    </main>
  )
}

export default App
