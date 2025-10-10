
import React, { useState, useEffect } from "react";
import Search from "./components/Search";
import MovieCard from "./components/MovieCard";
import Spinner from "./components/Spinner";
import { updateSearchCount, getTrendingMovies } from "./appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // track total pages from TMDB


  

  // Debounce search term input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);       // reset page for new search
     
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch movies
  const fetchMovies = async (query = "") => {
  setIsLoading(true);
  setErrorMessage("");

  try {
    const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

    const response = await fetch(endpoint, API_OPTIONS);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    // Update totalPages only from API response
    if (data.total_pages) setTotalPages(data.total_pages);

    if (page === 1) {
      setMovieList(data.results || []);
    } else {
      setMovieList((prev) => [...prev, ...(data.results || [])]);
    }

    if (query && data.results.length > 0 && page === 1) {
      await updateSearchCount(query, data.results[0]);
    }
  } catch (error) {
    console.error(`Error fetching movies: ${error}`);
    setErrorMessage("An error occurred while fetching data.");
  } finally {
    setIsLoading(false);
  }
};


  // Fetch trending movies (Appwrite)
  useEffect(() => {
    const loadTrendingMovies = async () => {
      try {
        const movies = await getTrendingMovies();
        setTrendingMovies(movies || []);
      } catch (error) {
        console.error("Error loading trending movies:", error);
      }
    };
    loadTrendingMovies();
  }, []);

  // Fetch movies whenever search term or page changes
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm, page]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (
  scrollTop + windowHeight >= fullHeight * 0.8 &&
  !isLoading &&
  page < totalPages
) {
  setPage((prev) => prev + 1);
}

    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, page, totalPages]);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="/hero-img.png" alt="Hero banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> you'll enjoy without hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* Trending Movies */}
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* All Movies */}
        <section className="all-movies">
          <h2>All Movies</h2>

          {movieList.length === 0 && isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <>
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>

              {/* Loading spinner for next pages */}
              {isLoading && page > 1 && (
                <div className="flex justify-center mt-4">
                  <Spinner />
                </div>
              )}

              {/* End of list message */}
              {!isLoading && page >= totalPages && movieList.length > 0 && (
                <p className="text-center text-gray-400 mt-6">
                  You have reached the end of the list.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
