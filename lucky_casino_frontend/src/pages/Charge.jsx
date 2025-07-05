import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Charge({ user }) {
  const [amount, setAmount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const presetAmounts = [10000, 30000, 50000, 100000]
  const fakeAccountNumber = '3333-44-555555' // 예시 계좌
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

  const handleConfirmDeposit = async () => {
  try {
    const res = await axios.post('http://localhost:5000/charge/request', {
      user_id: user.user_id,
      depositor_name: user.name,
      amount: amount
    })

    if (res.data.status === 'ok') {
      alert('입금 신청이 완료되었습니다. 관리자가 확인 후 승인할 예정입니다.')
      setShowModal(false)
      navigate('/')
    } else {
      alert('신청에 실패했습니다. 다시 시도해주세요.');
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
      <h2 className="text-2xl font-bold mb-4">{user.name}님, 충전하실 금액을 선택하세요</h2>

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
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          충전 신청
        </button>
      </div>

      {/* 계좌번호 및 안내문 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm">
            <h3 className="text-lg font-bold mb-2">충전 안내</h3>
            <p className="mb-1">
              <strong>{user.name}</strong>님, 아래 계좌로 <strong>{amount.toLocaleString()}원</strong>을 입금해주세요.
              가입하셨던 명의로 입금해주시고 '입금 신청' 버튼을 눌러주시면 확인 후 충전해드립니다.
            </p>
            <p className="mb-4 text-blue-700 font-semibold">{fakeAccountNumber}</p>
            <button
              onClick={closeModal}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              닫기
            </button>
            <button
                onClick={handleConfirmDeposit}
                className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
            >
                입금 신청
            </button>
          </div>
        </div>
      )}
    </div>
  )
}