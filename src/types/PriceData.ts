export interface PriceData {
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface Prediction {
  timestamp: number;
  coinId: string;
  currentPrice: number;
  nextDayPrediction: 'up' | 'down';
  nextWeekPrediction: 'up' | 'down';
  confidence: number;
}
