import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job<{ notificationId: string; channel: string }>) {
    const { notificationId, channel } = job.data;

    switch (channel) {
      case 'EMAIL':
        this.logger.log(`[EMAIL] Sending notification ${notificationId}`);
        // TODO: Implement email sending via Nodemailer
        break;
      case 'PUSH':
        this.logger.log(`[PUSH] Sending notification ${notificationId}`);
        // TODO: Implement push via FCM
        break;
      case 'IN_APP':
        this.logger.log(`[IN_APP] Sending notification ${notificationId}`);
        // TODO: Implement WebSocket push
        break;
      default:
        this.logger.warn(`Unknown channel: ${channel}`);
    }
  }
}
