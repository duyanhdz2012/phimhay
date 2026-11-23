import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'
import { searchMoviesWithFilters, getTotalPages } from '../lib/ophim'
import { MovieCard } from '../components/MovieCard'
import { Pagination } from '../components/Pagination'
import { ListFilterBar } from '../components/ListFilterBar'

export function YearMoviesPage() {
  const { year } = useParams()
  const [sp] = useSearchParams()
  const page = Number(sp.get('page') ?? '1') || 1

  const filters = {
    year: year ?? '',
    genre: sp.get('genre') || undefined,
    country: sp.get('country') || undefined,
    type: (sp.get('type') as 'single' | 'series' | 'hoathinh') || undefined,
  }

  const q = useQuery({
    queryKey: ['year-movies', filters, page],
    queryFn: () => searchMoviesWithFilters(filters, page),
    enabled: Boolean(year),
  })

  if (!year) return null

  return (
    <section>
      <h1 className="page-title">Năm: {year}</h1>
      <ListFilterBar hideYear />

      {q.isLoading ? (
        <div className="movies-grid" style={{ marginTop: 20 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ paddingTop: '150%', borderRadius: 16 }} />
          ))}
        </div>
      ) : q.isError || !q.data ? (
        <div className="panel panel--error" style={{ marginTop: 20 }}>Không tải được phim theo năm.</div>
      ) : (
        <>
          <div className="movies-grid" style={{ marginTop: 20 }}>
            {q.data.data.items.map((m) => (
              <MovieCard key={m._id} movie={m} cdn={q.data.data.APP_DOMAIN_CDN_IMAGE} />
            ))}
          </div>
          <Pagination
            basePath={`/nam-phat-hanh/${year}`}
            page={page}
            totalPages={getTotalPages(q.data.data.params?.pagination)}
            extraQuery={{ genre: filters.genre, country: filters.country, type: filters.type }}
          />
        </>
      )}
    </section>
  )
}
