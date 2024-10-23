<template>
  <div :class="['message', role]">
    <div v-if="role !== 'user'" class="assistant-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
      </svg>
    </div>
    <div class="message-wrapper">
      <div class="message-content">
        <span v-if="role === 'user' || !isNewMessage">{{ content }}</span>
        <span v-else>{{ displayedContent }}</span>
        <FeedbackSection v-if="role === 'assistant' && isTypingComplete" :messageId="messageId" />
      </div>
      <div class="message-time">{{ time }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, onUnmounted } from "vue";
import FeedbackSection from "@/components/messages/FeedbackSection.vue";

const props = defineProps<{
  role: "user" | "assistant" | "system";
  content: string;
  time: string;
  isNewMessage: boolean;
  messageId: number;
}>();

const displayedContent = ref("");
const isTypingComplete = ref(false);
const typingSpeed = 50; // 每個字符的打字速度（毫秒）
let typingInterval: ReturnType<typeof setInterval> | null = null;

const typeContent = () => {
  if (typingInterval !== null) {
    clearInterval(typingInterval);
  }
  let index = 0;
  displayedContent.value = "";
  isTypingComplete.value = false;
  typingInterval = setInterval(() => {
    if (index < props.content.length) {
      displayedContent.value += props.content[index];
      index++;
    } else {
      if (typingInterval !== null) {
        clearInterval(typingInterval);
      }
      isTypingComplete.value = true;
    }
  }, typingSpeed);
};

watch(
  () => props.content,
  (newContent) => {
    if (props.role === "assistant" && props.isNewMessage) {
      typeContent();
    } else {
      displayedContent.value = newContent;
      isTypingComplete.value = true;
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.role === "assistant" && props.isNewMessage) {
    typeContent();
  } else {
    displayedContent.value = props.content;
    isTypingComplete.value = true;
  }
});

onUnmounted(() => {
  if (typingInterval !== null) {
    clearInterval(typingInterval);
  }
});
</script>

<style scoped>
.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  max-width: 80%;
}

.assistant {
  margin-right: auto;
}

.user {
  margin-left: auto;
  flex-direction: row-reverse;
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

.message-time {
  font-size: 12px;
  color: #999999;
  margin-top: 4px;
  align-self: flex-start;
}

.assistant-icon {
  background-color: #e6eded;
}

.assistant-icon svg {
  color: #45b29d;
}

.user .message-content {
  background-color: #45b29d;
  color: #ffffff;
}

.assistant .message-content,
.system .message-content {
  background-color: #e6eded;
  color: #333333;
  box-shadow: 0 1px 2px rgba(69, 178, 157, 0.1);
}

.system .message-content {
  background-color: #f0f4f4;
  font-style: italic;
}

.user .message-time {
  align-self: flex-end;
}

/* 確保內容不會溢出容器 */
.message,
.message-content {
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>
