import React from 'react';
import { motion } from 'framer-motion';
import type { ScaleResult } from '../types';

interface ScaleBeamProps {
  result: ScaleResult | null;
  isWeighing: boolean;
}

const ScaleBeam: React.FC<ScaleBeamProps> = ({ result, isWeighing }) => {
  const getBeamRotation = () => {
    if (!result || !isWeighing) return 0;
    if (result === 'left-heavy') return 5;  // 左倾
    if (result === 'right-heavy') return -5; // 右倾
    return 0; // 平衡
  };

  const getPlateColors = () => {
    if (!result || !isWeighing) return { left: '', right: '' };

    if (result === 'left-heavy') return {
      left: 'bg-gradient-to-b from-blue-500 to-blue-700',
      right: 'bg-gradient-to-b from-slate-600 to-slate-800'
    };

    if (result === 'right-heavy') return {
      left: 'bg-gradient-to-b from-slate-600 to-slate-800',
      right: 'bg-gradient-to-b from-red-500 to-red-700'
    };

    return {
      left: 'bg-gradient-to-b from-green-500 to-green-700',
      right: 'bg-gradient-to-b from-green-500 to-green-700'
    };
  };

  const getResultText = () => {
    if (!result) return '等待称量结果';
    switch (result) {
      case 'left-heavy': return '左边较重';
      case 'right-heavy': return '右边较重';
      case 'balanced': return '平衡';
    }
  };

  const getResultColor = () => {
    if (!result) return 'text-slate-400';
    switch (result) {
      case 'left-heavy': return 'text-blue-400';
      case 'right-heavy': return 'text-red-400';
      case 'balanced': return 'text-green-400';
    }
  };

  const plateColors = getPlateColors();

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* 天平顶部连接点 */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-8 h-8">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full" />
        <div className="absolute inset-1 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full" />
      </div>

      {/* 天平梁 */}
      <motion.div
        className="relative scale-beam mt-8"
        style={{
          width: '100%',
          transformOrigin: 'center center',
        }}
        animate={{
          rotate: getBeamRotation(),
          scale: isWeighing ? 1.02 : 1,
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
        }}
      >
        {/* 梁的装饰效果 */}
        <div className="absolute inset-0 flex items-center">
          <div className="flex-1 h-1 bg-gradient-to-r from-gray-600 via-gray-300 to-gray-600 rounded-full" />
        </div>

        {/* 悬挂线 */}
        <div className="absolute left-1/4 top-0 -translate-x-1/2 w-1 h-12 bg-gradient-to-b from-gray-400 to-gray-600" />
        <div className="absolute right-1/4 top-0 translate-x-1/2 w-1 h-12 bg-gradient-to-b from-gray-400 to-gray-600" />
      </motion.div>

      {/* 左右盘子 */}
      <div className="flex justify-between items-start mt-20">
        {/* 左盘 */}
        <motion.div
          className={`relative w-48 h-48 scale-plate ${plateColors.left} ${
            result === 'left-heavy' && isWeighing ? 'active-left' : ''
          }`}
          animate={{
            y: isWeighing && result === 'left-heavy' ? [0, -5, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: isWeighing && result === 'left-heavy' ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          <div className="absolute inset-2 rounded-xl bg-gradient-to-b from-black/10 to-transparent" />
          <span className="text-lg font-bold text-white">左盘</span>

          {/* 盘子挂线 */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-2 h-12 bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-full" />
        </motion.div>

        {/* 右盘 */}
        <motion.div
          className={`relative w-48 h-48 scale-plate ${plateColors.right} ${
            result === 'right-heavy' && isWeighing ? 'active-right' : ''
          }`}
          animate={{
            y: isWeighing && result === 'right-heavy' ? [0, -5, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: isWeighing && result === 'right-heavy' ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          <div className="absolute inset-2 rounded-xl bg-gradient-to-b from-black/10 to-transparent" />
          <span className="text-lg font-bold text-white">右盘</span>

          {/* 盘子挂线 */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-2 h-12 bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-full" />
        </motion.div>
      </div>

      {/* 结果指示器 */}
      <motion.div
        className={`absolute left-1/2 -bottom-12 -translate-x-1/2 text-2xl font-bold ${getResultColor()}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: isWeighing ? 1 : 0.5,
          y: isWeighing ? 0 : 10,
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-slate-700">
          <div className={`w-3 h-3 rounded-full ${
            result === 'left-heavy' ? 'bg-blue-400 animate-pulse' :
            result === 'right-heavy' ? 'bg-red-400 animate-pulse' :
            result === 'balanced' ? 'bg-green-400 animate-pulse' : 'bg-slate-500'
          }`} />
          {getResultText()}
        </div>
      </motion.div>

      {/* 称量动画效果 */}
      {isWeighing && (
        <>
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            {/* 光线效果 */}
            <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />
            <div className="absolute right-1/4 top-1/2 translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/20 blur-3xl rounded-full" />
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ScaleBeam;
