import { ApiProperty } from '@nestjs/swagger';

class UserProfileDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John', nullable: true })
  firstName: string | null;

  @ApiProperty({ example: 'Doe', nullable: true })
  lastName: string | null;

  @ApiProperty({ example: 'tenant', description: 'User role' })
  role: string;
}

/**
 * Response for successful login without MFA
 */
export class AuthSuccessResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', required: false })
  refreshToken?: string;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;

  @ApiProperty({ example: false })
  mfaRequired: false;
}

/**
 * Response when MFA verification is required
 */
export class AuthMfaRequiredResponseDto {
  @ApiProperty({ example: null })
  accessToken: null;

  @ApiProperty({ example: null })
  refreshToken: null;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;

  @ApiProperty({ example: true })
  mfaRequired: true;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  mfaToken: string;
}

/**
 * Discriminated union type for authentication responses
 * Ensures type safety by requiring either complete success response or MFA required response
 */
export type AuthResponseDto = AuthSuccessResponseDto | AuthMfaRequiredResponseDto;

/**
 * API response for successful login (refreshToken stored in HTTP-only cookie)
 */
export class AuthApiSuccessResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}

/**
 * Union type for API responses (used by controllers)
 */
export type AuthApiResponseDto = AuthApiSuccessResponseDto | AuthMfaRequiredResponseDto;

export class MessageResponseDto {
  @ApiProperty({ example: 'Operation successful' })
  message: string;
}

