import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Check, Star, Search, Film, X, Bookmark, 
  GraduationCap, RefreshCw, Eye, AlertCircle, Play, 
  Shuffle, CheckCircle2, Trash2, ExternalLink, Download, 
  ArrowUpDown, Tv, Flame, Sparkles
} from 'lucide-react';
import './App.css';

const TMDB_API_KEY = '588ffc2c74b931292b25441fe86747cc';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

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

const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop';
const FALLBACK_BACKDROP = 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop';

const INITIAL_POPULAR = [
  {
    id: 157336,
    Title: "Interstellar",
    Year: "2014",
    imdbRating: "8.7",
    Poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/rAiYTua5ht9AcCQqqv6ZIG9qZmh.jpg",
    Plot: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass human space travel limitations.",
    Genre: "Adventure, Drama, Science Fiction",
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
    backdrop: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
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
    backdrop: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    Plot: "Batman raises the stakes in his war on crime and sets out to dismantle the remaining criminal organizations that plague the streets.",
    Genre: "Action, Crime, Drama",
    Actors: "Christian Bale, Heath Ledger",
    Director: "Christopher Nolan",
    Runtime: "152 min"
  }
];

export default function App() {
  const [movies, setMovies] = useState(INITIAL_POPULAR);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Trending');
  const [sortBy, setSortBy] = useState('default');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeTrailer, setActiveTrailer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [watchlistFilter, setWatchlistFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  const featuredMovie = movies[featuredIndex] || INITIAL_POPULAR[0];

  // Crash-proof Watchlist
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('cinetracker_tmdb_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cinetracker_tmdb_watchlist', JSON.stringify(watchlist));
    } catch (err) {
      console.error("Storage write failed:", err);
    }
  }, [watchlist]);

  // Hardware Back Button Controller
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

  // Scroll lock & Escape key
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleNextHero = () => {
    setFeaturedIndex((prev) => (prev + 1) % (movies.length > 5 ? 5 : movies.length));
  };

  // Formatter
  const formatTmdbMovie = (item) => ({
    id: item.id,
    Title: item.title || item.original_title || 'Untitled Movie',
    Year: item.release_date ? item.release_date.split('-')[0] : '2024',
    imdbRating: item.vote_average ? item.vote_average.toFixed(1) : '7.5',
    Poster: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : FALLBACK_POSTER,
    backdrop: item.backdrop_path ? `${BACKDROP_BASE_URL}${item.backdrop_path}` : FALLBACK_BACKDROP,
    Plot: item.overview || 'No synopsis provided.',
    Genre: 'Cinema',
    Actors: 'Featured Cast',
    Director: 'Director',
    Runtime: '120 min'
  });

  // Initial Trending Fetch
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        if (data && data.results && data.results.length > 0) {
          setMovies(data.results.slice(0, 18).map(formatTmdbMovie));
        }
      } catch (err) {
        console.warn("Fallback mode:", err);
      }
    };
    fetchInitial();
  }, []);

  // Search API
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
        setErrorMessage(`No titles found matching "${searchQuery}". Showing popular cinema.`);
      }
    } catch (err) {
      setMovies(INITIAL_POPULAR);
      setErrorMessage("Network issue detected. Running in offline safety mode.");
    } finally {
      setIsLoading(false);
    }
  };

  // Genre Change
  const handleGenreChange = async (genre) => {
    setSelectedGenre(genre);
    setSearchQuery('');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const endpoint = genre === 'Trending'
        ? `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
        : `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${GENRE_MAP[genre]}&sort_by=popularity.desc`;

      const res = await fetch(endpoint);
      const data = await res.json();
      if (data && data.results) {
        setMovies(data.results.slice(0, 18).map(formatTmdbMovie));
      }
    } catch {
      setMovies(INITIAL_POPULAR);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    handleGenreChange('Trending');
  };

  // Movie Details & Extra Metadata
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
    } catch (e) {
      console.warn("Details fetch error:", e);
    }
  };

  // TMDB Real YouTube Trailer Fetch
  const handlePlayTrailer = async (movie) => {
    try {
      const res = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`);
      const data = await res.json();
      const trailer = data?.results?.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));

      if (trailer && trailer.key) {
        setActiveTrailer({ type: 'embed', videoId: trailer.key, title: movie.Title });
      } else {
        setActiveTrailer({ type: 'external', title: movie.Title, year: movie.Year, poster: movie.Poster });
      }
    } catch {
      setActiveTrailer({ type: 'external', title: movie.Title, year: movie.Year, poster: movie.Poster });
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
      showToast(`Added "${movie.Title}" to Watchlist!`);
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
    downloadAnchor.setAttribute("download", `cinetrack_tmdb_watchlist_${Date.now()}.json`);
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
    let list = activeTab === 'explore' ? movies : watchlist.filter((m) => (watchlistFilter === 'All' ? true : m.userStatus === watchlistFilter));

    if (sortBy === 'rating') {
      list = [...list].sort((a, b) => (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0));
    } else if (sortBy === 'year') {
      list = [...list].sort((a, b) => (parseInt(b.Year) || 0) - (parseInt(a.Year) || 0));
    } else if (sortBy === 'title') {
      list = [...list].sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
    }

    return list;
  }, [activeTab, movies, watchlist, watchlistFilter, sortBy]);

  return (
    <div style={{ minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', background: '#0b0f19', color: '#f8fafc' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid #38bdf8',
          boxShadow: '0 8px 24px rgba(56, 189, 248, 0.25)',
          color: '#f8fafc',
          padding: '8px 16px',
          borderRadius: '24px',
          zIndex: 1200,
          fontSize: '0.8rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap'
        }}>
          <CheckCircle2 size={15} color="#38bdf8" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="navbar">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Film size={20} color="#38bdf8" />
          <span>CineTracker</span>
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
              fontSize: '0.8rem',
              padding: '4px'
            }}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'watchlist' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px'
            }}
          >
            <Bookmark size={13} />
            Watchlist ({watchlist.length})
          </button>

          {/* Student Persona Credit */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '4px 8px',
              borderRadius: '20px',
              fontSize: '0.68rem',
              color: '#7dd3fc',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            <GraduationCap size={12} color="#38bdf8" />
            <span>Anshu Maurya • TY BCA</span>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1 }}>
        {/* Billboard Hero Section */}
        {activeTab === 'explore' && !searchQuery && (
          <section
            className="hero"
            style={{
              backgroundImage: `url(${featuredMovie.backdrop})`
            }}
          >
            <div className="hero-overlay">
              <div className="hero-content">
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                    TMDB {featuredMovie.imdbRating}
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem' }}>
                    {featuredMovie.Year}
                  </span>
                  <span style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Sparkles size={11} /> Featured
                  </span>
                </div>

                <h1 className="hero-title">{featuredMovie.Title}</h1>
                <p className="hero-overview">{featuredMovie.Plot}</p>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={() => openMovieDetails(featuredMovie)}>
                    <Eye size={15} /> View Details
                  </button>
                  <button
                    onClick={() => toggleWatchlist(featuredMovie)}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.82rem'
                    }}
                  >
                    {isMovieInWatchlist(featuredMovie.id) ? (
                      <>
                        <Check size={15} color="#4ade80" /> Saved
                      </>
                    ) : (
                      <>
                        <Plus size={15} /> Add Watchlist
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleNextHero}
                    title="Next Highlight"
                    style={{
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.78rem'
                    }}
                  >
                    <Shuffle size={13} /> Next
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Watchlist Quick Stats */}
        {activeTab === 'watchlist' && (
          <div style={{
            marginTop: '0.5rem',
            marginBottom: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            background: 'rgba(21, 28, 47, 0.6)',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Saved</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>{stats.total}</div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Done</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4ade80' }}>{stats.completed}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Avg Rating</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f5c518' }}>{stats.avgRating}</div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {activeTab === 'explore' && (
          <form onSubmit={handleSearch} className="search-wrapper">
            <div className="search-input-box">
              <Search size={16} color="#38bdf8" />
              <input
                type="text"
                placeholder="Search movies (e.g. Inception, Batman)..."
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

        {/* Genre Chips & Sort Row */}
        {activeTab === 'explore' && (
          <div style={{ margin: '0.6rem 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="no-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', flex: 1 }}>
              {GENRE_TAGS.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreChange(genre)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    border: selectedGenre === genre ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: selectedGenre === genre ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedGenre === genre ? '#38bdf8' : '#94a3b8',
                    fontWeight: selectedGenre === genre ? 700 : 500,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {genre}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpDown size={13} color="#94a3b8" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: '#151c2f',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '6px',
                  padding: '3px 6px',
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
                    color: watchlistFilter === status ? '#0b0f19' : '#cbd5e1',
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
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                  : 'No titles saved under this category yet.'}
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
              {displayedMovies.map((movie) => (
                <div
                  key={movie?.id || Math.random()}
                  className="movie-card"
                  onClick={() => openMovieDetails(movie)}
                >
                  <div className="rating-badge">
                    <Star size={10} fill="#fbbf24" color="#fbbf24" />
                    <span>{movie?.imdbRating}</span>
                  </div>

                  <img
                    src={movie?.Poster || FALLBACK_POSTER}
                    alt={movie?.Title || 'Movie'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_POSTER;
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
                        {movie?.Year || '2024'} • TMDB VERIFIED
                      </div>
                    </div>

                    {/* Watchlist Tools */}
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
                            background: '#0b0f19',
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
                          borderRadius: '5px',
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
                            <Plus size={11} /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '14px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(11, 15, 25, 0.95)',
          color: '#94a3b8',
          fontSize: '0.75rem'
        }}
      >
        Developed by <strong style={{ color: '#38bdf8' }}>Anshu Maurya</strong> (TY BCA)
      </footer>

      {/* Smart Official Trailer Modal */}
      {activeTrailer && (
        <div className="modal-overlay" onClick={closeModalsSafely}>
          <div 
            style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '720px', 
              aspectRatio: activeTrailer.type === 'embed' ? '16/9' : 'auto', 
              background: '#0b0f19', 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.9)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: activeTrailer.type === 'external' ? '24px 16px' : '0'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModalsSafely}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.7)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                zIndex: 20
              }}
            >
              <X size={17} />
            </button>

            {activeTrailer.type === 'embed' ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeTrailer.videoId}?autoplay=1&rel=0`}
                title={`${activeTrailer.title} Trailer`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={activeTrailer.poster} 
                  alt={activeTrailer.title} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_POSTER;
                  }}
                  style={{ width: '100px', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }} 
                />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: '0 0 4px 0' }}>
                    {activeTrailer.title}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0, maxWidth: '380px' }}>
                    Official preview safely streaming on YouTube.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const query = encodeURIComponent(`${activeTrailer.title} official trailer`);
                    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank', 'noopener,noreferrer');
                  }}
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <Play size={15} fill="#fff" /> Launch Official Trailer <ExternalLink size={14} />
                </button>
              </div>
            )}
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
                src={selectedMovie?.Poster || FALLBACK_POSTER}
                alt={selectedMovie?.Title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_POSTER;
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

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{selectedMovie?.Title}</h3>
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

                {/* Where to Watch */}
                <div style={{ marginTop: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
                    <Tv size={13} /> STREAMING PROVIDERS
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <a
                      href={`https://www.justwatch.com/in/search?q=${encodeURIComponent(selectedMovie?.Title || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#f59e0b',
                        color: '#000',
                        textDecoration: 'none',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}
                    >
                      JustWatch <ExternalLink size={10} />
                    </a>
                    <a
                      href={`https://www.google.com/search?q=watch+${encodeURIComponent(selectedMovie?.Title || '')}+online`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#2563eb',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}
                    >
                      Google Watch <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleWatchlist(selectedMovie)}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {isMovieInWatchlist(selectedMovie?.id) ? (
                      <>
                        <Check size={15} color="#4ade80" /> Remove Watchlist
                      </>
                    ) : (
                      <>
                        <Plus size={15} /> Add to Watchlist
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handlePlayTrailer(selectedMovie)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: '#ef4444',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Play size={14} fill="#ffffff" /> Watch Trailer
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