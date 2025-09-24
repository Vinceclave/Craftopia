import multer from 'multer';
import path from 'path'
import fs, { promises as fsPromises} from 'fs'

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const folder = req.body.folder || 'posts';
        const uploadPath = path.join(__dirname, '../../uploads', folder)

        if(!fs.existsSync(uploadPath)) {
            await fsPromises.mkdir(uploadPath, { recursive: true })
        }
        
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const extension = path.extname(file.originalname)
        const filename = `image_${timestamp}${extension}`

        cb(null, filename)
    }
})

const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes =  ['image/jpeg', 'image/jpg ', 'image/png', 'image/webp']
    if (allowedTypes.includes(file.mimeType)) {
        cb(null, true)
    } else {
        cb(new Error('Only image files allowed'), false)
    }
}

export const uploadToFolder = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})