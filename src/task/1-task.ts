import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { MongoClient } from 'mongodb';
import { PricePredictor } from '../services/pricePredictor';
import { PriceData, Prediction } from '../types/PriceData';

const COIN_ID = 'bitcoin';
const MONGO_URI = 'your_mongodb_connection_string';
const CG_API_KEY = 'CG-Aa85hRZTivw7EWuFMzHjdpPY';

export async function task(roundNumber: number): Promise<void> {
  try {
    console.log(`EXECUTE TASK FOR ROUND ${roundNumber}`);

    // Fetch price data from CoinGecko
    const url = `https://pro-api.coingecko.com/api/v3/coins/${COIN_ID}/market_chart?vs_currency=usd&days=30&interval=daily`;
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'x-cg-pro-api-key': CG_API_KEY
      }
    });

    const priceData: PriceData = await response.json();
    
    // Generate prediction
    const predictor = new PricePredictor();
    const prediction = await predictor.predict(priceData, COIN_ID);

    // Store prediction in MongoDB
    const client = await MongoClient.connect(MONGO_URI);
    const db = client.db('price_predictions');
    await db.collection('predictions').insertOne(prediction);
    await client.close();

    // Store the prediction in namespace for submission
    await namespaceWrapper.storeSet("prediction", JSON.stringify(prediction));
    
  } catch (error) {
    console.error("EXECUTE TASK ERROR:", error);
  }
}
