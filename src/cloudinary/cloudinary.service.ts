import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './response/cloudinary.response';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor() {}

  async uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    const result = await new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
    return result;
  }

  async deleteFile(imageId: string) {
    cloudinary.uploader.destroy(imageId);
  }
}
