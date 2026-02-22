import { Injectable } from '@nestjs/common';
import { MeetingAiService } from './meeting-ai.service';
import { DecisionAiService } from './decision-ai.service';
import { FeedbackAiService } from './feedback-ai.service';
import { EventAiService } from './event-ai.service';

@Injectable()
export class AiOrchestratorService {
  constructor(
    readonly meeting: MeetingAiService,
    readonly decision: DecisionAiService,
    readonly feedback: FeedbackAiService,
    readonly event: EventAiService,
  ) {}
}
