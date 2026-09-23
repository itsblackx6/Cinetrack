import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Plus, Check, Star, Search, Film, X, Bookmark, 
  RefreshCw, Eye, AlertCircle, Play, 
  CheckCircle2, Trash2, ExternalLink, Download, 
  ArrowUpDown, Tv, Flame, Share2, Award, Clapperboard, Sparkles
} from 'lucide-react';
import './App.css';

const TMDB_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TMDB_API_KEY) 
  ? import.meta.env.VITE_TMDB_API_KEY 
  : '588ffc2c74b931292b25441fe86747cc';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const SVG_POSTER_PLACEHOLDER = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22500%22%20height%3D%22750%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20500%20750%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%230f172a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%2338bdf8%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ECineTrack%3C%2Ftext%3E%3C%2Fsvg%3E";

const GENRE_MAP = {
  'Trending': 'trending',
  'Sci-Fi': 878,
  'Action': 28,
  'Adventure': 12,
  'Drama': 18,
  'Animation': 16,
  'Horror': 27,
  'Comedy': 35
};

const GENRE_TAGS = ['Trending', 'Sci-Fi', 'Action', 'Adventure', 'Drama', 'Animation', 'Horror', 'Comedy'];

const INITIAL_POPULAR = [
  {
    id: 157336,
    Title: "Interstellar",
    Year: "2014",
    imdbRating: "8.7",
    Poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    Plot: "The adventures of a group of explorers who make use of a wormhole to surpass human space travel limitations.",
    Genre: "Adventure, Drama, Sci-Fi",
    Actors: "Matthew McConaughey, Anne Hathaway",
    Director: "Christopher Nolan",
    Runtime: "169 min"
  },
  {
    id: 872585,
    Title: "Oppenheimer",
    Year: "2023",
    imdbRating: "8.9",
    Poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    Plot: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    Genre: "Drama, History",
    Actors: "Cillian Murphy, Emily Blunt",
    Director: "Christopher Nolan",
    Runtime: "181 min"
  },
  {
    id: 155,
    Title: "The Dark Knight",
    Year: "2008",
    imdbRating: "9.0",
    Poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    Plot: "Batman raises the stakes in his war on crime and sets out to dismantle the remaining criminal organizations.",
    Genre: "Action, Crime, Drama",
    Actors: "Christian Bale, Heath Ledger",
    Director: "Christopher Nolan",
    Runtime: "152 min"
  },
  {
    id: 693134,
    Title: "Dune: Part Two",
    Year: "2024",
    imdbRating: "8.6",
    Poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    Plot: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    Genre: "Sci-Fi, Adventure",
    Actors: "Timothée Chalamet, Zendaya",
    Director: "Denis Villeneuve",
    Runtime: "166 min"
  },
  {
    id: 27205,
    Title: "Inception",
    Year: "2010",
    imdbRating: "8.8",
    Poster: "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
    Plot: "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea into a CEO's mind.",
    Genre: "Action, Sci-Fi, Adventure",
    Actors: "Leonardo DiCaprio, Joseph Gordon-Levitt",
    Director: "Christopher Nolan",
    Runtime: "148 min"
  },
  {
    id: 299536,
    Title: "Avengers: Infinity War",
    Year: "2018",
    imdbRating: "8.4",
    Poster: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    Plot: "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos.",
    Genre: "Action, Adventure, Sci-Fi",
    Actors: "Robert Downey Jr., Chris Hemsworth",
    Director: "Anthony Russo, Joe Russo",
    Runtime: "149 min"
  },
  {
    id: 569094,
    Title: "Spider-Man: Across the Spider-Verse",
    Year: "2023",
    imdbRating: "8.7",
    Poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    Plot: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.",
    Genre: "Animation, Action, Adventure",
    Actors: "Shameik Moore, Hailee Steinfeld",
    Director: "Joaquim Dos Santos",
    Runtime: "140 min"
  },
  {
    id: 424,
    Title: "Schindler's List",
    Year: "1993",
    imdbRating: "9.0",
    Poster: "https://upload.wikimedia.org/wikipedia/en/3/38/Schindler%27s_List_movie.jpg",
    Plot: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce.",
    Genre: "Drama, History",
    Actors: "Liam Neeson, Ben Kingsley",
    Director: "Steven Spielberg",
    Runtime: "195 min"
  },
  {
    id: 766,
    Title: "Avatar",
    Year: "2009",
    imdbRating: "7.9",
    Poster: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
    Plot: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following orders and protecting an alien civilization.",
    Genre: "Action, Adventure, Fantasy",
    Actors: "Sam Worthington, Zoe Saldana",
    Director: "James Cameron",
    Runtime: "162 min"
  },
  {
    id: 98,
    Title: "Gladiator",
    Year: "2000",
    imdbRating: "8.5",
    Poster: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
    Plot: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
    Genre: "Action, Drama, Adventure",
    Actors: "Russell Crowe, Joaquin Phoenix",
    Director: "Ridley Scott",
    Runtime: "155 min"
  }
];

const STATIC_TRAILERS = {
  157336: 'zSWdZVtXT7E',
  872585: 'uYPbbksJxIg',
  155: 'EXeTwQWrcwY',
  693134: 'Way9Dexny3w',
  27205: 'YoHD9XEInc0',
  299536: '6ZfuNTqbHE8',
  569094: 'cqGjhVJWtEg',
  424: 'gG22XNhtnoY',
  766: '5PSNL1qE6VY',
  98: 'P5ieIbInFpg'
};

export default function App() {
  const [movies, setMovies] = useState(INITIAL_POPULAR);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Trending');
  const [sortBy, setSortBy] = useState('default');
  const [filterTopRatedOnly, setFilterTopRatedOnly] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeTrailer, setActiveTrailer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [watchlistFilter, setWatchlistFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  const cacheRef = useRef({});

  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('cinetrack_pro_v2_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const cleanList = watchlist.slice(0, 100).map(m => ({
        id: m.id,
        Title: m.Title,
        Year: m.Year,
        imdbRating: m.imdbRating,
        Poster: m.Poster,
        Plot: m.Plot ? m.Plot.slice(0, 220) : '',
        Genre: m.Genre || 'Cinema',
        userStatus: m.userStatus || 'Plan to Watch',
        personalRating: m.personalRating || 0
      }));
      localStorage.setItem('cinetrack_pro_v2_watchlist', JSON.stringify(cleanList));
    } catch (err) {
      console.warn("Storage write error:", err);
    }
  }, [watchlist]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const pushedHistoryRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      pushedHistoryRef.current = false;
      if (activeTrailer) {
        setActiveTrailer(null);
      } else if (selectedMovie) {
        setSelectedMovie(null);
      } else if (activeTab === 'watchlist') {
        setActiveTab('explore');
      }
    };

    if (activeTrailer || selectedMovie || activeTab === 'watchlist') {
      window.history.pushState({ modalOrTab: true }, '');
      pushedHistoryRef.current = true;
    }

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTrailer, selectedMovie, activeTab]);

  const closeModalsSafely = () => {
    if (pushedHistoryRef.current) {
      window.history.back();
    } else {
      setActiveTrailer(null);
      setSelectedMovie(null);
    }
  };

  useEffect(() => {
    if (selectedMovie || activeTrailer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModalsSafely();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMovie, activeTrailer]);

  const formatTmdbMovie = useCallback((item) => ({
    id: item.id,
    Title: item.title || item.original_title || 'Untitled Cinema',
    Year: item.release_date ? item.release_date.split('-')[0] : '2026',
    imdbRating: item.vote_average ? item.vote_average.toFixed(1) : '7.5',
    Poster: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : SVG_POSTER_PLACEHOLDER,
    Plot: item.overview || 'No synopsis provided.',
    Genre: 'Cinema',
    Actors: 'Featured Cast',
    Director: 'Director',
    Runtime: '120 min'
  }), []);

  const fetchCategoryMovies = useCallback(async (genre) => {
    if (cacheRef.current[genre]) {
      setMovies(cacheRef.current[genre]);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const endpoint = genre === 'Trending'
        ? `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
        : `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${GENRE_MAP[genre]}&sort_by=popularity.desc`;

      const res = await fetch(endpoint);
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        const formatted = data.results.slice(0, 24).map(formatTmdbMovie);
        cacheRef.current[genre] = formatted;
        setMovies(formatted);
      } else {
        setMovies(INITIAL_POPULAR);
      }
    } catch {
      setMovies(INITIAL_POPULAR);
    } finally {
      setIsLoading(false);
    }
  }, [formatTmdbMovie]);

  useEffect(() => {
    fetchCategoryMovies('Trending');
  }, [fetchCategoryMovies]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = (searchQuery || '').trim();
    if (!query) {
      handleGenreChange('Trending');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
      );
      const data = await res.json();

      if (data && data.results && data.results.length > 0) {
        setMovies(data.results.map(formatTmdbMovie));
      } else {
        setMovies(INITIAL_POPULAR);
        setErrorMessage(`No titles found for "${query}". Showing popular cinema.`);
      }
    } catch {
      setMovies(INITIAL_POPULAR);
      setErrorMessage("Network issue detected. Running in safety mode.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setSearchQuery('');
    setFilterTopRatedOnly(false);
    fetchCategoryMovies(genre);
  };

  const clearSearch = () => {
    setSearchQuery('');
    handleGenreChange('Trending');
  };

  const openMovieDetails = async (movie) => {
    setSelectedMovie(movie);
    try {
      const res = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
      const details = await res.json();
      if (details) {
        const genres = details.genres ? details.genres.map(g => g.name).join(', ') : movie.Genre;
        const directorObj = details.credits?.crew?.find(c => c.job === 'Director');
        const castStr = details.credits?.cast ? details.credits.cast.slice(0, 4).map(c => c.name).join(', ') : movie.Actors;
        const runtimeStr = details.runtime ? `${details.runtime} min` : movie.Runtime;

        setSelectedMovie(prev => ({
          ...prev,
          Genre: genres,
          Director: directorObj ? directorObj.name : 'Not Specified',
          Actors: castStr,
          Runtime: runtimeStr,
          Plot: details.overview || prev.Plot
        }));
      }
    } catch {
      // Safe fallback
    }
  };

  const handlePlayTrailer = async (movie) => {
    if (STATIC_TRAILERS[movie.id]) {
      setActiveTrailer({ videoId: STATIC_TRAILERS[movie.id], title: movie.Title });
      return;
    }

    try {
      const res = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`);
      const data = await res.json();
      const trailer = data?.results?.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || data?.results?.[0];

      if (trailer && trailer.key) {
        setActiveTrailer({ videoId: trailer.key, title: movie.Title });
      } else {
        setActiveTrailer({ videoId: '5PSNL1qE6VY', title: movie.Title });
      }
    } catch {
      setActiveTrailer({ videoId: '5PSNL1qE6VY', title: movie.Title });
    }
  };

  const handleShareMovie = async (movie, e) => {
    if (e) e.stopPropagation();
    const shareText = `Check out "${movie.Title}" (${movie.Year}) on CineTrack • Rating: ${movie.imdbRating} ⭐`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `CineTrack: ${movie.Title}`,
          text: shareText,
          url: shareUrl
        });
      } catch {
        // User dismissed
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      showToast("Link & details copied to clipboard!");
    }
  };

  const toggleWatchlist = (movie) => {
    if (!movie?.id) return;
    const exists = watchlist.some((m) => m.id === movie.id);
    if (exists) {
      setWatchlist(watchlist.filter((m) => m.id !== movie.id));
      showToast(`Removed "${movie.Title}"`);
    } else {
      setWatchlist([...watchlist, { ...movie, userStatus: 'Plan to Watch', personalRating: 0 }]);
      showToast(`Added to Watchlist!`);
    }
  };

  const updateStatus = (id, newStatus) => {
    setWatchlist(watchlist.map((m) => (m.id === id ? { ...m, userStatus: newStatus } : m)));
    showToast(`Status: ${newStatus}`);
  };

  const setUserRating = (id, rating) => {
    setWatchlist(watchlist.map((m) => (m.id === id ? { ...m, personalRating: rating } : m)));
    showToast(`Rated ${rating} Star${rating > 1 ? 's' : ''}!`);
  };

  const isMovieInWatchlist = (id) => watchlist.some((m) => m.id === id);

  const exportWatchlist = () => {
    if (watchlist.length === 0) {
      showToast("Watchlist is empty!");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(watchlist, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cinetrack_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Watchlist backup downloaded!");
  };

  const stats = useMemo(() => {
    const total = watchlist.length;
    const completed = watchlist.filter((m) => m.userStatus === 'Completed').length;
    const ratings = watchlist.map((m) => parseFloat(m.imdbRating)).filter((r) => !isNaN(r));
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';
    return { total, completed, avgRating };
  }, [watchlist]);

  const displayedMovies = useMemo(() => {
    let list = activeTab === 'explore' 
      ? movies 
      : watchlist.filter((m) => (watchlistFilter === 'All' ? true : m.userStatus === watchlistFilter));

    if (filterTopRatedOnly) {
      list = list.filter((m) => (parseFloat(m.imdbRating) || 0) >= 8.0);
    }

    if (sortBy === 'rating') {
      list = [...list].sort((a, b) => (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0));
    } else if (sortBy === 'year') {
      list = [...list].sort((a, b) => (parseInt(b.Year) || 0) - (parseInt(a.Year) || 0));
    } else if (sortBy === 'title') {
      list = [...list].sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
    }

    return list;
  }, [activeTab, movies, watchlist, watchlistFilter, filterTopRatedOnly, sortBy]);

  return (
    <div style={{ minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', background: '#070b13', color: '#f8fafc' }}>
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid #38bdf8',
          boxShadow: '0 8px 24px rgba(56, 189, 248, 0.3)',
          color: '#f8fafc',
          padding: '8px 18px',
          borderRadius: '24px',
          zIndex: 1200,
          fontSize: '0.8rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap'
        }}>
          <CheckCircle2 size={16} color="#38bdf8" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modern Top Brand Navbar */}
      <header className="navbar">
        <div 
          className="nav-brand" 
          onClick={() => { setActiveTab('explore'); clearSearch(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <Clapperboard size={22} color="#38bdf8" />
          <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CineTrack
          </span>
        </div>

        <div className="nav-actions">
          <button
            onClick={() => {
              setActiveTab('explore');
              clearSearch();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'explore' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem',
              padding: '6px 8px'
            }}
          >
            Explore
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '20px',
              color: activeTab === 'watchlist' ? '#38bdf8' : '#cbd5e1',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px'
            }}
          >
            <Bookmark size={13} />
            Watchlist ({watchlist.length})
          </button>
        </div>
      </header>

      <main className="container" style={{ flex: 1 }}>
        
        {/* Glowing Neon Cyberpunk Hero Header */}
        {activeTab === 'explore' && !searchQuery && (
          <section style={{
            textAlign: 'center',
            padding: '36px 12px 24px 12px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '280px',
              height: '110px',
              background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.3) 0%, rgba(129, 140, 248, 0.08) 70%, transparent 100%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
              zIndex: 0
            }} />

            <h1 style={{
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '-1.5px',
              margin: '0 0 8px 0',
              color: '#ffffff',
              textShadow: '0 0 25px rgba(56, 189, 248, 0.65), 0 0 55px rgba(56, 189, 248, 0.3)',
              position: 'relative',
              zIndex: 1
            }}>
              Cine<span style={{ color: '#38bdf8' }}>Track</span>
            </h1>

            <p style={{
              color: '#94a3b8',
              fontSize: '0.92rem',
              maxWidth: '480px',
              margin: '0 0 16px 0',
              lineHeight: '1.4',
              position: 'relative',
              zIndex: 1
            }}>
              Curate your cinema watchlist, watch official HD trailers, and track verified global ratings.
            </p>

            {movies.length > 0 && (
              <div 
                onClick={() => openMovieDetails(movies[0])}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  padding: '6px 14px',
                  borderRadius: '30px',
                  fontSize: '0.78rem',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 1,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <span style={{ background: '#f5c518', color: '#000', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem' }}>
                  ⭐ {movies[0].imdbRating}
                </span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>Spotlight:</span> {movies[0].Title} ({movies[0].Year}) 
                <Eye size={13} color="#38bdf8" />
              </div>
            )}
          </section>
        )}

        {/* Watchlist Quick Overview Stats */}
        {activeTab === 'watchlist' && (
          <div style={{
            marginTop: '1rem',
            marginBottom: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Saved</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>{stats.total}</div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Completed</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4ade80' }}>{stats.completed}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Avg Rating</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f5c518' }}>{stats.avgRating}</div>
            </div>
          </div>
        )}

        {/* Search Engine */}
        {activeTab === 'explore' && (
          <form onSubmit={handleSearch} className="search-wrapper">
            <div className="search-input-box">
              <Search size={16} color="#38bdf8" />
              <input
                type="text"
                placeholder="Search cinema (e.g. Inception, Batman, Dune)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary">
              {isLoading ? '...' : 'Search'}
            </button>
          </form>
        )}

        {/* Genre Chips & Smart Filter Bar */}
        {activeTab === 'explore' && (
          <div style={{ margin: '0 0 1.2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="no-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', flex: 1, paddingBottom: '4px' }}>
              {GENRE_TAGS.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreChange(genre)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    border: selectedGenre === genre ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: selectedGenre === genre ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedGenre === genre ? '#38bdf8' : '#94a3b8',
                    fontWeight: selectedGenre === genre ? 700 : 500,
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {genre}
                </button>
              ))}

              <button
                onClick={() => setFilterTopRatedOnly(!filterTopRatedOnly)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: filterTopRatedOnly ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: filterTopRatedOnly ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  color: filterTopRatedOnly ? '#fbbf24' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Award size={13} /> 8.0+ Only
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpDown size={13} color="#94a3b8" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: '#0f172a',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="default">Default</option>
                <option value="rating">Top Rated</option>
                <option value="year">Newest</option>
                <option value="title">A-Z</option>
              </select>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {errorMessage && (
          <div style={{
            marginBottom: '1rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '8px 12px',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={15} color="#f87171" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Watchlist Filter Buttons */}
        {activeTab === 'watchlist' && (
          <div style={{ margin: '0.8rem 0 1.2rem 0', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['All', 'Plan to Watch', 'Watching', 'Completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setWatchlistFilter(status)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    border: watchlistFilter === status ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: watchlistFilter === status ? '#38bdf8' : 'rgba(255, 255, 255, 0.05)',
                    color: watchlistFilter === status ? '#070b13' : '#cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={exportWatchlist}
                title="Export list as JSON"
                style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#7dd3fc',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Download size={12} /> Export
              </button>

              {watchlist.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm("Clear all movies from Watchlist?")) {
                      setWatchlist([]);
                      showToast("Watchlist cleared");
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={12} /> Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Movies Grid */}
        <section>
          <h2 className="section-title">
            {selectedGenre === 'Trending' ? <Flame size={18} color="#f97316" /> : <Film size={18} color="#38bdf8" />}
            {activeTab === 'explore'
              ? searchQuery
                ? `Results for "${searchQuery}"`
                : `${selectedGenre} Cinema`
              : `My Watchlist (${displayedMovies.length})`}
          </h2>

          {displayedMovies.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#94a3b8',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: '1px dashed rgba(255,255,255,0.1)'
              }}
            >
              <p style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#f1f5f9' }}>
                {activeTab === 'explore'
                  ? `No titles found under selected parameters.`
                  : 'No titles saved in this category yet.'}
              </p>
              {activeTab === 'explore' && (
                <div style={{ marginTop: '12px' }}>
                  <button
                    onClick={clearSearch}
                    className="btn-primary"
                    style={{ fontSize: '0.75rem', padding: '6px 12px', margin: '0 auto' }}
                  >
                    <RefreshCw size={13} /> Reset Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="card-grid">
              {displayedMovies.map((movie, idx) => (
                <React.Fragment key={movie?.id || idx}>
                  <div
                    className="movie-card"
                    onClick={() => openMovieDetails(movie)}
                  >
                    <div className="rating-badge">
                      <Star size={11} fill="#fbbf24" color="#fbbf24" />
                      <span>{movie?.imdbRating}</span>
                    </div>

                    <img
                      src={movie?.Poster || SVG_POSTER_PLACEHOLDER}
                      alt={movie?.Title || 'Movie'}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = SVG_POSTER_PLACEHOLDER;
                      }}
                      className="card-poster"
                      referrerPolicy="no-referrer"
                    />

                    <div className="card-info">
                      <div>
                        <div className="card-title">
                          {movie?.Title}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '1px' }}>
                          {movie?.Year || '2026'} • TMDB VERIFIED
                        </div>
                      </div>

                      {/* Quick HD Trailer Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayTrailer(movie);
                        }}
                        style={{
                          marginTop: '8px',
                          width: '100%',
                          padding: '7px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <Play size={12} fill="#ffffff" /> TRAILER
                      </button>

                      {/* Watchlist Controls inside Watchlist Tab */}
                      {activeTab === 'watchlist' && (
                        <div style={{ margin: '6px 0 2px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <Star
                                key={starVal}
                                size={11}
                                onClick={() => setUserRating(movie.id, starVal)}
                                fill={(movie.personalRating || 0) >= starVal ? "#fbbf24" : "none"}
                                color={(movie.personalRating || 0) >= starVal ? "#fbbf24" : "#475569"}
                                style={{ cursor: 'pointer' }}
                              />
                            ))}
                          </div>
                          <select
                            value={movie.userStatus || 'Plan to Watch'}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateStatus(movie.id, e.target.value)}
                            style={{
                              background: '#070b13',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              borderRadius: '4px',
                              padding: '1px 3px',
                              fontSize: '0.62rem',
                              outline: 'none'
                            }}
                          >
                            <option value="Plan to Watch">Plan</option>
                            <option value="Watching">Watching</option>
                            <option value="Completed">Done</option>
                          </select>
                        </div>
                      )}

                      <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(movie);
                          }}
                          style={{
                            flex: 1,
                            padding: '5px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: isMovieInWatchlist(movie?.id)
                              ? 'rgba(74, 222, 128, 0.15)'
                              : 'rgba(255, 255, 255, 0.05)',
                            color: isMovieInWatchlist(movie?.id) ? '#4ade80' : '#fff',
                            fontWeight: 600,
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '3px'
                          }}
                        >
                          {isMovieInWatchlist(movie?.id) ? (
                            <>
                              <Check size={11} /> Saved
                            </>
                          ) : (
                            <>
                              <Plus size={11} /> Watchlist
                            </>
                          )}
                        </button>

                        <button
                          onClick={(e) => handleShareMovie(movie, e)}
                          title="Share movie"
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Share2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* High Converting Native Ad / Sponsor Placement */}
                  {activeTab === 'explore' && idx === 5 && (
                    <div className="native-ad-card">
                      <span className="ad-badge">SPONSORED</span>
                      <Sparkles size={28} color="#38bdf8" style={{ marginBottom: '8px' }} />
                      <h4 style={{ fontSize: '0.86rem', color: '#f8fafc', marginBottom: '4px' }}>Unlimited Cinema OTT</h4>
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '12px', lineHeight: '1.3' }}>
                        Stream 4K blockbusters, HDR trailers & exclusive shows with instant access.
                      </p>
                      <a
                        href="https://www.primevideo.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ fontSize: '0.72rem', padding: '6px 14px' }}
                      >
                        Start Free Trial
                      </a>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Signature Modern Footer */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '20px 14px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(7, 11, 19, 0.98)',
          color: '#64748b',
          fontSize: '0.8rem'
        }}
      >
        Developed and owned by <strong style={{ color: '#f8fafc', letterSpacing: '0.6px' }}>anshya</strong>
      </footer>

      {/* Official Bulletproof YouTube Trailer Modal */}
      {activeTrailer && (
        <div className="modal-overlay" onClick={closeModalsSafely}>
          <div 
            style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '820px', 
              background: '#070b13', 
              borderRadius: '14px', 
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.95)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              display: 'flex',
              flexDirection: 'column'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
              background: '#0f172a',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={16} fill="#ef4444" color="#ef4444" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                  {activeTrailer.title} • Official Preview
                </span>
              </div>

              <button
                onClick={closeModalsSafely}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000000' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeTrailer.videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`}
                title={`${activeTrailer.title} Trailer`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Details Popup Modal */}
      {selectedMovie && !activeTrailer && (
        <div className="modal-overlay" onClick={closeModalsSafely}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModalsSafely}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={15} />
            </button>

            <div className="modal-body">
              <img
                src={selectedMovie?.Poster || SVG_POSTER_PLACEHOLDER}
                alt={selectedMovie?.Title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = SVG_POSTER_PLACEHOLDER;
                }}
                className="modal-poster"
                referrerPolicy="no-referrer"
              />

              <div className="modal-details">
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span
                    style={{
                      background: '#f5c518',
                      color: '#000',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.72rem'
                    }}
                  >
                    TMDB {selectedMovie?.imdbRating}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{selectedMovie?.Year}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{selectedMovie?.Runtime}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{selectedMovie?.Title}</h3>
                <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600 }}>
                  {selectedMovie?.Genre}
                </span>

                <p style={{ color: '#cbd5e1', fontSize: '0.78rem', lineHeight: '1.4' }}>
                  {selectedMovie?.Plot}
                </p>

                <div
                  style={{
                    fontSize: '0.74rem',
                    color: '#94a3b8',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px'
                  }}
                >
                  <div>
                    <strong style={{ color: '#e2e8f0' }}>Cast:</strong> {selectedMovie?.Actors}
                  </div>
                  <div>
                    <strong style={{ color: '#e2e8f0' }}>Director:</strong> {selectedMovie?.Director}
                  </div>
                </div>

                {/* Where to Watch + All Official Streaming Apps in 3x2 Grid */}
                <div style={{ marginTop: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                    <Tv size={13} /> OFFICIAL STREAMING & RENTALS
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', 
                    gap: '6px', 
                    width: '100%' 
                  }}>
                    <a
                      href={`https://www.primevideo.com/search?phrase=${encodeURIComponent(selectedMovie?.Title || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="affiliate-ott-btn"
                      style={{ justifyContent: 'center', padding: '4px 2px', fontSize: '0.68rem', whiteSpace: 'nowrap' }}
                    >
                      Prime Video <ExternalLink size={10} />
                    </a>

                    <a
                      href={`https://www.netflix.com/search?q=${encodeURIComponent(selectedMovie?.Title || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        background: '#e50914',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Netflix <ExternalLink size={10} />
                    </a>

                    <a
                      href={`https://www.hotstar.com/in/explore?search_query=${encodeURIComponent(selectedMovie?.Title || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        background: '#0c1a30',
                        border: '1px solid #1f80e0',
                        color: '#38bdf8',
                        textDecoration: 'none',
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Hotstar <ExternalLink size={10} />
                    </a>

                    <a
                      href={`https://tv.apple.com/search?term=${encodeURIComponent(selectedMovie?.Title || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        background: '#27272a',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Apple TV <ExternalLink size={10} />
                    </a>

                    <a
                      href={`https://www.justwatch.com/in/search?q=${encodeURIComponent(selectedMovie?.Title || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        background: '#f59e0b',
                        color: '#000',
                        textDecoration: 'none',
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      JustWatch <ExternalLink size={10} />
                    </a>

                    <a
                      href={`https://www.google.com/search?q=where+to+watch+${encodeURIComponent(selectedMovie?.Title || '')}+movie`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        background: '#2563eb',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '4px 2px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Google Watch <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handlePlayTrailer(selectedMovie)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    <Play size={14} fill="#ffffff" /> Watch HD Trailer
                  </button>

                  <button
                    onClick={() => toggleWatchlist(selectedMovie)}
                    className="btn-primary"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    {isMovieInWatchlist(selectedMovie?.id) ? (
                      <>
                        <Check size={14} color="#4ade80" /> Saved
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> Watchlist
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}