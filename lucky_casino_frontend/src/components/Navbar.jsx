import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
import axios from 'axios';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃에 실패했습니다.');
    }
  };

  return (
    <nav className="bg-black/20 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/10">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-2xl font-bold text-white">
          Lucky Casino
        </Link>
        <div className="hidden md:flex space-x-4">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors">
            홈
          </Link>
          <Link to="/board/notice" className="text-gray-300 hover:text-white transition-colors">
            공지사항
          </Link>
          <Link to="/board/free" className="text-gray-300 hover:text-white transition-colors">
            자유게시판
          </Link>
          {user && (
            <Link to="/betting" className="text-gray-300 hover:text-white transition-colors">
              게임
            </Link>
          )}
          {user && (
            <Link to="/profile" className="text-gray-300 hover:text-white transition-colors">
              프로필
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <div className="flex items-center text-white text-lg font-semibold">
              <Coins className="h-5 w-5 text-yellow-400 mr-1" />
              {user.game_money?.toLocaleString()}원
            </div>
            <Button onClick={handleLogout} variant="outline" className="text-white border-white/20 hover:bg-white/10">
              로그아웃
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                로그인
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                회원가입
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

