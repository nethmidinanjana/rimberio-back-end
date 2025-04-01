const express = require('express')
const router = express.Router()
const admin = require('firebase-admin')
const crypto = require('crypto')
const db = admin.firestore()
const bcrypt = require('bcrypt')
require('dotenv').config()

const saltRounds = 10;

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    try {
        const userSnapshot = await db.collection('user').where('email', '==', email).get();

        if (userSnapshot.empty) {
            return res.status(401).json({ success: false, message: "User can not be found. If you do not have an account plase sign up!" });
        }

        const userDoc = userSnapshot.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data();
        const storedHashedPassword = userData.password;

        const isMatch = await bcrypt.compare(password, storedHashedPassword);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid password!" });
        }

        const userString = JSON.stringify({
            userId: userId,
            username: userData.username,
            password: userData.password
        });

        return res.json({ success: true, message: userString });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const userSnapshot = await db.collection('user').where('email', '==', email).get();

        if (!userSnapshot.empty) {
            return res.status(400).json({ success: false, message: "Email is already in use!" })
        }

        const verification_code = crypto.randomInt(1000, 9999)

        const counterDoc = await db.collection('user_counter').doc('counter').get();
        let count = counterDoc.exists ? counterDoc.data().count : 0;

        count++;
        const userId = `user_${count}`

        const hashedPassword = await bcrypt.hash(password, saltRounds)

        await db.collection('user').doc(userId).set({
            username: username,
            email: email,
            password: hashedPassword,
            verification_code: verification_code,
            points: 0,
            is_verified: false,
            is_active: true
        })

        await db.collection('user_counter').doc('counter').set({
            count: count
        })

        console.log(userId);

        //verification code sending
        const nodeMailer = require('nodemailer')
        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD
            }
        })

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Verification code for the rimberio mobile application",
            text: `Your verification code is: ${verification_code}`
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: 'Error sending email' })
            } else {
                console.log("Email sent successfully" + info.response);
                return res.status(200).json({ success: true, message: userId })
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }

})

router.post("/verify", async (req, res) => {
    const { userId, verification_code } = req.body;

    console.log(userId, verification_code);

    if (!userId || !verification_code) {
        res.status(400).json({ success: false, message: "Missing data." })
    }

    try {
        const userSnapshot = await db.collection('user').doc(userId).get();

        if (!userSnapshot.exists) {
            return res.status(400).json({ success: false, message: "User not found" })
        }
        console.log(userSnapshot);

        const userData = userSnapshot.data();

        if (String(userData.verification_code) !== verification_code) {
            console.log("Verification code mismatch:", userData.verification_code, verification_code);
            return res.status(400).json({ success: false, message: "Invalid verification code" });
        }

        await db.collection('user').doc(userId).update({ is_verified: true })

        const userString = JSON.stringify({
            userId: userId,
            username: userData.username,
            email: userData.email,
            password: userData.password
        })

        res.status(200).json({ success: true, message: userString })
    } catch (error) {
        console.log(error);
    }

})
module.exports = router