import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "./Spinner";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/movie/${id}?language=en-US`, API_OPTIONS);
        if (!res.ok) {
          console.log("Response status:", res.status);
          throw new Error("Failed to fetch details");
        }
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error("Error fetching movie details:", err);
        setErrorMessage("Unable to load movie details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (isLoading) return <Spinner />;
  if (errorMessage) return <p className="text-red-500">{errorMessage}</p>;

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-300 hover:text-white transition mb-6"
          >
            ← Back
          </button>
        </header>

        {movie && (
          <section className="details-page">
            <div className="flex flex-col md:flex-row gap-8">
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "/No-Poster.png"
                }
                alt={movie.title}
                className="rounded-2xl shadow-lg w-full md:w-1/3 object-cover"
              />

              <div className="flex-1 space-y-4">
                <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
                <p className="italic text-gray-400">{movie.tagline}</p>

                <div className="flex flex-wrap items-center gap-3 text-gray-400">
                  <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                  <span>•</span>
                  <span>{movie.release_date?.split("-")[0]}</span>
                  <span>•</span>
                  <span>{movie.runtime} min</span>
                </div>

                <p className="text-gray-200 leading-relaxed">{movie.overview}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {movie.genres?.map((g) => (
                    <span
                      key={g.id}
                      className="bg-dark-100 text-gray-200 px-3 py-1 rounded-full text-sm"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default Details;
