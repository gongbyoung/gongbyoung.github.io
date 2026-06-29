/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Play, Pause, AlertTriangle, Zap, CheckCircle2, RefreshCw } from 'lucide-react';
import { ChargingStation, Connector, RegisteredCard, ChargingSession } from '../types';

interface ChargingModalProps {
  station: ChargingStation;
  selectedCard: RegisteredCard | null;
  lang: 'ko' | 'en';
  onClose: () => void;
  onChargingComplete: (newSession: ChargingSession) => void;
}

export default function ChargingModal({
  station,
  selectedCard,
  lang,
  onClose,
  onChargingComplete
}: ChargingModalProps) {
  const [selectedConnector, setSelectedConnector] = useState<Connector>(station.connectors[0]);
  const [targetPercent, setTargetPercent] = useState<number>(80);
  const [currentPercent, setCurrentPercent] = useState<number>(32); // Start at mock 32%
  const [chargingStatus, setChargingStatus] = useState<'selecting' | 'charging' | 'paused' | 'completed'>('selecting');
  const [energyDelivered, setEnergyDelivered] = useState<number>(0);
  const [costAccumulated, setCostAccumulated] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Charging progress simulator interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (chargingStatus === 'charging') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        // Calculate progress increments based on charger speed
        // Rapid chargers fill faster
        const percentInc = station.speed >= 300 ? 1.5 : station.speed >= 100 ? 0.8 : 0.4;
        const currentKwhPrice = station.pricePerKwh;

        setCurrentPercent((prev) => {
          const nextVal = Math.min(prev + percentInc, targetPercent);
          if (nextVal >= targetPercent) {
            setChargingStatus('completed');
            if (interval) clearInterval(interval);
            return targetPercent;
          }
          return nextVal;
        });

        // Simulate energy delivery: 0.1 kWh to 0.4 kWh per interval tick
        const kwhInc = (station.speed / 3600) * 12; // simulated accelerated tick
        setEnergyDelivered((prev) => prev + kwhInc);
        setCostAccumulated((prev) => Math.round(prev + kwhInc * currentKwhPrice));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [chargingStatus, targetPercent, station.speed, station.pricePerKwh]);

  // Handle starting the charge flow
  const handleStartCharging = () => {
    setChargingStatus('charging');
  };

  // Finish charging and log into history state
  const handleFinishAndSave = () => {
    const sessionDate = new Date().toISOString().split('T')[0];
    const sessionTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newSession: ChargingSession = {
      id: `ch-sim-${Date.now()}`,
      date: sessionDate,
      time: sessionTime,
      stationId: station.id,
      stationName: station.name,
      stationNameKo: station.nameKo,
      address: station.address,
      energyUsed: parseFloat(energyDelivered.toFixed(1)),
      cost: costAccumulated > 0 ? costAccumulated : 3500, // min charge safe guard
      status: 'Completed',
      plugType: selectedConnector.type
    };

    onChargingComplete(newSession);
  };

  return (
    <div className="fixed inset-0 bg-[#001f2a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#c3c6d2]">
        
        {/* Header bar */}
        <div className="bg-[#002e60] text-white p-5 flex justify-between items-center">
          <div>
            <h3 className="font-display font-bold text-lg">
              {lang === 'ko' ? 'KEPCO 고속 충전 시뮬레이션' : 'Charging Simulator'}
            </h3>
            <p className="text-[10px] opacity-80 font-bold uppercase tracking-wider">
              {lang === 'ko' ? station.nameKo : station.name}
            </p>
          </div>
          {chargingStatus === 'selecting' && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/10 p-1.5 rounded-lg text-sm font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Modal Main Contents */}
        <div className="p-6">
          {chargingStatus === 'selecting' && (
            <div className="space-y-6">
              {/* Selector connector */}
              <div>
                <label className="block text-xs font-bold text-[#001f2a] mb-2">
                  {lang === 'ko' ? '1. 충전 커넥터 규격 선택' : '1. Select Plug Connector'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {station.connectors.map((conn, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedConnector(conn)}
                      className={`p-3 border rounded-xl flex items-center gap-3 transition-all text-left cursor-pointer ${
                        selectedConnector.type === conn.type
                          ? 'bg-[#e6f6ff] border-[#002e60] ring-1 ring-[#002e60]'
                          : 'border-[#c3c6d2] hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#ceedfd] flex items-center justify-center text-[#002e60] text-sm">
                        🔌
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#001f2a]">{conn.type.replace('_', ' ')}</p>
                        <p className="text-[10px] text-[#424751] font-bold">{conn.power}kW Max</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider for target percentage */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#001f2a]">
                    {lang === 'ko' ? '2. 목표 충전량 설정' : '2. Target Charging Limit'}
                  </label>
                  <span className="text-xs font-extrabold text-[#002e60]">{targetPercent}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="5"
                  value={targetPercent}
                  onChange={(e) => setTargetPercent(parseInt(e.target.value))}
                  className="w-full accent-[#002e60]"
                />
                <div className="flex justify-between text-[10px] text-[#424751] font-bold px-1 mt-1">
                  <span>40%</span>
                  <span>80% (Recommended)</span>
                  <span>100% (Full)</span>
                </div>
              </div>

              {/* Payment Card select confirmation */}
              <div className="bg-[#e6f6ff] p-4 rounded-xl border border-[#c3c6d2]">
                <p className="text-[10px] font-extrabold text-[#002e60] uppercase mb-1">
                  {lang === 'ko' ? '결제 예정 요금제 및 카드' : 'Billing Authorization'}
                </p>
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-[#001f2a]">
                      ₩{station.pricePerKwh.toLocaleString()} <span className="text-[10px] text-[#424751]">/ kWh</span>
                    </p>
                    <p className="text-[10px] text-[#424751] font-semibold">
                      {selectedCard ? selectedCard.number : 'No Card Registered'}
                    </p>
                  </div>
                  <span className="bg-[#91f78e] text-[#00731e] px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-tight">
                    Authorized
                  </span>
                </div>
              </div>

              {/* Start Trigger */}
              <button
                onClick={handleStartCharging}
                disabled={!selectedCard}
                className="w-full py-3.5 bg-[#006e1c] hover:bg-[#005313] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-display font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Play size={16} className="fill-current" />
                <span>
                  {lang === 'ko'
                    ? `${selectedConnector.type} 커넥터 연결 및 충전 시작`
                    : `Connect Plug & Start Charging`}
                </span>
              </button>
              {!selectedCard && (
                <p className="text-[10px] text-[#ba1a1a] font-bold text-center">
                  ⚠️ {lang === 'ko' ? '충전을 진행하려면 [지원 및 관리] 탭에서 결제 카드를 먼저 등록해 주세요.' : 'Please register a payment card in the Support tab first.'}
                </p>
              )}
            </div>
          )}

          {/* ACTIVE CHARGING SIMULATION STATE */}
          {(chargingStatus === 'charging' || chargingStatus === 'paused') && (
            <div className="space-y-6 text-center py-4">
              
              {/* Interactive circular battery progress */}
              <div className="relative w-40 h-40 mx-auto">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e6f6ff"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={chargingStatus === 'charging' ? '#006e1c' : '#737782'}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - currentPercent / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>

                {/* Inner percentage metrics */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display font-extrabold text-[#002e60]">
                    {Math.round(currentPercent)}%
                  </span>
                  <span className="text-[9px] font-extrabold text-[#424751] uppercase tracking-wider mt-0.5">
                    {lang === 'ko' ? '목표' : 'Target'}: {targetPercent}%
                  </span>
                </div>

                {/* Pulsing lightning current indicator */}
                {chargingStatus === 'charging' && (
                  <div className="absolute top-2 right-2 bg-[#91f78e] text-[#00731e] w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md animate-bounce">
                    ⚡
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="font-display font-extrabold text-[#001f2a]">
                  {chargingStatus === 'charging'
                    ? (lang === 'ko' ? '⚡ 차량 충전 전력 인가 중' : '⚡ Actively Charging vehicle')
                    : (lang === 'ko' ? '⏸️ 충전 일시 정지됨' : '⏸️ Charging Paused')}
                </p>
                <p className="text-[10px] text-[#424751] font-semibold">
                  {lang === 'ko' ? `현재 출력: ${station.speed}kW (고정형 고압 전류)` : `Current Output: ${station.speed}kW (High-voltage grid)`}
                </p>
              </div>

              {/* Cumulative stats readout */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 border border-[#c3c6d2]/50 p-4 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold text-[#424751] uppercase">
                    {lang === 'ko' ? '충전 공급 전력량' : 'Energy Delivered'}
                  </p>
                  <p className="font-display text-xl font-extrabold text-[#002e60] mt-0.5">
                    {energyDelivered.toFixed(2)} <span className="text-xs font-normal">kWh</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#424751] uppercase">
                    {lang === 'ko' ? '누적 부과 요금' : 'Accumulated Cost'}
                  </p>
                  <p className="font-display text-xl font-extrabold text-[#ba1a1a] mt-0.5">
                    ₩ {costAccumulated.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action toggles */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() =>
                    setChargingStatus(chargingStatus === 'charging' ? 'paused' : 'charging')
                  }
                  className="flex-1 py-3 bg-white border border-[#c3c6d2] text-[#002e60] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {chargingStatus === 'charging' ? (
                    <>
                      <Pause size={14} />
                      <span>{lang === 'ko' ? '일시 정지' : 'Pause'}</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} className="fill-current" />
                      <span>{lang === 'ko' ? '충전 재개' : 'Resume'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setChargingStatus('completed')}
                  className="flex-1 py-3 bg-[#ba1a1a] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-red-700"
                >
                  <AlertTriangle size={14} />
                  <span>{lang === 'ko' ? '충전 수동 종료' : 'Stop Charging'}</span>
                </button>
              </div>
            </div>
          )}

          {/* COMPLETED / BILLING RECEIPT SUMMARY */}
          {chargingStatus === 'completed' && (
            <div className="space-y-5 text-center py-2 animate-fade-in">
              <div className="w-12 h-12 bg-[#91f78e]/30 rounded-full flex items-center justify-center text-[#00731e] mx-auto">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h4 className="font-display font-bold text-lg text-[#002e60]">
                  {lang === 'ko' ? '전기차 고속 충전 완료!' : 'Charging Completed!'}
                </h4>
                <p className="text-xs text-[#424751] mt-1">
                  {lang === 'ko' ? '목표량 수치 도달 및 요금 결제가 완료되었습니다.' : 'Target limits met and secure invoice generated.'}
                </p>
              </div>

              {/* Detailed billing invoice */}
              <div className="bg-gray-50 border border-[#c3c6d2] rounded-xl p-5 text-left font-mono text-xs space-y-2 max-w-sm mx-auto">
                <div className="text-center font-bold border-b border-dashed border-[#c3c6d2] pb-2 text-[#002e60]">
                  KEPCO ELECTRIC VEHICLE CHARGE
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-[#424751]">Station:</span>
                  <span className="font-bold text-[#001f2a]">
                    {lang === 'ko' ? station.nameKo : station.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#424751]">Connector:</span>
                  <span className="font-bold text-[#001f2a]">{selectedConnector.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#424751]">Power Output:</span>
                  <span className="font-bold text-[#001f2a]">{station.speed}kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#424751]">Electricity Tariffs:</span>
                  <span className="font-bold text-[#001f2a]">₩{station.pricePerKwh}/kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#424751]">Energy Charged:</span>
                  <span className="font-bold text-[#001f2a]">{energyDelivered.toFixed(2)} kWh</span>
                </div>
                <div className="border-t border-dashed border-[#c3c6d2] pt-2 flex justify-between font-bold text-sm text-[#ba1a1a]">
                  <span>TOTAL PAID:</span>
                  <span>₩ {costAccumulated.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-[#424751] text-center pt-2 border-t border-dashed border-[#c3c6d2] uppercase">
                  Charged to: {selectedCard?.number}
                </div>
              </div>

              <button
                onClick={handleFinishAndSave}
                className="w-full py-3 bg-[#002e60] hover:bg-[#004488] text-white rounded-xl font-display font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                {lang === 'ko' ? '영수증 닫기 및 기록저장' : 'Finish & Save to History'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
