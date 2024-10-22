import { defineStore } from "pinia";

interface BaseMessage {
  id: number;
  role: "user" | "assistant" | "system";
  time: string;
}

export interface TextChatMessage extends BaseMessage {
  type: "text";
  content: string;
  isNewMessage?: boolean;
}

export interface ButtonChatMessage extends BaseMessage {
  type: "button";
  content: string;
  buttons: Array<{
    text: string;
    action: "dialog" | "process";
    payload?: string;
  }>;
}

export type ChatMessage = TextChatMessage | ButtonChatMessage;

export interface ChatHistory {
  id: number;
  date: string;
  title: string;
  messages: ChatMessage[];
  lastMessageTime: string;
}

interface FeedbackState {
  [messageId: number]: boolean | null;
}

export const useChatStore = defineStore("chat", {
  state: () => ({
    chatHistory: [] as ChatHistory[],
    currentChatId: null as number | null,
    feedback: {} as FeedbackState,
    isLoading: false,
    isWaitingForResponse: false,
    showSidebar: true,
  }),
  actions: {
    addNewChat() {
      const now = new Date();
      const newChat: ChatHistory = {
        id: now.getTime(),
        date: now.toLocaleDateString(),
        title: "新對話",
        messages: [],
        lastMessageTime: this.formatTime(now),
      };
      this.chatHistory.unshift(newChat);
      this.currentChatId = newChat.id;
    },
    selectChat(id: number) {
      this.currentChatId = id;
    },
    addMessage(chatId: number, message: Omit<TextChatMessage, "time" | "id"> | Omit<ButtonChatMessage, "time" | "id">) {
      const chat = this.chatHistory.find((c) => c.id === chatId);
      if (chat) {
        const now = new Date();
        const newMessage: ChatMessage = {
          ...message,
          id: Date.now(),
          time: this.formatTime(now),
        };

        if (newMessage.type === "text" && "isNewMessage" in message) {
          (newMessage as TextChatMessage).isNewMessage = message.isNewMessage;
        }

        chat.messages.push(newMessage);
        chat.lastMessageTime = newMessage.time;
        if (chat.messages.length === 1) {
          chat.title = message.type === "text" ? message.content.slice(0, 20) + "..." : "新對話";
        }
      }
    },
    setIsLoading(value: boolean) {
      this.isLoading = value;
    },
    setIsWaitingForResponse(value: boolean) {
      this.isWaitingForResponse = value;
    },
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },
    formatTime(date: Date): string {
      return date.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
    },
    formatDate(date: Date): string {
      return date.toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    },
    setFeedback(messageId: number, isHelpful: boolean) {
      this.feedback[messageId] = isHelpful;
    },
    getFeedbackStatus(messageId: number): boolean {
      return messageId in this.feedback;
    },
    getFeedback(messageId: number): boolean | null {
      return this.feedback[messageId] ?? null;
    },
  },
  getters: {
    currentChat: (state): ChatHistory | undefined => state.chatHistory.find((chat) => chat.id === state.currentChatId),
    groupedChatHistory: (state) => {
      const groups: { [key: string]: ChatHistory[] } = {};
      state.chatHistory.forEach((chat) => {
        const date = new Date(chat.id).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" });
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(chat);
      });
      return groups;
    },
  },
});
