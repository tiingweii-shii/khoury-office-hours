import {
  CreateQuestionParams,
  CreateQuestionResponse,
  DesktopNotifBody,
  GetCourseResponse,
  GetProfileResponse,
  GetQuestionResponse,
  GetQueueResponse,
  ListQuestionsResponse,
  PhoneNotifBody,
  QueuePartial,
  TAUpdateStatusResponse,
  UpdateQuestionParams,
  UpdateQuestionResponse,
  UpdateProfileParams,
} from "@template/common";
import Axios, { AxiosInstance } from "axios";

class APIClient {
  private axios: AxiosInstance;
  profile = {
    index: async (): Promise<GetProfileResponse> => {
      return (await this.axios.get(`/api/v1/profile`)).data;
    },
    patch: async (body: UpdateProfileParams): Promise<GetProfileResponse> => {
      return (await this.axios.patch(`/api/v1/profile`, body)).data;
    },
  };
  course = {
    get: async (courseId: number): Promise<GetCourseResponse> => {
      const course = (await this.axios.get(`/api/v1/courses/${courseId}`)).data;
      course.officeHours.forEach((officeHour: any) =>
        parseOfficeHourDates(officeHour)
      );
      // If you need to add time to queues check out this commit:
      return course;
    },
  };
  taStatus = {
    checkIn: async (
      courseId: number,
      room: string
    ): Promise<TAUpdateStatusResponse> => {
      const queue = (
        await this.axios.post(`/api/v1/courses/${courseId}/ta_location/${room}`)
      ).data;
      return queue;
    },
    checkOut: async (courseId: number, room: string): Promise<void> => {
      await this.axios.delete(
        `/api/v1/courses/${courseId}/ta_location/${room}`
      );
    },
  };
  questions = {
    index: async (queueId: number): Promise<ListQuestionsResponse> => {
      const questions = (
        await this.axios.get(`/api/v1/queues/${queueId}/questions`)
      ).data;
      questions.forEach((question: any) => parseQuestionDates(question));
      return questions;
    },
    create: async (
      params: CreateQuestionParams
    ): Promise<CreateQuestionResponse> => {
      const question = (await this.axios.post(`/api/v1/questions`, params))
        .data;
      parseQuestionDates(question);
      return question;
    },
    get: async (questionId: number): Promise<GetQuestionResponse> => {
      return (await this.axios.get(`/api/v1/questions/${questionId}`)).data;
    },
    update: async (
      questionId: number,
      params: UpdateQuestionParams
    ): Promise<UpdateQuestionResponse> => {
      const question = (
        await this.axios.patch(`/api/v1/questions/${questionId}`, params)
      ).data;
      parseQuestionDates(question);
      return question;
    },
    notify: async (questionId: number): Promise<void> => {
      await this.axios.post(`/api/v1/questions/${questionId}/notify`);
    },
  };
  queues = {
    get: async (queueId: number): Promise<GetQueueResponse> => {
      return (await this.axios.get(`/api/v1/queues/${queueId}`)).data;
    },
    updateNotes: async (queueId: number, notes: string) => {
      await this.axios.patch(`/api/v1/queues/${queueId}`, { notes });
    },
  };
  notif = {
    notify_user: async (userId: number): Promise<void> => {
      await this.axios.post(`/api/v1/notifications/notify_user/${userId}`);
    },
    desktop: {
      credentials: async (): Promise<string> => {
        return this.axios.get("/api/v1/notifications/desktop/credentials");
      },
      register: async (
        userId: number,
        payload: DesktopNotifBody
      ): Promise<string> => {
        return this.axios.post(
          `/api/v1/notifications/desktop/register/${userId}`,
          payload
        );
      },
    },
    phone: {
      register: async (
        userId: number,
        payload: PhoneNotifBody
      ): Promise<string> => {
        return this.axios.post(
          `/api/v1/notifications/phone/register/${userId}`,
          payload
        );
      },
    },
  };
  constructor(baseURL = "") {
    this.axios = Axios.create({ baseURL: baseURL });
  }
}

function parseOfficeHourDates(officeHour: any): void {
  officeHour.startTime = new Date(officeHour.startTime);
  officeHour.endTime = new Date(officeHour.endTime);
}

function parseQueueDates(queue: any): void {
  queue.createdAt = new Date(queue.createdAt);
  queue.closedAt = new Date(queue.closedAt);
}

function parseQuestionDates(question: any): void {
  question.createdAt = new Date(question.createdAt);
  question.helpedAt ? (question.helpedAt = new Date(question.helpedAt)) : null;
  question.closedAt ? (question.closedAt = new Date(question.closedAtt)) : null;
}

export const API = new APIClient(process.env.API_URL);
