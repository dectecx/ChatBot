<template>
  <div class="chat-container">
    <div class="header">
      <img src="../assets/Logo-Test.png" alt="" class="logo" />
    </div>
    <div class="content">
      <div class="sidebar">
        <button @click="startNewChat" class="new-chat-btn">
          新聊天
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" class="editor-icon">
            <path
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            />
          </svg>
        </button>
        <div class="chat-history">
          <template v-for="(group, date) in groupedChatHistory" :key="date">
            <div class="date-separator">{{ date }}</div>
            <div v-for="chat in group" :key="chat.id" :class="['chat-item', { active: chat.id === chatStore.currentChatId }]" @click="selectChat(chat.id)">
              <div class="chat-item-time">{{ formatHistoryTime(chat.id) }}</div>
              <div class="chat-item-title">{{ chat.title }}</div>
            </div>
          </template>
        </div>
      </div>
      <div class="main-chat">
        <div class="chat-header">{{ currentChat ? currentChat.title : "新聊天" }}</div>
        <div class="chat-messages" ref="chatMessages">
          <div v-for="(message, index) in currentChat?.messages" :key="index" :class="['message', message.role]">
            <div v-if="message.role === 'assistant'" class="assistant-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
              </svg>
            </div>
            <div class="message-wrapper">
              <div class="message-content">
                {{ message.content }}
              </div>
              <div class="message-time">{{ message.time }}</div>
            </div>
          </div>
        </div>
        <div class="chat-input">
          <textarea v-model="userInput" @keyup.enter.prevent="sendMessage" placeholder="請輸入訊息..."></textarea>
          <button @click="sendMessage" class="send-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { useChatStore } from "../stores/chatStore";

const chatStore = useChatStore();
const userInput = ref("");
const chatMessages = ref<HTMLElement | null>(null);

const currentChat = computed(() => chatStore.chatHistory.find((chat) => chat.id === chatStore.currentChatId));

const groupedChatHistory = computed(() => {
  const groups: { [key: string]: typeof chatStore.chatHistory } = {};
  chatStore.chatHistory.forEach((chat) => {
    const date = new Date(chat.id).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(chat);
  });
  return groups;
});

const startNewChat = () => {
  chatStore.addNewChat();
};

const selectChat = (id: number) => {
  chatStore.selectChat(id);
};

const sendMessage = () => {
  if (userInput.value.trim() === "" || !chatStore.currentChatId) return;

  chatStore.addMessage(chatStore.currentChatId, { role: "user", content: userInput.value });
  userInput.value = "";

  // 模擬AI回應
  setTimeout(() => {
    if (chatStore.currentChatId) {
      chatStore.addMessage(chatStore.currentChatId, { role: "assistant", content: "這是一個模擬的AI回應。" });
      scrollToBottom();
    }
  }, 1000);
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
    }
  });
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

onMounted(() => {
  if (chatStore.chatHistory.length === 0) {
    startNewChat();
  }
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.header {
  width: 100%;
  background-color: #45b29d;
  border-bottom: 1px solid #ccc;
  padding: 10px 20px;
  box-sizing: border-box;
}

.logo {
  height: 40px;
  width: auto;
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  background-color: #f0f0f0;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
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

.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #ccc;
  font-weight: bold;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f9f9f9;
}

.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  max-width: 80%;
}

.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.assistant {
  margin-right: auto;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
}

.message-content {
  padding: 10px 15px;
  border-radius: 18px;
  position: relative;
}

.user .message-content {
  background-color: #3c4d5e;
  color: white;
  border-bottom-right-radius: 0;
}

.assistant .message-content {
  background-color: white;
  color: black;
  border-bottom-left-radius: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-time {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  align-self: flex-start;
}

.user .message-time {
  align-self: flex-end;
}

.assistant-icon {
  margin-right: 10px;
  width: 30px;
  height: 30px;
  background-color: #e6e6e6;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.assistant-icon svg {
  width: 20px;
  height: 20px;
  color: #666;
}

.chat-input {
  display: flex;
  padding: 20px;
  background-color: #ffffff;
  border-top: 1px solid #ccc;
}

textarea {
  flex: 1;
  height: 40px;
  resize: none;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin-right: 10px;
  font-size: 14px;
}

.send-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: #007bff;
}

.send-button:hover {
  color: #0056b3;
}
</style>
