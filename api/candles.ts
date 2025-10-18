import express from 'express';
import ccxt from 'ccxt';

const router = express.Router();

router.get('/candles', async (req, res) => {
  try {
    const exchange = new (ccxt as any).kucoin();
    const data = await exchange.fetchOHLCV('BTC/USDT', '1h', undefined, 100);
    const formatted = data.map(c => ({
      x: c[0],
      y: [c[1], c[2], c[3], c[4]]
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
