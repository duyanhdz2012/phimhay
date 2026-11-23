import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  searchMoviesWithFilters,
  getGenres,
  getCountries,
  getYears,
  getTotalPages,
  type SearchFilters,
  type MovieListItem,
} from '../lib/ophim'
import { MovieCard } from '../components/MovieCard'
import { Pagination } from '../components/Pagination'

const TYPE_OPTIONS: { value: '' | SearchFilters['type']; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'single', label: 'Phim lẻ' },
  { value: 'series', label: 'Phim bộ' },
  { value: 'hoathinh', label: 'Phim hoạt hình' },
]

function buildFilters(params: URLSearchParams): SearchFilters {
  return {
    keyword: params.get('keyword') ?? undefined,
    genre: params.get('genre') || undefined,
    country: params.get('country') || undefined,
    year: params.get('year') || undefined,
    type: (params.get('type') as SearchFilters['type']) || undefined,
  }
}

function hasActiveFilters(f: SearchFilters): boolean {
  return !!(f.keyword?.trim() || f.genre || f.country || f.year || f.type)
}

export function FilterSearchPage() {
  const [sp, setSp] = useSearchParams()
  const filters = buildFilters(sp)
  const page = Number(sp.get('page') ?? '1') || 1

  const genresQ = useQuery({
    queryKey: ['genres'],
    queryFn: () => getGenres(),
  })
  const countriesQ = useQuery({
    queryKey: ['countries'],
    queryFn: () => getCountries(),
  })
  const yearsQ = useQuery({
    queryKey: ['years'],
    queryFn: () => getYears(),
  })

  const moviesQ = useQuery({
    queryKey: ['search-filters', filters, page],
    queryFn: () => searchMoviesWithFilters(filters, page),
    enabled: hasActiveFilters(filters),
  })

  const genres = genresQ.data?.data.items ?? []
  const countries = countriesQ.data?.data.items ?? []
  const rawYears = yearsQ.data?.data.items ?? []
  const years = rawYears
    .map((x) => (typeof x === 'number' ? x : (x as { year: number }).year))
    .filter((x): x is number => typeof x === 'number')
    .sort((a, b) => b - a)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const next = new URLSearchParams()
    const kw = (fd.get('keyword') as string)?.trim()
    if (kw) next.set('keyword', kw)
    const genre = fd.get('genre') as string
    if (genre) next.set('genre', genre)
    const country = fd.get('country') as string
    if (country) next.set('country', country)
    const year = fd.get('year') as string
    if (year) next.set('year', year)
    const type = fd.get('type') as string
    if (type) next.set('type', type)
    setSp(next)
  }

  return (
    <section>
      <h1 className="page-title">Tìm kiếm & Bộ lọc</h1>
      <p className="page-subtitle">
        Chọn thể loại, quốc gia, năm hoặc nhập từ khóa để tìm phim.
      </p>

      <form className="filter-form" onSubmit={handleSubmit}>
        <div className="filter-form__row">
          <input
            type="search"
            name="keyword"
            placeholder="Nhập từ khóa phim…"
            defaultValue={filters.keyword}
            className="filter-form__input"
          />
          <select
            name="genre"
            className="filter-form__select"
            defaultValue={filters.genre ?? ''}
          >
            <option value="">Thể loại</option>
            {genres.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
          <select
            name="country"
            className="filter-form__select"
            defaultValue={filters.country ?? ''}
          >
            <option value="">Quốc gia</option>
            {countries.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="year"
            className="filter-form__select"
            defaultValue={filters.year ?? ''}
          >
            <option value="">Năm</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            name="type"
            className="filter-form__select"
            defaultValue={filters.type ?? ''}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button type="submit" className="filter-form__btn">
            Tìm kiếm
          </button>
        </div>
      </form>

      {!hasActiveFilters(filters) ? (
        <div className="panel" style={{ marginTop: 20 }}>
          Chọn ít nhất một tiêu chí và bấm Tìm kiếm.
        </div>
      ) : moviesQ.isLoading ? (
        <div style={{ marginTop: 20 }}>
          <div className="movies-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ paddingTop: '150%', borderRadius: 16 }} />
            ))}
          </div>
        </div>
      ) : moviesQ.isError || !moviesQ.data ? (
        <div className="panel panel--error" style={{ marginTop: 20 }}>
          Không tải được kết quả.
        </div>
      ) : (
        <>
          <div className="movies-grid" style={{ marginTop: 20 }}>
            {moviesQ.data.data.items.map((m: MovieListItem) => (
              <MovieCard
                key={m._id}
                movie={m}
                cdn={moviesQ.data!.data.APP_DOMAIN_CDN_IMAGE}
              />
            ))}
          </div>
          <Pagination
            basePath="/bo-loc"
            page={page}
            totalPages={getTotalPages(moviesQ.data.data.params?.pagination)}
            extraQuery={{
              keyword: filters.keyword,
              genre: filters.genre,
              country: filters.country,
              year: filters.year,
              type: filters.type,
            }}
          />
        </>
      )}
    </section>
  )
}
