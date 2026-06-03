const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const nodemailer = require('nodemailer');

// ─── EMAIL SETUP ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendShipmentEmail(shipment) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: shipment.receiverEmail,
            subject: `📦 Your Package Has Been Shipped — Peakshift Delivery`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
                    <div style="background: #1a1a2e; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0;">🚚 Peakshift Delivery</h1>
                    </div>
                    <div style="background: white; padding: 35px; border-radius: 0 0 8px 8px; line-height: 1.9; color: #333;">
                        <p>Hello <strong>${shipment.receiverName}</strong>,</p>
                        <p>Your package from <strong>${shipment.senderName}</strong> has just been shipped and is on its way.</p>
                        <p>Here is your tracking code:</p>
                        <div style="background: #1a1a2e; color: #e63946; font-size: 24px; font-weight: bold;
                                    text-align: center; padding: 18px; border-radius: 8px;
                                    letter-spacing: 4px; margin: 20px 0;">
                            ${shipment.trackingNumber}
                        </div>
                        <p>You can track your package on the official website:</p>
                        <div style="text-align: center; margin: 25px 0;">
                            <a href="https://peakshift-delivery.onrender.com"
                               style="background: #e63946; color: white; padding: 14px 35px;
                                      text-decoration: none; border-radius: 6px;
                                      font-weight: bold; font-size: 16px;">
                                Track My Package
                            </a>
                        </div>
                        <p>For complaints or enquiries, contact us at
                            <a href="mailto:supportpeakdelivery@gmail.com" style="color: #e63946;">
                                supportpeakdelivery@gmail.com
                            </a>
                        </p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
                        <p style="color: #aaa; font-size: 12px; text-align: center;">
                            © 2026 Peakshift Delivery Company. All rights reserved.
                        </p>
                    </div>
                </div>
            `
        });
        console.log(`✅ Email sent to ${shipment.receiverEmail}`);
    } catch (err) {
        console.error('❌ Email error:', err.message);
    }
}
// ─── END EMAIL SETUP ─────────────────────────────────────────

const app = express();

app.set('sendShipmentEmail', sendShipmentEmail);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const shipmentRoutes = require('./routes/shipments');
app.use('/api/shipments', shipmentRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));