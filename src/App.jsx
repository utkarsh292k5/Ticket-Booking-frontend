import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Customer pages
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import ShowSelection from './pages/ShowSelection';
import SeatSelection from './pages/SeatSelection';
import Payment from './pages/Payment';
import BookingConfirmation from './pages/BookingConfirmation';
import UserBookings from './pages/UserBookings';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MovieManagement from './pages/admin/MovieManagement';
import TheatreManagement from './pages/admin/TheatreManagement';
import ShowManagement from './pages/admin/ShowManagement';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    const location = useLocation();

    if (!user) {
      // Save the attempted URL so we can redirect after login
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (adminOnly && user.role !== 'ADMIN') {
      return <Navigate to="/" />;
    }

    return children;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />

      {/* Customer routes */}
      <Route path="/" element={<Home />} />
      <Route path="/movies/:id" element={<MovieDetails />} />
      <Route path="/movies/:movieId/shows" element={<ShowSelection />} />

      {/* Protected customer routes */}
      <Route
        path="/booking/show/:showId/seats"
        element={
          <ProtectedRoute>
            <SeatSelection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/:bookingId"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/confirmation/:bookingId"
        element={
          <ProtectedRoute>
            <BookingConfirmation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <UserBookings />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/movies"
        element={
          <ProtectedRoute adminOnly>
            <MovieManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/theatres"
        element={
          <ProtectedRoute adminOnly>
            <TheatreManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/shows"
        element={
          <ProtectedRoute adminOnly>
            <ShowManagement />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;