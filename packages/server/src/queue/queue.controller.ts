import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ClosedQuestionStatus,
  GetQueueResponse,
  ListQuestionsResponse,
  UpdateQueueNotesParams,
  OpenQuestionStatus,
} from '@template/common';
import { Connection, In, Not, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { JwtAuthGuard } from '../login/jwt-auth.guard';
import { QuestionModel } from '../question/question.entity';
import { QueueModel } from './queue.entity';
import { OfficeHourModel } from 'course/office-hour.entity';
import { QueueService } from './queue.service';

@Controller('queues')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class QueueController {
  constructor(
    private connection: Connection,
    private queueService: QueueService,
  ) {}

  @Get(':queueId')
  async getQueue(@Param('queueId') queueId: string): Promise<GetQueueResponse> {
    const queue = await QueueModel.findOne(queueId, {
      relations: ['staffList'],
    });

    await this.queueService.addQueueTimes(queue);

    const questions = await QuestionModel.find({ where: { queueId } });
    queue.questions = questions;

    return queue;
  }

  @Get(':queueId/questions')
  async getQuestions(
    @Param('queueId') queueId: string,
  ): Promise<ListQuestionsResponse> {
    // todo: need a way to return different data, if TA vs. student hits endpoint.
    // for now, just return the student response
    const queueSize = await QueueModel.count({
      where: { id: queueId },
    });
    // Check that the queue exists
    if (queueSize === 0) {
      throw new NotFoundException();
    }

    return await QuestionModel.find({
      where: [
        {
          queueId: queueId,
          status: In(Object.values(OpenQuestionStatus)),
        },
      ],
      relations: ['creator', 'taHelped'],
      order: {
        createdAt: 'ASC',
      },
    });
  }

  @Patch(':queueId')
  async updateQueue(
    @Param('queueId') queueId: number,
    @Body() body: UpdateQueueNotesParams,
    // TODO: Add TA/Prof protection on endpoint
  ): Promise<QueueModel> {
    const queue = await QueueModel.findOne({
      where: { id: queueId },
    });
    if (queue === undefined) {
      throw new NotFoundException();
    }

    queue.notes = body.notes;
    await queue.save();
    return queue;
  }
}
