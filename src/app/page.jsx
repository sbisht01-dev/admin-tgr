"use client"; // Required in Next.js App Router for hooks like useEffect

import { db } from "@/lib/firebase"; // Use the 'db' you exported in your lib file
import { ref, onValue, get } from "firebase/database";
import { useEffect, useState } from "react";

export default function Home() {
  const dbRef = ref(db);
  const [movieList, setMovieList] = useState([]);
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        get(ref(db, "/catalog/movies")).then((snapshot) => {
          if (snapshot.exists()) {
            setMovieList(Object.values(snapshot.val()));
          } else {
            console.log("No data available");
          }
        })
      } catch (error) {
        console.log(error);
      }
    }
    fetchMovies();
  }, [])
  console.log(movieList);

  return (
    <main>
      <div className="container">
        <div className="header">
          {
            movieList.map((movie) => (
              <div className="data-container" key={movie.title}>
                <div className="movie">
                  <div>
                    <p className="title" >{movie.title} </p>
                    <div className="release-date" >{movie.released}</div>
                  </div>
                </div>
              </div>
            )
            )
          }
        </div>
      </div>
    </main>
  );
}