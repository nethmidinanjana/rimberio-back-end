require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const admin = require('firebase-admin')

const serviceAccount = require('./firebaseConfig.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const app = express()
app.use(cors())
app.use(bodyParser.json())

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const userRoutes = require('./routes/users')
app.use('/users', userRoutes);

const orderRoutes = require('./routes/order')
app.use('/order', orderRoutes);
app.listen(3000, () => { console.log(`🔥 Server running on port 3000`) })