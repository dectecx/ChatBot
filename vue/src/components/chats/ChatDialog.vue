<template>
  <div class="chat-container">
    <div class="header">
      <img src="@/assets/Logo-Test.png" alt="測試對話 Test Chat" class="logo" />
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
import { useChatStore } from "@/stores/chatStore";
import ChatHistoryComponent from "@/components/chats/ChatHistory.vue";
import ChatWindowComponent from "@/components/chats/ChatWindow.vue";

const chatStore = useChatStore();
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  font-family: Arial, sans-serif;
  background-color: #f0f4f4;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: linear-gradient(to right, #45b29d, #5bc0a8);
  color: #ffffff;
  border-bottom: 1px solid #ccc;
  padding: 10px 20px;
  box-sizing: border-box;
}

.logo {
  height: 40px;
  width: auto;
  display: block;
}

.toggle-sidebar-btn {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.toggle-sidebar-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.toggle-sidebar-btn svg {
  fill: #ffffff;
  margin-right: 8px;
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  background-color: #e6eded;
  border-right: 1px solid #d1dada;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: width 0.3s ease-in-out;
}

.sidebar-hidden {
  width: 0;
}

@media (max-width: 768px) {
  .chat-container {
    height: 100%;
  }

  .content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    max-height: 40vh;
    overflow-y: auto;
    transition: max-height 0.3s ease-in-out;
  }

  .sidebar-hidden {
    max-height: 0;
    overflow: hidden;
  }

  .main-chat {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
