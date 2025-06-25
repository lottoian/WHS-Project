import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle } from 'lucide-react';

const Board = ({ user }) => {
  const { type } = useParams(); // 'notice' or 'free'
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [error, setError] = useState(null);

  const boardTitle = type === 'notice' ? '공지사항' : '자유게시판';

  useEffect(() => {
    fetchPosts();
  }, [type]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`/api/board/${type}`);
      setPosts(response.data);
      setError(null);
    } catch (err) {
      console.error(`게시글 불러오기 실패 (${type}):`, err);
      setError('게시글을 불러오는 데 실패했습니다.');
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }
    if (!newPostTitle || !newPostContent) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      await axios.post(`/api/board/${type}`, {
        title: newPostTitle,
        content: newPostContent,
      });
      setNewPostTitle('');
      setNewPostContent('');
      fetchPosts();
      setError(null);
    } catch (err) {
      console.error('게시글 작성 실패:', err);
      setError(err.response?.data?.message || '게시글 작성에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white text-center">{boardTitle}</h1>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {user && (
        <Card className="bg-black/20 border-white/10 text-white p-6">
          <CardTitle className="mb-4">새 글 작성</CardTitle>
          <div className="space-y-4">
            <Input
              placeholder="제목"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Textarea
              placeholder="내용"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Button onClick={handleCreatePost} className="w-full bg-blue-600 hover:bg-blue-700">
              글쓰기
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-gray-400">아직 게시글이 없습니다.</p>
        ) : (
          posts.map(post => (
            <Card
              key={post.id}
              className="bg-black/20 border-white/10 text-white cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <p className="text-sm text-gray-400">작성자: {post.username} | {new Date(post.created_at).toLocaleString()}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{post.content.substring(0, 100)}...</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <Card className="bg-black/90 border-white/10 text-white p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {selectedPost.title}
                <Button variant="ghost" onClick={() => setSelectedPost(null)} className="text-white">
                  X
                </Button>
              </CardTitle>
              <p className="text-sm text-gray-400">작성자: {selectedPost.username} | {new Date(selectedPost.created_at).toLocaleString()}</p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 whitespace-pre-wrap">{selectedPost.content}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Board;

