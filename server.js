const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { exec } = require('child_process');
const os = require('os');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
const providedMongoUri =
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGO_URL ||
    process.env.MONGO_URI;
const isProduction = process.env.NODE_ENV === 'production';
const isRender = Boolean(
    process.env.RENDER ||
    process.env.RENDER_SERVICE_ID ||
    process.env.RENDER_INTERNAL_HOSTNAME ||
    process.env.RENDER_EXTERNAL_HOSTNAME
);
const localFallbackUri = 'mongodb://localhost:27017/jewellery';
const mongoUri = providedMongoUri || (isProduction || isRender ? undefined : localFallbackUri);

if (!mongoUri) {
    console.error('ERROR: Missing MongoDB connection string.');
    console.error('Set one of MONGODB_URI, DATABASE_URL, MONGO_URL, or MONGO_URI in your deployment environment.');
    process.exit(1);
}

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
};

mongoose.connect(mongoUri, mongooseOptions)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

mongoose.connection.on('error', err => {
    console.error('MongoDB connection lost:', err);
});


// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/page-content', require('./routes/pageContent'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));

app.use('/api/contact', require('./routes/contact'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Jewellery Store API' });
});

// Health check endpoint to assist in deployment debugging
app.get('/health', async (req, res) => {
    try {
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        const state = mongoose.connection.readyState;
        const info = {
            mongoState: states[state] || state,
            env: process.env.NODE_ENV || 'development',
        };

        // Try a lightweight DB command when connected
        if (state === 1) {
            const collections = await mongoose.connection.db.listCollections().toArray();
            info.collections = collections.map(c => c.name).slice(0, 10);
        }

        res.json(info);
    } catch (err) {
        res.status(500).json({ message: 'Health check failed', error: err.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

const path = require('path');
const fs = require('fs');

const adminBuildPath = path.join(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(adminBuildPath)) {
    app.use('/admin', express.static(adminBuildPath));
    app.get('/admin/*', (req, res) => {
        res.sendFile(path.join(adminBuildPath, 'index.html'));
    });
    console.log('Admin build detected — serving /admin from', adminBuildPath);
} else {
    console.log('Admin build not found at', adminBuildPath);
}

// Port handling
// Server runs ONLY on port 5000. Kill any existing process using this port.
const PORT = Number(process.env.PORT) || 5000;

function killProcessOnPort(port, callback) {
    const isWindows = os.platform() === 'win32';
    const command = isWindows
        ? `netstat -ano | find ":${port}" | for /f "tokens=5" %a in ('findstr :${port}') do taskkill /PID %a /F`
        : `lsof -ti:${port} | xargs kill -9 2>/dev/null`;

    exec(command, { shell: true }, (err) => {
        // Ignore errors - process might not exist
        callback();
    });
}

function startServer() {
    const server = app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is still in use. Retrying...`);
            setTimeout(() => {
                killProcessOnPort(PORT, startServer);
            }, 1000);
        } else {
            console.error('Failed to start server:', err);
            process.exit(1);
        }
    });
}

// Kill any existing process on port 5000, then start the server
killProcessOnPort(PORT, startServer);


