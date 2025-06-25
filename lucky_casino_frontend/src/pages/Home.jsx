import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Coins,
  Gamepad2,
  MessageSquare,
  TrendingUp,
  Users,
  Star
} from 'lucide-react';

const Home = ({ user }) => {
  return (
    <div className="space-y-8">
      {/* 히어로 섹션 */}
      <div className="text-center py-16">
        <h1 className="text-6xl font-bold text-white mb-4">
          Welcome to <span className="text-yellow-400">Lucky Casino</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          포렌식 연구를 위한 모의 도박 사이트입니다.
          안전한 환경에서 게임 머니로 다양한 베팅 게임을 즐겨보세요.
        </p>
        {!user && (
          <div className="space-x-4">
            <Link to="/register">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                지금 시작하기
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                로그인
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 특징 카드들 */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-black/20 border-white/10 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="h-6 w-6 text-yellow-400 mr-2" />
              게임 머니 시스템
            </CardTitle>
            <CardDescription className="text-gray-300">
              실제 돈이 아닌 가상의 게임 머니로 안전하게 베팅
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              회원가입 시 10,000원의 게임 머니를 지급받아 바로 게임을 시작할 수 있습니다.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gamepad2 className="h-6 w-6 text-purple-400 mr-2" />
              다양한 게임
            </CardTitle>
            <CardDescription className="text-gray-300">
              동전 던지기, 주사위, 슬롯 등 다양한 베팅 게임
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              간단한 확률 게임부터 복잡한 전략 게임까지 다양한 선택지를 제공합니다.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-6 w-6 text-blue-400 mr-2" />
              커뮤니티
            </CardTitle>
            <CardDescription className="text-gray-300">
              공지사항과 자유게시판을 통한 소통
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              다른 사용자들과 정보를 공유하고 게임 전략을 논의해보세요.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 사용자 대시보드 */}
      {user && (
        <div className="bg-black/20 backdrop-blur-md rounded-lg p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">
            안녕하세요, {user.username}님!
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {user.game_money?.toLocaleString()}원
              </div>
              <div className="text-gray-300">보유 게임 머니</div>
            </div>
            <Link to="/betting" className="block">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Gamepad2 className="h-4 w-4 mr-2" />
                게임 하러 가기
              </Button>
            </Link>
            <Link to="/profile" className="block">
              <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10">
                <TrendingUp className="h-4 w-4 mr-2" />
                거래 내역 보기
              </Button>
            </Link>
            <Link to="/board/free" className="block">
              <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10">
                <Users className="h-4 w-4 mr-2" />
                커뮤니티 참여
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 게임 미리보기 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-8">인기 게임</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Coins className="h-8 w-8 text-yellow-400 mr-2" />
                동전 던지기
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                앞면이 나오면 승리! 50% 확률로 2배 지급
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-yellow-400">
                <Star className="h-4 w-4" />
                <span>최소 베팅: 100원</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Gamepad2 className="h-8 w-8 text-purple-400 mr-2" />
                주사위 게임
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                짝수가 나오면 승리! 50% 확률로 2배 지급
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-purple-400">
                <Star className="h-4 w-4" />
                <span>최소 베팅: 200원</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Star className="h-8 w-8 text-blue-400 mr-2" />
                럭키 슬롯
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                운이 좋으면 승리! 50% 확률로 2배 지급
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-400">
                <Star className="h-4 w-4" />
                <span>최소 베팅: 500원</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;


