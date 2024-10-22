<template>
  <div class="chat-container">
    <div class="header">
      <img src="../assets/Logo-Test.png" alt="測試對話 Test Chat" class="logo" />
      <button @click="chatStore.toggleSidebar" class="toggle-sidebar-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
        <span>{{ chatStore.showSidebar ? "隱藏側邊欄" : "顯示側邊欄" }}</span>
      </button>
    </div>
    <div class="content">
      <ChatHistoryComponent :class="['sidebar', { 'sidebar-hidden': !chatStore.showSidebar }]" />
      <ChatWindowComponent />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useChatStore } from "../stores/chatStore";
import ChatHistoryComponent from "./ChatHistory.vue";
import ChatWindowComponent from "./ChatWindow.vue";

const chatStore = useChatStore();

onMounted(() => {
  if (chatStore.chatHistory.length === 0) {
    // startNewChat();
  }
});
</script>

<style scoped>
@import "../assets/styles/common.css";
@import "../assets/styles/chat.css";

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  font-family: Arial, sans-serif;
}

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
}
</style>
