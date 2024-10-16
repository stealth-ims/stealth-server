import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './provider/cloudinary.provider';

@Global()
@Module({
  providers: [CloudinaryService, CloudinaryProvider],
})
export class CloudinaryModule {}
