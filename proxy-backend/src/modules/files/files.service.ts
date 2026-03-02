import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { S3Service } from './s3/s3.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  constructor(private s3Service: S3Service) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ fileKey: string; url: string }> {
    const fileExtension = file.originalname.split('.').pop();
    const fileKey = `uploads/${userId}/${uuidv4()}.${fileExtension}`;

    await this.s3Service.uploadFile(
      fileKey,
      file.buffer,
      file.mimetype,
      {
        originalName: file.originalname,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
      },
    );

    const url = await this.s3Service.generatePresignedUrl(fileKey);

    return { fileKey, url };
  }

  async getFileUrl(fileKey: string, userId: string): Promise<string> {
    // Verify file belongs to user
    const metadata = await this.s3Service.getFileMetadata(fileKey);

    if (metadata.metadata?.uploadedBy !== userId) {
      throw new ForbiddenException('You do not have access to this file');
    }

    return this.s3Service.generatePresignedUrl(fileKey);
  }

  async deleteFile(fileKey: string, userId: string): Promise<void> {
    // Verify file belongs to user
    const metadata = await this.s3Service.getFileMetadata(fileKey);

    if (metadata.metadata?.uploadedBy !== userId) {
      throw new ForbiddenException('You do not have access to this file');
    }

    await this.s3Service.deleteFile(fileKey);
  }

  async getFileMetadata(fileKey: string, userId: string): Promise<any> {
    const metadata = await this.s3Service.getFileMetadata(fileKey);

    if (metadata.metadata?.uploadedBy !== userId) {
      throw new ForbiddenException('You do not have access to this file');
    }

    return metadata;
  }
}
