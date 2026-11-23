import { useQuery } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getMovie, getMovieImages, getMovieKeywords, getMoviePeoples, imgUrl, tmdbImageUrl } from '../lib/ophim'

type Tab = 'xem' | 'thong-tin' | 'hinh-anh' | 'dien-vien' | 'tu-khoa'

export function MovieDetailPage() {
  const { slug } = useParams()
  const [sp, setSp] = useSearchParams()
  const tab = (sp.get('tab') as Tab | null) ?? 'xem'

  const movieQ = useQuery({
    queryKey: ['movie', slug],
    queryFn: () => getMovie(slug ?? ''),
    enabled: Boolean(slug),
  })

  const imagesQ = useQuery({
    queryKey: ['movie-images', slug],
    queryFn: () => getMovieImages(slug ?? ''),
    enabled: Boolean(slug) && tab === 'hinh-anh',
  })

  const peoplesQ = useQuery({
    queryKey: ['movie-peoples', slug],
    queryFn: () => getMoviePeoples(slug ?? ''),
    enabled: Boolean(slug) && tab === 'dien-vien',
  })

  const keywordsQ = useQuery({
    queryKey: ['movie-keywords', slug],
    queryFn: () => getMovieKeywords(slug ?? ''),
    enabled: Boolean(slug) && tab === 'tu-khoa',
  })

  const [serverIndex, setServerIndex] = useState(0)
  const [episodeIndex, setEpisodeIndex] = useState(0)
  const [isDescExpanded, setIsDescExpanded] = useState(false)
  const [episodeSearch, setEpisodeSearch] = useState('')

  const activeEpRef = useRef<HTMLButtonElement | null>(null)
  const playerRef = useRef<HTMLDivElement | null>(null)

  // Scroll active episode into view whenever episode or server changes
  useEffect(() => {
    if (activeEpRef.current) {
      activeEpRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
    }
  }, [episodeIndex, serverIndex, tab])

  const handleWatchNow = () => {
    if (tab !== 'xem') {
      setSp({ tab: 'xem' })
    }
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  if (!slug) return null

  if (movieQ.isLoading) {
    return (
      <section className="detail">
        <div className="detail__top">
          <div className="detail__poster">
            <div className="skeleton" style={{ width: '100%', aspectRatio: '2/3', borderRadius: 20 }} />
          </div>
          <div className="detail__meta">
            <div className="skeleton" style={{ height: 32, width: '60%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 18, width: '40%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '70%' }} />
          </div>
        </div>
      </section>
    )
  }

  if (movieQ.isError || !movieQ.data) {
    return <div className="panel panel--error">Không tải được thông tin phim. Vui lòng thử lại sau.</div>
  }

  const data = movieQ.data.data
  const item = data.item
  const cdn = data.APP_DOMAIN_CDN_IMAGE
  const poster = imgUrl(cdn, item.poster_url ?? item.thumb_url)
  const servers = item.episodes ?? []

  const currentServer = servers[serverIndex] ?? servers[0]
  const episodes = currentServer?.server_data ?? []
  const currentEpisode = episodes[episodeIndex] ?? episodes[0]

  const rawContent = stripHtml(item.content || '')
  const hasLongContent = rawContent.length > 220

  // Filter episodes if search is provided
  const filteredEpisodes = episodes.filter((ep, idx) => {
    if (!episodeSearch.trim()) return true
    const term = episodeSearch.toLowerCase().trim()
    return ep.name.toLowerCase().includes(term) || String(idx + 1).includes(term)
  })

  return (
    <section className="detail">
      <div className="detail__top">
        <div className="detail__poster">
          {poster ? (
            <img
              src={poster}
              alt={item.name}
              loading="eager"
              decoding="async"
              width={260}
              height={390}
            />
          ) : (
            <div className="movie-card__poster--empty" style={{ width: '100%', aspectRatio: '2/3', borderRadius: 20 }} />
          )}
        </div>
        <div className="detail__meta">
          <h1 className="page-title detail__title">{item.name}</h1>
          {item.origin_name ? <p className="page-subtitle detail__subtitle">{item.origin_name}</p> : null}

          {((item.imdb && (item.imdb.vote_average || item.imdb.id)) || (item.tmdb && item.tmdb.vote_average)) ? (
            <div className="detail__ratings">
              {item.imdb && (item.imdb.vote_average || item.imdb.id) ? (
                <a
                  href={item.imdb.id ? `https://www.imdb.com/title/${item.imdb.id}` : undefined}
                  target={item.imdb.id ? '_blank' : undefined}
                  rel="noreferrer"
                  className="rating-badge rating-badge--imdb"
                  title={item.imdb.id ? `Xem trên IMDb (${item.imdb.id})` : 'IMDb'}
                >
                  <span className="rating-badge__logo">IMDb</span>
                  {item.imdb.vote_average && item.imdb.vote_average > 0 ? (
                    <>
                      <span className="rating-badge__star">★</span>
                      <span className="rating-badge__score">{item.imdb.vote_average.toFixed(1)}</span>
                      <span className="rating-badge__max">/10</span>
                      {item.imdb.vote_count ? (
                        <span className="rating-badge__count">
                          ({item.imdb.vote_count.toLocaleString('vi-VN')} đánh giá)
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="rating-badge__na">{item.imdb.id ? item.imdb.id : 'N/A'}</span>
                  )}
                  {item.imdb.id ? <span className="rating-badge__link-icon">↗</span> : null}
                </a>
              ) : null}

              {item.tmdb && item.tmdb.vote_average && item.tmdb.vote_average > 0 ? (
                <div className="rating-badge rating-badge--tmdb">
                  <span className="rating-badge__logo rating-badge__logo--tmdb">TMDB</span>
                  <span className="rating-badge__star">★</span>
                  <span className="rating-badge__score">{item.tmdb.vote_average.toFixed(1)}</span>
                  <span className="rating-badge__max">/10</span>
                  {item.tmdb.vote_count ? (
                    <span className="rating-badge__count">
                      ({item.tmdb.vote_count.toLocaleString('vi-VN')} votes)
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="detail__tags">
            {item.year ? <span>{item.year}</span> : null}
            {item.quality ? <span>{item.quality}</span> : null}
            {item.lang ? <span>{item.lang}</span> : null}
            {item.episode_current ? <span>{item.episode_current}</span> : null}
          </div>

          <p className="detail__info">
            {item.time ? <span>Thời lượng: {item.time}. </span> : null}
            {item.actor ? <span>Diễn viên: {item.actor}. </span> : null}
            {item.director ? <span>Đạo diễn: {item.director}.</span> : null}
          </p>

          {/* Quick synopsis on mobile & desktop with "Xem thêm / Thu gọn" */}
          {rawContent && (
            <div className="detail__synopsis">
              <p className={`detail__synopsis-text${isDescExpanded ? ' detail__synopsis-text--expanded' : ''}`}>
                {rawContent}
              </p>
              {hasLongContent && (
                <button
                  type="button"
                  className="detail__synopsis-toggle"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  aria-expanded={isDescExpanded}
                >
                  {isDescExpanded ? 'Thu gọn ▲' : 'Xem thêm ▼'}
                </button>
              )}
            </div>
          )}

          {/* Prominent "Xem ngay" button on mobile and desktop */}
          <div className="detail__cta-row">
            <button
              type="button"
              className="detail__watch-now-btn"
              onClick={handleWatchNow}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Xem ngay {currentEpisode ? `(${currentEpisode.name})` : ''}</span>
            </button>
          </div>

          <div className="detail__tabs" role="tablist">
            <TabButton active={tab === 'xem'} onClick={() => setSp({ tab: 'xem' })}>
              ▶ Xem phim
            </TabButton>
            <TabButton active={tab === 'thong-tin'} onClick={() => setSp({ tab: 'thong-tin' })}>
              Thông tin chi tiết
            </TabButton>
            <TabButton active={tab === 'hinh-anh'} onClick={() => setSp({ tab: 'hinh-anh' })}>
              Hình ảnh
            </TabButton>
            <TabButton active={tab === 'dien-vien'} onClick={() => setSp({ tab: 'dien-vien' })}>
              Diễn viên
            </TabButton>
            <TabButton active={tab === 'tu-khoa'} onClick={() => setSp({ tab: 'tu-khoa' })}>
              Từ khoá
            </TabButton>
          </div>
        </div>
      </div>

      {tab === 'xem' && (
        <div ref={playerRef} className="panel detail__watch-panel">
          {currentEpisode?.link_embed ? (
            <div className="theater-layout">
              {/* Main Player Column */}
              <div className="theater-main">
                <div className="player">
                  <iframe
                    src={currentEpisode.link_embed}
                    allowFullScreen
                    referrerPolicy="no-referrer"
                    title={`${item.name} - ${currentEpisode.filename ?? currentEpisode.name}`}
                  />
                </div>

                <div className="player-meta-bar">
                  <div className="player-meta-bar__info">
                    <span className="player-meta-bar__badge">Đang phát</span>
                    <h2 className="player-meta-bar__ep-title">
                      {currentEpisode.name}
                      {currentEpisode.filename && currentEpisode.filename !== currentEpisode.name ? (
                        <span className="player-meta-bar__filename"> — {currentEpisode.filename}</span>
                      ) : null}
                    </h2>
                  </div>
                  {episodes.length > 1 && (
                    <div className="player-meta-bar__nav">
                      <button
                        type="button"
                        disabled={episodeIndex <= 0}
                        onClick={() => setEpisodeIndex(episodeIndex - 1)}
                        className="player-nav-btn"
                        aria-label="Tập trước"
                      >
                        ‹ Tập trước
                      </button>
                      <span className="player-nav-indicator">
                        {episodeIndex + 1} / {episodes.length}
                      </span>
                      <button
                        type="button"
                        disabled={episodeIndex >= episodes.length - 1}
                        onClick={() => setEpisodeIndex(episodeIndex + 1)}
                        className="player-nav-btn"
                        aria-label="Tập tiếp theo"
                      >
                        Tập tiếp ›
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Episode Sidebar / List */}
              {servers.length > 0 && (
                <div className="theater-sidebar">
                  <div className="theater-sidebar__header">
                    <h3 className="theater-sidebar__title">
                      Danh sách tập ({episodes.length})
                    </h3>
                    {servers.length > 1 && (
                      <div className="episode-servers" role="tablist" aria-label="Chọn server">
                        {servers.map((s, idx) => (
                          <button
                            key={s.server_name + idx}
                            type="button"
                            onClick={() => {
                              setServerIndex(idx)
                              setEpisodeIndex(0)
                            }}
                            className={idx === serverIndex ? 'tab tab--active tab--server' : 'tab tab--server'}
                          >
                            {s.server_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {episodes.length > 12 && (
                    <div className="episode-filter-wrap">
                      <input
                        type="text"
                        placeholder="Tìm tập nhanh..."
                        value={episodeSearch}
                        onChange={(e) => setEpisodeSearch(e.target.value)}
                        className="episode-filter-input"
                        aria-label="Lọc số tập"
                      />
                      {episodeSearch && (
                        <button
                          type="button"
                          className="episode-filter-clear"
                          onClick={() => setEpisodeSearch('')}
                          aria-label="Xoá tìm kiếm tập"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}

                  <div className="episode-list" role="listbox" aria-label="Danh sách các tập phim">
                    {filteredEpisodes.length === 0 ? (
                      <div className="episode-list--empty">Không có tập phù hợp "{episodeSearch}"</div>
                    ) : (
                      filteredEpisodes.map((ep) => {
                        const originalIdx = episodes.findIndex((e) => e === ep)
                        const isCurrent = originalIdx === episodeIndex
                        return (
                          <button
                            key={ep.slug ?? ep.name ?? originalIdx}
                            ref={isCurrent ? activeEpRef : null}
                            type="button"
                            role="option"
                            aria-selected={isCurrent}
                            onClick={() => setEpisodeIndex(originalIdx)}
                            className={`episode-chip${isCurrent ? ' episode-chip--active' : ''}`}
                            title={`Xem ${ep.name}`}
                          >
                            {isCurrent && <span className="episode-chip__icon" aria-hidden>▶</span>}
                            <span>{ep.name}</span>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="player-empty-state">
              <p>Phim này chưa có link xem trực tiếp (hoặc API chưa cập nhật nguồn phát).</p>
            </div>
          )}
        </div>
      )}

      {tab === 'thong-tin' && (
        <div className="panel">
          <h2 style={{ fontSize: 18, margin: '0 0 12px', color: 'var(--text)' }}>Nội dung phim</h2>
          <p style={{ lineHeight: 1.7, fontSize: 15 }}>
            {rawContent || 'Chưa có mô tả chi tiết cho phim này.'}
          </p>

          <div className="detail__extra-info">
            {item.imdb?.id ? (
              <div className="detail__extra-item">
                <span className="detail__extra-label">IMDb:</span>
                <a
                  href={`https://www.imdb.com/title/${item.imdb.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="imdb-link"
                >
                  {item.imdb.id} ↗
                </a>
                {item.imdb.vote_average && item.imdb.vote_average > 0 ? (
                  <span className="detail__extra-rating">
                    — Điểm đánh giá: <strong>★ {item.imdb.vote_average.toFixed(1)}/10</strong>
                    {item.imdb.vote_count ? ` (${item.imdb.vote_count.toLocaleString('vi-VN')} lượt bình chọn)` : ''}
                  </span>
                ) : null}
              </div>
            ) : null}

            {item.tmdb?.id ? (
              <div className="detail__extra-item">
                <span className="detail__extra-label">TMDB:</span>
                <span className="tmdb-code">{item.tmdb.id}</span>
                {item.tmdb.vote_average && item.tmdb.vote_average > 0 ? (
                  <span className="detail__extra-rating">
                    — Điểm đánh giá: <strong>★ {item.tmdb.vote_average.toFixed(1)}/10</strong>
                    {item.tmdb.vote_count ? ` (${item.tmdb.vote_count.toLocaleString('vi-VN')} votes)` : ''}
                  </span>
                ) : null}
              </div>
            ) : null}

            {item.trailer_url ? (
              <div className="detail__extra-item">
                <span className="detail__extra-label">Trailer:</span>
                <a href={item.trailer_url} target="_blank" rel="noreferrer" style={{ color: '#4F46E5', fontWeight: 600 }}>
                  Xem trên YouTube ↗
                </a>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {tab === 'hinh-anh' && (
        <div className="panel">
          {imagesQ.isLoading ? (
            <p>Đang tải hình ảnh…</p>
          ) : imagesQ.isError || !imagesQ.data ? (
            <p>Không tải được hình ảnh.</p>
          ) : imagesQ.data.data.images.length === 0 ? (
            <div>
              <p style={{ marginBottom: 16, color: 'var(--text-muted, #9CA3AF)' }}>
                Chưa có hình ảnh bổ sung từ TMDB cho phim này. Dưới đây là hình ảnh chính của phim:
              </p>
              <div className="images-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {item.poster_url && (
                  <div className="fallback-image-wrapper">
                    <p style={{ fontSize: 14, marginBottom: 8, fontWeight: 500 }}>Ảnh Poster:</p>
                    <a href={imgUrl(cdn, item.poster_url)} target="_blank" rel="noreferrer">
                      <img 
                        src={imgUrl(cdn, item.poster_url)} 
                        alt="Poster" 
                        loading="lazy"
                        style={{ width: '100%', borderRadius: 12, objectFit: 'cover' }} 
                      />
                    </a>
                  </div>
                )}
                {item.thumb_url && (
                  <div className="fallback-image-wrapper">
                    <p style={{ fontSize: 14, marginBottom: 8, fontWeight: 500 }}>Ảnh Thumbnail/Banner:</p>
                    <a href={imgUrl(cdn, item.thumb_url)} target="_blank" rel="noreferrer">
                      <img 
                        src={imgUrl(cdn, item.thumb_url)} 
                        alt="Thumbnail" 
                        loading="lazy"
                        style={{ width: '100%', borderRadius: 12, objectFit: 'cover' }} 
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="images-grid">
              {imagesQ.data.data.images.slice(0, 24).map((img, idx) => {
                const url = tmdbImageUrl(imagesQ.data?.data.image_sizes, img.type, img.file_path)
                return (
                  <a key={idx} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt="" loading="lazy" />
                  </a>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'dien-vien' && (
        <div className="panel">
          {peoplesQ.isLoading ? (
            <p>Đang tải diễn viên…</p>
          ) : peoplesQ.isError || !peoplesQ.data ? (
            <p>Không tải được diễn viên.</p>
          ) : peoplesQ.data.data.peoples.length === 0 ? (
            <p>Chưa có thông tin diễn viên.</p>
          ) : (
            <ul className="list">
              {peoplesQ.data.data.peoples.map((p, idx) => (
                <li key={p.id ?? idx}>
                  <strong>{p.name}</strong>
                  {p.known_for_department ? ` • ${p.known_for_department}` : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'tu-khoa' && (
        <div className="panel">
          {keywordsQ.isLoading ? (
            <p>Đang tải từ khoá…</p>
          ) : keywordsQ.isError || !keywordsQ.data ? (
            <p>Không tải được từ khoá.</p>
          ) : keywordsQ.data.data.keywords.length === 0 ? (
            <p>Chưa có từ khoá cho phim này.</p>
          ) : (
            <div className="chips">
              {keywordsQ.data.data.keywords.map((k, idx) => (
                <span key={k.id ?? idx} className="chip">
                  {k.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      className={active ? 'tab tab--active' : 'tab'}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').trim()
}
