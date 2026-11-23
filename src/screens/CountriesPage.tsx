import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getCountries } from '../lib/ophim'

export function CountriesPage() {
  const q = useQuery({
    queryKey: ['countries'],
    queryFn: () => getCountries(),
  })

  if (q.isLoading) return <div className="panel">Đang tải quốc gia…</div>
  if (q.isError || !q.data) return <div className="panel panel--error">Không tải được quốc gia.</div>

  return (
    <section>
      <h1 className="page-title">Quốc gia</h1>
      <div className="chips">
        {q.data.data.items.map((c) => (
          <Link key={c.slug} to={`/quoc-gia/${c.slug}`} className="chip">
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  )
}

