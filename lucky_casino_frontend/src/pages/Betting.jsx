import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coins, Gamepad2, Star, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Betting = ({ user, setUser }) => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [betResult, setBetResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('/api/betting/games');
        setGames(response.data);
      } catch (err) {
        console.error('게임 목록 불러오기 실패:', err);
        setError('게임 목록을 불러오는 데 실패했습니다.');
      }
    };
    fetchGames();
  }, []);

  const handleBet = async () => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }
    if (!selectedGame) {
      setError('게임을 선택해주세요.');
      return;
    }
    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('유효한 베팅 금액을 입력해주세요.');
      return;
    }
    if (amount < selectedGame.min_bet || amount > selectedGame.max_bet) {
      setError(`베팅 금액은 ${selectedGame.min_bet}원 이상 ${selectedGame.max_bet}원 이하여야 합니다.`);
      return;
    }
    if (amount > user.game_money) {
      setError('보유 게임 머니가 부족합니다.');
      return;
    }

    setError(null);
    setBetResult(null);

    try {
      const response = await axios.post(`/api/betting/bet/${selectedGame.id}`, { amount });
      setBetResult(response.data);
      setUser(prevUser => ({ ...prevUser, game_money: response.data.current_money }));
    } catch (err) {
      console.error('베팅 실패:', err);
      setError(err.response?.data?.message || '베팅에 실패했습니다.');
    }
  };

  const getGameIcon = (gameName) => {
    switch (gameName) {
      case '동전 던지기': return <Coins className="h-6 w-6 text-yellow-400 mr-2" />;
      case '주사위 게임': return <Gamepad2 className="h-6 w-6 text-purple-400 mr-2" />;
      case '럭키 슬롯': return <Star className="h-6 w-6 text-blue-400 mr-2" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white text-center">베팅 게임</h1>
      <p className="text-xl text-gray-300 text-center">보유 게임 머니: {user?.game_money?.toLocaleString()}원</p>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {betResult && (
        <Alert variant={betResult.win ? "success" : "destructive"}>
          {betResult.win ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <AlertTitle>베팅이 완료되었습니다.</AlertTitle>
          <AlertDescription>
            {betResult.win ? (
              <span className="text-green-400">+{betResult.amount}원 승리!</span>
            ) : (
              <span className="text-red-400">-{betResult.amount}원 손실</span>
            )}
            <br />
            현재 보유 머니: {betResult.current_money?.toLocaleString()}원
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {games.map(game => (
          <Card
            key={game.id}
            className={`bg-black/20 border-white/10 text-white cursor-pointer ${selectedGame?.id === game.id ? 'border-2 border-yellow-500' : ''}`}
            onClick={() => {
              setSelectedGame(game);
              setBetAmount('');
              setBetResult(null);
              setError(null);
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                {getGameIcon(game.name)}
                {game.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">{game.description}</p>
              <p className="text-sm text-gray-400">최소 베팅: {game.min_bet}원</p>
              <p className="text-sm text-gray-400">최대 베팅: {game.max_bet}원</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedGame && (
        <Card className="bg-black/20 border-white/10 text-white p-6">
          <CardTitle className="mb-4">{selectedGame.name} 베팅</CardTitle>
          <div className="space-y-4">
            <div>
              <label htmlFor="betAmount" className="block text-gray-300 mb-2">베팅 금액</label>
              <Input
                id="betAmount"
                type="number"
                placeholder={`${selectedGame.min_bet} - ${selectedGame.max_bet}`}
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setBetAmount(selectedGame.min_bet.toString())}>최소</Button>
              <Button variant="outline" onClick={() => setBetAmount((selectedGame.max_bet / 4).toString())}>1/4</Button>
              <Button variant="outline" onClick={() => setBetAmount((selectedGame.max_bet / 2).toString())}>1/2</Button>
              <Button variant="outline" onClick={() => setBetAmount(selectedGame.max_bet.toString())}>최대</Button>
            </div>
            <Button onClick={handleBet} className="w-full bg-green-600 hover:bg-green-700">
              베팅하기
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Betting;

