"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderShippingMethods = exports.deleteShippingMethod = exports.updateShippingMethod = exports.createShippingMethod = exports.getShippingMethodById = exports.getAllShippingMethods = void 0;
const shipping_method_model_1 = require("../models/shipping-method.model");
const getAllShippingMethods = async (req, res) => {
    try {
        const { active } = req.query;
        const query = active === 'true' ? { isActive: true } : {};
        const methods = await shipping_method_model_1.ShippingMethodModel.find(query).sort({ order: 1 });
        res.json({
            success: true,
            data: methods
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching shipping methods',
            error
        });
    }
};
exports.getAllShippingMethods = getAllShippingMethods;
const getShippingMethodById = async (req, res) => {
    try {
        const method = await shipping_method_model_1.ShippingMethodModel.findById(req.params.id);
        if (!method) {
            return res.status(404).json({
                success: false,
                message: 'Shipping method not found'
            });
        }
        res.json({
            success: true,
            data: method
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching shipping method',
            error
        });
    }
};
exports.getShippingMethodById = getShippingMethodById;
const createShippingMethod = async (req, res) => {
    try {
        const method = await shipping_method_model_1.ShippingMethodModel.create(req.body);
        res.status(201).json({
            success: true,
            data: method,
            message: 'Shipping method created successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating shipping method',
            error
        });
    }
};
exports.createShippingMethod = createShippingMethod;
const updateShippingMethod = async (req, res) => {
    try {
        const method = await shipping_method_model_1.ShippingMethodModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!method) {
            return res.status(404).json({
                success: false,
                message: 'Shipping method not found'
            });
        }
        res.json({
            success: true,
            data: method,
            message: 'Shipping method updated successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating shipping method',
            error
        });
    }
};
exports.updateShippingMethod = updateShippingMethod;
const deleteShippingMethod = async (req, res) => {
    try {
        const method = await shipping_method_model_1.ShippingMethodModel.findByIdAndDelete(req.params.id);
        if (!method) {
            return res.status(404).json({
                success: false,
                message: 'Shipping method not found'
            });
        }
        res.json({
            success: true,
            message: 'Shipping method deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting shipping method',
            error
        });
    }
};
exports.deleteShippingMethod = deleteShippingMethod;
const reorderShippingMethods = async (req, res) => {
    try {
        const { methods } = req.body; // Array of { id, order }
        await Promise.all(methods.map((item) => shipping_method_model_1.ShippingMethodModel.findByIdAndUpdate(item.id, { order: item.order })));
        res.json({
            success: true,
            message: 'Shipping methods reordered successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error reordering shipping methods',
            error
        });
    }
};
exports.reorderShippingMethods = reorderShippingMethods;
//# sourceMappingURL=shipping-method.controller.js.map