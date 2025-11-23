import type { FilterQuery } from "mongoose";
import {
  OrderModel,
  type OrderDocument,
  type PaymentStatus,
  type FulfillmentStatus,
} from "../models/order.model";
import { CartModel } from "../models/cart.model";
import { notifyAdminsOfEvent } from "./adminNotification.service";

interface CreateOrderInput {
  userId?: string;
  customerInfo: {
    name?: string;
    email: string;
    phone: string;
  };
  items: Array<{
    gameId: string;
    variantId?: string;
    selectedOptions?: Record<string, string>;
    pricePaid: number;
    quantity: number;
  }>;
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
  note?: string;
  paymentMethod?: string;
}

export const createOrder = async (
  input: CreateOrderInput
): Promise<OrderDocument> => {
  const orderData: any = {
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

  if (input.userId) {
    orderData.userId = input.userId;
  }

  const order = await OrderModel.create(orderData);

  let orderItemsSummary = input.items.map((item) => ({
    title: "بازی ناشناس",
    quantity: item.quantity,
    price: item.pricePaid,
  }));
  let resolvedCustomerName = order.customerInfo.name;

  // Clear user's cart after order creation
  if (input.userId) {
    await CartModel.findOneAndUpdate(
      { userId: input.userId },
      { $set: { items: [] } }
    );
  }

  // Send order confirmation notification
  try {
    const { sendOrderConfirmation } = await import(
      "./notificationSender.service"
    );
    const { UserModel } = await import("../models/user.model");
    const { GameModel } = await import("../models/game.model");

    // Get user info if logged in
    let userTelegram: string | undefined;
    if (input.userId) {
      const user = await UserModel.findById(input.userId);
      userTelegram = user?.telegram;
      if (!resolvedCustomerName && user?.name) {
        resolvedCustomerName = user.name;
      }
    }

    // Get game titles for items
    orderItemsSummary = await Promise.all(
      input.items.map(async (item) => {
        const game = await GameModel.findById(item.gameId);
        return {
          title: game?.title || "بازی ناشناس",
          quantity: item.quantity,
          price: item.pricePaid,
        };
      })
    );

    await sendOrderConfirmation(
      input.userId,
      order._id.toString(),
      order.orderNumber,
      input.customerInfo.email,
      userTelegram,
      input.totalAmount,
      orderItemsSummary
    );
  } catch (error) {
    console.error("Failed to send order confirmation notification:", error);
    // Don't fail the order if notification fails
  }

  notifyAdminsOfEvent({
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

export const getUserOrders = async (
  userId: string,
  status?: string
): Promise<OrderDocument[]> => {
  const query: any = { userId };
  if (status) {
    query.paymentStatus = status;
  }

  return OrderModel.find(query)
    .populate("items.gameId")
    .sort({ createdAt: -1 });
};

export const getOrdersByCustomer = async (
  email: string,
  phone: string
): Promise<OrderDocument[]> => {
  return OrderModel.find({
    "customerInfo.email": email,
    "customerInfo.phone": phone,
  })
    .populate("items.gameId")
    .sort({ createdAt: -1 });
};

export const getOrderById = async (
  orderId: string,
  userId?: string
): Promise<OrderDocument | null> => {
  const order = await OrderModel.findById(orderId).populate("items.gameId");

  if (!order) return null;

  // If order has a userId, verify it matches the requesting user
  if (order.userId && userId && order.userId.toString() !== userId) {
    return null;
  }

  return order;
};

export const updateOrderStatus = async (
  orderId: string,
  updates: {
    paymentStatus?: "pending" | "paid" | "failed";
    fulfillmentStatus?: "pending" | "assigned" | "delivered" | "refunded";
    paymentReference?: string;
  }
): Promise<OrderDocument | null> => {
  return OrderModel.findByIdAndUpdate(
    orderId,
    { $set: updates },
    { new: true }
  ).populate("items.gameId");
};

export const getAllOrders = async (): Promise<OrderDocument[]> => {
  return OrderModel.find()
    .populate("items.gameId")
    .populate("userId")
    .sort({ createdAt: -1 });
};

export interface AdminOrderFilters {
  search?: string;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  fromDate?: Date;
  toDate?: Date;
  page: number;
  limit: number;
}

export const searchAdminOrders = async (filters: AdminOrderFilters) => {
  const query: FilterQuery<OrderDocument> = {};
  const andConditions: FilterQuery<OrderDocument>[] = [];

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
    const range: Record<string, Date> = {};
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
    OrderModel.find(query)
      .populate("items.gameId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    OrderModel.countDocuments(query),
  ]);

  return { orders, total };
};

export const notifyCustomerByEmail = async (
  orderId: string,
  payload: { subject?: string; message: string }
) => {
  const order = await OrderModel.findById(orderId)
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
    .map(
      (item) =>
        `• ${item.quantity}× ${
          (item.gameId as any)?.title ?? "بازی"
        } (${item.pricePaid.toLocaleString("fa-IR")} تومان)`
    )
    .join("\n");

  const compiledMessage =
    payload.message?.trim() ||
    `${greeting}

سفارش شماره ${order.orderNumber} با مبلغ ${order.totalAmount.toLocaleString(
      "fa-IR"
    )} تومان ثبت شده است.
جزئیات اقلام:
${summaryLines}

وضعیت پرداخت: ${
      order.paymentStatus === "paid" ? "پرداخت شده" : "در انتظار پرداخت"
    }
وضعیت تحویل: ${order.fulfillmentStatus}

با تشکر از خرید شما؛ تیم GameClub`;

  // Send notification using notification service
  try {
    const { sendNotification } = await import("./notificationSender.service");
    const user = order.userId ? (order.userId as any) : null;

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
  } catch (error) {
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

export const updateOrderDelivery = async (
  orderId: string,
  payload: {
    message?: string;
    credentials?: string;
    deliveredAt?: Date;
    updatedBy?: string;
  }
) => {
  const update: Record<string, unknown> = {};
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

  const order = await OrderModel.findByIdAndUpdate(
    orderId,
    { $set: update },
    { new: true }
  )
    .populate("items.gameId")
    .populate("userId");

  // Send delivery notification if credentials or message provided
  if (order && (payload.message || payload.credentials)) {
    try {
      const { sendOrderDelivery } = await import(
        "./notificationSender.service"
      );
      const user = order.userId ? (order.userId as any) : null;

      if (payload.credentials) {
        await sendOrderDelivery(
          user?._id?.toString(),
          order._id.toString(),
          order.orderNumber,
          order.customerInfo.email,
          user?.telegram,
          payload.credentials,
          payload.message
        );
      }
    } catch (error) {
      console.error("Failed to send delivery notification:", error);
      // Don't fail the update if notification fails
    }
  }

  return order;
};

export const acknowledgeOrderDelivery = async (
  orderId: string,
  userId: string
) => {
  return OrderModel.findOneAndUpdate(
    { _id: orderId, userId },
    {
      $set: {
        customerAcknowledgement: {
          acknowledged: true,
          acknowledgedAt: new Date(),
        },
      },
    },
    { new: true }
  );
};

export const updateOrderItemWarranty = async (
  orderId: string,
  itemId: string,
  warrantyData: {
    status: 'active' | 'expired' | 'voided';
    startDate?: Date;
    endDate?: Date;
    description?: string;
  }
) => {
  const order = await OrderModel.findById(orderId);
  if (!order) return null;

  const item = order.items.find(
    (i) => (i as any)._id?.toString() === itemId || (i as any).id === itemId
  );

  if (!item) return null;

  item.warranty = {
    status: warrantyData.status,
    startDate: warrantyData.startDate,
    endDate: warrantyData.endDate,
    description: warrantyData.description
  };

  await order.save();
  return order;
};
