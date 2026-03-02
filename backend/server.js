// Trigger restart
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT"]
    }
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads/chat folder if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads', 'chat');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/chat', express.static(path.join(__dirname, 'uploads', 'chat')));
app.use('/uploads/posts', express.static(path.join(__dirname, 'uploads', 'posts')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB Telegram-style limit
});

const chatController = require('./controllers/chatController');

// Routes
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/profileRoutes'));
app.use('/api', require('./routes/startupRoutes'));
app.use('/api', require('./routes/chatRoutes'));
app.use('/api', require('./routes/taskRoutes'));
app.use('/api', require('./routes/jobRoutes'));
app.use('/api', require('./routes/followerRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api', require('./routes/notificationRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('Reboot API is running...');
});

// Socket.io Events
io.on('connection', (socket) => {
    socket.on('join_startup', (startupId) => socket.join(`startup_${startupId}`));
    socket.on('join_dm', (userId) => socket.join(`dm_${userId}`));

    socket.on('chat:message', async (data) => {
        const { startupId, message, senderId, senderName, type, fileUrl } = data;
        await chatController.saveMessage(startupId, senderId, message, type || 'text', fileUrl);
        io.to(`startup_${startupId}`).emit('chat:message', {
            ...data,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('private:message', async (data) => {
        const { senderId, receiverId, message, type, fileUrl } = data;
        await chatController.savePrivateMessage(senderId, receiverId, message, type || 'text', fileUrl);
        io.to(`dm_${receiverId}`).emit('private:message', { ...data, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        io.to(`dm_${senderId}`).emit('private:message', { ...data, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    });

    socket.on('chat:delete', (data) => {
        const { id, startupId } = data;
        io.to(`startup_${startupId}`).emit('chat:delete', { id });
    });

    socket.on('private:delete', (data) => {
        const { id, senderId, receiverId } = data;
        io.to(`dm_${receiverId}`).emit('private:delete', { id });
        io.to(`dm_${senderId}`).emit('private:delete', { id });
    });

    socket.on('call:request', (data) => {
        const { startupId, receiverId, callerName, type, isGroup } = data;
        if (isGroup) {
            socket.to(`startup_${startupId}`).emit('call:incoming', { ...data, callerId: socket.id });
        } else {
            socket.to(`dm_${receiverId}`).emit('call:incoming', { ...data, callerId: socket.id });
        }
    });

    socket.on('call:response', (data) => {
        const { callerId, accepted, responderName } = data;
        io.to(callerId).emit('call:answered', data);
    });

    socket.on('call:end', (data) => {
        const { startupId, receiverId, isGroup } = data;
        if (isGroup) {
            io.to(`startup_${startupId}`).emit('call:ended');
        } else {
            io.to(`dm_${receiverId}`).emit('call:ended');
            io.to(`dm_${data.senderId}`).emit('call:ended');
        }
    });

    socket.on('webrtc:signal', (data) => {
        const { targetId, signal } = data;
        io.to(targetId).emit('webrtc:signal', { senderId: socket.id, signal });
    });

    socket.on('disconnect', () => console.log('User disconnected'));
});

// File Upload for Chat
app.post('/api/chat/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    res.json({ fileUrl: `http://localhost:5000/uploads/chat/${req.file.filename}` });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
