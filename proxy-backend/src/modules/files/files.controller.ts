import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadFile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.filesService.uploadFile(file, req.user.userId);
  }

  @Get(':fileKey(*)')
  async getFileUrl(@Request() req, @Param('fileKey') fileKey: string) {
    const url = await this.filesService.getFileUrl(fileKey, req.user.userId);
    return { url };
  }

  @Delete(':fileKey(*)')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Request() req, @Param('fileKey') fileKey: string) {
    await this.filesService.deleteFile(fileKey, req.user.userId);
  }

  @Get(':fileKey(*)/metadata')
  async getFileMetadata(@Request() req, @Param('fileKey') fileKey: string) {
    return this.filesService.getFileMetadata(fileKey, req.user.userId);
  }
}
