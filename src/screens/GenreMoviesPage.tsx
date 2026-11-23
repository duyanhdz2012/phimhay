import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'
import { searchMoviesWithFilters, getTotalPages } from '../lib/ophim'
import { MovieCard } from '../components/MovieCard'
import { Pagination } from '../components/Pagination'
import { ListFilterBar } from '../components/ListFilterBar'

export function GenreMoviesPage() {
  const { slug } = useParams()
  const [sp] = useSearchParams()
  const page = Number(sp.get('page') ?? '1') || 1

  const filters = {
    genre: slug ?? '',
    country: sp.get('country') || undefined,
    year: sp.get('year') || undefined,
    type: (sp.get('type') as 'single' | 'series' | 'hoathinh') || undefined,
  }

  const q = useQuery({
    queryKey: ['genre-movies', filters, page],
    queryFn: () => searchMoviesWithFilters(filters, page),
    enabled: Boolean(slug),
  })

  if (!slug) return null

  return (
    <section>
      <h1 className="page-title">Thể loại: {slug}</h1>
      <ListFilterBar hideGenre />

      {q.isLoading ? (
        <div className="movies-grid" style={{ marginTop: 20 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ paddingTop: '150%', borderRadius: 16 }} />
          ))}
        </div>
      ) : q.isError || !q.data ? (
        <div className="panel panel--error" style={{ marginTop: 20 }}>Không tải được phim theo thể loại.</div>
      ) : (
        <>
          <div className="movies-grid" style={{ marginTop: 20 }}>
            {q.data.data.items.map((m) => (
              <MovieCard key={m._id} movie={m} cdn={q.data.data.APP_DOMAIN_CDN_IMAGE} />
            ))}
          </div>
          <Pagination
            basePath={`/the-loai/${slug}`}
            page={page}
            totalPages={getTotalPages(q.data.data.params?.pagination)}
            extraQuery={{ country: filters.country, year: filters.year, type: filters.type }}
          />
        </>
      )}
    </section>
  )
}
