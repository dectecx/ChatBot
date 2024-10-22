<template>
  <div :class="['message', role]">
    <div v-if="role === 'assistant'" class="assistant-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
      </svg>
    </div>
    <div class="message-wrapper">
      <div class="message-content">
        <p>{{ content }}</p>
        <div class="button-group">
          <button v-for="button in buttons" :key="button.text" @click="handleButtonClick(button)">
            {{ button.text }}
          </button>
        </div>
        <FeedbackSection v-if="role === 'assistant'" :messageId="messageId" />
      </div>
      <div class="message-time">{{ time }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
import FeedbackSection from "../FeedbackSection.vue";

const props = defineProps<{
  content: string;
  time: string;
  buttons: Array<{
    text: string;
    action: "dialog" | "process";
    payload?: string;
  }>;
  messageId: number;
  role: "user" | "assistant" | "system";
}>();

const emit = defineEmits<{
  (e: "button-click", button: { action: string; payload?: string }): void;
}>();

const handleButtonClick = (button: { action: string; payload?: string }) => {
  emit("button-click", button);
};
</script>

<style scoped>
@import "../../assets/styles/common.css";

.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  max-width: 80%;
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

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.button-group button {
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-group button:hover {
  background-color: #0056b3;
}
</style>
