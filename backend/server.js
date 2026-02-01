const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const fileRoutes = require('./routes/fileRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const executeRoutes = require('./routes/executeRoutes');
const aiRoutes = require('./routes/aiRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/files', fileRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
