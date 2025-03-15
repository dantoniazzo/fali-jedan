import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import Home from '_pages/Home';
import MatchDetails from '_pages/MatchDetails';
import AddMatch from '_pages/AddMatch';
import Login from '_pages/Login';
import Profile from '_pages/Profile';
import { User } from '@supabase/supabase-js';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/match/:id" element={<MatchDetails />} />
          <Route
            path="/add-match"
            element={
              user ? (
                <AddMatch />
              ) : (
                <Navigate to="/login" state={{ redirectTo: '/add-match' }} />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              user ? (
                <Profile />
              ) : (
                <Navigate to="/login" state={{ redirectTo: '/profile' }} />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
