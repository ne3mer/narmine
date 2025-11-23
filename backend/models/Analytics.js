const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['pageview', 'click', 'event'],
    required: true,
    index: true
  },
  
  // Page view data
  url: {
    type: String,
    required: true,
    index: true
  },
  path: {
    type: String,
    index: true
  },
  title: String,
  referrer: String,
  
  // Click data
  elementType: String, // button, link, product, etc.
  elementId: String,
  elementText: String,
  elementClass: String,
  
  // Event data
  eventName: String,
  eventData: mongoose.Schema.Types.Mixed,
  
  // User data (anonymous)
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  
  // Device & browser data
  userAgent: String,
  deviceType: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop', 'unknown'],
    default: 'unknown'
  },
  browser: String,
  os: String,
  screenWidth: Number,
  screenHeight: Number,
  
  // Location data (hashed for privacy)
  ipHash: String,
  country: String,
  city: String,
  
  // Timing data
  loadTime: Number,
  timeOnPage: Number,
  
  // Metadata
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for common queries
analyticsSchema.index({ type: 1, timestamp: -1 });
analyticsSchema.index({ url: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1, timestamp: 1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ deviceType: 1, timestamp: -1 });

// TTL index to automatically delete old analytics data after 90 days (optional)
// analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Analytics', analyticsSchema);
