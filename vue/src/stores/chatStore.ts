import { defineStore } from "pinia";
import { ref, computed } from "vue";

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

export const useChatStore = defineStore("chat", () => {
  const chatHistory = ref<ChatHistory[]>([]);
  const currentChatId = ref<number | null>(null);
  const feedback = ref<FeedbackState>({});
  const isLoading = ref(false);
  const isWaitingForResponse = ref(false);
  const showSidebar = ref(true);

  const currentChat = computed(() => chatHistory.value.find((chat) => chat.id === currentChatId.value));

  const groupedChatHistory = computed(() => {
    const groups: { [key: string]: ChatHistory[] } = {};
    chatHistory.value.forEach((chat) => {
      const date = new Date(chat.id).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(chat);
    });
    return groups;
  });

  function addNewChat() {
    const now = new Date();
    const newChat: ChatHistory = {
      id: now.getTime(),
      date: now.toLocaleDateString(),
      title: "新對話",
      messages: [],
      lastMessageTime: formatTime(now),
    };
    chatHistory.value.unshift(newChat);
    currentChatId.value = newChat.id;
  }

  function selectChat(id: number) {
    currentChatId.value = id;
  }

  function addMessage(chatId: number, message: Omit<TextChatMessage, "time" | "id"> | Omit<ButtonChatMessage, "time" | "id">) {
    const chat = chatHistory.value.find((c) => c.id === chatId);
    if (chat) {
      const now = new Date();
      const newMessage: ChatMessage = {
        ...message,
        id: Date.now(),
        time: formatTime(now),
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
  }

  function setIsLoading(value: boolean) {
    isLoading.value = value;
  }

  function setIsWaitingForResponse(value: boolean) {
    isWaitingForResponse.value = value;
  }

  function toggleSidebar() {
    showSidebar.value = !showSidebar.value;
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function setFeedback(messageId: number, isHelpful: boolean) {
    feedback.value[messageId] = isHelpful;
  }

  function getFeedbackStatus(messageId: number): boolean {
    return messageId in feedback.value;
  }

  function getFeedback(messageId: number): boolean | null {
    return feedback.value[messageId] ?? null;
  }

  return {
    chatHistory,
    currentChatId,
    feedback,
    isLoading,
    isWaitingForResponse,
    showSidebar,
    currentChat,
    groupedChatHistory,
    addNewChat,
    selectChat,
    addMessage,
    setIsLoading,
    setIsWaitingForResponse,
    toggleSidebar,
    formatTime,
    formatDate,
    setFeedback,
    getFeedbackStatus,
    getFeedback,
  };
});
