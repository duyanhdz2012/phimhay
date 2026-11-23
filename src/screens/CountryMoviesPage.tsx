import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'
import { searchMoviesWithFilters, getTotalPages } from '../lib/ophim'
import { MovieCard } from '../components/MovieCard'
import { Pagination } from '../components/Pagination'
import { ListFilterBar } from '../components/ListFilterBar'

export function CountryMoviesPage() {
  const { slug } = useParams()
  const [sp] = useSearchParams()
  const page = Number(sp.get('page') ?? '1') || 1

  const filters = {
    country: slug ?? '',
    genre: sp.get('genre') || undefined,
    year: sp.get('year') || undefined,
    type: (sp.get('type') as 'single' | 'series' | 'hoathinh') || undefined,
  }

  const q = useQuery({
    queryKey: ['country-movies', filters, page],
    queryFn: () => searchMoviesWithFilters(filters, page),
    enabled: Boolean(slug),
  })

  if (!slug) return null

  return (
    <section>
      <h1 className="page-title">Quốc gia: {slug}</h1>
      <ListFilterBar hideCountry />

      {q.isLoading ? (
        <div className="movies-grid" style={{ marginTop: 20 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ paddingTop: '150%', borderRadius: 16 }} />
          ))}
        </div>
      ) : q.isError || !q.data ? (
        <div className="panel panel--error" style={{ marginTop: 20 }}>Không tải được phim theo quốc gia.</div>
      ) : (
        <>
          <div className="movies-grid" style={{ marginTop: 20 }}>
            {q.data.data.items.map((m) => (
              <MovieCard key={m._id} movie={m} cdn={q.data.data.APP_DOMAIN_CDN_IMAGE} />
            ))}
          </div>
          <Pagination
            basePath={`/quoc-gia/${slug}`}
            page={page}
            totalPages={getTotalPages(q.data.data.params?.pagination)}
            extraQuery={{ genre: filters.genre, year: filters.year, type: filters.type }}
          />
        </>
      )}
    </section>
  )
}
