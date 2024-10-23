<template>
  <div v-if="!feedbackGiven" class="feedback-section">
    <p>這個回答對您有幫助嗎？</p>
    <button @click="giveFeedback(true)" class="feedback-button positive">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path
          d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"
        />
      </svg>
      有幫助
    </button>
    <button @click="giveFeedback(false)" class="feedback-button negative">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path
          d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"
        />
      </svg>
      沒幫助
    </button>
  </div>
  <div v-else class="feedback-response">
    {{ feedbackResponse }}
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useChatStore } from "@/stores/chatStore";

const props = defineProps<{
  messageId: number;
}>();

const chatStore = useChatStore();
const feedbackGiven = ref(false);
const feedbackResponse = ref("");

const giveFeedback = (isHelpful: boolean) => {
  chatStore.setFeedback(props.messageId, isHelpful);
  feedbackGiven.value = true;
  if (isHelpful) {
    feedbackResponse.value = "非常感謝您的支持！我們會持續努力提供更好的服務。";
  } else {
    feedbackResponse.value = "感謝您的回饋。我們會努力改進我們的回答品質。";
  }
};

onMounted(() => {
  const existingFeedback = chatStore.getFeedback(props.messageId);
  if (existingFeedback !== null) {
    feedbackGiven.value = true;
    feedbackResponse.value = existingFeedback ? "非常感謝您的支持！我們會持續努力提供更好的服務。" : "感謝您的回饋。我們會努力改進我們的回答品質。";
  }
});
</script>

<style scoped>
.feedback-section {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.feedback-button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.feedback-button.positive {
  background-color: #4caf50;
  color: white;
}

.feedback-button.negative {
  background-color: #f44336;
  color: white;
}

.feedback-button:hover {
  opacity: 0.8;
}

.feedback-button svg {
  width: 16px;
  height: 16px;
}

.feedback-response {
  margin-top: 10px;
  font-style: italic;
  color: #666;
}
</style>
