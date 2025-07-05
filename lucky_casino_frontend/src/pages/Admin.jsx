import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Admin({ user }) {
  const navigate = useNavigate()
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [users, setUsers] = useState([])
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    name: '',
    account_number: '',
    balance: 0
  })
  const [editingUserId, setEditingUserId] = useState(null)
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    name: '',
    account_number: '',
    balance: 0
  })
  const [searchKeyword, setSearchKeyword] = useState('')

  const fetchDeposits = async () => {
    const res = await axios.get('http://localhost:5000/admin/deposits')
    setDeposits(res.data)
  }

  const fetchWithdrawals = async () => {
    const res = await axios.get('http://localhost:5000/admin/withdrawals')
    setWithdrawals(res.data)
  }

  const fetchStats = async () => {
    const res = await axios.get('http://localhost:5000/admin/stats')
    setStats(res.data)
  }

  const fetchHistory = async () => {
    const res = await axios.get('http://localhost:5000/admin/history')
    setHistory(res.data)
  }

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5000/admin/users')
    setUsers(res.data)
  }

  const handleApproveDeposit = async (id) => {
    await axios.post('http://localhost:5000/charge/approve', { request_id: id })
    fetchDeposits()
    fetchStats()
    fetchHistory()
  }

  const handleApproveWithdrawal = async (id) => {
    await axios.post('http://localhost:5000/withdraw/approve', { request_id: id })
    fetchWithdrawals()
    fetchStats()
    fetchHistory()
  }

  const handleAddUser = async () => {
    const { username, email, name, account_number } = newUser
    if (!username || !email || !name || !account_number) return alert('모든 항목은 필수입니다.')

    await axios.post('http://localhost:5000/admin/users', newUser)
    setNewUser({
      username: '',
      email: '',
      name: '',
      account_number: '',
      balance: 0
    })
    fetchUsers()
    fetchStats()
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm(`${id}번 사용자를 삭제할까요?`)) return
    await axios.delete(`http://localhost:5000/admin/users/${id}`)
    fetchUsers()
    fetchStats()
  }

  const handleEditClick = (user) => {
    setEditingUserId(user.id)
    setEditForm({
      username: user.username,
      email: user.email,
      name: user.name,
      account_number: user.account_number,
      balance: user.balance
    })
  }

  const handleSaveEdit = async () => {
    await axios.patch(`http://localhost:5000/admin/users/${editingUserId}`, editForm)
    setEditingUserId(null)
    fetchUsers()
    fetchStats()
  }

  const handleSearch = async () => {
  try {
    const res = await axios.get('http://localhost:5000/admin/users', {
      params: { keyword: searchKeyword }
    })
    console.log('검색 결과:', res.data)
    setUsers(res.data)
  } catch (err) {
    console.error('검색 실패:', err)
  }
}

  useEffect(() => {
    fetchDeposits()
    fetchWithdrawals()
    fetchStats()
    fetchHistory()
    fetchUsers()
  }, [])

  return (
    <div className="h-screen p-4 bg-gray-100 relative"> 
      <div className="fixed top-0 right-0 m-4 z-50">
        <button
          onClick={() => navigate('/')}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-lg"
        >
          홈으로
        </button>
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">

        {/* 관리자 통계 */}
        <div className="bg-white rounded shadow p-4 overflow-auto min-h-0">
          <h2 className="text-xl font-semibold mb-2">관리자 통계</h2>
          {stats && (
            <>
              <p>총 입금 금액: {stats.total_deposit.toLocaleString()}원</p>
              <p>총 출금 금액: {stats.total_withdraw.toLocaleString()}원</p>
              <p>전체 잔액 합계: {stats.total_balance.toLocaleString()}원</p>
              <p>전체 사용자 수: {stats.user_count}명</p>
            </>
          )}
        </div>


      {/* 입금 요청 */}
      <div className="bg-white rounded shadow p-4 overflow-auto min-h-0">
        <h2 className="text-xl font-semibold mb-2">입금 요청</h2>
        <table className="w-full border mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">이름</th>
              <th className="p-2 border">금액</th>
              <th className="p-2 border">상태</th>
              <th className="p-2 border">일자</th>
              <th className="p-2 border">승인</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((item) => (
              <tr key={`deposit-${item.id}`} className="text-center">
                <td className="p-2 border">{item.id}</td>
                <td className="p-2 border">{item.depositor_name}</td>
                <td className="p-2 border">{item.amount.toLocaleString()}원</td>
                <td className="p-2 border">{item.status}</td>
                <td className="p-2 border">{item.created_at.split('T')[0]}</td>
                <td className="p-2 border">
                  {item.status === 'pending' ? (
                    <button
                      onClick={() => handleApproveDeposit(item.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      승인
                    </button>
                  ) : (
                    <span className="text-gray-400">완료</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 출금 요청 */}
      <div className="bg-white rounded shadow p-4 overflow-auto min-h-0">
        <h2 className="text-xl font-semibold mb-2">출금 요청</h2>
        <table className="w-full border mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">계좌번호</th>
              <th className="p-2 border">은행</th>
              <th className="p-2 border">금액</th>
              <th className="p-2 border">상태</th>
              <th className="p-2 border">일자</th>
              <th className="p-2 border">승인</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((item) => (
              <tr key={`withdrawal-${item.id}`} className="text-center">
                <td className="p-2 border">{item.id}</td>
                <td className="p-2 border">{item.account_number}</td>
                <td className="p-2 border">{item.bank_name}</td> {/* 추가 */}
                <td className="p-2 border">{item.amount.toLocaleString()}원</td>
                <td className="p-2 border">{item.status}</td>
                <td className="p-2 border">{item.created_at.split('T')[0]}</td>
                <td className="p-2 border">
                  {item.status === 'pending' ? (
                    <button
                      onClick={() => handleApproveWithdrawal(item.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      승인
                    </button>
                  ) : (
                    <span className="text-gray-400">완료</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*사용자 관리*/}
      <div className="bg-white rounded shadow p-4 overflow-auto min-h-0">
        <h2 className="text-xl font-bold mb-2">사용자 관리</h2>

      {/*사용자 등록 입력창*/}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="아이디"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="email"
          placeholder="이메일"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="이름"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="계좌번호"
          value={newUser.account_number}
          onChange={(e) => setNewUser({ ...newUser, account_number: e.target.value })}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="초기 잔액"
          value={newUser.balance}
          onChange={(e) => setNewUser({ ...newUser, balance: parseInt(e.target.value || 0) })}
          className="p-2 border rounded appearance-none"
        />
        <button
          onClick={handleAddUser}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          사용자 등록
      </button>
    </div>

    {/*검색 입력창*/}
    <div className="mb-4 flex gap-2">
      <input
        type="text"
        placeholder="이름, 아이디, 이메일 검색"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        className="p-2 border rounded w-64"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-3 py-2 rounded"
      >
        검색
      </button>
    </div>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">아이디</th>
              <th className="p-2 border">이메일</th>
              <th className="p-2 border">이름</th>
              <th className="p-2 border">계좌번호</th>
              <th className="p-2 border">잔액</th>
              <th className="p-2 border">관리</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="p-2 border">{user.id}</td>
                {editingUserId === user.id ? (
                  <>
                    <td className="p-2 border"><input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} /></td>
                    <td className="p-2 border"><input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></td>
                    <td className="p-2 border"><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                    <td className="p-2 border"><input value={editForm.account_number} onChange={(e) => setEditForm({ ...editForm, account_number: e.target.value })} /></td>
                    <td className="p-2 border"><input type="number" value={editForm.balance} onChange={(e) => setEditForm({ ...editForm, balance: parseInt(e.target.value || 0) })} className="appearance-none" /></td>
                    <td className="p-2 border">
                      <button onClick={handleSaveEdit} className="bg-blue-500 text-white px-2 py-1 rounded">저장</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2 border">{user.username}</td>
                    <td className="p-2 border">{user.email}</td>
                    <td className="p-2 border">{user.name}</td>
                    <td className="p-2 border">{user.account_number}</td>
                    <td className="p-2 border">{user.balance.toLocaleString()}원</td>
                    <td className="p-2 border flex gap-2 justify-center">
                      <button onClick={() => handleEditClick(user)} className="bg-yellow-400 px-2 py-1 rounded text-sm">수정</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 text-white px-2 py-1 rounded text-sm">삭제</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 이력 */}
      <div className="bg-white rounded shadow p-4 overflow-auto min-h-0">
        <h2 className="text-xl font-semibold mb-2">입출금 전체 이력</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">구분</th>
              <th className="p-2 border">아이디</th>
              <th className="p-2 border">이름/계좌</th>
              <th className="p-2 border">금액</th>
              <th className="p-2 border">상태</th>
              <th className="p-2 border">시간</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr key={`log-${idx}`} className="text-center">
                <td className="p-2 border">{item.type}</td>
                <td className="p-2 border">{item.username}</td>
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border">{item.amount.toLocaleString()}원</td>
                <td className="p-2 border">{item.status}</td>
                <td className="p-2 border">{item.created_at.split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  )
}