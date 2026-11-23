import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import type { MovieListItem } from '../lib/ophim'
import { getHome, imgUrl } from '../lib/ophim'
import { MovieCard } from '../components/MovieCard'

export function HomePage() {
  const q = useQuery({
    queryKey: ['home'],
    queryFn: () => getHome(),
  })

  if (q.isLoading) return (
    <div className="home">
      <div className="hero skeleton" style={{ minHeight: 400 }} />
      <div className="home-section">
        <div className="skeleton" style={{ height: 24, width: 200 }} />
        <div className="scroll-row">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: 175, height: 310, borderRadius: 16, flexShrink: 0 }} />
          ))}
        </div>
      </div>
    </div>
  )

  if (q.isError || !q.data) {
    return <div className="panel panel--error">Không tải được dữ liệu trang chủ.</div>
  }

  const data = q.data.data
  const cdn = data.APP_DOMAIN_CDN_IMAGE
  const items = data.items as MovieListItem[]

  const hero = items[0]
  const rest = items.slice(1)

  const phimBo = rest.filter((m) => m.type === 'series').slice(0, 12)
  const phimLe = rest.filter((m) => m.type === 'single').slice(0, 12)
  const hanhDong = rest
    .filter((m) => (m.category || []).some((c) => c.name.toLowerCase().includes('hành động')))
    .slice(0, 12)
  const kinhDi = rest
    .filter((m) => (m.category || []).some((c) => c.name.toLowerCase().includes('kinh dị')))
    .slice(0, 12)

  const heroImg = imgUrl(cdn, hero.poster_url ?? hero.thumb_url)

  return (
    <div className="home">
      {hero ? (
        <section className="hero">
          {heroImg ? (
            <img
              className="hero__backdrop"
              src={heroImg}
              alt={hero.name}
              fetchPriority="high"
              decoding="async"
            />
          ) : null}
          <div className="hero__gradient" />
          <div className="hero__content">
            <h1 className="hero__title">{hero.name}</h1>
            {hero.origin_name ? <p className="hero__subtitle">{hero.origin_name}</p> : null}
            <div className="hero__meta">
              {hero.imdb?.vote_average && hero.imdb.vote_average > 0 ? (
                <span className="hero__badge-imdb" title={`IMDb: ${hero.imdb.vote_average.toFixed(1)}/10`}>
                  <strong>IMDb</strong> ★ {hero.imdb.vote_average.toFixed(1)}
                </span>
              ) : hero.tmdb?.vote_average && hero.tmdb.vote_average > 0 ? (
                <span className="hero__badge-tmdb" title={`TMDB: ${hero.tmdb.vote_average.toFixed(1)}/10`}>
                  <strong>TMDB</strong> ★ {hero.tmdb.vote_average.toFixed(1)}
                </span>
              ) : null}
              {hero.year ? <span>{hero.year}</span> : null}
              {hero.quality ? <span>{hero.quality}</span> : null}
              {hero.lang ? <span>{hero.lang}</span> : null}
              {hero.episode_current ? <span>{hero.episode_current}</span> : null}
            </div>
            <p className="hero__tagline">Xem phim miễn phí cực nhanh, chất lượng cao</p>
            <div className="hero__actions">
              <Link to={`/phim/${hero.slug}`} className="hero__btn hero__btn--primary">
                ▶ Xem ngay
              </Link>
              <Link to={`/phim/${hero.slug}?tab=thong-tin`} className="hero__btn hero__btn--secondary">
                Chi tiết
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <Section
        title="Phim bộ mới"
        subtitle="Những bộ phim nhiều tập đang hot"
        seeAllHref="/danh-sach/phim-bo"
      >
        {phimBo.map((m) => (
          <MovieCard key={m._id} movie={m} cdn={cdn} />
        ))}
      </Section>

      <Section
        title="Phim lẻ hay"
        subtitle="Phim chiếu rạp, phim lẻ hấp dẫn"
        seeAllHref="/danh-sach/phim-le"
      >
        {phimLe.map((m) => (
          <MovieCard key={m._id} movie={m} cdn={cdn} />
        ))}
      </Section>

      <Section
        title="Hành động bom tấn"
        subtitle="Phim hành động gay cấn"
        seeAllHref="/the-loai/hanh-dong"
      >
        {hanhDong.map((m) => (
          <MovieCard key={m._id} movie={m} cdn={cdn} />
        ))}
      </Section>

      <Section
        title="Kinh dị rùng rợn"
        subtitle="Những câu chuyện ám ảnh"
        seeAllHref="/the-loai/kinh-di"
      >
        {kinhDi.map((m) => (
          <MovieCard key={m._id} movie={m} cdn={cdn} />
        ))}
      </Section>
    </div>
  )
}

function Section({
  title,
  subtitle,
  seeAllHref,
  children,
}: {
  title: string
  subtitle?: string
  seeAllHref?: string
  children: React.ReactNode
}) {
  return (
    <section className="home-section">
      <div className="home-section__header">
        <div className="home-section__header-left">
          <h2 className="home-section__title">{title}</h2>
          {subtitle ? <p className="home-section__subtitle">{subtitle}</p> : null}
        </div>
        {seeAllHref && (
          <Link to={seeAllHref} className="home-section__see-all">
            Xem tất cả &rarr;
          </Link>
        )}
      </div>
      <div className="scroll-row">{children}</div>
    </section>
  )
}
