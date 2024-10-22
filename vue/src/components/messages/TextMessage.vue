<template>
  <div :class="['message', role]">
    <div v-if="role === 'assistant'" class="assistant-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
      </svg>
    </div>
    <div class="message-wrapper">
      <div class="message-content">
        <span v-if="role === 'user' || !isNewMessage">{{ content }}</span>
        <span v-else>{{ displayedContent }}</span>
        <div v-if="role === 'assistant' && isTypingComplete" class="feedback-section">
          <template v-if="!feedbackGiven">
            <button @click="giveFeedback(true)">有幫助</button>
            <button @click="giveFeedback(false)">沒幫助</button>
          </template>
          <div v-else class="feedback-response">{{ feedbackResponse }}</div>
        </div>
      </div>
      <div class="message-time">{{ time }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, onUnmounted } from "vue";

const props = defineProps<{
  role: "user" | "assistant";
  content: string;
  time: string;
  isNewMessage: boolean;
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

const feedbackGiven = ref(false);
const feedbackResponse = ref("");

const giveFeedback = (isHelpful: boolean) => {
  feedbackGiven.value = true;
  if (isHelpful) {
    feedbackResponse.value = "非常感謝您的支持！我會持續努力提供更好的服務。";
  } else {
    feedbackResponse.value = "感謝您的回饋，請提供建議";
  }
};
</script>

<style scoped>
@import "../../assets/styles/common.css";

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

.user .message-time {
  align-self: flex-end;
}

.feedback-section {
  margin-top: 10px;
  font-size: 12px;
  border-top: 1px solid #e0e0e0;
  padding-top: 10px;
}

.feedback-section button {
  margin-right: 10px;
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.feedback-response {
  font-style: italic;
  color: #666;
}
</style>
