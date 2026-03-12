export type CoinState = 'normal' | 'fake-heavy' | 'fake-light' | 'known-real';

export interface Coin {
  id: number;           // 1-12
  state: CoinState;
  isSelected: boolean;  // 是否被选中准备称量
}

export type ScaleResult = 'left-heavy' | 'right-heavy' | 'balanced';

export interface WeighingStep {
  stepNumber: number;      // 第几次称量 (1-3)
  leftSide: number[];      // 左边盘子上的硬币ID
  rightSide: number[];     // 右边盘子上的硬币ID
  result: ScaleResult | null;  // 称量结果
  conclusion: string;      // 本轮得出的结论
  possibleFakes: { coinId: number, couldBeHeavy: boolean, couldBeLight: boolean }[];
}

export interface GameState {
  coins: Coin[];
  currentStep: number;     // 当前步骤 (0: 开始, 1-3: 称量)
  weighings: WeighingStep[];
  possibleFakes: number[]; // 可能是假币的硬币ID
  fakeCoinId: number | null;
  isFakeHeavy: boolean | null;
  status: 'setup' | 'weighing' | 'conclusion' | 'completed';
  selectedCoins: number[]; // 用户当前选择的硬币 (用于放置到天平)
  currentPlate: 'left' | 'right' | null; // 当前选择的盘子
}

// 算法的配置
export const WEIGHING_STRATEGY = {
  firstWeighing: {
    left: [1, 2, 3, 4],
    right: [5, 6, 7, 8],
    conclusions: {
      balanced: "平衡 → 假币在 9, 10, 11, 12 中",
      leftHeavy: "左边重 → 假币在 1-4 中(偏重) 或 5-8 中(偏轻)",
      rightHeavy: "右边重 → 假币在 5-8 中(偏重) 或 1-4 中(偏轻)"
    }
  },
  secondWeighing: {
    balanced: {  // 第一次平衡的情况
      left: [1, 2, 3],
      right: [9, 10, 11],
      conclusions: {
        balanced: "平衡 → 12号是假币",
        leftHeavy: "左边重 → 9, 10, 11 中有轻假币",
        rightHeavy: "右边重 → 9, 10, 11 中有重假币"
      }
    },
    leftHeavy: {  // 第一次左边重的情况
      left: [1, 2, 5],
      right: [3, 6, 9],
      conclusions: {
        balanced: "平衡 → 4号重 或 7, 8号轻",
        leftHeavy: "左边重 → 1, 2号重 或 6号轻",
        rightHeavy: "右边重 → 3号重 或 5号轻"
      }
    },
    rightHeavy: {  // 第一次右边重的情况 (与左边重对称)
      left: [5, 6, 1],
      right: [7, 2, 9],
      conclusions: {
        balanced: "平衡 → 8号重 或 3, 4号轻",
        leftHeavy: "左边重 → 5, 6号重 或 2号轻",
        rightHeavy: "右边重 → 7号重 或 1号轻"
      }
    }
  },
  thirdWeighing: {
    // 第三称的各种情况比较复杂，将在逻辑中动态计算
  }
} as const;

// 12个硬币的初始状态
export const initialCoins: Coin[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  state: 'normal',
  isSelected: false,
}));
