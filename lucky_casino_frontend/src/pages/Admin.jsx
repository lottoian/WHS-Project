import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Admin({ user }) {
  const navigate = useNavigate()
  const [charges, setCharges] = useState([])
  const [withdraws, setWithdraws] = useState([])
  const [loading, setLoading] = useState(false)

  // 충전/환전 내역 불러오기
  const fetchData = async () => {
    setLoading(true)
    const [chargeRes, withdrawRes] = await Promise.all([
      axios.get('/api/charge/list'),
      axios.get('/api/withdraw/list')
    ])
    setCharges(chargeRes.data)
    setWithdraws(withdrawRes.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // 승인 처리
  const approveCharge = async (id) => {
    await axios.post('/api/charge/approve', { id })
    fetchData()
  }
  const approveWithdraw = async (id) => {
    await axios.post('/api/withdraw/approve', { id })
    fetchData()
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* 충전 신청 내역 */}
      <div className="flex-1 bg-white rounded shadow p-4">
        <h2 className="text-xl font-bold mb-4 text-black">충전 신청 내역</h2>
        <table className="w-full text-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">신청번호</th>
              <th className="p-2 border">사용자명</th>
              <th className="p-2 border">금액</th>
              <th className="p-2 border">상태</th>
              <th className="p-2 border">승인</th>
            </tr>
          </thead>
          <tbody>
            {charges.map(c => (
              <tr key={c.id} className="text-center">
                <td className="p-2 border">{c.id}</td>
                <td className="p-2 border">{c.username}</td>
                <td className="p-2 border">{c.amount.toLocaleString()}원</td>
                <td className="p-2 border">{c.status}</td>
                <td className="p-2 border">
                  {c.status === '승인 완료' ? (
                    <span className="text-gray-400">완료</span>
                  ) : (
                    <button onClick={() => approveCharge(c.id)} className="bg-green-500 text-white px-3 py-1 rounded">승인</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 환전 신청 내역 */}
      <div className="flex-1 bg-white rounded shadow p-4">
        <h2 className="text-xl font-bold mb-4 text-black">환전 신청 내역</h2>
        <table className="w-full text-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">신청번호</th>
              <th className="p-2 border">사용자명</th>
              <th className="p-2 border">금액</th>
              <th className="p-2 border">상태</th>
              <th className="p-2 border">승인</th>
            </tr>
          </thead>
          <tbody>
            {withdraws.map(w => (
              <tr key={w.id} className="text-center">
                <td className="p-2 border">{w.id}</td>
                <td className="p-2 border">{w.username}</td>
                <td className="p-2 border">{w.amount.toLocaleString()}원</td>
                <td className="p-2 border">{w.status}</td>
                <td className="p-2 border">
                  {w.status === '승인 완료' ? (
                    <span className="text-gray-400">완료</span>
                  ) : (
                    <button onClick={() => approveWithdraw(w.id)} className="bg-blue-500 text-white px-3 py-1 rounded">승인</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}