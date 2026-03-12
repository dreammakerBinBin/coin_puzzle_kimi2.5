import { useState } from 'react';
import type { GameState, ScaleResult } from '../types';
import { initialCoins } from '../types';
import { WEIGHING_STRATEGY } from '../types';

const getRandomFakeCoin = () => {
  const id = Math.floor(Math.random() * 12) + 1;
  const isHeavy = Math.random() > 0.5;
  return { id, isHeavy };
};

const createInitialState = (): GameState => {
  const fakeCoin = getRandomFakeCoin();

  // 创建带假币的硬币数组
  const coins = initialCoins.map(coin => ({
    ...coin,
    state: (coin.id === fakeCoin.id
      ? fakeCoin.isHeavy ? 'fake-heavy' : 'fake-light'
      : 'normal') as 'normal' | 'fake-heavy' | 'fake-light'
  }));

  return {
    coins,
    currentStep: 0,
    weighings: [
      {
        stepNumber: 1,
        leftSide: [],
        rightSide: [],
        result: null,
        conclusion: '',
        possibleFakes: []
      },
      {
        stepNumber: 2,
        leftSide: [],
        rightSide: [],
        result: null,
        conclusion: '',
        possibleFakes: []
      },
      {
        stepNumber: 3,
        leftSide: [],
        rightSide: [],
        result: null,
        conclusion: '',
        possibleFakes: []
      }
    ],
    possibleFakes: [],
    fakeCoinId: fakeCoin.id,
    isFakeHeavy: fakeCoin.isHeavy,
    status: 'setup',
    selectedCoins: [],
    currentPlate: null,
  };
};

const getSecondWeighingConfig = (firstResult: ScaleResult) => {
  if (firstResult === 'balanced') return WEIGHING_STRATEGY.secondWeighing.balanced;
  if (firstResult === 'left-heavy') return WEIGHING_STRATEGY.secondWeighing.leftHeavy;
  return WEIGHING_STRATEGY.secondWeighing.rightHeavy;
};


const calculatePossibleFakes = (
  step: number,
  firstResult: ScaleResult | null,
  secondResult: ScaleResult | null
) => {
  const possibilities: { coinId: number, couldBeHeavy: boolean, couldBeLight: boolean }[] = [];

  if (step === 1) {
    // 第一次称量后，确定假币可能在哪些硬币中
    if (firstResult === 'balanced') {
      [9, 10, 11, 12].forEach(id => {
        possibilities.push({ coinId: id, couldBeHeavy: true, couldBeLight: true });
      });
    } else if (firstResult === 'left-heavy') {
      [1, 2, 3, 4].forEach(id => {
        possibilities.push({ coinId: id, couldBeHeavy: true, couldBeLight: false });
      });
      [5, 6, 7, 8].forEach(id => {
        possibilities.push({ coinId: id, couldBeHeavy: false, couldBeLight: true });
      });
    } else {
      [1, 2, 3, 4].forEach(id => {
        possibilities.push({ coinId: id, couldBeHeavy: false, couldBeLight: true });
      });
      [5, 6, 7, 8].forEach(id => {
        possibilities.push({ coinId: id, couldBeHeavy: true, couldBeLight: false });
      });
    }
  }

  if (step === 2 && firstResult) {
    const config = getSecondWeighingConfig(firstResult);
    if (secondResult === 'balanced') {
      possibilities.push(...(config.conclusions.balanced.includes('重') ? [
        { coinId: 4, couldBeHeavy: true, couldBeLight: false },
        { coinId: 7, couldBeHeavy: false, couldBeLight: true },
        { coinId: 8, couldBeHeavy: false, couldBeLight: true }
      ] : []));
    }
    // 简化的可能性计算
  }

  return possibilities;
};

export const useCoinGame = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [isWeighing, setIsWeighing] = useState(false);

  const resetGame = () => {
    setGameState(createInitialState());
  };

  const toggleCoinSelection = (coinId: number) => {
    if (gameState.status !== 'setup' && gameState.status !== 'weighing') return;

    setGameState(prev => {
      const selectedCoins = prev.selectedCoins.includes(coinId)
        ? prev.selectedCoins.filter(id => id !== coinId)
        : [...prev.selectedCoins, coinId];

      return { ...prev, selectedCoins };
    });
  };

  const selectPlate = (plate: 'left' | 'right') => {
    setGameState(prev => ({ ...prev, currentPlate: plate }));
  };

  const placeCoinOnPlate = (plate: 'left' | 'right') => {
    setGameState(prev => {
      // 检查是否可以放置硬币
      if (prev.selectedCoins.length === 0 || prev.currentStep === 0) {
        return prev;
      }

      const newWeighings = [...prev.weighings];
      const currentWeighing = newWeighings[prev.currentStep - 1];

      if (plate === 'left') {
        // 从selectedCoins中移除已经放在左边或右边的硬币
        const coinsToPlace = prev.selectedCoins.filter(
          id => !currentWeighing.leftSide.includes(id) && !currentWeighing.rightSide.includes(id)
        );
        newWeighings[prev.currentStep - 1] = {
          ...currentWeighing,
          leftSide: [...currentWeighing.leftSide, ...coinsToPlace]
        };
      } else {
        const coinsToPlace = prev.selectedCoins.filter(
          id => !currentWeighing.rightSide.includes(id) && !currentWeighing.leftSide.includes(id)
        );
        newWeighings[prev.currentStep - 1] = {
          ...currentWeighing,
          rightSide: [...currentWeighing.rightSide, ...coinsToPlace]
        };
      }

      return {
        ...prev,
        weighings: newWeighings,
        selectedCoins: [],
        currentPlate: null,
      };
    });
  };

  const startWeighing = (step: number) => {
    if (gameState.currentStep !== step - 1) return;
    if (gameState.status === 'completed') return;

    const currentWeighing = gameState.weighings[step - 1];
    if (currentWeighing.leftSide.length === 0 && currentWeighing.rightSide.length === 0) return;

    setIsWeighing(true);
    setGameState(prev => ({ ...prev, status: 'weighing' }));

    // 模拟称量过程
    setTimeout(() => {
      const leftWeight = currentWeighing.leftSide.reduce((sum, id) => {
        const coin = gameState.coins.find(c => c.id === id);
        return sum + (coin?.state === 'fake-heavy' ? 1.1 : coin?.state === 'fake-light' ? 0.9 : 1);
      }, 0);

      const rightWeight = currentWeighing.rightSide.reduce((sum, id) => {
        const coin = gameState.coins.find(c => c.id === id);
        return sum + (coin?.state === 'fake-heavy' ? 1.1 : coin?.state === 'fake-light' ? 0.9 : 1);
      }, 0);

      let result: ScaleResult = 'balanced';
      if (leftWeight > rightWeight) result = 'left-heavy';
      if (rightWeight > leftWeight) result = 'right-heavy';

      // 更新称量结果
      setGameState(prev => {
        const newWeighings = [...prev.weighings];
        newWeighings[step - 1] = {
          ...newWeighings[step - 1],
          result,
          conclusion: step === 1
            ? WEIGHING_STRATEGY.firstWeighing.conclusions[
                result === 'left-heavy' ? 'leftHeavy' :
                result === 'right-heavy' ? 'rightHeavy' : 'balanced'
              ]
            : step === 2 && prev.weighings[0].result
            ? getSecondWeighingConfig(prev.weighings[0].result).conclusions[
                result === 'left-heavy' ? 'leftHeavy' :
                result === 'right-heavy' ? 'rightHeavy' : 'balanced'
              ]
            : '第三次称量结论'
        };

        const possibleFakes = calculatePossibleFakes(step, prev.weighings[0].result, result);

        newWeighings[step - 1].possibleFakes = possibleFakes;

        const status = step === 3 ? 'completed' : 'setup';
        const nextStep = step === 3 ? 3 : step + 1;

        return {
          ...prev,
          currentStep: nextStep,
          status,
          weighings: newWeighings,
          possibleFakes: possibleFakes.map(p => p.coinId),
        };
      });

      // 称量结束
      setTimeout(() => {
        setIsWeighing(false);
      }, 2000);
    }, 2000);
  };

  const advanceToNextStep = () => {
    if (gameState.currentStep >= 3) return;

    const nextStep = gameState.currentStep + 1;
    setGameState(prev => ({
      ...prev,
      currentStep: nextStep,
      status: 'setup',
      selectedCoins: [],
      currentPlate: null,
    }));
  };

  const revealAnswer = () => {
    setGameState(prev => ({
      ...prev,
      status: 'completed',
    }));
  };

  return {
    gameState,
    isWeighing,
    resetGame,
    toggleCoinSelection,
    selectPlate,
    placeCoinOnPlate,
    startWeighing,
    advanceToNextStep,
    revealAnswer,
  };
};
