import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"


export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/login', {
        username,
        password,
      })

      if (res.data.status === 'ok') {
        setError(null)
        if (username === 'admin') {
          navigate('/admin', { state: { user: res.data } })
        } else {
          navigate('/dashboard', { state: { user: res.data } })
        }
      } else {
        setError('로그인 실패')
      }
    } catch (err) {
      setError('아이디 또는 비밀번호가 잘못되었습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-lg w-[90%] max-w-sm text-white">
        <h2 className="text-2xl font-bold text-center mb-2">로그인</h2>
        <p className="text-sm text-center text-gray-400 mb-6">
          Lucky Casino 계정으로 로그인하세요.
        </p>

        <div className="mb-4">
          <label className="text-sm mb-1 block">사용자 이름</label>
          <input
            type="text"
            placeholder="사용자 이름을 입력하세요"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm mb-1 block">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-md transition"
        >
          로그인
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}

        <p className="text-sm text-center text-gray-400 mt-6">
          계정이 없으신가요?{' '}
          <Link to="/register" className="text-orange-400 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}