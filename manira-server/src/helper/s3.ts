import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { env } from '../config/env';

export const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId:     env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const createUploader = (folder: string, allowVideo = false) =>
  multer({
    storage: multerS3({
      s3,
      bucket: env.AWS_BUCKET_NAME,
      acl:    'public-read',   // requires bucket ACLs enabled in AWS console (Object Ownership → ACLs enabled)
      key: (_req, file, cb) => {
        const ext  = file.originalname.split('.').pop();
        const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        cb(null, name);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
    fileFilter: (_req, file, cb) => {
      const isImage = file.mimetype.startsWith('image/');
      const isVideo = allowVideo && file.mimetype.startsWith('video/');
      cb(null, isImage || isVideo);
    },
    limits: { fileSize: allowVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024 },
  });

export const uploadImage  = (folder = 'products') => createUploader(folder, false).single('image');
export const uploadImages = (folder = 'products') => createUploader(folder, false).array('images', 10);
export const uploadMedia  = (folder = 'products') => createUploader(folder, true).single('media');

export const deleteFromS3 = (url: string) => {
  const key = url.split('.amazonaws.com/')[1];
  if (!key) return Promise.resolve();
  return s3.send(new DeleteObjectCommand({ Bucket: env.AWS_BUCKET_NAME, Key: key }));
};
