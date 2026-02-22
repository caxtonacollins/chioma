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

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string | null;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken: string | null;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;

  @ApiProperty({ example: false, required: false })
  mfaRequired?: boolean;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  mfaToken?: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Operation successful' })
  message: string;
}
