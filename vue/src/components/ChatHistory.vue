<template>
  <div class="chat-history-container">
    <button @click="startNewChat" class="new-chat-btn">
      新對話
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" class="editor-icon">
        <path
          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
        />
      </svg>
    </button>
    <div class="chat-history">
      <template v-for="(group, date) in chatStore.groupedChatHistory" :key="date">
        <div class="date-separator">{{ date }}</div>
        <div v-for="chat in group" :key="chat.id" :class="['chat-item', { active: chat.id === chatStore.currentChatId }]" @click="selectChat(chat.id)">
          <div class="chat-item-time">{{ formatHistoryTime(chat.id) }}</div>
          <div class="chat-item-title">{{ chat.title }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ChatMessage, useChatStore } from "../stores/chatStore";

const chatStore = useChatStore();

// 重置所有消息的 isNewMessage 屬性
const resetNewMessageFlags = (messages: ChatMessage[]) => {
  messages.forEach((message) => {
    if ("isNewMessage" in message) {
      message.isNewMessage = false;
    }
  });
};

const startNewChat = () => {
  if (chatStore.isWaitingForResponse) {
    chatStore.setIsWaitingForResponse(false);
  }
  chatStore.addNewChat();
};

const selectChat = (id: number) => {
  if (chatStore.isWaitingForResponse) {
    chatStore.setIsWaitingForResponse(false);
  }
  chatStore.selectChat(id);

  if (chatStore.currentChat) {
    resetNewMessageFlags(chatStore.currentChat.messages);
  }
};

const formatHistoryDate = (chatId: number) => {
  const chat = chatStore.chatHistory.find((c) => c.id === chatId);
  if (chat) {
    return chatStore.formatDate(new Date(chat.id));
  }
  return "";
};

const formatHistoryTime = (chatId: number) => {
  const chat = chatStore.chatHistory.find((c) => c.id === chatId);
  if (chat) {
    return new Date(chat.id).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
  }
  return "";
};
</script>

<style scoped>
.chat-history-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.new-chat-btn {
  width: 100%;
  padding: 10px;
  background-color: #3c4c5e;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.new-chat-btn:hover {
  background-color: #2b3c50;
}

.editor-icon {
  width: 20px;
  height: 20px;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
}

.date-separator {
  padding: 10px;
  background-color: #e0e0e0;
  font-weight: bold;
  font-size: 14px;
}

.chat-item {
  padding: 10px 20px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  word-break: break-word;
  overflow-wrap: break-word;
}

.chat-item-time {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.chat-item-title {
  font-size: 14px;
}

.chat-item.active {
  background-color: #e6f3ff;
}

@media (max-width: 768px) {
  .chat-history-container {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .chat-item {
    padding: 5px 10px;
  }
}
</style>
