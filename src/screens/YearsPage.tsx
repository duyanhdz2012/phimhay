import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getYears } from '../lib/ophim'

export function YearsPage() {
  const q = useQuery({
    queryKey: ['years'],
    queryFn: () => getYears(),
  })

  if (q.isLoading) return <div className="panel">Đang tải năm phát hành…</div>
  if (q.isError || !q.data) return <div className="panel panel--error">Không tải được năm phát hành.</div>

  const raw = q.data.data.items
  const years = raw
    .map((x) => (typeof x === 'number' ? x : (x as { year: number }).year))
    .filter((x): x is number => typeof x === 'number')
    .sort((a, b) => b - a)

  return (
    <section>
      <h1 className="page-title">Năm phát hành</h1>
      <div className="chips">
        {years.map((y) => (
          <Link key={y} to={`/nam-phat-hanh/${y}`} className="chip">
            {y}
          </Link>
        ))}
      </div>
    </section>
  )
}

