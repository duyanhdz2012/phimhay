import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { getGenres, getCountries, getYears } from '../lib/ophim'
import type { SearchFilters } from '../lib/ophim'

const TYPE_OPTIONS: { value: '' | SearchFilters['type']; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'single', label: 'Phim lẻ' },
  { value: 'series', label: 'Phim bộ' },
  { value: 'hoathinh', label: 'Phim hoạt hình' },
]

type Props = {
  /** Đã chọn sẵn từ trang - ẩn các ô này */
  hideGenre?: boolean
  hideCountry?: boolean
  hideYear?: boolean
  hideType?: boolean
}

export function ListFilterBar({
  hideGenre,
  hideCountry,
  hideYear,
  hideType,
}: Props) {
  const [sp, setSp] = useSearchParams()

  const genresQ = useQuery({ queryKey: ['genres'], queryFn: () => getGenres() })
  const countriesQ = useQuery({ queryKey: ['countries'], queryFn: () => getCountries() })
  const yearsQ = useQuery({ queryKey: ['years'], queryFn: () => getYears() })

  const genres = genresQ.data?.data.items ?? []
  const countries = countriesQ.data?.data.items ?? []
  const rawYears = yearsQ.data?.data.items ?? []
  const years = rawYears
    .map((x) => (typeof x === 'number' ? x : (x as { year: number }).year))
    .filter((x): x is number => typeof x === 'number')
    .sort((a, b) => b - a)

  const handleChange = (key: string, value: string) => {
    const next = new URLSearchParams(sp)
    next.delete('page')
    if (value) next.set(key, value)
    else next.delete(key)
    setSp(next)
  }

  return (
    <form
      className="filter-form filter-form--compact"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="filter-form__row">
        {!hideGenre && (
          <select
            value={sp.get('genre') ?? ''}
            onChange={(e) => handleChange('genre', e.target.value)}
            className="filter-form__select"
          >
            <option value="">Thể loại</option>
            {genres.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>
        )}
        {!hideCountry && (
          <select
            value={sp.get('country') ?? ''}
            onChange={(e) => handleChange('country', e.target.value)}
            className="filter-form__select"
          >
            <option value="">Quốc gia</option>
            {countries.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        {!hideYear && (
          <select
            value={sp.get('year') ?? ''}
            onChange={(e) => handleChange('year', e.target.value)}
            className="filter-form__select"
          >
            <option value="">Năm</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
        {!hideType && (
          <select
            value={sp.get('type') ?? ''}
            onChange={(e) => handleChange('type', e.target.value)}
            className="filter-form__select"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </form>
  )
}
