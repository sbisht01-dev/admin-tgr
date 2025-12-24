"use client";
import "@/styles/home.css";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { useEffect, useState } from "react";

export default function Home() {
  const [movieList, setMovieList] = useState([]);
  const [ledgerData, setLedgerData] = useState({}); // To store revenue data

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Movies
      const movieSnap = await get(ref(db, "/catalog/movies"));

      // 2. Fetch Ledger (All collections)
      const ledgerSnap = await get(ref(db, "/ledger/daily_collections"));

      if (movieSnap.exists()) {
        // Convert to array and keep IDs this time!
        const movies = Object.entries(movieSnap.val()).map(([id, data]) => ({
          id,
          ...data,
        }));
        setMovieList(movies);
      }

      if (ledgerSnap.exists()) {
        setLedgerData(ledgerSnap.val());
      }
    };
    fetchData();
  }, []);

  // 3. The "Sum" Helper Function
  const calculateTotal = (movieId) => {
    const collections = ledgerData[movieId];
    if (!collections) return 0;

    // Object.values gives us [20, 32.5]
    // .reduce adds them up: 0 + 20 + 32.5 = 52.5
    return Object.values(collections).reduce((sum, val) => sum + val, 0);
  };

  return (
    <main className="main-wrapper">
      <div className="container">
        <h1 className="header">Movie Ledger</h1>
        <div className="list-wrapper">
          {movieList.map((movie) => (
            <div className="horizontal-card" key={movie.id}>
              <div className="poster-box"><span>Poster</span></div>
              <div className="movie-details">
                <div className="top-row">
                  <h2 className="movie-title">{movie.title}</h2>
                  {/* <span className="id-badge">{movie.id}</span> */}
                </div>
                <div className="meta-info">
                  <div className="info-group">
                    <label>Released</label>
                    <p>{movie.released}</p>
                  </div>
                  <div className="info-group">
                    <label>Total Collection</label>
                    <p className="currency-text">
                      ${Math.round(calculateTotal(movie.id))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}