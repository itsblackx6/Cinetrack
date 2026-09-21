import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Check, Star, Search, Film, X, Bookmark, 
  GraduationCap, RefreshCw, Eye, AlertCircle, Play, 
  Shuffle, CheckCircle2, Trash2, ExternalLink, Download, 
  ArrowUpDown, Tv
} from 'lucide-react';
import './App.css';

const API_KEY = 'b9bd48a6';

const GENRE_TAGS = ['All', 'Sci-Fi', 'Action', 'Adventure', 'Drama', 'Animation', 'Horror'];

// Default high-quality cinema placeholder for broken/missing posters
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop';

// Helper function to ensure reliable posters
const getValidPoster = (posterUrl, title) => {
  if (!posterUrl || posterUrl === 'N/A' || !posterUrl.startsWith('http')) {
    const t = title?.toLowerCase() || '';
    if (t.includes('interstellar')) return 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg';
    if (t.includes('oppenheimer')) return 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg';
    if (t.includes('fast') || t.includes('f9')) return 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop';
    if (t.includes('black clover')) return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop';
    if (t.includes('dark knight')) return 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg';
    if (t.includes('inception')) return 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg';
    if (t.includes('wrong turn')) return 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop';
    return FALLBACK_POSTER;
  }
  return posterUrl;
};

// Verified trailer IDs for instant in-app popups
const VERIFIED_TRAILERS = {
  "tt0816692": "zSWdZVtXT7E", // Interstellar
  "tt15398776": "uYPbbksJxIg", // Oppenheimer
  "tt5433180": "aSiDu3Ywi8E",  // F9
  "tt22678604": "M-JD8QqStBg", // Black Clover: Sword of the Wizard King
  "tt0468569": "EXeTwQWrcwY",  // The Dark Knight
  "tt1375666": "YoHD9XEInc0",   // Inception
  "tt0295700": "9lIUi6xWflg"   // Wrong Turn
};

// Curated Where-to-Watch Streaming Platform mappings
const STREAMING_PLATFORMS = {
  "tt0816692": [
    { name: "Prime Video", color: "#00a8e1", url: "https://www.primevideo.com" },
    { name: "JioCinema", color: "#e11d48", url: "https://www.jiocinema.com" }
  ],
  "tt15398776": [
    { name: "JioCinema", color: "#e11d48", url: "https://www.jiocinema.com" },
    { name: "Prime Video", color: "#00a8e1", url: "https://www.primevideo.com" }
  ],
  "tt5433180": [
    { name: "Netflix", color: "#e50914", url: "https://www.netflix.com" },
    { name: "Prime Video", color: "#00a8e1", url: "https://www.primevideo.com" }
  ],
  "tt22678604": [
    { name: "Netflix", color: "#e50914", url: "https://www.netflix.com" }
  ],
  "tt0468569": [
    { name: "Prime Video", color: "#00a8e1", url: "https://www.primevideo.com" },
    { name: "JioCinema", color: "#e11d48", url: "https://www.jiocinema.com" }
  ],
  "tt1375666": [
    { name: "Netflix", color: "#e50914", url: "https://www.netflix.com" },
    { name: "Prime Video", color: "#00a8e1", url: "https://www.primevideo.com" }
  ],
  "tt0295700": [
    { name: "Prime Video", color: "#00a8e1", url: "https://www.primevideo.com" }
  ]
};

const INITIAL_POPULAR = [
  {
    Title: "Interstellar",
    Year: "2014",
    imdbRating: "8.7",
    imdbID: "tt0816692",
    Poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop",
    Plot: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    Genre: "Adventure, Drama, Sci-Fi",
    Actors: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
    Director: "Christopher Nolan",
    Released: "07 Nov 2014",
    Runtime: "169 min"
  },
  {
    Title: "Oppenheimer",
    Year: "2023",
    imdbRating: "8.9",
    imdbID: "tt15398776",
    Poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1200&auto=format&fit=crop",
    Plot: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    Genre: "Biography, Drama, History",
    Actors: "Cillian Murphy, Emily Blunt, Matt Damon",
    Director: "Christopher Nolan",
    Released: "21 Jul 2023",
    Runtime: "180 min"
  },
  {
    Title: "F9: The Fast Saga",
    Year: "2021",
    imdbRating: "5.2",
    imdbID: "tt5433180",
    Poster: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop",
    Plot: "Dom and the crew must take on an international terrorist who turns out to be Dom and Mia's estranged brother.",
    Genre: "Action, Adventure, Crime",
    Actors: "Vin Diesel, Michelle Rodriguez, John Cena",
    Director: "Justin Lin",
    Released: "25 Jun 2021",
    Runtime: "143 min"
  },
  {
    Title: "Black Clover: Sword of the Wizard King",
    Year: "2023",
    imdbRating: "7.4",
    imdbID: "tt22678604",
    Poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop",
    Plot: "In a world where magic is everything, Asta, a boy who was born with no magic, aims to become the Wizard King.",
    Genre: "Animation, Action, Adventure",
    Actors: "Gakuto Kajiwara, Nobunaga Shimazaki, Jun'ichi Suwabe",
    Director: "Ayataka Tanemura",
    Released: "16 Jun 2023",
    Runtime: "113 min"
  },
  {
    Title: "The Dark Knight",
    Year: "2008",
    imdbRating: "9.0",
    imdbID: "tt0468569",
    Poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop",
    Plot: "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological and physical tests.",
    Genre: "Action, Crime, Drama",
    Actors: "Christian Bale, Heath Ledger, Aaron Eckhart",
    Director: "Christopher Nolan",
    Released: "18 Jul 2008",
    Runtime: "152 min"
  },
  {
    Title: "Inception",
    Year: "2010",
    imdbRating: "8.8",
    imdbID: "tt1375666",
    Poster: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
    backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    Plot: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
    Genre: "Action, Adventure, Sci-Fi",
    Actors: "Leonardo DiCaprio, Joseph Gordon-Levitt",
    Director: "Christopher Nolan",
    Released: "16 Jul 2010",
    Runtime: "148 min"
  }
];

export default function App() {
  const [movies, setMovies] = useState(INITIAL_POPULAR);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeTrailer, setActiveTrailer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('explore');
  const [watchlistFilter, setWatchlistFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  const featuredMovie = INITIAL_POPULAR[featuredIndex] || INITIAL_POPULAR[0];

  // Crash-proof Watchlist stored in LocalStorage
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('cinetracker_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cinetracker_watchlist', JSON.stringify(watchlist));
    } catch (err) {
      console.error("Storage write failed:", err);
    }
  }, [watchlist]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleNextHero = () => {
    setFeaturedIndex((prev) => (prev + 1) % INITIAL_POPULAR.length);
  };

  // Worldwide live search with API fallback
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setMovies(INITIAL_POPULAR);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSelectedGenre('All');
    
    try {
      const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${API_KEY}`);
      const data = await res.json();

      if (data.Response === 'True' && data.Search) {
        const fullDetails = await Promise.all(
          data.Search.slice(0, 8).map(async (item) => {
            try {
              const itemRes = await fetch(`https://www.omdbapi.com/?i=${item.imdbID}&apikey=${API_KEY}`);
              const itemData = await itemRes.json();
              return itemData.Response === 'True' ? itemData : item;
            } catch {
              return item;
            }
          })
        );
        setMovies(fullDetails);
      } else {
        const localMatches = INITIAL_POPULAR.filter(
          (m) => m.Title.toLowerCase().includes(query) || m.Genre?.toLowerCase().includes(query)
        );
        setMovies(localMatches);
        if (localMatches.length === 0) {
          setErrorMessage(`No movies found matching "${searchQuery}". Showing local catalog.`);
        }
      }
    } catch (err) {
      const localMatches = INITIAL_POPULAR.filter((m) => m.Title.toLowerCase().includes(query));
      setMovies(localMatches);
      setErrorMessage("Network issue detected. Displaying local cache safely.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setSortBy('default');
    setMovies(INITIAL_POPULAR);
    setErrorMessage(null);
  };

  const toggleWatchlist = (movie) => {
    const exists = watchlist.some((m) => m.imdbID === movie.imdbID);
    if (exists) {
      setWatchlist(watchlist.filter((m) => m.imdbID !== movie.imdbID));
      showToast(`Removed "${movie.Title}"`);
    } else {
      setWatchlist([...watchlist, { ...movie, userStatus: 'Plan to Watch', personalRating: 0 }]);
      showToast(`Added "${movie.Title}" to Watchlist!`);
    }
  };

  const updateStatus = (imdbID, newStatus) => {
    setWatchlist(
      watchlist.map((m) => (m.imdbID === imdbID ? { ...m, userStatus: newStatus } : m))
    );
    showToast(`Status: ${newStatus}`);
  };

  const setUserRating = (imdbID, rating) => {
    setWatchlist(
      watchlist.map((m) => (m.imdbID === imdbID ? { ...m, personalRating: rating } : m))
    );
    showToast(`Rated ${rating} Star${rating > 1 ? 's' : ''}!`);
  };

  const isMovieInWatchlist = (imdbID) => watchlist.some((m) => m.imdbID === imdbID);

  // Watchlist Export Feature (JSON Backup File)
  const exportWatchlist = () => {
    if (watchlist.length === 0) {
      showToast("Watchlist is empty! Add movies first.");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(watchlist, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cinetrack_watchlist_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Watchlist backup downloaded!");
  };

  // Watchlist Statistics Calculation
  const stats = useMemo(() => {
    const total = watchlist.length;
    const completed = watchlist.filter(m => m.userStatus === 'Completed').length;
    const ratings = watchlist.map(m => parseFloat(m.imdbRating)).filter(r => !isNaN(r));
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';
    return { total, completed, avgRating };
  }, [watchlist]);

  // Combined Filter & Sorting Logic
  const displayedMovies = useMemo(() => {
    let list = activeTab === 'explore'
      ? movies.filter((m) => {
          if (selectedGenre === 'All') return true;
          return m.Genre?.toLowerCase().includes(selectedGenre.toLowerCase());
        })
      : watchlist.filter((m) => (watchlistFilter === 'All' ? true : m.userStatus === watchlistFilter));

    if (sortBy === 'rating') {
      list = [...list].sort((a, b) => (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0));
    } else if (sortBy === 'year') {
      list = [...list].sort((a, b) => (parseInt(b.Year) || 0) - (parseInt(a.Year) || 0));
    } else if (sortBy === 'title') {
      list = [...list].sort((a, b) => a.Title.localeCompare(b.Title));
    }

    return list;
  }, [activeTab, movies, watchlist, selectedGenre, watchlistFilter, sortBy]);

  // Bulletproof Smart Trailer Handler
  const handlePlayTrailer = (movie) => {
    const videoId = VERIFIED_TRAILERS[movie.imdbID];
    if (videoId) {
      setActiveTrailer({ type: 'embed', videoId, title: movie.Title });
    } else {
      setActiveTrailer({ 
        type: 'external', 
        title: movie.Title, 
        year: movie.Year, 
        poster: getValidPoster(movie.Poster, movie.Title) 
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', background: '#0b0f19', color: '#f8fafc' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #38bdf8',
          boxShadow: '0 8px 24px rgba(56, 189, 248, 0.25)',
          color: '#f8fafc',
          padding: '10px 18px',
          borderRadius: '30px',
          zIndex: 160,
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#38bdf8" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="navbar">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Film size={20} color="#38bdf8" />
          <span>CineTracker</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
              fontSize: '0.85rem'
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
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Bookmark size={14} />
            Watchlist ({watchlist.length})
          </button>

          {/* Student Credit Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '4px 8px',
              borderRadius: '20px',
              fontSize: '0.7rem',
              color: '#7dd3fc',
              fontWeight: 600
            }}
          >
            <GraduationCap size={13} color="#38bdf8" />
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
              backgroundImage: `url(${
                featuredMovie.backdrop ||
                'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop'
              })`
            }}
          >
            <div className="hero-overlay">
              <div className="hero-content">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: '#f5c518',
                      color: '#000',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem'
                    }}
                  >
                    IMDb {featuredMovie.imdbRating}
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {featuredMovie.Year}
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {featuredMovie.Genre}
                  </span>
                </div>

                <h1 className="hero-title">{featuredMovie.Title}</h1>
                <p className="hero-overview">{featuredMovie.Plot}</p>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={() => setSelectedMovie(featuredMovie)}>
                    <Eye size={16} /> View Details
                  </button>
                  <button
                    onClick={() => toggleWatchlist(featuredMovie)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isMovieInWatchlist(featuredMovie.imdbID) ? (
                      <>
                        <Check size={16} color="#4ade80" /> In Watchlist
                      </>
                    ) : (
                      <>
                        <Plus size={16} /> Add to Watchlist
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleNextHero}
                    title="Next Highlight"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem'
                    }}
                  >
                    <Shuffle size={14} /> Next
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Watchlist Analytics Quick Stats Bar */}
        {activeTab === 'watchlist' && (
          <div style={{
            marginTop: '1.2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            background: 'rgba(21, 28, 47, 0.6)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Saved</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>{stats.total}</div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Completed</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4ade80' }}>{stats.completed}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Avg IMDb</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f5c518' }}>{stats.avgRating}</div>
            </div>
          </div>
        )}

        {/* Live Search Bar */}
        {activeTab === 'explore' && (
          <form onSubmit={handleSearch} className="search-wrapper">
            <div className="search-input-box">
              <Search size={18} color="#38bdf8" />
              <input
                type="text"
                placeholder="Search worldwide (e.g. Star Wars, Batman, Oppenheimer)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary">
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
        )}

        {/* Genre Chips & Sort Row (Explore Tab) */}
        {activeTab === 'explore' && (
          <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', flex: 1 }}>
              {GENRE_TAGS.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    border: selectedGenre === genre ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: selectedGenre === genre ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedGenre === genre ? '#38bdf8' : '#94a3b8',
                    fontWeight: selectedGenre === genre ? 700 : 500,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Sorting Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={14} color="#94a3b8" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: '#151c2f',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="default">Default</option>
                <option value="rating">Top Rated</option>
                <option value="year">Newest First</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {errorMessage && (
          <div style={{
            marginTop: '1rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '10px 14px',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} color="#f87171" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Watchlist Filter Buttons & Action Tools */}
        {activeTab === 'watchlist' && (
          <div style={{ marginTop: '1.2rem', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['All', 'Plan to Watch', 'Watching', 'Completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setWatchlistFilter(status)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    border: watchlistFilter === status ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: watchlistFilter === status ? '#38bdf8' : 'rgba(255, 255, 255, 0.05)',
                    color: watchlistFilter === status ? '#0b0f19' : '#cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={exportWatchlist}
                title="Export list as JSON"
                style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#7dd3fc',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Download size={13} /> Export
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
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={13} /> Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Movies Grid */}
        <section style={{ marginTop: '1.5rem' }}>
          <h2 className="section-title">
            <Film size={18} color="#38bdf8" />
            {activeTab === 'explore'
              ? searchQuery
                ? `Results for "${searchQuery}"`
                : selectedGenre !== 'All' 
                  ? `${selectedGenre} Cinema` 
                  : 'Trending Cinema'
              : `My Watchlist (${displayedMovies.length})`}
          </h2>

          {displayedMovies.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 1rem',
                color: '#94a3b8',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: '1px dashed rgba(255,255,255,0.1)'
              }}
            >
              <p style={{ fontSize: '1rem', marginBottom: '8px', color: '#f1f5f9' }}>
                {activeTab === 'explore'
                  ? `No titles found under selected parameters.`
                  : 'No titles saved under this category yet.'}
              </p>
              {activeTab === 'explore' && (
                <div style={{ marginTop: '16px' }}>
                  <button
                    onClick={clearSearch}
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px', margin: '0 auto' }}
                  >
                    <RefreshCw size={14} /> Reset Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="card-grid" 
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}
            >
              {displayedMovies.map((movie) => {
                const posterImg = getValidPoster(movie.Poster, movie.Title);
                return (
                  <div
                    key={movie.imdbID || Math.random()}
                    className="movie-card"
                    onClick={() => setSelectedMovie(movie)}
                    style={{
                      background: '#151c2f',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div className="rating-badge" style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: 'rgba(11, 15, 25, 0.85)',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#fff',
                      zIndex: 2
                    }}>
                      <Star size={11} fill="#fbbf24" color="#fbbf24" />
                      <span>{movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : '7.5'}</span>
                    </div>

                    <img
                      src={posterImg}
                      alt={movie.Title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_POSTER;
                      }}
                      style={{ width: '100%', height: '170px', objectFit: 'cover' }}
                      referrerPolicy="no-referrer"
                    />

                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {movie.Title}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.73rem', marginTop: '2px' }}>
                          {movie.Year} • {movie.Type ? movie.Type.toUpperCase() : 'MOVIE'}
                        </div>
                      </div>

                      {/* Watchlist Rating & Status Tools */}
                      {activeTab === 'watchlist' && (
                        <div style={{ margin: '6px 0 2px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                            {[1, 2, 3, 4, 5].map((starVal) => (
                              <Star
                                key={starVal}
                                size={12}
                                onClick={() => setUserRating(movie.imdbID, starVal)}
                                fill={(movie.personalRating || 0) >= starVal ? "#fbbf24" : "none"}
                                color={(movie.personalRating || 0) >= starVal ? "#fbbf24" : "#475569"}
                                style={{ cursor: 'pointer' }}
                              />
                            ))}
                          </div>
                          <select
                            value={movie.userStatus || 'Plan to Watch'}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateStatus(movie.imdbID, e.target.value)}
                            style={{
                              background: '#0b0f19',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              borderRadius: '4px',
                              padding: '1px 4px',
                              fontSize: '0.65rem',
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
                            padding: '5px 6px',
                            borderRadius: '5px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: isMovieInWatchlist(movie.imdbID)
                              ? 'rgba(74, 222, 128, 0.15)'
                              : 'rgba(255, 255, 255, 0.05)',
                            color: isMovieInWatchlist(movie.imdbID) ? '#4ade80' : '#fff',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '3px'
                          }}
                        >
                          {isMovieInWatchlist(movie.imdbID) ? (
                            <>
                              <Check size={12} /> Saved
                            </>
                          ) : (
                            <>
                              <Plus size={12} /> Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '16px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(11, 15, 25, 0.9)',
          color: '#94a3b8',
          fontSize: '0.8rem'
        }}
      >
        Project Developed by <strong style={{ color: '#38bdf8' }}>Anshu Maurya</strong> • TY BCA
      </footer>

      {/* Robust Smart Trailer Modal Player */}
      {activeTrailer && (
        <div 
          className="modal-overlay" 
          onClick={() => setActiveTrailer(null)}
          style={{ zIndex: 140, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}
        >
          <div 
            style={{ 
              position: 'relative', 
              width: '92%', 
              maxWidth: '740px', 
              aspectRatio: activeTrailer.type === 'embed' ? '16/9' : 'auto', 
              background: '#0b0f19', 
              borderRadius: '14px', 
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: activeTrailer.type === 'external' ? '28px 20px' : '0'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveTrailer(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255,255,255,0.1)',
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
              <X size={18} />
            </button>

            {activeTrailer.type === 'embed' ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeTrailer.videoId}?autoplay=1`}
                title={`${activeTrailer.title} Trailer`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <img 
                  src={activeTrailer.poster} 
                  alt={activeTrailer.title} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_POSTER;
                  }}
                  style={{ width: '110px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }} 
                />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
                    {activeTrailer.title}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, maxWidth: '420px' }}>
                    Watch official trailer safely on YouTube without playback restrictions.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const query = encodeURIComponent(`${activeTrailer.title} ${activeTrailer.year || ''} official trailer`);
                    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank', 'noopener,noreferrer');
                  }}
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <Play size={16} fill="#fff" /> Launch Official Trailer <ExternalLink size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Details Popup Modal (with WHERE TO WATCH streaming section) */}
      {selectedMovie && !activeTrailer && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedMovie(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={16} />
            </button>

            <div className="modal-body">
              <img
                src={getValidPoster(selectedMovie.Poster, selectedMovie.Title)}
                alt={selectedMovie.Title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_POSTER;
                }}
                className="modal-poster"
                referrerPolicy="no-referrer"
              />

              <div className="modal-details">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span
                    style={{
                      background: '#f5c518',
                      color: '#000',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem'
                    }}
                  >
                    IMDb {selectedMovie.imdbRating || 'N/A'}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{selectedMovie.Year}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{selectedMovie.Runtime || '120 min'}</span>
                </div>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{selectedMovie.Title}</h3>
                <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>
                  {selectedMovie.Genre || 'Action, Drama'}
                </span>

                <p style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: '1.4' }}>
                  {selectedMovie.Plot && selectedMovie.Plot !== 'N/A'
                    ? selectedMovie.Plot
                    : 'No synopsis available.'}
                </p>

                <div
                  style={{
                    fontSize: '0.78rem',
                    color: '#94a3b8',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div>
                    <strong style={{ color: '#e2e8f0' }}>Cast:</strong> {selectedMovie.Actors || 'N/A'}
                  </div>
                  <div>
                    <strong style={{ color: '#e2e8f0' }}>Director:</strong> {selectedMovie.Director || 'N/A'}
                  </div>
                </div>

                {/* Where to Watch (Streaming Providers Section) */}
                <div style={{ marginTop: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                    <Tv size={14} /> WHERE TO WATCH (STREAMING)
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {STREAMING_PLATFORMS[selectedMovie.imdbID] ? (
                      STREAMING_PLATFORMS[selectedMovie.imdbID].map((platform) => (
                        <a
                          key={platform.name}
                          href={platform.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: platform.color,
                            color: '#fff',
                            textDecoration: 'none',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          {platform.name} <ExternalLink size={11} />
                        </a>
                      ))
                    ) : (
                      <>
                        <a
                          href={`https://www.google.com/search?q=watch+${encodeURIComponent(selectedMovie.Title)}+online`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#2563eb',
                            color: '#fff',
                            textDecoration: 'none',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          Find Streaming on Google <ExternalLink size={11} />
                        </a>
                        <a
                          href={`https://www.justwatch.com/in/search?q=${encodeURIComponent(selectedMovie.Title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f59e0b',
                            color: '#000',
                            textDecoration: 'none',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          JustWatch <ExternalLink size={11} />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions: Watchlist Toggle + Safe Trailer */}
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleWatchlist(selectedMovie)}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {isMovieInWatchlist(selectedMovie.imdbID) ? (
                      <>
                        <Check size={16} color="#4ade80" /> Remove from Watchlist
                      </>
                    ) : (
                      <>
                        <Plus size={16} /> Add to Watchlist
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handlePlayTrailer(selectedMovie)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: '#ef4444',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Play size={15} fill="#ffffff" /> Watch Trailer
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