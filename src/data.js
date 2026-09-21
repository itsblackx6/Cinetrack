// src/data.js

const mockTMDBResponse = {
  trending: [
    {
      id: 1,
      title: "Oppenheimer",
      overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb.",
      poster_path: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      backdrop_path: "https://image.tmdb.org/t/p/original/fm6KqXGrSMC586Y6S6An4fBFr5j.jpg",
      vote_average: 8.9,
      genre_ids: [18, 36],
    },
    {
      id: 2,
      title: "Interstellar",
      overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      backdrop_path: "https://image.tmdb.org/t/p/original/rAiTmwDx44Sst47uU4U3D7yAd7l.jpg",
      vote_average: 8.6,
      genre_ids: [12, 18, 878],
    },
    {
      id: 3,
      title: "Dune: Part Two",
      overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
      poster_path: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      backdrop_path: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg",
      vote_average: 8.7,
      genre_ids: [12, 878],
    },
    {
      id: 4,
      title: "Black Clover: Sword of the Wizard King",
      overview: "As Asta continues gaining merit on his way to becoming the Wizard King, the previous Wizard King Conrad resurfaces.",
      poster_path: "https://image.tmdb.org/t/p/w500/9YEGawvjaumu9Wk35AGUVhaYfl5.jpg",
      backdrop_path: "https://image.tmdb.org/t/p/original/b9UCf9bm97CYYFtN2mpq3AzAQiq.jpg",
      vote_average: 8.5,
      genre_ids: [28, 12, 16],
    },
    {
      id: 5,
      title: "Spider-Man: Across the Spider-Verse",
      overview: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.",
      poster_path: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
      backdrop_path: "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
      vote_average: 8.8,
      genre_ids: [28, 12, 16],
    },
    {
      id: 6,
      title: "The Dark Knight",
      overview: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
      poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      backdrop_path: "https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
      vote_average: 9.0,
      genre_ids: [28, 18, 53],
    },
  ],
};

const genres = {
  18: "Drama",
  36: "History",
  12: "Adventure",
  878: "Sci-Fi",
  28: "Action",
  53: "Thriller",
  16: "Anime",
};

export { mockTMDBResponse, genres };