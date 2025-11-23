"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadScreenshot = void 0;
const uploadScreenshot = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'هیچ فایلی آپلود نشده است' });
        }
        // Construct public URL
        // Assuming app serves 'public/uploads' at '/uploads'
        const fileUrl = `/uploads/screenshots/${req.file.filename}`;
        res.json({
            message: 'فایل با موفقیت آپلود شد',
            url: fileUrl,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'خطا در آپلود فایل', error: error.message });
    }
};
exports.uploadScreenshot = uploadScreenshot;
//# sourceMappingURL=arena-upload.controller.js.map