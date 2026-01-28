import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { AddEvidenceDto } from './dto/add-evidence.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { QueryDisputesDto } from './dto/query-disputes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDispute(
    @Body() createDisputeDto: CreateDisputeDto,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.disputesService.createDispute(createDisputeDto, userId);
  }

  @Get()
  async findAll(
    @Query() query: QueryDisputesDto,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = req.user?.id;
    return this.disputesService.findAll(query, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.disputesService.findOne(parseInt(id));
  }

  @Get('dispute/:disputeId')
  async findByDisputeId(@Param('disputeId') disputeId: string) {
    return this.disputesService.findByDisputeId(disputeId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDisputeDto: UpdateDisputeDto,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.disputesService.update(parseInt(id), updateDisputeDto, userId);
  }

  @Post(':disputeId/evidence')
  @UseInterceptors(FileInterceptor('file'))
  async addEvidence(
    @Param('disputeId') disputeId: string,
    @UploadedFile()
    file:
      | { path?: string; originalname: string; mimetype: string; size: number }
      | undefined,
    @Body() dto: AddEvidenceDto,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = req.user?.id;
    if (!userId || !file) {
      throw new Error('User not authenticated or file missing');
    }
    return this.disputesService.addEvidence(disputeId, file, userId, dto);
  }

  @Post(':disputeId/comment')
  async addComment(
    @Param('disputeId') disputeId: string,
    @Body() addCommentDto: AddCommentDto,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.disputesService.addComment(disputeId, addCommentDto, userId);
  }

  @Post(':disputeId/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async resolveDispute(
    @Param('disputeId') disputeId: string,
    @Body() resolveDisputeDto: ResolveDisputeDto,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.disputesService.resolveDispute(
      disputeId,
      resolveDisputeDto,
      userId,
    );
  }

  @Get('agreement/:agreementId/disputes')
  async getAgreementDisputes(
    @Param('agreementId') agreementId: string,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = req.user?.id;
    return this.disputesService.getAgreementDisputes(agreementId, userId);
  }
}
