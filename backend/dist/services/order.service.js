"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderItemWarranty = exports.acknowledgeOrderDelivery = exports.updateOrderDelivery = exports.notifyCustomerByEmail = exports.searchAdminOrders = exports.getAllOrders = exports.updateOrderStatus = exports.getOrderById = exports.getOrdersByCustomer = exports.getUserOrders = exports.createOrder = void 0;
const order_model_1 = require("../models/order.model");
const cart_model_1 = require("../models/cart.model");
const adminNotification_service_1 = require("./adminNotification.service");
const createOrder = async (input) => {
    const orderData = {
        customerInfo: input.customerInfo,
        items: input.items.map((item) => ({
            gameId: item.gameId,
            variantId: item.variantId,
            selectedOptions: item.selectedOptions
                ? new Map(Object.entries(item.selectedOptions))
                : undefined,
            pricePaid: item.pricePaid,
            quantity: item.quantity,
        })),
        totalAmount: input.totalAmount,
        paymentStatus: "pending",
        fulfillmentStatus: "pending",
        note: input.note,
        paymentMethod: input.paymentMethod || 'online',
    };
    if (input.couponCode) {
        orderData.couponCode = input.couponCode;
    }
    if (input.discountAmount && input.discountAmount > 0) {
        orderData.discountAmount = input.discountAmount;
    }
    if (input.shippingMethod) {
        orderData.shippingMethod = {
            ...input.shippingMethod,
            price: Math.max(0, input.shippingMethod.price ?? 0)
        };
    }
    if (input.shippingPreferences) {
        const { deliveryDate, instructions } = input.shippingPreferences;
        if (deliveryDate || instructions) {
            orderData.shippingPreferences = {
                instructions,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined
            };
        }
    }
    if (input.userId) {
        orderData.userId = input.userId;
    }
    const order = await order_model_1.OrderModel.create(orderData);
    let orderItemsSummary = input.items.map((item) => ({
        title: "بازی ناشناس",
        quantity: item.quantity,
        price: item.pricePaid,
    }));
    let resolvedCustomerName = order.customerInfo.name;
    // Clear user's cart after order creation
    if (input.userId) {
        await cart_model_1.CartModel.findOneAndUpdate({ userId: input.userId }, { $set: { items: [] } });
    }
    // Send order confirmation notification
    try {
        const { sendOrderConfirmation } = await Promise.resolve().then(() => __importStar(require("./notificationSender.service")));
        const { UserModel } = await Promise.resolve().then(() => __importStar(require("../models/user.model")));
        const { GameModel } = await Promise.resolve().then(() => __importStar(require("../models/game.model")));
        // Get user info if logged in
        let userTelegram;
        if (input.userId) {
            const user = await UserModel.findById(input.userId);
            userTelegram = user?.telegram;
            if (!resolvedCustomerName && user?.name) {
                resolvedCustomerName = user.name;
            }
        }
        // Get game titles for items
        orderItemsSummary = await Promise.all(input.items.map(async (item) => {
            const game = await GameModel.findById(item.gameId);
            return {
                title: game?.title || "بازی ناشناس",
                quantity: item.quantity,
                price: item.pricePaid,
            };
        }));
        await sendOrderConfirmation(input.userId, order._id.toString(), order.orderNumber, input.customerInfo.email, userTelegram, input.totalAmount, orderItemsSummary);
    }
    catch (error) {
        console.error("Failed to send order confirmation notification:", error);
        // Don't fail the order if notification fails
    }
    (0, adminNotification_service_1.notifyAdminsOfEvent)({
        type: "order_created",
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        note: order.note,
        paymentMethod: order.paymentMethod,
        customer: {
            name: resolvedCustomerName,
            email: order.customerInfo.email,
            phone: order.customerInfo.phone,
        },
        createdAt: order.createdAt,
        items: orderItemsSummary,
    }).catch((error) => {
        console.error("Failed to notify admins about new order:", error);
    });
    return order;
};
exports.createOrder = createOrder;
const getUserOrders = async (userId, status) => {
    const query = { userId };
    if (status) {
        query.paymentStatus = status;
    }
    return order_model_1.OrderModel.find(query)
        .populate("items.gameId")
        .sort({ createdAt: -1 });
};
exports.getUserOrders = getUserOrders;
const getOrdersByCustomer = async (email, phone) => {
    return order_model_1.OrderModel.find({
        "customerInfo.email": email,
        "customerInfo.phone": phone,
    })
        .populate("items.gameId")
        .sort({ createdAt: -1 });
};
exports.getOrdersByCustomer = getOrdersByCustomer;
const getOrderById = async (orderId, userId) => {
    const order = await order_model_1.OrderModel.findById(orderId).populate("items.gameId");
    if (!order)
        return null;
    // If order has a userId, verify it matches the requesting user
    if (order.userId && userId && order.userId.toString() !== userId) {
        return null;
    }
    return order;
};
exports.getOrderById = getOrderById;
const updateOrderStatus = async (orderId, updates) => {
    return order_model_1.OrderModel.findByIdAndUpdate(orderId, { $set: updates }, { new: true }).populate("items.gameId");
};
exports.updateOrderStatus = updateOrderStatus;
const getAllOrders = async () => {
    return order_model_1.OrderModel.find()
        .populate("items.gameId")
        .populate("userId")
        .sort({ createdAt: -1 });
};
exports.getAllOrders = getAllOrders;
const searchAdminOrders = async (filters) => {
    const query = {};
    const andConditions = [];
    if (filters.search) {
        const regex = new RegExp(filters.search, "i");
        andConditions.push({
            $or: [
                { orderNumber: regex },
                { "customerInfo.name": regex },
                { "customerInfo.email": regex },
                { "customerInfo.phone": regex },
            ],
        });
    }
    if (filters.paymentStatus) {
        andConditions.push({ paymentStatus: filters.paymentStatus });
    }
    if (filters.fulfillmentStatus) {
        andConditions.push({ fulfillmentStatus: filters.fulfillmentStatus });
    }
    if (filters.fromDate || filters.toDate) {
        const range = {};
        if (filters.fromDate) {
            range.$gte = filters.fromDate;
        }
        if (filters.toDate) {
            range.$lte = filters.toDate;
        }
        andConditions.push({ createdAt: range });
    }
    if (andConditions.length) {
        query.$and = andConditions;
    }
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        order_model_1.OrderModel.find(query)
            .populate("items.gameId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        order_model_1.OrderModel.countDocuments(query),
    ]);
    return { orders, total };
};
exports.searchAdminOrders = searchAdminOrders;
const notifyCustomerByEmail = async (orderId, payload) => {
    const order = await order_model_1.OrderModel.findById(orderId)
        .populate("items.gameId")
        .populate("userId");
    if (!order) {
        return null;
    }
    const subject = payload.subject?.trim() || `رسید سفارش ${order.orderNumber}`;
    const greeting = order.customerInfo.name
        ? `سلام ${order.customerInfo.name}`
        : "سلام همراه GameClub";
    const summaryLines = order.items
        .map((item) => `• ${item.quantity}× ${item.gameId?.title ?? "بازی"} (${item.pricePaid.toLocaleString("fa-IR")} تومان)`)
        .join("\n");
    const compiledMessage = payload.message?.trim() ||
        `${greeting}

سفارش شماره ${order.orderNumber} با مبلغ ${order.totalAmount.toLocaleString("fa-IR")} تومان ثبت شده است.
جزئیات اقلام:
${summaryLines}

وضعیت پرداخت: ${order.paymentStatus === "paid" ? "پرداخت شده" : "در انتظار پرداخت"}
وضعیت تحویل: ${order.fulfillmentStatus}

با تشکر از خرید شما؛ تیم GameClub`;
    // Send notification using notification service
    try {
        const { sendNotification } = await Promise.resolve().then(() => __importStar(require("./notificationSender.service")));
        const user = order.userId ? order.userId : null;
        await sendNotification({
            userId: user?._id?.toString(),
            orderId: order._id.toString(),
            type: "order_email",
            subject,
            message: compiledMessage,
            channel: user?.telegram ? "both" : "email",
            email: order.customerInfo.email,
            telegramChatId: user?.telegram,
        });
    }
    catch (error) {
        console.error("Failed to send notification:", error);
    }
    return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        to: order.customerInfo.email,
        subject,
        message: compiledMessage,
    };
};
exports.notifyCustomerByEmail = notifyCustomerByEmail;
const updateOrderDelivery = async (orderId, payload) => {
    const update = {};
    if (payload.message !== undefined) {
        update["deliveryInfo.message"] = payload.message;
    }
    if (payload.credentials !== undefined) {
        update["deliveryInfo.credentials"] = payload.credentials;
    }
    update["deliveryInfo.deliveredAt"] = payload.deliveredAt ?? new Date();
    if (payload.updatedBy) {
        update["deliveryInfo.updatedBy"] = payload.updatedBy;
    }
    const order = await order_model_1.OrderModel.findByIdAndUpdate(orderId, { $set: update }, { new: true })
        .populate("items.gameId")
        .populate("userId");
    // Send delivery notification if credentials or message provided
    if (order && (payload.message || payload.credentials)) {
        try {
            const { sendOrderDelivery } = await Promise.resolve().then(() => __importStar(require("./notificationSender.service")));
            const user = order.userId ? order.userId : null;
            if (payload.credentials) {
                await sendOrderDelivery(user?._id?.toString(), order._id.toString(), order.orderNumber, order.customerInfo.email, user?.telegram, payload.credentials, payload.message);
            }
        }
        catch (error) {
            console.error("Failed to send delivery notification:", error);
            // Don't fail the update if notification fails
        }
    }
    return order;
};
exports.updateOrderDelivery = updateOrderDelivery;
const acknowledgeOrderDelivery = async (orderId, userId) => {
    return order_model_1.OrderModel.findOneAndUpdate({ _id: orderId, userId }, {
        $set: {
            customerAcknowledgement: {
                acknowledged: true,
                acknowledgedAt: new Date(),
            },
        },
    }, { new: true });
};
exports.acknowledgeOrderDelivery = acknowledgeOrderDelivery;
const updateOrderItemWarranty = async (orderId, itemId, warrantyData) => {
    const order = await order_model_1.OrderModel.findById(orderId);
    if (!order)
        return null;
    const item = order.items.find((i) => i._id?.toString() === itemId || i.id === itemId);
    if (!item)
        return null;
    item.warranty = {
        status: warrantyData.status,
        startDate: warrantyData.startDate,
        endDate: warrantyData.endDate,
        description: warrantyData.description
    };
    await order.save();
    return order;
};
exports.updateOrderItemWarranty = updateOrderItemWarranty;
//# sourceMappingURL=order.service.js.map