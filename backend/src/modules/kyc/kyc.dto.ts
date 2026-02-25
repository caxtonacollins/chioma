import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { KycStatus } from './kyc.entity';

export class SubmitKycDto {
  @IsObject()
  @IsNotEmpty()
  kycData: Record<string, any>; // SEP-9 fields
}

export class KycStatusResponseDto {
  @IsEnum(KycStatus)
  status: KycStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class KycWebhookDto {
  @IsString()
  providerReference: string;

  @IsEnum(KycStatus)
  status: KycStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
