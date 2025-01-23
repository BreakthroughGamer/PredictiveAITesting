import { PriceData, Prediction } from '../types/PriceData';
import brain from 'brain.js';

export class PricePredictor {
  private network: brain.recurrent.LSTMTimeStep;

  constructor() {
    this.network = new brain.recurrent.LSTMTimeStep({
      inputSize: 1,
      hiddenLayers: [8, 8],
      outputSize: 1
    });
  }

  private normalizeData(prices: number[]): number[] {
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    return prices.map(price => (price - min) / (max - min));
  }

  private denormalizeData(normalized: number, prices: number[]): number {
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    return normalized * (max - min) + min;
  }

  public async predict(priceData: PriceData, coinId: string): Promise<Prediction> {
    const prices = priceData.prices.map(p => p[1]);
    const currentPrice = prices[prices.length - 1];
    
    // Train on normalized data
    const normalizedPrices = this.normalizeData(prices);
    await this.network.train([normalizedPrices], {
      iterations: 100,
      errorThresh: 0.011
    });

    // Make predictions
    const nextDayNorm = this.network.run(normalizedPrices);
    const nextWeekNorm = this.network.forecast(7)[6];

    const nextDay = this.denormalizeData(nextDayNorm, prices);
    const nextWeek = this.denormalizeData(nextWeekNorm, prices);

    return {
      timestamp: Date.now(),
      coinId,
      currentPrice,
      nextDayPrediction: nextDay > currentPrice ? 'up' : 'down',
      nextWeekPrediction: nextWeek > currentPrice ? 'up' : 'down',
      confidence: Math.max(0, Math.min(100, 100 - (Math.abs(nextDay - currentPrice) / currentPrice * 100)))
    };
  }
}
