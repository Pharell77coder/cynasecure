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
  adminReply: string | null;
  repliedAt: string | null;
  replyReadAt: string | null;
  createdAt: string;
}

export interface UserMessage {
  id: number;
  subject: string;
  message: string;
  status: "new" | "read" | "answered";
  adminReply: string | null;
  repliedAt: string | null;
  replyReadAt: string | null;
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

  suggestions: () =>
    apiFetch<{ label: string; questions: string[] }[]>("/api/chatbot/suggestions"),

  user: {
    myMessages: () =>
      apiFetch<UserMessage[]>("/api/my-messages"),

    unreadCount: () =>
      apiFetch<{ count: number }>("/api/my-messages/unread-count"),

    markRead: () =>
      apiFetch<{ ok: boolean }>("/api/my-messages/mark-read", { method: "POST" }),
  },

  admin: {
    listMessages: (page = 1, perPage = 20) =>
      apiFetch<{ items: AdminContactMessage[]; total: number; page: number; perPage: number; totalPages: number }>(
        `/api/admin/contact-messages?page=${page}&perPage=${perPage}`
      ),

    updateStatus: (id: number, status: string) =>
      apiFetch<AdminContactMessage>(`/api/admin/contact-messages/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),

    reply: (id: number, reply: string) =>
      apiFetch<AdminContactMessage>(`/api/admin/contact-messages/${id}/reply`, {
        method: "POST",
        body: JSON.stringify({ reply }),
      }),

    listConversations: (page = 1, perPage = 20) =>
      apiFetch<{ items: AdminConversation[]; total: number; page: number; perPage: number; totalPages: number }>(
        `/api/admin/chatbot-conversations?page=${page}&perPage=${perPage}`
      ),

    getConversation: (id: number) =>
      apiFetch<AdminConversationDetail>(`/api/admin/chatbot-conversations/${id}`),
  },
};
