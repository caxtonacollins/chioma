import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review } from './review.entity';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // @UseGuards(JwtAuthGuard)
  @Post()
  async createReview(
    @Body() body: Partial<Review>,
    @Req() req,
  ): Promise<Review> {
    // TODO: Add authorization logic
    return this.reviewsService.create(body);
  }

  @Get('user/:userId')
  async getUserReviews(@Param('userId') userId: string): Promise<Review[]> {
    return this.reviewsService.getUserReviews(userId);
  }

  @Get('property/:propertyId')
  async getPropertyReviews(
    @Param('propertyId') propertyId: string,
  ): Promise<Review[]> {
    return this.reviewsService.getPropertyReviews(propertyId);
  }

  @Post('report/:reviewId')
  async reportReview(
    @Param('reviewId') reviewId: string,
  ): Promise<{ success: boolean }> {
    // Mark review as reported
    // In production, notify admin or moderation queue
    // For now, just set reported=true
    // TODO: Add authentication if needed
    // Use service method
    await this.reviewsService.reportReview(reviewId);
    return { success: true };
  }
}
