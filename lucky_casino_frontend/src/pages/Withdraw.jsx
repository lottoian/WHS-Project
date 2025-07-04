import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Withdraw() {
  const location = useLocation()
  const user = location.state?.user
  const [amount, setAmount] = useState(0)
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [showModal, setShowModal] = useState(false)
  const presetAmounts = [10000, 30000, 50000, 100000]
  const navigate = useNavigate()

  const handlePresetClick = (val) => {
    setAmount(val)
  }

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value) || 0
    setAmount(value)
  }

  const handleSubmit = () => {
    if (amount <= 0) {
      alert('금액을 입력해주세요.')
      return
    }
    setShowModal(true)
  }

  const handleConfirmWithdraw = async () => {
    if (!bankName || !accountNumber) {
      alert('은행명과 계좌번호를 모두 입력해주세요.')
      return
    }

    try {
      const res = await axios.post('http://localhost:5000/withdraw/request', {
        user_id: user.user_id,
        amount,
        bank_name: bankName,
        account_number: accountNumber,
      })

      if (res.data.status === 'ok') {
        alert('출금 신청이 완료되었습니다. 관리자가 확인 후 승인할 예정입니다.')
        setShowModal(false)
        navigate('/dashboard', { state: { user } })
      } else {
        alert('신청에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (err) {
      alert('오류가 발생했습니다.')
      console.error(err)
    }
  }

  const closeModal = () => {
    setShowModal(false)
  }

  if (!user) {
    return <p className="text-center text-red-500 mt-10">사용자 정보가 없습니다. 다시 로그인해주세요.</p>
  }

  return (
    <div className="p-6 max-w-md mx-auto relative">
      <h2 className="text-2xl font-bold mb-4">{user.name}님, 출금하실 금액을 선택하세요</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {presetAmounts.map((val) => (
          <button
            key={val}
            onClick={() => handlePresetClick(val)}
            className={`p-3 rounded border ${amount === val ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            {val.toLocaleString()}원
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="직접 입력 (원)"
          value={amount}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, '')
            setAmount(val === '' ? 0 : parseInt(val))
          }}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          출금 신청
        </button>
      </div>

      {/* 출금 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">출금 안내</h3>
            <p className="mb-1">
              <strong>{user.name}</strong>님, 출금하실 은행명과 계좌번호를 아래에 입력해주세요.
              수수료 10%를 제외한 금액이 입금되며, 출금 신청 후 최대 3일 이내 처리됩니다.
            </p>
            <input
              type="text"
              placeholder="은행명"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />
            <input
              type="text"
              placeholder="계좌번호"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded">
                닫기
              </button>
              <button onClick={handleConfirmWithdraw} className="bg-blue-600 text-white px-4 py-2 rounded">
                출금 신청
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}