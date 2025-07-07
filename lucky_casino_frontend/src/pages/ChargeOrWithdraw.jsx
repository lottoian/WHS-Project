import React, { useState } from 'react';
import axios from 'axios';

const PRESET_AMOUNTS = [5000, 10000, 30000, 50000, 100000];

export default function ChargeOrWithdraw({ user }) {
  const [tab, setTab] = useState('charge');
  const [chargeAmount, setChargeAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // 충전 금액 버튼 클릭
  const handleChargeAdd = (val) => setChargeAmount(prev => prev + val);
  // 환전 금액 버튼 클릭
  const handleWithdrawAdd = (val) => setWithdrawAmount(prev => prev + val);
  // 리셋
  const resetCharge = () => setChargeAmount(0);
  const resetWithdraw = () => setWithdrawAmount(0);

  // 충전 요청
  const handleCharge = async () => {
    if (chargeAmount <= 0) return alert('금액을 입력하세요.');
    setShowChargeModal(true);
  };
  const confirmCharge = async () => {
    setLoading(true);
    try {
      await axios.post('/api/charge/request', {
        username: user.username,
        amount: chargeAmount
      });
      alert('충전 신청 완료!');
      setChargeAmount(0);
      setShowChargeModal(false);
    } catch (e) {
      alert('충전 신청 실패');
    } finally {
      setLoading(false);
    }
  };

  // 환전 요청
  const handleWithdraw = async () => {
    if (withdrawAmount <= 0) return alert('금액을 입력하세요.');
    if (!withdrawAccount) return alert('계좌번호를 입력하세요.');
    setShowWithdrawModal(true);
  };
  const confirmWithdraw = async () => {
    setLoading(true);
    try {
      await axios.post('/api/withdraw/request', {
        username: user.username,
        amount: withdrawAmount,
        account_number: withdrawAccount
      });
      alert('환전 신청 완료!');
      setWithdrawAmount(0);
      setWithdrawAccount('');
      setShowWithdrawModal(false);
    } catch (e) {
      alert('환전 신청 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      {/* 미니 메뉴바 */}
      <div className="flex mb-6">
        <button
          className={`flex-1 py-2 rounded-t-lg font-bold ${tab === 'charge' ? 'bg-white text-black' : 'bg-gray-200 text-gray-500'}`}
          onClick={() => setTab('charge')}
        >충전</button>
        <button
          className={`flex-1 py-2 rounded-t-lg font-bold ${tab === 'withdraw' ? 'bg-white text-black' : 'bg-gray-200 text-gray-500'}`}
          onClick={() => setTab('withdraw')}
        >환전</button>
      </div>

      {/* 충전 탭 */}
      {tab === 'charge' && (
        <div className="bg-white p-6 rounded-b-lg shadow">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {PRESET_AMOUNTS.map(val => (
              <button
                key={val}
                onClick={() => handleChargeAdd(val)}
                className="p-2 border rounded text-black bg-gray-100 hover:bg-blue-100"
              >
                {val.toLocaleString()}원
              </button>
            ))}
            <button onClick={resetCharge} className="p-2 border rounded text-black bg-gray-200">리셋</button>
          </div>
          <div className="mb-4 text-black">합계: <span className="font-bold">{chargeAmount.toLocaleString()}원</span></div>
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-black"
            onClick={handleCharge}
            disabled={loading}
          >충전</button>
        </div>
      )}

      {/* 환전 탭 */}
      {tab === 'withdraw' && (
        <div className="bg-white p-6 rounded-b-lg shadow">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {PRESET_AMOUNTS.map(val => (
              <button
                key={val}
                onClick={() => handleWithdrawAdd(val)}
                className="p-2 border rounded text-black bg-gray-100 hover:bg-blue-100"
              >
                {val.toLocaleString()}원
              </button>
            ))}
            <button onClick={resetWithdraw} className="p-2 border rounded text-black bg-gray-200">리셋</button>
          </div>
          <div className="mb-2 text-black">합계: <span className="font-bold">{withdrawAmount.toLocaleString()}원</span></div>
          <input
            type="text"
            placeholder="내 계좌번호"
            value={withdrawAccount}
            onChange={e => setWithdrawAccount(e.target.value)}
            className="w-full p-2 border rounded mb-4 text-black"
          />
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-black"
            onClick={handleWithdraw}
            disabled={loading}
          >환전</button>
        </div>
      )}

      {/* 충전 안내 모달 */}
      {showChargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm">
            <h3 className="text-lg font-bold mb-2 text-black">충전 안내</h3>
            <p className="mb-1 text-black">
              아래 계좌로 <strong>{chargeAmount.toLocaleString()}원</strong>을 입금해주세요.<br />
              입금 후 "충전" 버튼을 눌러주세요.
            </p>
            <p className="mb-4 text-blue-700 font-semibold">3333-44-555555</p>
            <button
              onClick={() => setShowChargeModal(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            >닫기</button>
            <button
              onClick={confirmCharge}
              className="bg-green-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >충전</button>
          </div>
        </div>
      )}

      {/* 환전 안내 모달 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm">
            <h3 className="text-lg font-bold mb-2 text-black">환전 신청</h3>
            <p className="mb-1 text-black">
              <strong>{withdrawAmount.toLocaleString()}원</strong>을 <br />
              계좌번호 <strong>{withdrawAccount}</strong>로 환전 신청합니다.
            </p>
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            >닫기</button>
            <button
              onClick={confirmWithdraw}
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >환전</button>
          </div>
        </div>
      )}
    </div>
  );
} 