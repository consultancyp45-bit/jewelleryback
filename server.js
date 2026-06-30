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
const providedMongoUri = process.env.MONGODB_URI;

// If user provides a URI without a database (e.g. mongodb://localhost:27017),
// default the database name to `jewellery`.
// If they provide a full URI with a DB, use it as-is.
const mongoUri = (() => {
    if (!providedMongoUri) return 'mongodb://localhost:27017/jewellery';

    // Very small heuristic: if there's no trailing "/<db>" part, append it.
    // Examples:
    // - mongodb://localhost:27017 -> mongodb://localhost:27017/jewellery
    // - mongodb://localhost:27017/otherdb -> mongodb://localhost:27017/otherdb
    if (providedMongoUri.endsWith('/')) return `${providedMongoUri}jewellery`;
    const lastSegment = providedMongoUri.split('/').pop();
    // If last segment contains query params or is empty, don't append blindly.
    if (!lastSegment || lastSegment.includes('?')) return `${providedMongoUri}/jewellery`;

    // If the last segment looks like a database name (no '='), keep it.
    // If it's clearly host/port end (e.g. mongodb://localhost:27017), append.
    const looksLikeDbName = lastSegment && !lastSegment.includes(':') && !lastSegment.includes('.') && !lastSegment.includes(' ');
    // For mongodb://localhost:27017, lastSegment is '27017' (contains ':'? no). We special-case this common port-only form.
    const isPortOnly = lastSegment && /^\d+$/.test(lastSegment);

    if (isPortOnly || !looksLikeDbName) return `${providedMongoUri}/jewellery`;
    return providedMongoUri;
})();

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));


// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/page-content', require('./routes/pageContent'));
app.use('/api/admin', require('./routes/admin'));

app.use('/api/contact', require('./routes/contact'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Jewellery Store API' });
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


