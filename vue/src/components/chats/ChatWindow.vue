<template>
  <div class="main-chat">
    <div class="chat-header">{{ chatStore.currentChat ? chatStore.currentChat.title : "新對話" }}</div>
    <div class="chat-messages-container">
      <div class="chat-messages" ref="chatMessages" @scroll="handleScroll">
        <template v-for="(message, index) in chatStore.currentChat?.messages" :key="index">
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
        <LoadingMessage v-if="chatStore.isLoading" />
        <!-- 自訂對話框 -->
        <div v-if="showDialog" class="custom-dialog">
          <div class="dialog-content">
            <p>{{ dialogMessage }}</p>
            <button @click="closeDialog">關閉</button>
          </div>
        </div>
      </div>
      <div v-if="showScrollButton" class="scroll-button" @click="scrollToBottom()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
        </svg>
      </div>
    </div>
    <div v-if="chatStore.isWaitingForResponse" class="ai-responding-hint">AI 正在回覆中... 按下 ESC 鍵可終止回覆</div>
    <div class="chat-input">
      <textarea v-model="userInput" @keyup.enter.prevent="sendMessage" @keyup.esc="cancelResponse" placeholder="請輸入訊息..." ref="inputTextarea"></textarea>
      <button
        @click="chatStore.isWaitingForResponse ? cancelResponse() : sendMessage()"
        class="send-button"
        :class="{ 'cancel-button': chatStore.isWaitingForResponse }"
      >
        <svg v-if="!chatStore.isWaitingForResponse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, watch, onUnmounted } from "vue";
import { ButtonChatMessage, TextChatMessage, useChatStore } from "@/stores/chatStore";
import TextMessageComponent from "@/components/messages/TextMessage.vue";
import ButtonMessageComponent from "@/components/messages/ButtonMessage.vue";
import LoadingMessage from "@/components/messages/LoadingMessage.vue";

const chatStore = useChatStore();
const userInput = ref("");
const chatMessages = ref<HTMLElement | null>(null);
const inputTextarea = ref<HTMLTextAreaElement | null>(null);
const showScrollButton = ref(false);
const responseTimeout = ref<number | null>(null);

const showDialog = ref(false);
const dialogMessage = ref("");

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

const sendMessage = () => {
  if (userInput.value.trim() === "" || chatStore.isWaitingForResponse) return;

  chatStore.addMessage(chatStore.currentChatId!, {
    role: "user",
    type: "text",
    content: userInput.value,
  });
  userInput.value = "";

  scrollToBottom();

  chatStore.setIsWaitingForResponse(true);
  chatStore.setIsLoading(true);

  // 模擬 AI 回應
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
      chatStore.setIsLoading(false);
      chatStore.setIsWaitingForResponse(false);
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

  if (chatStore.isWaitingForResponse) {
    if (chatStore.currentChatId) {
      chatStore.addMessage(chatStore.currentChatId, {
        role: "system",
        type: "text",
        content: "回覆已被使用者中斷。",
      });
    }
    chatStore.setIsWaitingForResponse(false);
    chatStore.setIsLoading(false);
  }

  // 在取消回應後，將焦點設置回輸入框
  nextTick(() => {
    if (inputTextarea.value) {
      inputTextarea.value.focus();
    }
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

const closeDialog = () => {
  showDialog.value = false;
  // 在對話框關閉後，將焦點設置回輸入框
  nextTick(() => {
    if (inputTextarea.value) {
      inputTextarea.value.focus();
    }
  });
};

watch(
  () => chatStore.currentChat?.messages,
  () => {
    handleScroll();
  },
  { deep: true }
);

onMounted(() => {
  // TODO: 切換聊天室時，需要 scrollToBottom
  nextTick(() => {
    scrollToBottom();
    handleScroll();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && chatStore.isWaitingForResponse) {
      cancelResponse();
    }
  });
});

window.addEventListener("resize", handleScroll);

onUnmounted(() => {
  window.removeEventListener("resize", handleScroll);
});
</script>

<style scoped>
.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease-in-out;
}

.chat-header {
  padding: 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #ccc;
  font-weight: bold;
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

.chat-input {
  display: flex;
  padding: 10px;
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

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

@media (max-width: 768px) {
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
  .chat-header {
    padding: 10px;
  }

  .chat-messages {
    padding: 10px;
  }
}
</style>
