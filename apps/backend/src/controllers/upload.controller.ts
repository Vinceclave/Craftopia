import { Response, Request } from 'express' 
import { uploadToFolder } from '../middlewares/upload.middleware'
import { AuthRequest } from '../middlewares/auth.middleware'
import { sendSuccess, sendError } from '../utils/response'
import { asyncHandler } from './base.controller'

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file)
        return sendError(res, 'No file uploaded', 400);
    
    const folder = req.body.folder || 'posts'
    
    const imageUrl = `/uploads/${folder}/${req.file.filename}`

    sendSuccess(res, {
        imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        folder
    }, 'Image uploaded successfully')
})

export const uploadMiddleware = uploadToFolder.single('image');
