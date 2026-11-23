const API_BASE = 'https://phimapi.com'
const API_V1_BASE = 'https://phimapi.com/v1/api'

export type MovieRating = {
  id?: string
  vote_average?: number
  vote_count?: number
}

export type MovieTmdb = MovieRating & {
  type?: string
  season?: number | null
}

export type MovieListItem = {
  _id: string
  name: string
  slug: string
  origin_name?: string
  thumb_url?: string
  poster_url?: string
  year?: number
  time?: string
  episode_current?: string
  quality?: string
  lang?: string
  type?: string
  category?: Array<{ name: string; slug: string }>
  country?: Array<{ name: string; slug: string }>
  imdb?: MovieRating
  tmdb?: MovieTmdb
}

export type Pagination = {
  totalItems?: number
  totalItemsPerPage?: number
  currentPage?: number
  totalPages?: number
}

/** Tính totalPages từ API (API có thể trả totalItems + totalItemsPerPage thay vì totalPages) */
export function getTotalPages(pagination?: Pagination): number | undefined {
  if (pagination?.totalPages != null) return pagination.totalPages
  const total = pagination?.totalItems
  const perPage = pagination?.totalItemsPerPage
  if (total != null && perPage != null && perPage > 0) {
    return Math.ceil(total / perPage)
  }
  return undefined
}

export type PagedMovies = {
  items: MovieListItem[]
  params?: { pagination?: Pagination }
  APP_DOMAIN_CDN_IMAGE?: string
}

type Envelope<T> = { status?: string | boolean; message?: string; data: T }

async function apiGet<T>(
  base: string,
  path: string,
  query?: Record<string, string | number | undefined>,
) {
  const url = new URL(base + path)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v == null || v === '') continue
      url.searchParams.set(k, String(v))
    }
  }
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as T
}

const LIST_SLUG_MAP: Record<string, string> = {
  'phim-le': 'phim-le',
  'phim-bo': 'phim-bo',
  'phim-hoat-hinh': 'hoat-hinh',
  'tv-shows': 'tv-shows',
  'phim-vietsub': 'phim-vietsub',
  'phim-thuyet-minh': 'phim-thuyet-minh',
  'phim-long-tieng': 'phim-long-tieng',
}

const TYPE_TO_LIST: Record<NonNullable<SearchFilters['type']>, string> = {
  single: 'phim-le',
  series: 'phim-bo',
  hoathinh: 'hoat-hinh',
}

function normalizeMessage(raw: unknown) {
  if (!raw) return undefined
  if (typeof raw === 'string') return raw || undefined
  return undefined
}

function normalizeActorDirector(value?: string | string[]) {
  if (Array.isArray(value)) return value.join(', ')
  return value || ''
}

export const NON_V1_SLUGS = new Set([
  'phim-moi-cap-nhat',
  'phim-le',
  'phim-bo',
  'hoat-hinh',
  'tv-shows'
])

function mapPagedResponse(raw: any): Envelope<PagedMovies> {
  if (!raw) {
    return {
      status: false,
      data: { items: [] }
    }
  }

  // V1 envelope (has .data object containing items and params)
  if (raw.data && typeof raw.data === 'object' && ('items' in raw.data || 'params' in raw.data)) {
    const data = raw.data
    return {
      status: raw.status,
      message: normalizeMessage(raw.msg ?? raw.message),
      data: {
        items: Array.isArray(data.items) ? data.items : [],
        params: data.params || { pagination: data.pagination },
        APP_DOMAIN_CDN_IMAGE: data.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com',
      }
    }
  }

  // Non-V1 envelope (items, pagination at the root)
  return {
    status: raw.status,
    message: normalizeMessage(raw.msg ?? raw.message),
    data: {
      items: Array.isArray(raw.items) ? raw.items : [],
      params: {
        pagination: raw.pagination
      },
      APP_DOMAIN_CDN_IMAGE: 'https://phimimg.com',
    }
  }
}

function mapMovieResponse(raw: any): Envelope<MovieDetail> {
  if (!raw) {
    throw new Error('No data returned')
  }

  // V1 movie detail structure (has .data.item)
  if (raw.data && raw.data.item) {
    const item = raw.data.item
    return {
      status: raw.status,
      message: normalizeMessage(raw.msg ?? raw.message),
      data: {
        APP_DOMAIN_CDN_IMAGE: raw.data.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com',
        item: {
          ...item,
          actor: normalizeActorDirector(item.actor),
          director: normalizeActorDirector(item.director),
          episodes: item.episodes ?? [],
        },
      },
    }
  }

  // Non-V1 movie detail structure (movie and episodes at root)
  const movie = raw.movie
  if (!movie) {
    throw new Error(raw.msg || raw.message || 'Movie not found')
  }

  return {
    status: raw.status,
    message: normalizeMessage(raw.msg ?? raw.message),
    data: {
      APP_DOMAIN_CDN_IMAGE: 'https://phimimg.com',
      item: {
        ...movie,
        actor: normalizeActorDirector(movie.actor),
        director: normalizeActorDirector(movie.director),
        episodes: raw.episodes ?? [],
      },
    },
  }
}

export async function getHome() {
  return apiGet<any>(API_V1_BASE, '/home').then(mapPagedResponse)
}

export function getDanhSach(slug: string, page = 1) {
  const mappedSlug = LIST_SLUG_MAP[slug] ?? slug
  if (mappedSlug === 'phim-moi-cap-nhat') {
    return apiGet<any>(API_BASE, '/danh-sach/phim-moi-cap-nhat', { page }).then(mapPagedResponse)
  }
  if (NON_V1_SLUGS.has(mappedSlug)) {
    return apiGet<any>(API_BASE, `/danh-sach/${encodeURIComponent(mappedSlug)}`, { page }).then(mapPagedResponse)
  }
  return apiGet<any>(API_V1_BASE, `/danh-sach/${encodeURIComponent(mappedSlug)}`, { page }).then(mapPagedResponse)
}

export async function searchMovies(keyword: string, page = 1, limit = 24) {
  const trimmed = keyword.trim()
  if (/^tt\d+$/i.test(trimmed)) {
    try {
      const res = await getMovieByImdb(trimmed)
      if (res?.data?.item) {
        return {
          status: true,
          data: {
            items: [res.data.item],
            params: {
              pagination: {
                currentPage: 1,
                totalItems: 1,
                totalItemsPerPage: limit,
                totalPages: 1,
              },
            },
            APP_DOMAIN_CDN_IMAGE: res.data.APP_DOMAIN_CDN_IMAGE,
          },
        }
      }
    } catch {
      // Tiếp tục tìm kiếm thông thường nếu tìm theo IMDb ID không ra
    }
  }

  return apiGet<any>(
    API_V1_BASE,
    '/tim-kiem',
    { keyword: trimmed, page, limit },
  ).then(mapPagedResponse)
}

export type SearchFilters = {
  keyword?: string
  genre?: string
  country?: string
  year?: string
  type?: 'single' | 'series' | 'hoathinh'
  /** Slug danh sách: phim-moi-cap-nhat, phim-le, v.v. Dùng khi không có type/genre/country/year */
  listSlug?: string
}

function matchesFilters(m: MovieListItem, f: SearchFilters): boolean {
  if (f.genre && !(m.category ?? []).some((c) => c.slug === f.genre)) return false
  if (f.country && !(m.country ?? []).some((c) => c.slug === f.country)) return false
  if (f.year && m.year !== Number(f.year)) return false
  if (f.type && m.type !== f.type) return false
  return true
}

/** Tìm phim theo bộ lọc - sử dụng các tham số lọc của API */
export async function searchMoviesWithFilters(
  filters: SearchFilters,
  page = 1,
): Promise<Envelope<PagedMovies>> {
  let raw: Envelope<PagedMovies>

  const queryParams: Record<string, string | number | undefined> = { page }

  if (filters.keyword?.trim()) {
    // Tìm kiếm bằng keyword kèm theo các query params khác của PhimAPI
    const res = await apiGet<any>(
      API_V1_BASE,
      '/tim-kiem',
      {
        keyword: filters.keyword.trim(),
        page,
        ...(filters.genre ? { category: filters.genre } : {}),
        ...(filters.country ? { country: filters.country } : {}),
        ...(filters.year ? { year: filters.year } : {}),
      },
    )
    raw = mapPagedResponse(res)
  } else {
    let base = API_V1_BASE
    let path = ''

    if (filters.type) {
      const typeSlug = TYPE_TO_LIST[filters.type]
      if (NON_V1_SLUGS.has(typeSlug)) {
        base = API_BASE
        path = `/danh-sach/${typeSlug}`
      } else {
        path = `/danh-sach/${typeSlug}`
      }
      if (filters.genre) queryParams.category = filters.genre
      if (filters.country) queryParams.country = filters.country
      if (filters.year) queryParams.year = filters.year
    } else if (filters.genre) {
      path = `/the-loai/${encodeURIComponent(filters.genre)}`
      if (filters.country) queryParams.country = filters.country
      if (filters.year) queryParams.year = filters.year
    } else if (filters.country) {
      path = `/quoc-gia/${encodeURIComponent(filters.country)}`
      if (filters.year) queryParams.year = filters.year
    } else if (filters.year) {
      path = `/nam/${encodeURIComponent(String(filters.year))}`
    } else if (filters.listSlug) {
      const listSlug = LIST_SLUG_MAP[filters.listSlug] ?? filters.listSlug
      if (listSlug === 'phim-moi-cap-nhat' || NON_V1_SLUGS.has(listSlug)) {
        base = API_BASE
        path = `/danh-sach/${encodeURIComponent(listSlug)}`
      } else {
        path = `/danh-sach/${encodeURIComponent(listSlug)}`
      }
    } else {
      base = API_BASE
      path = '/danh-sach/phim-moi-cap-nhat'
    }

    const res = await apiGet<any>(
      base,
      path,
      queryParams,
    )
    raw = mapPagedResponse(res)
  }

  // Hỗ trợ lọc client-side cho trường hợp từ khóa + loại phim (vì endpoint /tim-kiem không lọc type trên server được hoàn toàn)
  if (filters.keyword?.trim() && (filters.type || filters.genre || filters.country || filters.year)) {
    const data = raw.data
    if (data && data.items) {
      const filtered = data.items.filter((m: MovieListItem) => matchesFilters(m, filters))
      return {
        ...raw,
        data: {
          ...data,
          items: filtered,
        },
      }
    }
  }

  return raw
}

export type TaxonomyItem = { name: string; slug: string }

export function getGenres() {
  return apiGet<{ data: { items: TaxonomyItem[] } }>(API_BASE, '/the-loai').then((raw) => ({
    status: true,
    data: { items: raw.data.items },
  }))
}

export function getGenreMovies(slug: string, page = 1) {
  return apiGet<any>(
    API_V1_BASE,
    `/the-loai/${encodeURIComponent(slug)}`,
    { page },
  ).then(mapPagedResponse)
}

export function getCountries() {
  return apiGet<{ data: { items: TaxonomyItem[] } }>(API_BASE, '/quoc-gia').then((raw) => ({
    status: true,
    data: { items: raw.data.items },
  }))
}

export function getCountryMovies(slug: string, page = 1) {
  return apiGet<any>(
    API_V1_BASE,
    `/quoc-gia/${encodeURIComponent(slug)}`,
    { page },
  ).then(mapPagedResponse)
}

export function getYears() {
  return apiGet<{
    status?: string | boolean
    message?: string
    data?: { items?: Array<{ year: number }> }
  }>(API_BASE, '/nam-phat-hanh').then((raw) => ({
    status: raw.status ?? true,
    data: {
      items: (raw.data?.items ?? []).map((item) => item.year),
    },
  }))
}

export function getYearMovies(year: string | number, page = 1, category?: string) {
  return apiGet<any>(
    API_V1_BASE,
    `/nam/${encodeURIComponent(String(year))}`,
    { page, ...(category ? { category } : {}) },
  ).then(mapPagedResponse)
}

export type MovieDetail = {
  APP_DOMAIN_CDN_IMAGE?: string
  item: MovieListItem & {
    content?: string
    actor?: string
    director?: string
    trailer_url?: string
    episodes?: Array<{
      server_name: string
      server_data: Array<{
        name: string
        slug: string
        filename?: string
        link_embed?: string
      }>
    }>
  }
}

export function getMovie(slug: string) {
  return apiGet<any>(API_V1_BASE, `/phim/${encodeURIComponent(slug)}`).then(mapMovieResponse)
}

export function getMovieById(id: string) {
  return apiGet<any>(API_BASE, `/phim/id/${encodeURIComponent(id)}`).then(mapMovieResponse)
}

export function getMovieByTmdb(id: string | number) {
  return apiGet<any>(API_BASE, `/tmdb/movie/${encodeURIComponent(id)}`).then(mapMovieResponse)
}

export function getMovieByImdb(id: string) {
  return apiGet<any>(API_BASE, `/imdb/title/${encodeURIComponent(id)}`).then(mapMovieResponse)
}

type MovieExtraResponse<T> = {
  success?: boolean
  status?: boolean
  message?: string
  data: T
}

export function getMovieImages(slug: string) {
  return apiGet<
    MovieExtraResponse<{
      image_sizes?: {
        backdrop?: Record<string, string>
        poster?: Record<string, string>
      }
      images?: Array<{ file_path: string; type?: 'backdrop' | 'poster' | string }>
    }>
  >(API_V1_BASE, `/phim/${encodeURIComponent(slug)}/images`).then((raw) => ({
    status: raw.success ?? raw.status ?? true,
    data: {
      image_sizes: raw.data.image_sizes ?? { backdrop: {}, poster: {} },
      images: raw.data.images ?? [],
    },
  }))
}

export function getMoviePeoples(slug: string) {
  return apiGet<
    MovieExtraResponse<{
      peoples?: Array<{ id?: number | string; name: string; known_for_department?: string }>
    }>
  >(API_V1_BASE, `/phim/${encodeURIComponent(slug)}/peoples`).then((raw) => ({
    status: raw.success ?? raw.status ?? true,
    data: {
      peoples: raw.data.peoples ?? [],
    },
  }))
}

export function getMovieKeywords(slug: string) {
  return apiGet<
    MovieExtraResponse<{
      keywords?: Array<string | { id?: number | string; name: string }>
    }>
  >(API_V1_BASE, `/phim/${encodeURIComponent(slug)}/keywords`).then((raw) => ({
    status: raw.success ?? raw.status ?? true,
    data: {
      keywords: (raw.data.keywords ?? []).map((keyword, index) =>
        typeof keyword === 'string'
          ? { id: keyword, name: keyword }
          : { id: keyword.id ?? index, name: keyword.name },
      ),
    },
  }))
}

export function imgUrl(cdn: string | undefined, path: string | undefined) {
  if (!path) return undefined
  let fullUrl = path
  if (!path.startsWith('http://') && !path.startsWith('https://')) {
    let p = path
    if (!p.includes('/')) {
      p = `uploads/movies/${p}`
    }
    const activeCdn = cdn || 'https://phimimg.com'
    fullUrl = `${activeCdn.replace(/\/$/, '')}/${p.replace(/^\//, '')}`
  }
  return fullUrl
}

export function tmdbImageUrl(
  sizes:
    | {
        backdrop?: { [k: string]: string }
        poster?: { [k: string]: string }
      }
    | undefined,
  type: string | undefined,
  filePath: string,
) {
  if (!filePath) return ''
  let fullUrl = filePath
  if (!filePath.startsWith('http://') && !filePath.startsWith('https://')) {
    const kind = type === 'poster' ? 'poster' : 'backdrop'
    const base =
      kind === 'poster'
        ? sizes?.poster?.w342 || sizes?.poster?.original
        : sizes?.backdrop?.w780 || sizes?.backdrop?.original
    if (base) {
      fullUrl = `${base.replace(/\/$/, '')}/${filePath.replace(/^\//, '')}`
    }
  }
  return `https://images.weserv.nl/?url=${encodeURIComponent(fullUrl)}`
}
