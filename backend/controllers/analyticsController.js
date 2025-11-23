const Analytics = require('../models/Analytics');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Helper function to hash IP address for privacy
const hashIP = (ip) => {
  return crypto.createHash('sha256').update(ip).digest('hex');
};

// Helper function to detect device type from user agent
const getDeviceType = (userAgent) => {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Helper function to extract browser and OS
const getBrowserAndOS = (userAgent) => {
  if (!userAgent) return { browser: 'unknown', os: 'unknown' };
  
  let browser = 'unknown';
  let os = 'unknown';
  
  // Detect browser
  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';
  
  // Detect OS
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  
  return { browser, os };
};

const getAuthenticatedUser = (req) => {
  if (req.user?._id) {
    return {
      id: req.user._id.toString(),
      email: req.user.email,
      role: req.user.role
    };
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key-change-in-production');
    if (!decoded) return null;
    return {
      id: (decoded.id || decoded.sub)?.toString?.() ?? decoded.id ?? decoded.sub,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
};

// Track page view
exports.trackPageView = async (req, res) => {
  try {
    const {
      url,
      path,
      title,
      referrer,
      sessionId,
      screenWidth,
      screenHeight,
      loadTime
    } = req.body;

    if (!url || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'URL and sessionId are required'
      });
    }

    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.connection.remoteAddress;
    const { browser, os } = getBrowserAndOS(userAgent);

    const authUser = getAuthenticatedUser(req);

    const analytics = new Analytics({
      type: 'pageview',
      url,
      path,
      title,
      referrer,
      sessionId,
      userId: authUser?.id || req.user?._id,
      isAuthenticated: Boolean(authUser || req.user),
      userAgent,
      deviceType: getDeviceType(userAgent),
      browser,
      os,
      screenWidth,
      screenHeight,
      ipHash: hashIP(ip),
      loadTime
    });

    await analytics.save();

    res.status(201).json({
      success: true,
      message: 'Page view tracked'
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track page view'
    });
  }
};

// Track click event
exports.trackClick = async (req, res) => {
  try {
    const {
      url,
      path,
      elementType,
      elementId,
      elementText,
      elementClass,
      sessionId
    } = req.body;

    if (!url || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'URL and sessionId are required'
      });
    }

    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.connection.remoteAddress;
    const { browser, os } = getBrowserAndOS(userAgent);

    const authUser = getAuthenticatedUser(req);

    const analytics = new Analytics({
      type: 'click',
      url,
      path,
      elementType,
      elementId,
      elementText,
      elementClass,
      sessionId,
      userId: authUser?.id || req.user?._id,
      isAuthenticated: Boolean(authUser || req.user),
      userAgent,
      deviceType: getDeviceType(userAgent),
      browser,
      os,
      ipHash: hashIP(ip)
    });

    await analytics.save();

    res.status(201).json({
      success: true,
      message: 'Click tracked'
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click'
    });
  }
};

// Track custom event
exports.trackEvent = async (req, res) => {
  try {
    const {
      url,
      path,
      eventName,
      eventData,
      sessionId
    } = req.body;

    if (!url || !sessionId || !eventName) {
      return res.status(400).json({
        success: false,
        message: 'URL, sessionId, and eventName are required'
      });
    }

    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.connection.remoteAddress;
    const { browser, os } = getBrowserAndOS(userAgent);

    const authUser = getAuthenticatedUser(req);

    const analytics = new Analytics({
      type: 'event',
      url,
      path,
      eventName,
      eventData,
      sessionId,
      userId: authUser?.id || req.user?._id,
      isAuthenticated: Boolean(authUser || req.user),
      userAgent,
      deviceType: getDeviceType(userAgent),
      browser,
      os,
      ipHash: hashIP(ip)
    });

    await analytics.save();

    res.status(201).json({
      success: true,
      message: 'Event tracked'
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event'
    });
  }
};

// Get analytics overview (admin only)
exports.getOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // Total page views
    const totalPageViews = await Analytics.countDocuments({
      type: 'pageview',
      ...dateFilter
    });

    // Unique sessions
    const uniqueSessions = await Analytics.distinct('sessionId', {
      type: 'pageview',
      ...dateFilter
    });

    // Total clicks
    const totalClicks = await Analytics.countDocuments({
      type: 'click',
      ...dateFilter
    });

    // Device breakdown
    const deviceBreakdown = await Analytics.aggregate([
      { $match: { type: 'pageview', ...dateFilter } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Browser breakdown
    const browserBreakdown = await Analytics.aggregate([
      { $match: { type: 'pageview', ...dateFilter } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Top pages
    const topPages = await Analytics.aggregate([
      { $match: { type: 'pageview', ...dateFilter } },
      { $group: { _id: '$path', count: { $sum: 1 }, title: { $first: '$title' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Page views over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const pageViewsOverTime = await Analytics.aggregate([
      { 
        $match: { 
          type: 'pageview',
          timestamp: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalPageViews,
        uniqueVisitors: uniqueSessions.length,
        totalClicks,
        deviceBreakdown,
        browserBreakdown,
        topPages,
        pageViewsOverTime
      }
    });
  } catch (error) {
    console.error('Error getting analytics overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics overview'
    });
  }
};

// Get page views with filters
exports.getPageViews = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      path,
      deviceType,
      page = 1,
      limit = 50
    } = req.query;

    const filter = { type: 'pageview' };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    if (path) filter.path = path;
    if (deviceType) filter.deviceType = deviceType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [pageViews, total] = await Promise.all([
      Analytics.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-userAgent -ipHash'),
      Analytics.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: pageViews,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting page views:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get page views'
    });
  }
};

// Get clicks with filters
exports.getClicks = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      elementType,
      page = 1,
      limit = 50
    } = req.query;

    const filter = { type: 'click' };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    if (elementType) filter.elementType = elementType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [clicks, total] = await Promise.all([
      Analytics.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-userAgent -ipHash'),
      Analytics.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: clicks,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting clicks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get clicks'
    });
  }
};

// Get popular pages
exports.getPopularPages = async (req, res) => {
  try {
    const { startDate, endDate, limit = 20 } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    const popularPages = await Analytics.aggregate([
      { $match: { type: 'pageview', ...dateFilter } },
      {
        $group: {
          _id: '$path',
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' },
          title: { $first: '$title' },
          avgLoadTime: { $avg: '$loadTime' }
        }
      },
      {
        $project: {
          path: '$_id',
          views: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          title: 1,
          avgLoadTime: 1
        }
      },
      { $sort: { views: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: popularPages
    });
  } catch (error) {
    console.error('Error getting popular pages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular pages'
    });
  }
};

// Get user journey
exports.getUserJourney = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId is required'
      });
    }

    const journey = await Analytics.find({ sessionId })
      .sort({ timestamp: 1 })
      .select('type url path title elementType elementText timestamp');

    res.json({
      success: true,
      data: journey
    });
  } catch (error) {
    console.error('Error getting user journey:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user journey'
    });
  }
};
