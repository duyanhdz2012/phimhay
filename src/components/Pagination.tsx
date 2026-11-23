import { Link } from 'react-router-dom'

type Props = {
  basePath: string
  page: number
  totalPages?: number
  extraQuery?: Record<string, string | number | undefined>
}

export function Pagination({ basePath, page, totalPages, extraQuery }: Props) {
  if (!totalPages || totalPages <= 1) return null
  const current = Math.max(1, Math.min(page, totalPages))

  const pages: Array<number | '...'> = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - current) <= 2) {
      pages.push(p)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="pagination">
      <PageLink basePath={basePath} target={1} current={current} totalPages={totalPages} extraQuery={extraQuery}>
        «
      </PageLink>
      <PageLink basePath={basePath} target={current - 1} current={current} totalPages={totalPages} extraQuery={extraQuery}>
        ‹
      </PageLink>
      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`dots-${idx}`} className="pagination__dots">
            …
          </span>
        ) : (
          <PageLink
            key={p}
            basePath={basePath}
            target={p}
            current={current}
            totalPages={totalPages}
            extraQuery={extraQuery}
          >
            {p}
          </PageLink>
        ),
      )}
      <PageLink basePath={basePath} target={current + 1} current={current} totalPages={totalPages} extraQuery={extraQuery}>
        ›
      </PageLink>
      <PageLink basePath={basePath} target={totalPages} current={current} totalPages={totalPages} extraQuery={extraQuery}>
        »
      </PageLink>
    </div>
  )
}

type PageLinkProps = {
  basePath: string
  target: number
  current: number
  totalPages?: number
  extraQuery?: Record<string, string | number | undefined>
  children: React.ReactNode
}

function PageLink({ basePath, target, current, totalPages, extraQuery, children }: PageLinkProps) {
  const disabled =
    target === current || target < 1 || (totalPages != null && target > totalPages)
  if (disabled) {
    return (
      <span className="pagination__btn pagination__btn--disabled">
        {children}
      </span>
    )
  }

  const url = new URL(basePath, window.location.origin)
  const params = new URLSearchParams(url.search)
  params.set('page', String(target))
  if (extraQuery) {
    for (const [k, v] of Object.entries(extraQuery)) {
      if (v != null && v !== '') params.set(k, String(v))
    }
  }
  const to = url.pathname + '?' + params.toString()

  return (
    <Link to={to} className="pagination__btn">
      {children}
    </Link>
  )
}
