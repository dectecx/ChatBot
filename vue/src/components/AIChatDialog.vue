<template>
  <div class="chat-container">
    <div class="header">
      <img src="../assets/Logo-Test.png" alt="測試對話 Test Chat" class="logo" />
      <button @click="toggleSidebar" class="toggle-sidebar-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
        <span>{{ showSidebar ? "隱藏側邊欄" : "顯示側邊欄" }}</span>
      </button>
    </div>
    <div class="content">
      <div :class="['sidebar', { 'sidebar-hidden': !showSidebar }]">
        <button @click="startNewChat" class="new-chat-btn">
          新對話
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
        <div class="chat-header">{{ currentChat ? currentChat.title : "新對話" }}</div>
        <div class="chat-messages-container">
          <div class="chat-messages" ref="chatMessages" @scroll="handleScroll">
            <template v-for="(message, index) in currentChat?.messages" :key="index">
              <TextMessageComponent
                v-if="message.type === 'text'"
                :role="message.role"
                :content="message.content"
                :time="message.time"
                :isNewMessage="message.isNewMessage ?? false"
                :messageId="message.id"
              />
              <ButtonMessageComponent
                v-else-if="message.type === 'button'"
                :content="message.content"
                :time="message.time"
                :buttons="message.buttons"
                :messageId="message.id"
                :role="message.role"
                @button-click="handleButtonClick"
              />
            </template>
            <LoadingMessage v-if="isLoading" />
          </div>
          <div v-if="showScrollButton" class="scroll-button" @click="scrollToBottom()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
            </svg>
          </div>
        </div>
        <div v-if="isWaitingForResponse" class="ai-responding-hint">AI 正在回覆中... 按下 ESC 鍵可終止回覆</div>
        <div class="chat-input">
          <textarea
            v-model="userInput"
            @keyup.enter.prevent="sendMessage"
            @keyup.esc="cancelResponse"
            @input="handleInput"
            placeholder="請輸入訊息..."
            ref="inputTextarea"
          ></textarea>
          <button @click="isWaitingForResponse ? cancelResponse() : sendMessage()" class="send-button" :class="{ 'cancel-button': isWaitingForResponse }">
            <svg v-if="!isWaitingForResponse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <!-- 自訂對話框 -->
    <div v-if="showDialog" class="custom-dialog">
      <div class="dialog-content">
        <p>{{ dialogMessage }}</p>
        <button @click="closeDialog">關閉</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, computed, watch, onUnmounted } from "vue";
import { useChatStore } from "../stores/chatStore";
import TextMessageComponent from "./messages/TextMessage.vue";
import ButtonMessageComponent from "./messages/ButtonMessage.vue";
import LoadingMessage from "./messages/LoadingMessage.vue";
import type { ChatHistory, ChatMessage, TextChatMessage, ButtonChatMessage } from "../stores/chatStore";

const chatStore = useChatStore();
const userInput = ref("");
const chatMessages = ref<HTMLElement | null>(null);
const inputTextarea = ref<HTMLTextAreaElement | null>(null);

const showDialog = ref(false);
const dialogMessage = ref("");

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
  if (isWaitingForResponse.value) {
    cancelResponse();
  }
  chatStore.addNewChat();
};

// 重置所有消息的 isNewMessage 屬性
const resetNewMessageFlags = (messages: ChatMessage[]) => {
  messages.forEach((message) => {
    if ("isNewMessage" in message) {
      message.isNewMessage = false;
    }
  });
};

const selectChat = (id: number) => {
  if (isWaitingForResponse.value) {
    cancelResponse();
  }
  chatStore.selectChat(id);

  if (currentChat.value) {
    resetNewMessageFlags(currentChat.value.messages);
  }

  nextTick(() => {
    scrollToBottom();
    handleScroll();
  });
};

const handleButtonClick = (button: { action: string; payload?: string }) => {
  if (button.action === "dialog") {
    dialogMessage.value = button.payload || "這是一個對話框訊息";
    showDialog.value = true;

    if (chatStore.currentChatId) {
      chatStore.addMessage(chatStore.currentChatId, {
        role: "system",
        type: "text",
        content: "對話框已顯示。您可以繼續對話。",
      });
    }
  } else if (button.action === "process") {
    if (chatStore.currentChatId) {
      chatStore.addMessage(chatStore.currentChatId, {
        role: "system",
        type: "text",
        content: `開始 ${button.payload} 流程`,
      });
    }
  }
  scrollToBottom();
};

const handleInput = (event: Event) => {
  userInput.value = (event.target as HTMLTextAreaElement).value;
};

const isLoading = ref(false);
const isWaitingForResponse = ref(false);
const responseTimeout = ref<number | null>(null);

const canSendMessage = computed(() => userInput.value.trim() !== "");

const sendMessage = () => {
  if (!canSendMessage.value || isWaitingForResponse.value) return;

  chatStore.addMessage(chatStore.currentChatId!, {
    role: "user",
    type: "text",
    content: userInput.value,
  });
  userInput.value = "";

  scrollToBottom();

  isWaitingForResponse.value = true;
  isLoading.value = true;

  const randomDelay = Math.random() * 3000;

  responseTimeout.value = window.setTimeout(() => {
    if (chatStore.currentChatId) {
      const randomValue = Math.random();
      const responseType = randomValue < 0.7 ? "text" : "button";

      if (responseType === "text") {
        const newMessage: Omit<TextChatMessage, "time" | "id"> = {
          role: "assistant",
          type: "text",
          content: "這是一個模擬的 AI 文字回應。",
          isNewMessage: true,
        };
        chatStore.addMessage(chatStore.currentChatId, newMessage);
      } else {
        const buttonMessage: Omit<ButtonChatMessage, "time" | "id"> = {
          role: "assistant",
          type: "button",
          content: "這是一個包含按鈕的回應。請選擇一個選項：",
          buttons: [
            { text: "顯示對話框", action: "dialog", payload: "這是一個對話框訊息" },
            { text: "開始特定流程", action: "process", payload: "特定" },
          ],
        };
        chatStore.addMessage(chatStore.currentChatId, buttonMessage);
      }
      isLoading.value = false;
      isWaitingForResponse.value = false;
      scrollToBottom();

      nextTick(() => {
        if (inputTextarea.value) {
          inputTextarea.value.focus();
        }
      });
    }
  }, randomDelay);
};

const cancelResponse = () => {
  if (responseTimeout.value !== null) {
    clearTimeout(responseTimeout.value);
    responseTimeout.value = null;
  }

  if (isWaitingForResponse.value) {
    if (chatStore.currentChatId) {
      chatStore.addMessage(chatStore.currentChatId, {
        role: "system",
        type: "text",
        content: "回覆已被使用者中斷。",
      });
    }
    isWaitingForResponse.value = false;
    isLoading.value = false;
  }

  // 在取消回應後，將焦點設置回輸入框
  nextTick(() => {
    if (inputTextarea.value) {
      inputTextarea.value.focus();
    }
  });
};

const showScrollButton = ref(false);

const handleScroll = () => {
  if (chatMessages.value) {
    const { scrollTop, scrollHeight, clientHeight } = chatMessages.value;
    showScrollButton.value = scrollTop < scrollHeight - clientHeight - 100;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessages.value) {
      const container = chatMessages.value;
      container.scrollTop = container.scrollHeight;
    }
  });
};

// 監聽聊天訊息的變化
watch(
  () => currentChat.value?.messages,
  () => {
    handleScroll();
  },
  { deep: true }
);

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

const closeDialog = () => {
  showDialog.value = false;
  // 在對話框關閉後，將焦點設置回輸入框
  nextTick(() => {
    if (inputTextarea.value) {
      inputTextarea.value.focus();
    }
  });
};

const showSidebar = ref(true);
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
};

onMounted(() => {
  if (chatStore.chatHistory.length === 0) {
    startNewChat();
  }
  nextTick(() => {
    scrollToBottom();
    handleScroll();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isWaitingForResponse.value) {
      cancelResponse();
    }
  });
});

// 監聽窗口大小變化
window.addEventListener("resize", handleScroll);

// 組件卸載時移除事件監聽
onUnmounted(() => {
  window.removeEventListener("resize", handleScroll);
});
</script>

<style scoped>
@import "../assets/styles/common.css";
@import "../assets/styles/chat.css";

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background-color: #45b29d;
  border-bottom: 1px solid #ccc;
  padding: 10px 20px;
  box-sizing: border-box;
}

.logo {
  height: 40px;
  width: auto;
  display: block; /* 確保 logo 垂直居中 */
}

.toggle-sidebar-btn {
  display: flex;
  align-items: center;
  background-color: #3c4c5e;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 8px 12px;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.toggle-sidebar-btn:hover {
  background-color: #2b3c50;
}

.toggle-sidebar-btn svg {
  width: 20px;
  height: 20px;
  fill: #ffffff;
  margin-right: 8px;
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

.chat-header {
  padding: 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #ccc;
  font-weight: bold;
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
  transition: color 0.3s;
}

.send-button:hover {
  color: #0056b3;
}

.send-button.cancel-button {
  color: #dc3545;
}

.send-button.cancel-button:hover {
  color: #bd2130;
}

.custom-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dialog-content button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.dialog-content button:hover {
  background-color: #0056b3;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-responding-hint {
  text-align: center;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin: 10px 0;
  font-style: italic;
  color: #666;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.chat-messages-container {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.chat-messages {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  background-color: #f9f9f9;
}

.scroll-button {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
  z-index: 1000;
}

.scroll-button:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.scroll-button svg {
  width: 24px;
  height: 24px;
}

.toggle-sidebar-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.toggle-sidebar-btn svg {
  width: 24px;
  height: 24px;
  fill: #ffffff;
}

.sidebar {
  width: 250px;
  transition: width 0.3s ease-in-out;
  overflow: hidden;
}

.sidebar-hidden {
  width: 0;
}

.main-chat {
  flex: 1;
  transition: margin-left 0.3s ease-in-out;
}

.sidebar-hidden + .main-chat {
  margin-left: 0;
}

@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
  }

  .header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
  }

  .logo {
    height: 30px;
  }

  .content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
  }

  .sidebar-hidden {
    max-height: 0;
  }

  .main-chat {
    width: 100%;
    margin-left: 0;
  }

  .chat-messages-container {
    height: calc(100vh - 200px);
  }

  .chat-input {
    padding: 10px;
  }

  textarea {
    height: 60px;
  }

  .send-button {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .chat-item {
    padding: 5px 10px;
  }

  .chat-header {
    padding: 10px;
  }

  .chat-messages {
    padding: 10px;
  }

  .button-group button {
    padding: 5px;
    font-size: 12px;
  }
}
</style>
