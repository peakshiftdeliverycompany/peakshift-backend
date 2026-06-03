const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  senderName:        { type: String, required: true },
  senderPhone:       { type: String },
  receiverName:      { type: String, required: true },
  receiverPhone:     { type: String },
  receiverEmail:     { type: String },
  origin:            { type: String, required: true },
  destination:       { type: String, required: true },
  weight:            { type: String },
  description:       { type: String },
  estimatedDelivery: { type: String },
  status: {
    type: String,
    enum: [
      'Pending',
      'Processing',
      'In Transit',
      'Shipped',
      'Arrived',
      'Ready for Delivery',
      'Out for Delivery',
      'Delivered',
      'Failed'
    ],
    default: 'Pending'
  },
  history: [{
    status:    { type: String },
    location:  { type: String },
    note:      { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shipment', shipmentSchema);
