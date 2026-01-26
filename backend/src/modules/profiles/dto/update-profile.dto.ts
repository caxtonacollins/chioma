import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  Matches,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Chioma Nnadi' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiPropertyOptional({ example: 'chioma@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'ipfs://bafy.../avatar.png' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({ example: 1, description: '1 landlord, 2 tenant, 3 agent' })
  @IsInt()
  @Min(1)
  @Max(3)
  accountType: number;

  @ApiProperty({ example: 'GABCD1234...' })
  @IsString()
  @Matches(/^G[A-Z2-7]{55}$/)
  stellarPublicKey: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class SubmitOnChainDto {
  @ApiProperty({ description: 'Signed transaction XDR (base64)' })
  @IsString()
  @IsNotEmpty()
  signedXdr: string;
}
