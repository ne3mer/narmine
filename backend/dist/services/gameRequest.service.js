"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGameRequest = exports.updateGameRequestStatus = exports.getGameRequestStats = exports.getAllGameRequests = exports.getUserGameRequests = exports.createGameRequest = void 0;
const gameRequest_model_1 = require("../models/gameRequest.model");
const errorHandler_1 = require("../middleware/errorHandler");
const createGameRequest = async (userId, input) => {
    const request = await gameRequest_model_1.GameRequestModel.create({
        ...input,
        userId
    });
    return request;
};
exports.createGameRequest = createGameRequest;
const getUserGameRequests = async (userId) => {
    return gameRequest_model_1.GameRequestModel.find({ userId }).sort({ createdAt: -1 });
};
exports.getUserGameRequests = getUserGameRequests;
const getAllGameRequests = async (status) => {
    const query = status ? { status } : {};
    const requests = await gameRequest_model_1.GameRequestModel.find(query)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 });
    const stats = await (0, exports.getGameRequestStats)();
    return {
        data: requests,
        statistics: stats
    };
};
exports.getAllGameRequests = getAllGameRequests;
const getGameRequestStats = async () => {
    const total = await gameRequest_model_1.GameRequestModel.countDocuments();
    const pending = await gameRequest_model_1.GameRequestModel.countDocuments({ status: 'pending' });
    const approved = await gameRequest_model_1.GameRequestModel.countDocuments({ status: 'approved' });
    const rejected = await gameRequest_model_1.GameRequestModel.countDocuments({ status: 'rejected' });
    const completed = await gameRequest_model_1.GameRequestModel.countDocuments({ status: 'completed' });
    return {
        total,
        pending,
        approved,
        rejected,
        completed
    };
};
exports.getGameRequestStats = getGameRequestStats;
const updateGameRequestStatus = async (id, input) => {
    const request = await gameRequest_model_1.GameRequestModel.findByIdAndUpdate(id, {
        status: input.status,
        adminNote: input.adminNote
    }, { new: true });
    if (!request) {
        throw new errorHandler_1.ApiError(404, 'Request not found');
    }
    return request;
};
exports.updateGameRequestStatus = updateGameRequestStatus;
const deleteGameRequest = async (id) => {
    const request = await gameRequest_model_1.GameRequestModel.findByIdAndDelete(id);
    if (!request) {
        throw new errorHandler_1.ApiError(404, 'Request not found');
    }
    return request;
};
exports.deleteGameRequest = deleteGameRequest;
//# sourceMappingURL=gameRequest.service.js.map