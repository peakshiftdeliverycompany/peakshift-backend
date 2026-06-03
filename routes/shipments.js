const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');

function generateTrackingNumber() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'PKS' + code;
}

router.post('/', async (req, res) => {
    try {
        console.log('📦 POST /api/shipments hit');
        console.log('📧 receiverEmail received:', req.body.receiverEmail);

        const trackingNumber = generateTrackingNumber();
        const shipment = new Shipment({
            ...req.body,
            trackingNumber,
            history: [{
                status: 'Pending',
                location: req.body.origin,
                note: 'Shipment created and registered'
            }]
        });
        await shipment.save();
        console.log('✅ Shipment saved to DB');

        if (shipment.receiverEmail) {
            console.log('📧 Attempting to send email to:', shipment.receiverEmail);
            const sendShipmentEmail = req.app.get('sendShipmentEmail');
            console.log('📧 sendShipmentEmail function found:', !!sendShipmentEmail);
            if (sendShipmentEmail) await sendShipmentEmail(shipment);
        } else {
            console.log('⚠️ No receiverEmail — email skipped');
        }

        res.status(201).json({ success: true, shipment });
    } catch (err) {
        console.error('❌ Error creating shipment:', err.message);
        res.status(400).json({ success: false, message: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const shipments = await Shipment.find().sort({ createdAt: -1 });
        res.json({ success: true, shipments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/track/:trackingNumber', async (req, res) => {
    try {
        const shipment = await Shipment.findOne({
            trackingNumber: req.params.trackingNumber.toUpperCase().trim()
        });
        if (!shipment)
            return res.status(404).json({ success: false, message: 'Shipment not found. Please check your tracking number.' });
        res.json({ success: true, shipment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { status, location, note } = req.body;
        const shipment = await Shipment.findById(req.params.id);
        if (!shipment) return res.status(404).json({ success: false, message: 'Not found' });

        if (status) shipment.status = status;
        if (req.body.estimatedDelivery) shipment.estimatedDelivery = req.body.estimatedDelivery;

        shipment.history.push({
            status: status || shipment.status,
            location: location || '',
            note: note || ''
        });

        await shipment.save();
        res.json({ success: true, shipment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Shipment.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Shipment deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
