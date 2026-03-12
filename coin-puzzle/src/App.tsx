import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, RefreshCw, ChevronRight, Info, Target, HelpCircle } from 'lucide-react';
import ScaleBeam from './components/ScaleBeam';
import Coin from './components/Coin';
import { useCoinGame } from './hooks/useCoinGame';

function App() {
  const {
    gameState,
    isWeighing,
    resetGame,
    toggleCoinSelection,
    selectPlate,
    placeCoinOnPlate,
    startWeighing,
    advanceToNextStep,
    revealAnswer,
  } = useCoinGame();

  const [showInstructions, setShowInstructions] = useState(true);
  const [activeTab, setActiveTab] = useState<'game' | 'explain'>('game');

  const currentWeighing = gameState.currentStep > 0
    ? gameState.weighings[gameState.currentStep - 1]
    : null;

  const getStepInstructions = () => {
    switch (gameState.currentStep) {
      case 0:
        return "点击硬币选中它们，然后选择左盘或右盘放置";
      case 1:
        return "根据第一次称量结果，放置硬币进行第二次称量";
      case 2:
        return "进行第三次称量确定假币";
      case 3:
        return "恭喜！你已经找到假币";
      default:
        return "";
    }
  };

  const getStepButton = () => {
    if (gameState.status === 'completed') {
      return (
        <button type="button" className="btn-secondary" onClick={resetGame}>
          <RefreshCw className="w-4 h-4 mr-2" />
          重新开始
        </button>
      );
    }

    if (gameState.currentStep === 0) {
      return (
        <button type="button"
          className="btn-primary"
          onClick={() => advanceToNextStep()}
          disabled={!currentWeighing || (currentWeighing.leftSide.length === 0 && currentWeighing.rightSide.length === 0)}
        >
          开始第一次称量
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      );
    }

    if (gameState.currentStep < 3) {
      return (
        <div className="flex gap-3">
          <button type="button"
            className="btn-primary"
            onClick={() => startWeighing(gameState.currentStep)}
            disabled={
              isWeighing ||
              !currentWeighing ||
              (currentWeighing.leftSide.length === 0 && currentWeighing.rightSide.length === 0)
            }
          >
            <Scale className="w-4 h-4 mr-2" />
            开始称量
          </button>
          {!isWeighing && currentWeighing?.result && (
            <button type="button"
              className="btn-secondary"
              onClick={() => advanceToNextStep()}
            >
              下一步
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      );
    }

    if (gameState.currentStep === 3) {
      return (
        <button type="button"
          className="btn-primary"
          onClick={() => startWeighing(3)}
          disabled={isWeighing}
        >
          <Scale className="w-4 h-4 mr-2" />
          第三次称量
        </button>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* 顶部导航栏 */}
      <nav className="relative z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Scale className="w-6 h-6 text-amber-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">硬币称量之谜</h1>
                <p className="text-sm text-slate-400">12枚硬币，3次称量，找出假币</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'game'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  onClick={() => setActiveTab('game')}
                >
                  游戏
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'explain'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  onClick={() => setActiveTab('explain')}
                >
                  解法说明
                </button>
              </div>

              <button
                className="info-badge flex items-center gap-2"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <Info className="w-4 h-4" />
                说明
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <AnimatePresence>
          {showInstructions && activeTab === 'game' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">🎯 游戏规则</h3>
                  <ul className="text-slate-300 space-y-1 list-disc list-inside">
                    <li>12枚硬币中有一枚假币，可能是<strong className="text-red-400">重了</strong>或<strong className="text-green-400">轻了</strong></li>
                    <li>使用天平进行<strong className="text-yellow-400">3次称量</strong>找出假币</li>
                    <li>每次称量可以选择硬币放在左盘或右盘</li>
                    <li>根据称量结果推断假币的位置和轻重</li>
                  </ul>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'game' ? (
          <>
            {/* 进度指示器 */}
            <div className="mb-10">
              <div className="flex justify-center items-center gap-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-8">
                    <div className="flex flex-col items-center">
                      <div className={`
                        step-indicator
                        ${gameState.currentStep >= step ? 'active' : ''}
                        ${gameState.currentStep > step ? 'completed' : ''}
                      `}>
                        {gameState.currentStep > step ? '✓' : step}
                      </div>
                      <span className="mt-2 text-sm text-slate-400">
                        第{step}次称量
                      </span>
                    </div>
                    {step < 3 && (
                      <div className="w-16 h-1 bg-slate-700 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 游戏说明 */}
            <div className="mb-8 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-800/30">
              <div className="flex items-center gap-3 text-white">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <p className="text-sm">{getStepInstructions()}</p>
              </div>
            </div>

            {/* 主要游戏区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 左列：硬币选择区 */}
              <div className="lg:col-span-1">
                <div className="card h-full">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <span className="text-amber-400 font-bold">12</span>
                    </div>
                    硬币选择
                  </h3>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-slate-300">选择硬币然后放置到天平上</span>
                      <span className="text-sm text-slate-400">
                        已选中: {gameState.selectedCoins.length} 枚
                      </span>
                    </div>

                    {/* 盘子选择 */}
                    <div className="flex gap-3 mb-6">
                      <button
                        type="button"
                        className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                          gameState.currentPlate === 'left'
                            ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                            : 'border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-400'
                        } ${gameState.currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                          selectPlate('left');
                          placeCoinOnPlate('left');
                        }}
                        disabled={gameState.currentStep === 0}
                      >
                        {gameState.currentStep === 0 ? '请先开始称量' : '放置到左盘'}
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                          gameState.currentPlate === 'right'
                            ? 'border-red-500 bg-red-500/20 text-red-400'
                            : 'border-slate-700 text-slate-400 hover:border-red-500/50 hover:text-red-400'
                        } ${gameState.currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                          selectPlate('right');
                          placeCoinOnPlate('right');
                        }}
                        disabled={gameState.currentStep === 0}
                      >
                        {gameState.currentStep === 0 ? '请先开始称量' : '放置到右盘'}
                      </button>
                    </div>
                  </div>

                  {/* 硬币网格 */}
                  <div className="grid grid-cols-3 gap-4">
                    {gameState.coins.map((coin) => (
                      <div key={coin.id} className="flex flex-col items-center">
                        <Coin
                          {...coin}
                          isDraggable={gameState.status === 'setup' || gameState.status === 'weighing'}
                          onClick={() => toggleCoinSelection(coin.id)}
                        />
                        <span className={`mt-2 text-sm font-medium ${
                          gameState.selectedCoins.includes(coin.id)
                            ? 'text-blue-400'
                            : 'text-slate-400'
                        }`}>
                          硬币 {coin.id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 中列：天平和称量结果 */}
              <div className="lg:col-span-2">
                <div className="card">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Scale className="w-6 h-6 text-blue-400" />
                    天平称量
                  </h3>

                  {/* 天平组件 */}
                  <div className="mb-8">
                    <ScaleBeam
                      result={currentWeighing?.result || null}
                      isWeighing={isWeighing}
                    />
                  </div>

                  {/* 当前称量信息 */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-blue-800/30">
                      <h4 className="text-sm font-medium text-blue-400 mb-2">左盘硬币</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentWeighing?.leftSide.length ? (
                          currentWeighing.leftSide.map(id => (
                            <span
                              key={id}
                              className="coin-sm bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm"
                            >
                              {id}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-sm">暂无硬币</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4 border border-red-800/30">
                      <h4 className="text-sm font-medium text-red-400 mb-2">右盘硬币</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentWeighing?.rightSide.length ? (
                          currentWeighing.rightSide.map(id => (
                            <span
                              key={id}
                              className="coin-sm bg-red-900/30 text-red-300 px-3 py-1 rounded-full text-sm"
                            >
                              {id}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-sm">暂无硬币</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 称量结论 */}
                  {currentWeighing?.result && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-800/30 mb-6"
                    >
                      <h4 className="text-sm font-medium text-white mb-2">本次称量结论</h4>
                      <p className="text-slate-300">{currentWeighing.conclusion}</p>

                      {currentWeighing.possibleFakes.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-800/30">
                          <p className="text-sm text-slate-400 mb-2">可能是假币:</p>
                          <div className="flex flex-wrap gap-2">
                            {currentWeighing.possibleFakes.map(({ coinId, couldBeHeavy, couldBeLight }) => (
                              <span
                                key={coinId}
                                className="px-3 py-1 rounded-full text-sm bg-amber-900/30 text-amber-300 border border-amber-800/30"
                              >
                                硬币 {coinId}
                                {couldBeHeavy && couldBeLight && " (可重可轻)"}
                                {couldBeHeavy && !couldBeLight && " (偏重)"}
                                {!couldBeHeavy && couldBeLight && " (偏轻)"}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex justify-between items-center">
                    <button
                      className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                      onClick={resetGame}
                    >
                      <RefreshCw className="w-4 h-4" />
                      重置游戏
                    </button>

                    <div className="flex gap-3">
                      {gameState.status === 'completed' ? (
                        <button
                          className="btn-secondary"
                          onClick={revealAnswer}
                        >
                          <Target className="w-4 h-4 mr-2" />
                          显示答案
                        </button>
                      ) : (
                        getStepButton()
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 最终答案 */}
            {gameState.status === 'completed' && gameState.fakeCoinId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 card bg-gradient-to-r from-emerald-900/20 to-green-900/20 border border-emerald-800/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">🎉 恭喜你找到了假币！</h3>
                    <p className="text-slate-300 mb-4">
                      通过3次称量，你成功找到了假币并确定了它的重量。
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Coin
                            id={gameState.fakeCoinId}
                            state={gameState.isFakeHeavy ? 'fake-heavy' : 'fake-light'}
                            isSelected={true}
                            isDraggable={false}
                          />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-white">
                            假币是: <span className="text-gradient font-bold">硬币 {gameState.fakeCoinId}</span>
                          </p>
                          <p className={`text-lg font-bold ${
                            gameState.isFakeHeavy ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {gameState.isFakeHeavy ? '比正常硬币重' : '比正常硬币轻'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={resetGame}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    再来一次
                  </button>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          /* 解法说明标签页 */
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6">🔍 经典硬币称量问题解法</h2>

            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-bold text-white mb-3">📚 问题概述</h3>
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                  <ul className="space-y-2 text-slate-300">
                    <li>• 有12枚外观相同的硬币，其中1枚是假币</li>
                    <li>• 假币可能比真币重，也可能比真币轻（未知）</li>
                    <li>• 使用天平（只能比较重量，不能称具体数值）</li>
                    <li>• 目标：<strong className="text-amber-400">用3次称量找出假币，并判断它是重了还是轻了</strong></li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-3">🧠 核心思路</h3>
                <div className="bg-blue-900/20 rounded-xl p-5 border border-blue-800/30">
                  <h4 className="text-lg font-medium text-blue-300 mb-2">信息论基础</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li>• 每次称量有3种结果：左重、右重、平衡</li>
                    <li>• 3次称量共有 <code className="bg-slate-700 px-2 py-1 rounded">3³ = 27</code> 种可能结果</li>
                    <li>• 12枚硬币，每枚可能重或轻：<code className="bg-slate-700 px-2 py-1 rounded">12 × 2 = 24</code> 种情况</li>
                    <li>• <strong className="text-green-400">24 {'<'} 27</strong>，所以理论上可行</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-3">📋 具体步骤</h3>

                <div className="space-y-4">
                  {/* 第一次称量 */}
                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                    <h4 className="text-lg font-medium text-amber-400 mb-3">第1次称量：1,2,3,4 vs 5,6,7,8</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-900/30 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-blue-400 mb-1">情况A：平衡</h5>
                        <p className="text-xs text-slate-300">假币在9-12中，轻重未知</p>
                      </div>
                      <div className="bg-red-900/30 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-red-400 mb-1">情况B：左重</h5>
                        <p className="text-xs text-slate-300">假币在1-4中(重) 或 5-8中(轻)</p>
                      </div>
                      <div className="bg-red-900/30 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-red-400 mb-1">情况C：右重</h5>
                        <p className="text-xs text-slate-300">假币在5-8中(重) 或 1-4中(轻)</p>
                      </div>
                    </div>
                  </div>

                  {/* 第二次称量 */}
                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                    <h4 className="text-lg font-medium text-amber-400 mb-3">第2次称量（根据第1次结果）</h4>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-green-400 mb-2">情况A：第一次平衡 → 1,2,3 vs 9,10,11</h5>
                      <div className="grid grid-cols-3 gap-3 ml-4">
                        <div className="bg-slate-700/50 rounded p-2">
                          <p className="text-xs text-slate-300">平衡 → 12是假币</p>
                        </div>
                        <div className="bg-slate-700/50 rounded p-2">
                          <p className="text-xs text-slate-300">左重 → 9,10,11中有轻假币</p>
                        </div>
                        <div className="bg-slate-700/50 rounded p-2">
                          <p className="text-xs text-slate-300">右重 → 9,10,11中有重假币</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-green-400 mb-2">情况B：第一次左重 → 1,2,5 vs 3,6,9</h5>
                      <div className="grid grid-cols-3 gap-3 ml-4">
                        <div className="bg-slate-700/50 rounded p-2">
                          <p className="text-xs text-slate-300">平衡 → 4重 或 7,8轻</p>
                        </div>
                        <div className="bg-slate-700/50 rounded p-2">
                          <p className="text-xs text-slate-300">左重 → 1,2重 或 6轻</p>
                        </div>
                        <div className="bg-slate-700/50 rounded p-2">
                          <p className="text-xs text-slate-300">右重 → 3重 或 5轻</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 第三次称量 */}
                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                    <h4 className="text-lg font-medium text-amber-400 mb-3">第3次称量（确定具体假币）</h4>
                    <p className="text-slate-300">
                      根据前两次的结果，第三次称量通常比较两个已知的硬币，或者用一个已知的真币去比较可疑的硬币，
                      从而确定哪一枚是假币以及它是重了还是轻了。
                    </p>
                    <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-sm text-slate-400">
                        <strong>例：</strong>如果第一次平衡，第二次左重，则假币在9,10,11中且偏轻。
                        第三次称量：9 vs 10，如果左重则10轻，如果右重则9轻，如果平衡则11轻。
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-3">💡 关键技巧</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-800/30">
                    <h4 className="text-md font-medium text-purple-300 mb-2">交叉称量</h4>
                    <p className="text-sm text-slate-300">将可疑硬币和已知真币混合称量，同时测试"可能是重"和"可能是轻"的可能性。</p>
                  </div>
                  <div className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-800/30">
                    <h4 className="text-md font-medium text-emerald-300 mb-2">三等分</h4>
                    <p className="text-sm text-slate-300">每次称量都要让三种结果尽可能平分可能性，最大化信息获取。</p>
                  </div>
                </div>
              </section>

              <div className="flex justify-center">
                <button
                  className="btn-primary"
                  onClick={() => setActiveTab('game')}
                >
                  开始游戏
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="mt-12 py-6 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>
            经典逻辑谜题交互演示 • 使用 React + TypeScript + Tailwind CSS + Framer Motion 构建
          </p>
          <p className="mt-2">
            设计目标：直观演示3次称量找出12枚硬币中假币的算法过程
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
