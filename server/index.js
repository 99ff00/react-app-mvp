import Mux from '@mux/mux-node';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const { Video } = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

// Get upload URL
app.post('/api/mux/upload-url', async (req, res) => {
  try {
    const upload = await Video.Uploads.create({
      cors_origin: req.headers.origin,
      new_asset_settings: {
        playback_policy: ['public'],
      },
    });

    res.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
    });
  } catch (error) {
    console.error('Error creating Mux upload', error);
    res.status(500).json({
      error: 'Failed to create upload URL',
      details: error.message,
    });
  }
});

// Check upload status
app.get('/api/mux/upload/:uploadId', async (req, res) => {
  try {
    const upload = await Video.Uploads.get(req.params.uploadId);
    res.json(upload);
  } catch (error) {
    console.error('Error fetching upload', error);
    res.status(500).json({ error: error.message });
  }
});

// Get asset
app.get('/api/mux/asset/:assetId', async (req, res) => {
  try {
    const asset = await Video.Assets.get(req.params.assetId);
    res.json(asset);
  } catch (error) {
    console.error('Error fetching asset', error);
    res.status(500).json({ error: error.message });
  }
});

// Get assets
app.get('/api/mux/assets', async (req, res) => {
  try {
    const assets = await Video.Assets.list();

    res.json({
      assets: assets,
    });
  } catch (error) {
    console.error('Error listing assets', error);
    res.status(500).json({ error: error.message });
  }
});

// Get random asset
app.get('/api/mux/random_asset', async (req, res) => {
  try {
    const assets = await Video.Assets.list();

    res.json({
      asset: assets[Math.floor(Math.random() * assets.length)],
    });
  } catch (error) {
    console.error('Error listing assets', error);
    res.status(500).json({ error: error.message });
  }
});

// Get assets count
app.get('/api/mux/assets_count', async (req, res) => {
  try {
    const assets = await Video.Assets.list();

    res.json({
      count: assets.length,
    });
  } catch (error) {
    console.error('Error listing assets', error);
    res.status(500).json({ error: error.message });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
