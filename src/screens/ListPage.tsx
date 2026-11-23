import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'
import { searchMoviesWithFilters, getTotalPages } from '../lib/ophim'
import { MovieCard } from '../components/MovieCard'
import { Pagination } from '../components/Pagination'
import { ListFilterBar } from '../components/ListFilterBar'

const SLUG_TO_TYPE: Record<string, 'single' | 'series' | 'hoathinh'> = {
  'phim-le': 'single',
  'phim-bo': 'series',
  'phim-hoat-hinh': 'hoathinh',
}

const SLUG_LABELS: Record<string, string> = {
  'phim-le': 'Phim lẻ',
  'phim-bo': 'Phim bộ',
  'phim-hoat-hinh': 'Phim hoạt hình',
  'phim-moi-cap-nhat': 'Phim mới cập nhật',
  'tv-shows': 'TV Shows',
}

export function ListPage() {
  const { slug } = useParams()
  const [sp] = useSearchParams()
  const page = Number(sp.get('page') ?? '1') || 1

  const listType = slug ? SLUG_TO_TYPE[slug] : undefined

  const filters = {
    type: listType,
    listSlug: !listType && slug ? slug : undefined,
    genre: sp.get('genre') || undefined,
    country: sp.get('country') || undefined,
    year: sp.get('year') || undefined,
  }

  const q = useQuery({
    queryKey: ['list', slug, filters, page],
    queryFn: () => searchMoviesWithFilters(filters, page),
    enabled: Boolean(slug),
  })

  if (!slug) return null

  const title = SLUG_LABELS[slug] ?? slug

  return (
    <section>
      <h1 className="page-title">{title}</h1>
      <ListFilterBar hideType={Boolean(listType)} />

      {q.isLoading ? (
        <div className="movies-grid" style={{ marginTop: 20 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ paddingTop: '150%', borderRadius: 16 }} />
          ))}
        </div>
      ) : q.isError || !q.data ? (
        <div className="panel panel--error" style={{ marginTop: 20 }}>Không tải được danh sách phim.</div>
      ) : (
        <>
          <div className="movies-grid" style={{ marginTop: 20 }}>
            {q.data.data.items.map((m) => (
              <MovieCard key={m._id} movie={m} cdn={q.data.data.APP_DOMAIN_CDN_IMAGE} />
            ))}
          </div>
          <Pagination
            basePath={`/danh-sach/${slug}`}
            page={page}
            totalPages={getTotalPages(q.data.data.params?.pagination)}
            extraQuery={{ genre: filters.genre, country: filters.country, year: filters.year }}
          />
        </>
      )}
    </section>
  )
}
