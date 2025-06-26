import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Gamepad2, Coins, User, Mail, CalendarDays, TrendingUp, Settings, Lock, LogOut, Trophy, Award, Clock, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Profile = ({ user }) => {
  const [bettingHistory, setBettingHistory] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('betting'); // 'betting' or 'transaction'

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, activeTab]);

  const fetchHistory = async () => {
    try {
      if (activeTab === 'betting') {
        const response = await axios.get('/api/profile/betting-history');
        setBettingHistory(response.data);
      } else {
        const response = await axios.get('/api/profile/transaction-history');
        setTransactionHistory(response.data);
      }
    } catch (error) {
      console.error('내역 불러오기 실패:', error);
    }
  };

  if (!user) {
    return <div className="text-center text-white text-xl">로그인이 필요합니다.</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white text-center">프로필</h1>

      <Card className="bg-black/20 border-white/10 text-white p-6">
        <CardHeader>
          <CardTitle className="mb-4">사용자 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-400" />
            <span>사용자명:</span>
            <span className="font-semibold">{user.username}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-400" />
            <span>보유 게임 머니:</span>
            <span className="font-semibold text-yellow-400">{user.game_money?.toLocaleString()}원</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-gray-400" />
            <span>이메일:</span>
            <span className="font-semibold">{user.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-gray-400" />
            <span>가입일:</span>
            <span className="font-semibold">{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4 mb-6">
        <Button
          onClick={() => setActiveTab('betting')}
          variant={activeTab === 'betting' ? 'default' : 'outline'}
          className={activeTab === 'betting' ? 'bg-purple-600 hover:bg-purple-700' : 'text-white border-white/20 hover:bg-white/10'}
        >
          <Gamepad2 className="h-4 w-4 mr-2" />
          베팅 기록
        </Button>
        <Button
          onClick={() => setActiveTab('transaction')}
          variant={activeTab === 'transaction' ? 'default' : 'outline'}
          className={activeTab === 'transaction' ? 'bg-purple-600 hover:bg-purple-700' : 'text-white border-white/20 hover:bg-white/10'}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          거래 내역
        </Button>
      </div>

      <Card className="bg-black/20 border-white/10 text-white p-6">
        <CardHeader>
          <CardTitle className="mb-4">
            {activeTab === 'betting' ? '최근 베팅 활동 내역' : '게임 머니 거래 내역'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === 'betting' ? (
            bettingHistory.length === 0 ? (
              <p className="text-center text-gray-400">베팅 기록이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {bettingHistory.map((record) => (
                  <div key={record.id} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-md">
                    <div>
                      <p className="font-semibold">{record.game_name}</p>
                      <p className="text-sm text-gray-400">{new Date(record.bet_time).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p>베팅: {record.bet_amount?.toLocaleString()}원</p>
                      <p className={record.win ? 'text-green-400' : 'text-red-400'}>
                        {record.win ? `+${record.profit_loss?.toLocaleString()}원 승리` : `${record.profit_loss?.toLocaleString()}원 손실`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            transactionHistory.length === 0 ? (
              <p className="text-center text-gray-400">거래 내역이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {transactionHistory.map((record) => (
                  <div key={record.id} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-md">
                    <div>
                      <p className="font-semibold">{record.type === 'deposit' ? '입금' : '출금'}</p>
                      <p className="text-sm text-gray-400">{new Date(record.transaction_time).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={record.type === 'deposit' ? 'text-green-400' : 'text-red-400'}>
                        {record.type === 'deposit' ? '+' : '-'}{record.amount?.toLocaleString()}원
                      </p>
                      <p className="text-sm text-gray-400">잔액: {record.current_balance?.toLocaleString()}원</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;


