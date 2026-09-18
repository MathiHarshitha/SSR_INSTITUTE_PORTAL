export interface ClassScheduleEntry {
  _id: string;
  batch: { _id: string; name: string };
  module?: { _id: string; name: string };
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  description?: string;
  meetingLink?: string;
  location?: string;
  createdAt: string;
}

export interface ClassScheduleFormInput {
  batch: string;
  module?: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  description?: string;
  meetingLink?: string;
  location?: string;
}

export interface ClassScheduleQuery {
  batch?: string;
  from?: string;
  to?: string;
}
