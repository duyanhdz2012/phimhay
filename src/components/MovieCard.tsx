import { Link } from 'react-router-dom'
import type { MovieListItem } from '../lib/ophim'
import { imgUrl } from '../lib/ophim'

type Props = {
  movie: MovieListItem
  cdn?: string
}

export function MovieCard({ movie, cdn }: Props) {
  const thumb = imgUrl(cdn, movie.thumb_url ?? movie.poster_url)

  return (
    <Link
      to={`/phim/${movie.slug}`}
      className="movie-card"
      title={`${movie.name}${movie.origin_name ? ` (${movie.origin_name})` : ''}`}
      aria-label={`Xem phim ${movie.name}`}
    >
      <div className="movie-card__poster">
        {thumb ? (
          <img
            src={thumb}
            alt={movie.name}
            loading="lazy"
            decoding="async"
            width={300}
            height={450}
          />
        ) : (
          <div className="movie-card__poster--empty" aria-hidden />
        )}
        <div className="movie-card__play-overlay" aria-hidden>
          <div className="movie-card__play-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="movie-card__labels">
          {movie.imdb?.vote_average && movie.imdb.vote_average > 0 ? (
            <span className="movie-card__badge-imdb" title={`Điểm IMDb: ${movie.imdb.vote_average.toFixed(1)}/10`}>
              ★ {movie.imdb.vote_average.toFixed(1)}
            </span>
          ) : movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 ? (
            <span className="movie-card__badge-tmdb" title={`Điểm TMDB: ${movie.tmdb.vote_average.toFixed(1)}/10`}>
              ★ {movie.tmdb.vote_average.toFixed(1)}
            </span>
          ) : null}
          {movie.quality ? <span>{movie.quality}</span> : null}
          {movie.lang ? <span>{movie.lang}</span> : null}
          {movie.episode_current ? <span>{movie.episode_current}</span> : null}
        </div>
      </div>
      <div className="movie-card__body">
        <div className="movie-card__title" title={movie.name}>
          {movie.name}
        </div>
        <div className="movie-card__meta">
          {movie.imdb?.vote_average && movie.imdb.vote_average > 0 ? (
            <span className="movie-card__meta-imdb">IMDb {movie.imdb.vote_average.toFixed(1)}</span>
          ) : movie.tmdb?.vote_average && movie.tmdb.vote_average > 0 ? (
            <span className="movie-card__meta-tmdb">TMDB {movie.tmdb.vote_average.toFixed(1)}</span>
          ) : null}
          {movie.year ? <span>{movie.year}</span> : null}
          {movie.time ? <span>{movie.time}</span> : null}
        </div>
      </div>
    </Link>
  )
}
