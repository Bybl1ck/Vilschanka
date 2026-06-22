export type CallbackRequestStatus = "new" | "called" | "archived";

export interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  comment?: string;
  source: string;
  selectedDates?: string[];
  houseName?: string;
  status: CallbackRequestStatus;
  createdAt: string;
}

export interface CreateCallbackRequestInput {
  name: string;
  phone: string;
  comment?: string;
  source: string;
  selectedDates?: string[];
  houseName?: string;
}
