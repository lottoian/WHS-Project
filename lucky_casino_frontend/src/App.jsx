import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Board from './pages/Board';
import Betting from './pages/Betting';
import Profile from './pages/Profile';
import ChargeOrWithdraw from './pages/ChargeOrWithdraw';
import Admin from './pages/Admin';
import './App.css';

// Axios 기본 설정
axios.defaults.withCredentials = true; // CORS 문제 해결을 위해 필요

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log('App 렌더링됨, user:', user);

  useEffect(() => {
    console.log('user:', user);
  }, [user]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get('/api/auth/check-session');
        if (response.data.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('세션 확인 실패:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-white">로딩 중...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white">
        <Navbar user={user} setUser={setUser} />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/board/:type" element={<Board user={user} />} />
            <Route path="/betting" element={<Betting user={user} setUser={setUser} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/chargeorwithdraw" element={<ChargeOrWithdraw user={user} />} />
            <Route path="/approval-process" element={<Admin user={user} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

