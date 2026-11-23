import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { searchMovies, getTotalPages } from '../lib/ophim'
import { MovieCard } from '../components/MovieCard'
import { Pagination } from '../components/Pagination'

export function SearchPage() {
  const [sp, setSp] = useSearchParams()
  const keyword = (sp.get('keyword') ?? '').trim()
  const page = Number(sp.get('page') ?? '1') || 1

  const [inputVal, setInputVal] = useState(keyword)

  useEffect(() => {
    setInputVal(keyword)
  }, [keyword])

  const q = useQuery({
    queryKey: ['search', keyword, page],
    queryFn: () => searchMovies(keyword, page),
    enabled: keyword.length > 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputVal.trim()
    if (!trimmed) return
    setSp({ keyword: trimmed })
  }

  return (
    <section className="search-page">
      <h1 className="page-title">Tìm kiếm phim</h1>
      <p className="page-subtitle">
        Khám phá hàng ngàn bộ phim lẻ, phim bộ và hoạt hình đặc sắc.
      </p>

      {/* In-page search bar for mobile & desktop */}
      <form className="search-page__form" onSubmit={handleSubmit} role="search">
        <div className="search-page__input-wrap">
          <svg className="search-page__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Nhập tên phim, diễn viên hoặc mã IMDb (tt...)..."
            className="search-page__input"
            aria-label="Nhập từ khoá tìm kiếm phim"
            autoFocus={!keyword}
          />
          {inputVal && (
            <button
              type="button"
              className="search-page__clear"
              onClick={() => setInputVal('')}
              aria-label="Xoá nội dung ô tìm kiếm"
            >
              ×
            </button>
          )}
        </div>
        <button type="submit" className="search-page__btn">
          Tìm kiếm
        </button>
      </form>

      {keyword && (
        <div className="search-page__results-header">
          <span>Kết quả tìm kiếm cho: <strong>"{keyword}"</strong></span>
          {q.data?.data?.params?.pagination?.totalItems != null && (
            <span className="search-page__count">
              ({q.data.data.params.pagination.totalItems} kết quả)
            </span>
          )}
        </div>
      )}

      {!keyword ? (
        <div className="panel" style={{ marginTop: 24, textAlign: 'center', padding: '36px 20px' }}>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-secondary)' }}>
            Vui lòng nhập tên phim cần tìm kiếm vào ô trên.
          </p>
        </div>
      ) : q.isLoading ? (
        <div className="movies-grid" style={{ marginTop: 20 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ paddingTop: '150%', borderRadius: 16 }} />
          ))}
        </div>
      ) : q.isError || !q.data ? (
        <div className="panel panel--error" style={{ marginTop: 20 }}>
          Không tải được kết quả tìm kiếm. Vui lòng thử lại sau.
        </div>
      ) : q.data.data.items.length === 0 ? (
        <div className="panel" style={{ marginTop: 20, textAlign: 'center', padding: '36px 20px' }}>
          <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>Không tìm thấy phim phù hợp</p>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
            Hãy thử tìm bằng từ khoá ngắn hơn, không dấu hoặc kiểm tra lại chính tả.
          </p>
        </div>
      ) : (
        <>
          <div className="movies-grid" style={{ marginTop: 20 }}>
            {q.data.data.items.map((m) => (
              <MovieCard key={m._id} movie={m} cdn={q.data.data.APP_DOMAIN_CDN_IMAGE} />
            ))}
          </div>
          <Pagination
            basePath="/tim-kiem"
            page={page}
            totalPages={getTotalPages(q.data.data.params?.pagination)}
            extraQuery={{ keyword }}
          />
        </>
      )}
    </section>
  )
}
