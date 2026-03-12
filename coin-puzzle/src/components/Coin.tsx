import React from 'react';
import { motion } from 'framer-motion';
import type { CoinState } from '../types';

interface CoinProps {
  id: number;
  state: CoinState;
  isSelected: boolean;
  isDraggable: boolean;
  onClick?: () => void;
  className?: string;
}

const Coin: React.FC<CoinProps> = ({
  id,
  state,
  isSelected,
  isDraggable,
  onClick,
  className = ''
}) => {
  const getCoinClasses = () => {
    const baseClass = "coin relative flex items-center justify-center";
    const stateClass = state === 'fake-heavy' ? 'fake-heavy' :
                       state === 'fake-light' ? 'fake-light' :
                       state === 'known-real' ? 'known-real' : '';
    const selectedClass = isSelected ? 'selected' : '';

    return `${baseClass} ${stateClass} ${selectedClass} ${className}`.trim();
  };

  const getCoinContent = () => {
    if (state === 'fake-heavy') return (
      <span className="text-white font-bold text-xl">重</span>
    );
    if (state === 'fake-light') return (
      <span className="text-emerald-900 font-bold text-xl">轻</span>
    );
    return (
      <span className="font-bold text-amber-900">{id}</span>
    );
  };

  const getStateIndicator = () => {
    switch (state) {
      case 'fake-heavy':
        return (
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 border-2 border-slate-900 flex items-center justify-center">
            <span className="text-xs font-bold text-white">重</span>
          </div>
        );
      case 'fake-light':
        return (
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 border-2 border-slate-900 flex items-center justify-center">
            <span className="text-xs font-bold text-white">轻</span>
          </div>
        );
      case 'known-real':
        return (
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-500 border-2 border-slate-900 flex items-center justify-center">
            <span className="text-xs font-bold text-white">真</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getCoinGlow = () => {
    if (state === 'fake-heavy') return 'shadow-[0_0_30px_rgba(239,68,68,0.5)]';
    if (state === 'fake-light') return 'shadow-[0_0_30px_rgba(34,197,94,0.5)]';
    if (isSelected) return 'shadow-[0_0_30px_rgba(59,130,246,0.5)]';
    return '';
  };

  const coinElement = (
    <motion.div
      className={`${getCoinClasses()} ${getCoinGlow()}`}
      onClick={onClick}
      whileHover={isDraggable ? { scale: 1.1, y: -2 } : {}}
      whileTap={isDraggable ? { scale: 0.95 } : {}}
      animate={{
        rotate: isSelected ? [0, 5, -5, 0] : 0,
        y: isSelected ? [0, -5, 0] : 0,
      }}
      transition={{
        duration: 1,
        repeat: isSelected ? Infinity : 0,
        ease: "easeInOut",
      }}
      style={{
        cursor: isDraggable ? 'grab' : 'default',
      }}
    >
      {/* 硬币主体 */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {/* 硬币渐变背景 */}
        <div className="absolute inset-0" style={{
          background: state === 'fake-heavy'
            ? 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 50%, #FF6B6B 100%)'
            : state === 'fake-light'
            ? 'linear-gradient(135deg, #4ADE80 0%, #22C55E 50%, #4ADE80 100%)'
            : 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)'
        }} />

        {/* 硬币内阴影 */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-800/30" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-b from-transparent via-black/10 to-black/20" />

        {/* 硬币边缘高光 */}
        <div className="absolute inset-0 rounded-full border border-amber-300/50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-amber-300/50 to-transparent" />
      </div>

      {/* 硬币中心 */}
      <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-b from-amber-200/30 to-amber-400/20 backdrop-blur-sm">
        {getCoinContent()}
      </div>

      {/* 硬币边缘齿纹 */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i * 360) / 20;
          const radians = (angle * Math.PI) / 180;
          const x = 50 + 45 * Math.cos(radians);
          const y = 50 + 45 * Math.sin(radians);

          return (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-gradient-to-b from-amber-800/60 to-amber-600/40"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        })}
      </div>

      {/* 状态指示器 */}
      {getStateIndicator()}

      {/* 悬浮动画效果 */}
      {isDraggable && (
        <div className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <motion.div
            className="absolute inset-0 border-2 border-blue-400/30 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      )}
    </motion.div>
  );

  // 如果可拖动，包装在拖拽容器中
  if (isDraggable) {
    return coinElement;
  }

  return coinElement;
};

export default Coin;
