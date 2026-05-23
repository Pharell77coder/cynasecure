import { apiFetch } from "./apiFetch";

export interface ContactPayload {
  email: string;
  subject: string;
  message: string;
}

export interface ChatbotPayload {
  sessionId: string;
  message: string;
  email?: string;
}

export interface ChatbotResponse {
  reply: string;
  matched: boolean;
}

export interface AdminContactMessage {
  id: number;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "answered";
  ipAddress: string | null;
  createdAt: string;
}

export interface AdminConversation {
  id: number;
  sessionId: string;
  email: string | null;
  messages: number;
  createdAt: string;
}

export interface AdminConversationDetail {
  id: number;
  sessionId: string;
  email: string | null;
  createdAt: string;
  messages: { sender: "user" | "bot"; content: string; createdAt: string }[];
}

export const contactApi = {
  send: (payload: ContactPayload) =>
    apiFetch<{ message: string }>("/api/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  chatbot: (payload: ChatbotPayload) =>
    apiFetch<ChatbotResponse>("/api/chatbot/message", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  admin: {
    listMessages: (page = 1) =>
      apiFetch<{ items: AdminContactMessage[]; total: number; page: number }>(
        `/api/admin/contact-messages?page=${page}`
      ),

    updateStatus: (id: number, status: string) =>
      apiFetch<AdminContactMessage>(`/api/admin/contact-messages/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),

    listConversations: () =>
      apiFetch<AdminConversation[]>("/api/admin/chatbot-conversations"),

    getConversation: (id: number) =>
      apiFetch<AdminConversationDetail>(`/api/admin/chatbot-conversations/${id}`),
  },
};
