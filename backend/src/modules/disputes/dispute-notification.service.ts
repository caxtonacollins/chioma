import { Injectable } from '@nestjs/common';
import { Dispute, DisputeStatus } from './entities/dispute.entity';
import { User } from '../users/entities/user.entity';
import { RentAgreement } from '../rent/entities/rent-contract.entity';

export interface DisputeNotificationData {
  dispute: Dispute;
  agreement: RentAgreement;
  initiator: User;
  recipient?: User;
  action:
    | 'created'
    | 'evidence_added'
    | 'comment_added'
    | 'status_updated'
    | 'resolved';
  additionalData?: Record<string, unknown>;
}

@Injectable()
export class DisputeNotificationService {
  /**
   * Send notification for dispute creation
   */
  notifyDisputeCreated(data: DisputeNotificationData): void {
    const { dispute, agreement, initiator } = data;

    // Notify the other party (landlord or tenant)
    const otherPartyId =
      agreement.landlordId === initiator.id
        ? agreement.tenantId
        : agreement.landlordId;

    this.sendNotification({
      userId: otherPartyId || '',
      type: 'DISPUTE_CREATED',
      title: 'New Dispute Filed',
      message: `A new dispute has been filed for your rental agreement. Type: ${dispute.disputeType}`,
      data: {
        disputeId: dispute.disputeId,
        agreementId: agreement.id,
        disputeType: dispute.disputeType,
        initiatedBy: initiator.firstName || initiator.email,
      },
    });

    // Notify admins
    this.notifyAdmins(dispute, 'NEW_DISPUTE', 'New Dispute Requires Review');
  }

  /**
   * Send notification for evidence added
   */
  notifyEvidenceAdded(data: DisputeNotificationData): void {
    const { dispute, agreement, initiator } = data;

    // Notify the other party
    const otherPartyId =
      agreement.landlordId === initiator.id
        ? agreement.tenantId
        : agreement.landlordId;

    this.sendNotification({
      userId: otherPartyId || '',
      type: 'EVIDENCE_ADDED',
      title: 'New Evidence Added',
      message: `New evidence has been added to the dispute for your rental agreement.`,
      data: {
        disputeId: dispute.disputeId,
        agreementId: agreement.id,
        addedBy: initiator.firstName || initiator.email,
      },
    });
  }

  /**
   * Send notification for comment added
   */
  notifyCommentAdded(data: DisputeNotificationData): void {
    const { dispute, agreement, initiator, additionalData } = data;
    const isInternal =
      additionalData &&
      typeof additionalData === 'object' &&
      'isInternal' in additionalData
        ? Boolean((additionalData as { isInternal?: boolean }).isInternal)
        : false;

    if (isInternal) {
      // Internal comments only go to admins
      this.notifyAdmins(dispute, 'INTERNAL_COMMENT', 'New Internal Comment');
    } else {
      // Public comments notify all parties
      const otherPartyId =
        agreement.landlordId === initiator.id
          ? agreement.tenantId
          : agreement.landlordId;

      this.sendNotification({
        userId: otherPartyId || '',
        type: 'COMMENT_ADDED',
        title: 'New Comment Added',
        message: `A new comment has been added to the dispute for your rental agreement.`,
        data: {
          disputeId: dispute.disputeId,
          agreementId: agreement.id,
          commentBy: initiator.firstName || initiator.email,
        },
      });
    }
  }

  /**
   * Send notification for dispute status update
   */
  notifyStatusUpdated(data: DisputeNotificationData): void {
    const { dispute, agreement, initiator } = data;

    // Notify all parties
    const parties = [agreement.landlordId, agreement.tenantId].filter(
      (id) => id !== initiator.id,
    );

    for (const partyId of parties) {
      this.sendNotification({
        userId: partyId || '',
        type: 'DISPUTE_STATUS_UPDATED',
        title: 'Dispute Status Updated',
        message: `The dispute status has been updated to: ${dispute.status}`,
        data: {
          disputeId: dispute.disputeId,
          agreementId: agreement.id,
          newStatus: dispute.status,
          updatedBy: initiator.firstName || initiator.email,
        },
      });
    }

    // Notify admins if status requires attention
    if (dispute.status === DisputeStatus.UNDER_REVIEW) {
      this.notifyAdmins(
        dispute,
        'DISPUTE_UNDER_REVIEW',
        'Dispute Under Review',
      );
    }
  }

  /**
   * Send notification for dispute resolution
   */
  notifyDisputeResolved(data: DisputeNotificationData): void {
    const { dispute, agreement, initiator } = data;

    // Notify all parties
    const parties = [agreement.landlordId, agreement.tenantId];

    for (const partyId of parties) {
      this.sendNotification({
        userId: partyId || '',
        type: 'DISPUTE_RESOLVED',
        title: 'Dispute Resolved',
        message: `The dispute for your rental agreement has been resolved.`,
        data: {
          disputeId: dispute.disputeId,
          agreementId: agreement.id,
          resolution: dispute.resolution,
          resolvedBy: initiator.firstName || initiator.email,
        },
      });
    }
  }

  /**
   * Notify all admins about a dispute
   */
  private notifyAdmins(dispute: Dispute, type: string, title: string): void {
    // This would typically query for all admin users and send notifications
    // For now, we'll implement a placeholder that could be connected to
    // the actual notification system

    console.log(`Admin notification: ${title} - Dispute ${dispute.disputeId}`);

    // Example implementation:
    // const admins = await this.userRepository.find({ where: { role: UserRole.ADMIN } });
    // for (const admin of admins) {
    //   await this.sendNotification({
    //     userId: admin.id,
    //     type,
    //     title,
    //     message: `Dispute ${dispute.disputeId} requires attention`,
    //     data: { disputeId: dispute.disputeId },
    //   });
    // }
  }

  /**
   * Send notification (placeholder for actual notification service)
   */
  private sendNotification(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data: Record<string, unknown>;
  }): void {
    // This would integrate with the actual notification service
    // For now, we'll log it

    console.log(`Notification sent to user ${notification.userId}:`, {
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
    });

    // Example implementation:
    // await this.notificationService.create({
    //   userId: notification.userId,
    //   type: notification.type,
    //   title: notification.title,
    //   message: notification.message,
    //   data: notification.data,
    //   isRead: false,
    // });
  }
}
