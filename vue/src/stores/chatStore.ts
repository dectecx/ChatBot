import { defineStore } from "pinia";

interface ChatHistory {
  id: number;
  date: string;
  title: string;
  messages: Message[];
  lastMessageTime: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

export const useChatStore = defineStore("chat", {
  state: () => ({
    chatHistory: [] as ChatHistory[],
    currentChatId: null as number | null,
  }),
  actions: {
    addNewChat() {
      const now = new Date();
      const newChat: ChatHistory = {
        id: now.getTime(),
        date: now.toLocaleDateString(),
        title: "新聊天",
        messages: [],
        lastMessageTime: this.formatTime(now),
      };
      this.chatHistory.unshift(newChat);
      this.currentChatId = newChat.id;
    },
    selectChat(id: number) {
      this.currentChatId = id;
    },
    addMessage(chatId: number, message: Omit<Message, "time">) {
      const chat = this.chatHistory.find((c) => c.id === chatId);
      if (chat) {
        const now = new Date();
        const newMessage = { ...message, time: this.formatTime(now) };
        chat.messages.push(newMessage);
        chat.lastMessageTime = newMessage.time;
        if (chat.messages.length === 1) {
          chat.title = message.content.slice(0, 20) + "...";
        }
      }
    },
    formatTime(date: Date): string {
      return date.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
    },
    formatDate(date: Date): string {
      return date.toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    },
  },
});
