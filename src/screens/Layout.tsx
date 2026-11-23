import { Outlet, Link, NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const ChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

function HeaderSearchForm({ defaultKeyword }: { defaultKeyword: string }) {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState(defaultKeyword)

  return (
    <form
      className="search-bar search-bar--full"
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        const k = keyword.trim()
        if (!k) return
        navigate(`/tim-kiem?keyword=${encodeURIComponent(k)}`)
      }}
    >
      <span className="search-bar__icon" aria-hidden>
        <SearchIcon />
      </span>
      <input
        type="search"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Tìm kiếm phim, diễn viên…"
        className="search-bar__input"
        aria-label="Tìm kiếm phim, diễn viên"
      />
      {keyword && (
        <button
          type="button"
          onClick={() => setKeyword('')}
          className="search-bar__clear-btn"
          aria-label="Xoá từ khóa"
        >
          ×
        </button>
      )}
      <button type="submit" className="search-bar__submit-btn" aria-label="Bắt đầu tìm kiếm">
        Tìm
      </button>
    </form>
  )
}

function MobileNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeMenu()
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <>
      <button
        className="hamburger-btn"
        onClick={() => setIsMenuOpen(true)}
        aria-label="Mở menu điều hướng"
        aria-expanded={isMenuOpen}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div
        className={`mobile-menu-overlay${isMenuOpen ? ' mobile-menu-overlay--open' : ''}`}
        onClick={closeMenu}
        aria-hidden={!isMenuOpen}
      />

      <div
        className={`mobile-menu${isMenuOpen ? ' mobile-menu--open' : ''}`}
        role="dialog"
        aria-label="Menu điều hướng chính"
        aria-modal="true"
      >
        <div className="mobile-menu__header">
          <span className="mobile-menu__title">Danh mục</span>
          <button
            className="mobile-menu__close"
            onClick={closeMenu}
            aria-label="Đóng menu"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mobile-menu__links">
          <NavLink to="/" end className="mobile-menu__link" onClick={closeMenu}>
            Trang chủ
          </NavLink>
          <NavLink to="/danh-sach/phim-le" className="mobile-menu__link" onClick={closeMenu}>
            Phim Lẻ
          </NavLink>
          <NavLink to="/danh-sach/phim-bo" className="mobile-menu__link" onClick={closeMenu}>
            Phim Bộ
          </NavLink>
          <NavLink to="/danh-sach/phim-hoat-hinh" className="mobile-menu__link" onClick={closeMenu}>
            Anime & Hoạt hình
          </NavLink>

          <div className="mobile-menu__divider" />

          <div className="mobile-menu__section-title">Khám phá</div>
          <NavLink to="/the-loai" className="mobile-menu__link" onClick={closeMenu}>
            Thể loại
          </NavLink>
          <NavLink to="/quoc-gia" className="mobile-menu__link" onClick={closeMenu}>
            Quốc gia
          </NavLink>
          <NavLink to="/nam-phat-hanh" className="mobile-menu__link" onClick={closeMenu}>
            Năm phát hành
          </NavLink>

          <div className="mobile-menu__divider" />

          <NavLink to="/bo-loc" className="mobile-menu__link mobile-menu__link--highlight" onClick={closeMenu}>
            Bộ lọc nâng cao
          </NavLink>
        </div>
      </div>
    </>
  )
}

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const urlKeyword = params.get('keyword') ?? ''

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [mobileKeyword, setMobileKeyword] = useState(urlKeyword)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMobileKeyword(urlKeyword)
  }, [urlKeyword])

  useEffect(() => {
    if (isMobileSearchOpen) {
      // Focus input when mobile search bar opens
      setTimeout(() => mobileInputRef.current?.focus(), 50)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsMobileSearchOpen(false)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileSearchOpen])

  // Close mobile search on route navigation
  useEffect(() => {
    setIsMobileSearchOpen(false)
  }, [location.pathname, location.search])

  return (
    <div className="app-wrapper">
      {/* ── Desktop / Tablet Header ── */}
      <header className="app-header app-header--full">
        <div className="app-header__inner">
          <Link to="/" className="logo logo--thung" aria-label="Phim Hay - Trang chủ">
            <span className="logo__badge logo__badge--thung" aria-hidden />
            <div className="logo__brand">
              <span className="logo__text">Phim Hay</span>
              <span className="logo__tagline">Phim hay đây mà</span>
            </div>
          </Link>

          <nav className="nav nav--thung" aria-label="Điều hướng chính">
            <NavLink to="/" end className="nav__item">
              Home
            </NavLink>
            <NavLink to="/danh-sach/phim-le" className="nav__item">
              Phim Lẻ
            </NavLink>
            <NavLink to="/danh-sach/phim-bo" className="nav__item">
              Phim Bộ
            </NavLink>
            <NavLink to="/danh-sach/phim-hoat-hinh" className="nav__item">
              Anime
            </NavLink>
            <NavLink to="/the-loai" className="nav__item nav__item--with-chevron">
              Thể loại
              <span className="nav__chevron" aria-hidden><ChevronDown /></span>
            </NavLink>
            <NavLink to="/quoc-gia" className="nav__item nav__item--with-chevron">
              Quốc gia
              <span className="nav__chevron" aria-hidden><ChevronDown /></span>
            </NavLink>
            <NavLink to="/nam-phat-hanh" className="nav__item">
              Năm
            </NavLink>
            <NavLink to="/bo-loc" className="nav__item">
              Bộ lọc
            </NavLink>
          </nav>

          <HeaderSearchForm key={urlKeyword} defaultKeyword={urlKeyword} />

          <div className="header-mobile-actions">
            {/* Mobile search toggle button */}
            <button
              className={`mobile-search-btn${isMobileSearchOpen ? ' mobile-search-btn--active' : ''}`}
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              aria-label={isMobileSearchOpen ? 'Đóng ô tìm kiếm' : 'Mở ô tìm kiếm'}
              aria-expanded={isMobileSearchOpen}
            >
              {isMobileSearchOpen ? <CloseIcon /> : <SearchIcon />}
            </button>

            <MobileNavigation key={location.pathname} />
          </div>
        </div>

        {/* Mobile floating / expandable search bar anchored at the top */}
        {isMobileSearchOpen && (
          <div className="mobile-search-dropdown" role="region" aria-label="Thanh tìm kiếm di động">
            <form
              className="mobile-search-form"
              onSubmit={(e) => {
                e.preventDefault()
                const k = mobileKeyword.trim()
                if (!k) return
                setIsMobileSearchOpen(false)
                navigate(`/tim-kiem?keyword=${encodeURIComponent(k)}`)
              }}
            >
              <span className="mobile-search-form__icon" aria-hidden>
                <SearchIcon />
              </span>
              <input
                ref={mobileInputRef}
                type="search"
                value={mobileKeyword}
                onChange={(e) => setMobileKeyword(e.target.value)}
                placeholder="Tìm phim, diễn viên..."
                className="mobile-search-form__input"
                aria-label="Nhập từ khóa tìm kiếm"
              />
              {mobileKeyword && (
                <button
                  type="button"
                  className="mobile-search-form__clear"
                  onClick={() => {
                    setMobileKeyword('')
                    mobileInputRef.current?.focus()
                  }}
                  aria-label="Xoá nội dung tìm kiếm"
                >
                  <CloseIcon />
                </button>
              )}
              <button type="submit" className="mobile-search-form__submit">
                Tìm
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <div className="app">
        <main className="app-main">
          <Outlet />
        </main>
      </div>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <div className="app-footer__inner">
          <div className="app-footer__brand">
            <Link to="/" className="app-footer__logo">
              <span className="logo__text">Phim Hay</span>
            </Link>
            <p className="app-footer__desc">
              Trang xem phim trực tuyến miễn phí chất lượng cao với phụ đề tiếng Việt. Kho phim đa dạng, cập nhật liên tục.
            </p>
            <div className="app-footer__socials">
              <a href="#" className="app-footer__social" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="app-footer__social" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="app-footer__social" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="app-footer__col">
            <h4 className="app-footer__title">Danh mục</h4>
            <Link to="/danh-sach/phim-le" className="app-footer__link">Phim lẻ</Link>
            <Link to="/danh-sach/phim-bo" className="app-footer__link">Phim bộ</Link>
            <Link to="/danh-sach/phim-hoat-hinh" className="app-footer__link">Anime</Link>
            <Link to="/danh-sach/tv-shows" className="app-footer__link">TV Shows</Link>
          </div>

          <div className="app-footer__col">
            <h4 className="app-footer__title">Thể loại</h4>
            <Link to="/the-loai/hanh-dong" className="app-footer__link">Hành động</Link>
            <Link to="/the-loai/tinh-cam" className="app-footer__link">Tình cảm</Link>
            <Link to="/the-loai/kinh-di" className="app-footer__link">Kinh dị</Link>
            <Link to="/the-loai/hai-huoc" className="app-footer__link">Hài hước</Link>
          </div>

          <div className="app-footer__col">
            <h4 className="app-footer__title">Hỗ trợ</h4>
            <Link to="#" className="app-footer__link">Liên hệ</Link>
            <Link to="#" className="app-footer__link">Điều khoản</Link>
            <Link to="#" className="app-footer__link">Bảo mật</Link>
          </div>
        </div>

        <div className="app-footer__bottom">
          <p>© 2026 Phim Hay. Tất cả quyền được bảo lưu. Dữ liệu phim được cung cấp bởi OPhim.</p>
        </div>
      </footer>

      {/* ── Bottom Navigation (mobile only, shown via CSS) ── */}
      <nav className="bottom-nav">
        <div className="bottom-nav__inner">
          <NavLink to="/" end className="bottom-nav__item">
            <span className="bottom-nav__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <span className="bottom-nav__label">Trang chủ</span>
          </NavLink>

          <NavLink to="/tim-kiem" className="bottom-nav__item">
            <span className="bottom-nav__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <span className="bottom-nav__label">Tìm kiếm</span>
          </NavLink>

          <NavLink to="/the-loai" className="bottom-nav__item">
            <span className="bottom-nav__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </span>
            <span className="bottom-nav__label">Thể loại</span>
          </NavLink>

          <NavLink to="/quoc-gia" className="bottom-nav__item">
            <span className="bottom-nav__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </span>
            <span className="bottom-nav__label">Quốc gia</span>
          </NavLink>

          <NavLink to="/bo-loc" className="bottom-nav__item">
            <span className="bottom-nav__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </span>
            <span className="bottom-nav__label">Bộ lọc</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
