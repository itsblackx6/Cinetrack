import React, { useState, useEffect, useMemo, useRef, useCallback, Component } from 'react';
import { 
  Plus, Check, Star, Search, Film, X, Bookmark, 
  RefreshCw, AlertCircle, Play, 
  CheckCircle2, Trash2,
  ArrowUpDown, Tv, Flame, Share2, Award, ShieldCheck, Dices
} from 'lucide-react';
import './App.css';

// ---------------------- ERROR BOUNDARY ----------------------
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("CineTrack Safe Recovery:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#070b13', color: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Something went off-screen!</h2>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '16px', background: '#38bdf8', color: '#070b13', border: 'none', padding: '10px 22px', borderRadius: '24px', fontWeight: 700, cursor: 'pointer' }}
          >
            Reload CineTrack
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------- CONFIG & CONSTANTS ----------------------
const TMDB_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TMDB_API_KEY) 
  ? import.meta.env.VITE_TMDB_API_KEY 
  : '588ffc2c74b931292b25441fe86747cc';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w780';

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
    Backdrop: "https://image.tmdb.org/t/p/w780/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    Plot: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
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
    Backdrop: "https://image.tmdb.org/t/p/w780/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
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
    Backdrop: "https://image.tmdb.org/t/p/w780/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    Plot: "Batman raises the stakes in his war on crime and sets out to dismantle the remaining criminal organizations.",
    Genre: "Action, Crime, Drama",
    Actors: "Christian Bale, Heath Ledger",
    Director: "Christopher Nolan",
    Runtime: "152 min"
  }
];

const STATIC_TRAILERS = {
  157336: 'zSWdZVtXT7E',
  872585: 'uYPbbksJxIg',
  155: 'EXeTwQWrcwY'
};

function CineTrackApp() {
  const [movies, setMovies] = useState(INITIAL_POPULAR);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Trending');
  const [sortBy, setSortBy] = useState('default');
  const [filterTopRatedOnly, setFilterTopRatedOnly] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeTrailer, setActiveTrailer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('explore');
  const [watchlistFilter, setWatchlistFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);
  const [activeLegalModal, setActiveLegalModal] = useState(null);

  const cacheRef = useRef({});
  const searchTimeoutRef = useRef(null);
  const pushedHistoryRef = useRef(false);

  // Safe Watchlist Init
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('cinetrack_pro_v2_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Watchlist Sync
  useEffect(() => {
    try {
      const cleanList = (watchlist || []).slice(0, 150).map(m => ({
        id: m.id,
        Title: m.Title || 'Movie',
        Year: m.Year || '',
        imdbRating: m.imdbRating || '7.0',
        Poster: m.Poster || SVG_POSTER_PLACEHOLDER,
        Backdrop: m.Backdrop || '',
        Plot: m.Plot ? m.Plot.slice(0, 250) : '',
        Genre: m.Genre || 'Cinema',
        userStatus: m.userStatus || 'Plan to Watch',
        personalRating: m.personalRating || 0
      }));
      localStorage.setItem('cinetrack_pro_v2_watchlist', JSON.stringify(cleanList));
    } catch (err) {
      console.warn("Storage Quota:", err);
    }
  }, [watchlist]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // Popstate Listener
  useEffect(() => {
    const handlePopState = () => {
      pushedHistoryRef.current = false;
      if (activeTrailer) {
        setActiveTrailer(null);
      } else if (selectedMovie) {
        setSelectedMovie(null);
      } else if (activeLegalModal) {
        setActiveLegalModal(null);
      } else if (activeTab === 'watchlist') {
        setActiveTab('explore');
      }
    };

    if (activeTrailer || selectedMovie || activeLegalModal || activeTab === 'watchlist') {
      window.history.pushState({ modalOrTab: true }, '');
      pushedHistoryRef.current = true;
    }

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTrailer, selectedMovie, activeLegalModal, activeTab]);

  const closeModalsSafely = () => {
    if (pushedHistoryRef.current) {
      window.history.back();
    } else {
      setActiveTrailer(null);
      setSelectedMovie(null);
      setActiveLegalModal(null);
    }
  };

  useEffect(() => {
    if (selectedMovie || activeTrailer || activeLegalModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedMovie, activeTrailer, activeLegalModal]);

  const formatTmdbMovie = useCallback((item) => {
    const currentYear = new Date().getFullYear().toString();
    return {
      id: item?.id || Math.floor(Math.random() * 100000),
      Title: item?.title || item?.original_title || 'Untitled Cinema',
      Year: item?.release_date ? item.release_date.split('-')[0] : currentYear,
      imdbRating: item?.vote_average ? item.vote_average.toFixed(1) : '7.5',
      Poster: item?.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : SVG_POSTER_PLACEHOLDER,
      Backdrop: item?.backdrop_path ? `${BACKDROP_BASE_URL}${item.backdrop_path}` : (item?.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : ''),
      Plot: item?.overview || 'No synopsis provided.',
      Genre: 'Cinema',
      Actors: 'Featured Cast',
      Director: 'Director',
      Runtime: '120 min'
    };
  }, []);

  const fetchCategoryMovies = useCallback(async (genre, pageNum = 1, append = false) => {
    if (pageNum === 1 && cacheRef.current[genre] && !append) {
      setMovies(cacheRef.current[genre]);
      return;
    }

    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsPaginating(true);
    }

    try {
      const endpoint = genre === 'Trending'
        ? `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=${pageNum}`
        : `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${GENRE_MAP[genre]}&sort_by=popularity.desc&page=${pageNum}`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        const formatted = data.results.map(formatTmdbMovie);
        if (append) {
          setMovies(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newOnes = formatted.filter(m => !existingIds.has(m.id));
            return [...prev, ...newOnes];
          });
        } else {
          cacheRef.current[genre] = formatted;
          setMovies(formatted);
        }
      } else {
        if (!append) setMovies(INITIAL_POPULAR);
      }
    } catch {
      if (!append) setMovies(INITIAL_POPULAR);
    } finally {
      setIsLoading(false);
      setIsPaginating(false);
    }
  }, [formatTmdbMovie]);

  useEffect(() => {
    fetchCategoryMovies('Trending', 1);
  }, [fetchCategoryMovies]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCategoryMovies(selectedGenre, nextPage, true);
  };

  const handleSurpriseMe = () => {
    if (movies.length === 0) return;
    const randomIndex = Math.floor(Math.random() * movies.length);
    const luckyMovie = movies[randomIndex];
    showToast(`🎲 Surprise: ${luckyMovie.Title}!`);
    openMovieDetails(luckyMovie);
  };

  const executeSearch = useCallback(async (rawQuery) => {
    const query = (rawQuery || '').trim();
    if (!query) {
      setPage(1);
      fetchCategoryMovies(selectedGenre, 1);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      if (data && data.results && data.results.length > 0) {
        setMovies(data.results.map(formatTmdbMovie));
      } else {
        setMovies(INITIAL_POPULAR);
      }
    } catch {
      setMovies(INITIAL_POPULAR);
    } finally {
      setIsLoading(false);
    }
  }, [selectedGenre, fetchCategoryMovies, formatTmdbMovie]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      executeSearch(val);
    }, 380);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    executeSearch(searchQuery);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setSearchQuery('');
    setPage(1);
    setFilterTopRatedOnly(false);
    fetchCategoryMovies(genre, 1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
    handleGenreChange('Trending');
  };

  const openMovieDetails = async (movie) => {
    setSelectedMovie(movie);

    try {
      const res = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`);
      if (res.ok) {
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
      }
    } catch {
      // Safe fallback
    }
  };

  const handlePlayTrailer = async (movie) => {
    if (!movie) return;
    if (STATIC_TRAILERS[movie.id]) {
      setActiveTrailer({ videoId: STATIC_TRAILERS[movie.id], title: movie.Title });
      return;
    }

    try {
      const res = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}`);
      if (!res.ok) throw new Error('Video fetch failed');
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
    const shareText = `Check out "${movie.Title}" (${movie.Year}) • Rating: ${movie.imdbRating} ⭐`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.Title,
          text: shareText,
          url: shareUrl
        });
      } catch {
        // Dismissed
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      showToast("Link copied!");
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

  const isMovieInWatchlist = (id) => watchlist.some((m) => m.id === id);

  const heroMovie = movies.length > 0 ? movies[0] : null;

  // Prevent duplicate hero in grid
  const gridMovies = useMemo(() => {
    if (activeTab === 'watchlist') {
      return watchlist.filter(m => watchlistFilter === 'All' ? true : m.userStatus === watchlistFilter);
    }
    let list = (!searchQuery && movies.length > 1) ? movies.slice(1) : movies;
    if (filterTopRatedOnly) {
      list = list.filter(m => (parseFloat(m.imdbRating) || 0) >= 8.0);
    }
    if (sortBy === 'rating') {
      list = [...list].sort((a, b) => (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0));
    } else if (sortBy === 'year') {
      list = [...list].sort((a, b) => (parseInt(b.Year) || 0) - (parseInt(a.Year) || 0));
    } else if (sortBy === 'title') {
      list = [...list].sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
    }
    return list;
  }, [activeTab, movies, watchlist, watchlistFilter, searchQuery, filterTopRatedOnly, sortBy]);

  return (
    <div style={{ minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: '#070b13', color: '#f8fafc' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid #f59e0b',
          boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
          color: '#f8fafc',
          padding: '8px 18px',
          borderRadius: '24px',
          zIndex: 1200,
          fontSize: '0.8rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <CheckCircle2 size={16} color="#f59e0b" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar with Golden "𝓜𝓮𝓮𝓷𝓪⚡" */}
      <header className="navbar">
        <div 
          className="meena-brand"
          onClick={() => { setActiveTab('explore'); clearSearch(); }}
        >
          𝓜𝓮𝓮𝓷𝓪⚡
        </div>

        <div className="nav-actions">
          <button
            onClick={handleSurpriseMe}
            title="Pick a random movie!"
            style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '20px',
              color: '#facc15',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 11px'
            }}
          >
            <Dices size={13} color="#facc15" />
            <span>Surprise</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'watchlist' ? 'explore' : 'watchlist')}
            style={{
              background: activeTab === 'watchlist' ? '#38bdf8' : 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '20px',
              color: activeTab === 'watchlist' ? '#070b13' : '#cbd5e1',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px'
            }}
          >
            <Bookmark size={12} />
            Watchlist ({watchlist.length})
          </button>
        </div>
      </header>

      <main className="container" style={{ flex: 1 }}>

        {/* Dynamic Netflix Billboard (Trending #1) */}
        {activeTab === 'explore' && !searchQuery && heroMovie && (
          <div className="hero-billboard" onClick={() => openMovieDetails(heroMovie)}>
            <div className="hero-backdrop-wrapper">
              <img 
                src={heroMovie.Backdrop || heroMovie.Poster} 
                alt={heroMovie.Title}
                className="hero-backdrop-img"
              />
              <div className="hero-gradient-overlay" />
            </div>

            <div className="hero-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ 
                  background: 'linear-gradient(90deg, #F59E0B, #D97706)', 
                  color: '#000', 
                  fontWeight: 900, 
                  fontSize: '0.66rem', 
                  padding: '2px 7px', 
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <Flame size={11} fill="#000" /> #1 TRENDING
                </span>
                <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>
                  ⭐ {heroMovie.imdbRating}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>• {heroMovie.Year}</span>
              </div>

              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                {heroMovie.Title}
              </h2>

              <p style={{ 
                color: '#cbd5e1', 
                fontSize: '0.75rem', 
                lineHeight: '1.3', 
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {heroMovie.Plot}
              </p>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handlePlayTrailer(heroMovie)}
                  style={{
                    background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 14px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer'
                  }}
                >
                  <Play size={13} fill="#ffffff" /> TRAILER
                </button>

                <button
                  onClick={() => toggleWatchlist(heroMovie)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(8px)',
                    color: isMovieInWatchlist(heroMovie.id) ? '#4ade80' : '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '7px 14px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {isMovieInWatchlist(heroMovie.id) ? <Check size={13} /> : <Plus size={13} />}
                  {isMovieInWatchlist(heroMovie.id) ? 'Saved' : 'Watchlist'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Debounced Search Bar */}
        {activeTab === 'explore' && (
          <form onSubmit={handleSearchSubmit} className="search-wrapper">
            <div className="search-input-box">
              <Search size={16} color="#38bdf8" />
              <input
                type="text"
                placeholder="Search cinema (e.g. Inception, Batman, Dune)..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
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

        {/* Genre Filter Pills */}
        {activeTab === 'explore' && (
          <div style={{ margin: '0 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <div className="no-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', flex: 1, paddingBottom: '2px' }}>
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
                <Award size={13} /> 8.0+
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
                  borderRadius: '8px',
                  padding: '4px 6px',
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

        {/* Watchlist Quick Filters */}
        {activeTab === 'watchlist' && (
          <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
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

            {watchlist.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Clear all movies?")) setWatchlist([]);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <Trash2 size={11} /> Clear
              </button>
            )}
          </div>
        )}

        {/* Clean 2-Column Movies Grid */}
        <section>
          <h2 className="section-title">
            {activeTab === 'explore' ? <Film size={17} color="#38bdf8" /> : <Bookmark size={17} color="#facc15" />}
            {activeTab === 'explore'
              ? searchQuery ? `Results for "${searchQuery}"` : `${selectedGenre} Cinema`
              : `My Watchlist (${gridMovies.length})`}
          </h2>

          {gridMovies.length === 0 && activeTab === 'explore' ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <p>No titles found. Please try another query.</p>
              <button onClick={clearSearch} className="btn-primary" style={{ marginTop: '10px', fontSize: '0.75rem' }}>
                Reset Cinema
              </button>
            </div>
          ) : activeTab === 'watchlist' && gridMovies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <Film size={36} color="#475569" style={{ marginBottom: '10px' }} />
              <p style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 600 }}>Your watchlist is empty.</p>
              <button onClick={() => setActiveTab('explore')} className="btn-primary" style={{ fontSize: '0.76rem', marginTop: '12px' }}>
                Explore Trending Cinema
              </button>
            </div>
          ) : (
            <div className="card-grid">
              {gridMovies.map((movie) => (
                <div key={movie.id} className="movie-card" onClick={() => openMovieDetails(movie)}>
                  <div className="rating-badge">
                    <Star size={10} fill="#fbbf24" color="#fbbf24" />
                    <span>{movie.imdbRating}</span>
                  </div>

                  <img 
                    src={movie.Poster || SVG_POSTER_PLACEHOLDER} 
                    alt={movie.Title}
                    className="card-poster"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = SVG_POSTER_PLACEHOLDER;
                    }}
                  />

                  <div className="card-info">
                    <div>
                      <div className="card-title">{movie.Title}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: '2px' }}>
                        {movie.Year} • TMDB VERIFIED
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTrailer(movie);
                      }}
                      style={{
                        marginTop: '8px',
                        width: '100%',
                        padding: '6px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Play size={11} fill="#ffffff" /> TRAILER
                    </button>

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
                          background: isMovieInWatchlist(movie.id) ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: isMovieInWatchlist(movie.id) ? '#4ade80' : '#fff',
                          fontWeight: 600,
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px'
                        }}
                      >
                        {isMovieInWatchlist(movie.id) ? <Check size={11} /> : <Plus size={11} />}
                        {isMovieInWatchlist(movie.id) ? 'Saved' : 'Watchlist'}
                      </button>

                      <button
                        onClick={(e) => handleShareMovie(movie, e)}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        <Share2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Pagination */}
          {activeTab === 'explore' && !searchQuery && movies.length > 0 && (
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <button
                onClick={handleLoadMore}
                disabled={isPaginating}
                style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#38bdf8',
                  padding: '10px 24px',
                  borderRadius: '24px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: isPaginating ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isPaginating ? <RefreshCw size={13} className="animate-spin" /> : <Film size={13} />}
                Load More Blockbusters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        padding: '24px 14px 20px 14px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(7, 11, 19, 0.98)',
        color: '#64748b',
        fontSize: '0.78rem'
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto 16px auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveLegalModal('privacy')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>Privacy Policy</button>
            <button onClick={() => setActiveLegalModal('about')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>About CineTrack</button>
            <button onClick={() => setActiveLegalModal('contact')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>Contact Support</button>
          </div>
          <div style={{ lineHeight: '1.5', color: '#64748b', fontSize: '0.72rem' }}>
            <ShieldCheck size={14} color="#38bdf8" style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
            <strong>Affiliate Disclosure:</strong> As an Amazon Associate, CineTrack earns from qualifying purchases.
          </div>
        </div>
        <div>
          Developed and owned by <strong style={{ color: '#f8fafc' }}>anshya</strong> • Powered by TMDB & AdSense
        </div>
      </footer>

      {/* Trailer Modal */}
      {activeTrailer && (
        <div className="modal-overlay" onClick={closeModalsSafely}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '800px', background: '#070b13', borderRadius: '14px', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0f172a' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#f8fafc' }}>{activeTrailer.title} Preview</span>
              <button onClick={closeModalsSafely} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeTrailer.videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
                title="Trailer"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Movie Details Modal */}
      {selectedMovie && !activeTrailer && (
        <div className="modal-overlay" onClick={closeModalsSafely}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModalsSafely} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', color: '#fff', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={15} />
            </button>

            <div className="modal-body">
              <img src={selectedMovie.Poster || SVG_POSTER_PLACEHOLDER} alt={selectedMovie.Title} className="modal-poster" />
              <div className="modal-details">
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ background: '#f5c518', color: '#000', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem' }}>
                    TMDB {selectedMovie.imdbRating}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.76rem' }}>{selectedMovie.Year}</span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>{selectedMovie.Title}</h3>
                <span style={{ color: '#38bdf8', fontSize: '0.74rem', fontWeight: 600 }}>{selectedMovie.Genre}</span>
                <p style={{ color: '#cbd5e1', fontSize: '0.78rem', lineHeight: '1.4' }}>{selectedMovie.Plot}</p>

                {/* Direct OTT Streaming Links */}
                <div style={{ marginTop: '6px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tv size={13} /> OFFICIAL STREAMING & RENTALS
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px' }}>
                    <a href={`https://www.netflix.com/search?q=${encodeURIComponent(selectedMovie.Title)}`} target="_blank" rel="noopener noreferrer" style={{ background: '#e50914', color: '#fff', padding: '5px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>Netflix</a>
                    <a href={`https://www.amazon.in/s?k=${encodeURIComponent(selectedMovie.Title)}&i=instant-video&tag=cinetrack-21`} target="_blank" rel="noopener noreferrer" style={{ background: '#00A8E1', color: '#fff', padding: '5px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>Prime Video</a>
                    <a href={`https://www.google.com/search?q=where+to+watch+${encodeURIComponent(selectedMovie.Title)}+movie`} target="_blank" rel="noopener noreferrer" style={{ background: '#2563eb', color: '#fff', padding: '5px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>Google Watch</a>
                  </div>
                </div>

                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => handlePlayTrailer(selectedMovie)} style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'linear-gradient(90deg, #dc2626, #ef4444)', border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Play size={13} fill="#ffffff" /> Watch Trailer
                  </button>
                  <button onClick={() => toggleWatchlist(selectedMovie)} className="btn-primary" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    {isMovieInWatchlist(selectedMovie.id) ? 'Saved' : 'Watchlist'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legal Modals */}
      {activeLegalModal && (
        <div className="modal-overlay" onClick={closeModalsSafely}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', maxWidth: '500px', width: '92%', padding: '20px', color: '#cbd5e1' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#fff', marginTop: 0 }}>CineTrack Legal Information</h3>
            <p style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>Powered by TMDB API. Participant in Amazon Services LLC Associates Program. User data is saved directly to local browser storage.</p>
            <button onClick={closeModalsSafely} className="btn-primary" style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CineTrackApp />
    </ErrorBoundary>
  );
}
