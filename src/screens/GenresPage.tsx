import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getGenres } from '../lib/ophim'

export function GenresPage() {
  const q = useQuery({
    queryKey: ['genres'],
    queryFn: () => getGenres(),
  })

  if (q.isLoading) return <div className="panel">Đang tải thể loại…</div>
  if (q.isError || !q.data) return <div className="panel panel--error">Không tải được thể loại.</div>

  return (
    <section>
      <h1 className="page-title">Thể loại</h1>
      <div className="chips">
        {q.data.data.items.map((g) => (
          <Link key={g.slug} to={`/the-loai/${g.slug}`} className="chip">
            {g.name}
          </Link>
        ))}
      </div>
    </section>
  )
}

