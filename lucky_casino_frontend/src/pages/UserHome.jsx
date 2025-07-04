import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function UserHome() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = location.state?.user

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500">잘못된 접근입니다. 로그인을 먼저 해주세요.</p>
      </div>
    )
  }

  return (
    <>
      <div className="fixed top-0 right-0 m-4 z-50">
        <button
          onClick={() => navigate('/chargelogin')}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-lg"
        >
          로그아웃
        </button>
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <h2 className="text-2xl font-bold mb-4">{user.name}님 환영합니다!</h2>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/charge', { state: { user } })}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
          >
            충전하기
          </button>
          <button
              onClick={() => navigate('/withdraw', { state: { user } })}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
          >
              출금하기
          </button>
        </div>
      </div>
    </>
  )
}