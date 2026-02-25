import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { KycService } from './kyc.service';
import { SubmitKycDto, KycWebhookDto } from './kyc.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submitKyc(@Req() req, @Body() dto: SubmitKycDto) {
    const userId = req.user.id;
    return this.kycService.submitKyc(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getKycStatus(@Req() req) {
    const userId = req.user.id;
    return this.kycService.getKycStatus(userId);
  }

  @Post('webhook')
  async webhook(@Body() dto: KycWebhookDto) {
    await this.kycService.handleWebhook(dto);
    return { success: true };
  }
}
