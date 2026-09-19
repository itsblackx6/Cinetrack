import { useState, useEffect } from 'react';

function App() {
  const [movies, setMovies] = useState(() => {
    const saved = localStorage.getItem('cinetrack_movies');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 1,
        title: 'Inception',
        genre: 'Sci-Fi',
        status: 'Watched',
        rating: 5,
        poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg'
      },
      {
        id: 2,
        title: 'Interstellar',
        genre: 'Sci-Fi',
        status: 'Plan to Watch',
        rating: 4,
        poster: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_.jpg'
      },
      {
        id: 3,
        title: 'The Dark Knight',
        genre: 'Action',
        status: 'Watched',
        rating: 5,
        poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg'
      }
    ];
  });

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [poster, setPoster] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    localStorage.setItem('cinetrack_movies', JSON.stringify(movies));
  }, [movies]);

  const handleAddMovie = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMovie = {
      id: Date.now(),
      title: title.trim(),
      genre: genre.trim() || 'General',
      status: 'Plan to Watch',
      rating: 0,
      poster: poster.trim()
    };

    setMovies([newMovie, ...movies]);
    setTitle('');
    setGenre('');
    setPoster('');
  };

  const handleDelete = (id) => {
    setMovies(movies.filter((movie) => movie.id !== id));
  };

  const toggleStatus = (id) => {
    setMovies(
      movies.map((movie) =>
        movie.id === id
          ? { ...movie, status: movie.status === 'Watched' ? 'Plan to Watch' : 'Watched' }
          : movie
      )
    );
  };

  const setRating = (id, rating) => {
    setMovies(
      movies.map((movie) => (movie.id === id ? { ...movie, rating } : movie))
    );
  };

  const filteredMovies = movies.filter((m) => {
    const matchesFilter = filter === 'All' ? true : m.status === filter;
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.genre.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const watchedCount = movies.filter((m) => m.status === 'Watched').length;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>🎬 CineTrack</h1>
          <p style={styles.subtitle}>Curate your cinematic journey</p>
          <div style={styles.stats}>
            <span>Total: <strong>{movies.length}</strong></span>
            <span>Watched: <strong>{watchedCount}</strong></span>
            <span>Pending: <strong>{movies.length - watchedCount}</strong></span>
          </div>
        </header>

        {/* Live Search Bar */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="🔍 Search movie by title or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Add Movie Form */}
        <form onSubmit={handleAddMovie} style={styles.form}>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <input
              type="text"
              placeholder="Movie title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              style={{ ...styles.input, maxWidth: '120px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '8px' }}>
            <input
              type="url"
              placeholder="Poster image URL (optional)"
              value={poster}
              onChange={(e) => setPoster(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.addBtn}>+ Add</button>
          </div>
        </form>

        {/* Status Filters */}
        <div style={styles.filterRow}>
          {['All', 'Plan to Watch', 'Watched'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                ...styles.filterBtn,
                backgroundColor: filter === tab ? '#6366f1' : '#0f172a',
                color: '#ffffff',
                border: filter === tab ? '1px solid #818cf8' : '1px solid #334155',
                opacity: filter === tab ? 1 : 0.75
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Movies List */}
        <ul style={styles.list}>
          {filteredMovies.length === 0 ? (
            <li style={styles.empty}>No movies found.</li>
          ) : (
            filteredMovies.map((movie) => (
              <li key={movie.id} style={styles.listItem}>
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    style={styles.posterImg}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}

                {/* Stylish Fallback Box agar photo fail ho ya na ho */}
                <div
                  style={{
                    ...styles.posterFallback,
                    display: movie.poster ? 'none' : 'flex'
                  }}
                >
                  🎥
                </div>

                <div style={{ flex: 1 }}>
                  <div style={styles.movieTitle}>{movie.title}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <span style={styles.genreBadge}>{movie.genre}</span>
                    <div style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() => setRating(movie.id, star)}
                          style={{
                            cursor: 'pointer',
                            color: star <= (movie.rating || 0) ? '#f59e0b' : '#475569',
                            fontSize: '0.95rem'
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={styles.actionGroup}>
                  <button
                    onClick={() => toggleStatus(movie.id)}
                    style={{
                      ...styles.statusBtn,
                      backgroundColor: movie.status === 'Watched' ? '#064e3b' : '#78350f',
                      borderColor: movie.status === 'Watched' ? '#10b981' : '#f59e0b',
                      color: movie.status === 'Watched' ? '#6ee7b7' : '#fcd34d'
                    }}
                  >
                    {movie.status === 'Watched' ? '✓ Watched' : '⏳ Plan'}
                  </button>
                  <button
                    onClick={() => handleDelete(movie.id)}
                    style={styles.deleteBtn}
                    title="Delete Movie"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#090d16',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '30px 16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#f8fafc',
    boxSizing: 'border-box'
  },
  card: {
    width: '100%',
    maxWidth: '580px',
    backgroundColor: '#111827',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.7)',
    border: '1px solid #1f2937'
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: '800'
  },
  subtitle: {
    margin: '6px 0 14px 0',
    color: '#9ca3af',
    fontSize: '0.85rem'
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: '#090d16',
    padding: '10px 16px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    color: '#cbd5e1',
    border: '1px solid #1f2937'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '20px'
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #374151',
    backgroundColor: '#090d16',
    color: '#f8fafc',
    fontSize: '0.85rem',
    outline: 'none'
  },
  addBtn: {
    padding: '10px 20px',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px'
  },
  filterBtn: {
    flex: 1,
    padding: '9px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 14px',
    backgroundColor: '#161f30',
    borderRadius: '10px',
    border: '1px solid #1f2937'
  },
  posterImg: {
    width: '46px',
    height: '64px',
    objectFit: 'cover',
    borderRadius: '6px',
    backgroundColor: '#1e293b'
  },
  posterFallback: {
    width: '46px',
    height: '64px',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #374151, #1f2937)',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem'
  },
  movieTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#f9fafb'
  },
  genreBadge: {
    fontSize: '0.72rem',
    backgroundColor: '#1f2937',
    color: '#9ca3af',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  starRow: {
    display: 'inline-flex',
    gap: '2px',
    userSelect: 'none'
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statusBtn: {
    border: '1px solid',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.05rem',
    cursor: 'pointer',
    opacity: 0.8
  },
  empty: {
    textAlign: 'center',
    padding: '24px',
    color: '#64748b',
    fontSize: '0.9rem'
  }
};

export default App;