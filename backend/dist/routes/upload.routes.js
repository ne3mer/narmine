"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_middleware_1 = require("../middleware/upload.middleware");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
// Upload single image (admin only)
router.post('/image', adminAuth_1.adminAuth, upload_middleware_1.upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'لطفاً یک تصویر انتخاب کنید' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({
            message: 'تصویر با موفقیت آپلود شد',
            data: {
                url: imageUrl,
                filename: req.file.filename
            }
        });
    }
    catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'خطا در آپلود تصویر' });
    }
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map