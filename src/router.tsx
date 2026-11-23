import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './screens/Layout'
import { HomePage } from './screens/HomePage'
import { ListPage } from './screens/ListPage'
import { SearchPage } from './screens/SearchPage'
import { GenresPage } from './screens/GenresPage'
import { GenreMoviesPage } from './screens/GenreMoviesPage'
import { CountriesPage } from './screens/CountriesPage'
import { CountryMoviesPage } from './screens/CountryMoviesPage'
import { YearsPage } from './screens/YearsPage'
import { YearMoviesPage } from './screens/YearMoviesPage'
import { MovieDetailPage } from './screens/MovieDetailPage'
import { FilterSearchPage } from './screens/FilterSearchPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/danh-sach/:slug', element: <ListPage /> },
      { path: '/tim-kiem', element: <SearchPage /> },
      { path: '/bo-loc', element: <FilterSearchPage /> },
      { path: '/the-loai', element: <GenresPage /> },
      { path: '/the-loai/:slug', element: <GenreMoviesPage /> },
      { path: '/quoc-gia', element: <CountriesPage /> },
      { path: '/quoc-gia/:slug', element: <CountryMoviesPage /> },
      { path: '/nam-phat-hanh', element: <YearsPage /> },
      { path: '/nam-phat-hanh/:year', element: <YearMoviesPage /> },
      { path: '/phim/:slug', element: <MovieDetailPage /> },
    ],
  },
])

