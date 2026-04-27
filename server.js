import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Availability from './models/Availability.js';

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI_AVAILABILITY || process.env.MONGO_URI;

try {
  await mongoose.connect(MONGO_URI);
  console.log('Availability Service DB Connected');
} catch (err) {
  console.error('Availability DB Connection Error:', err);
}

app.post('/availability', async (req, res) => {
  try {
    const { userId, status, shiftStart, shiftEnd } = req.body;
    const availability = await Availability.findOneAndUpdate(
      { userId },
      { userId, status, shiftStart, shiftEnd },
      { upsert: true, new: true, returnDocument: 'after' }
    );
    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/availability/:userId', async (req, res) => {
  try {
    const availability = await Availability.findOne({ userId: req.params.userId });
    
    // FIXED: Instead of 404, return a default 'active' status
    if (!availability) {
      return res.json({ userId: req.params.userId, status: 'active' });
    }
    
    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`Availability Service running on port ${PORT}`));
