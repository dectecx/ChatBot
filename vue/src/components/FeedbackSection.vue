<template>
  <div v-if="isVisible && !isProcessMessage" class="feedback-section">
    <template v-if="!feedbackGiven">
      <button @click="giveFeedback(true)" :disabled="feedbackGiven">有幫助</button>
      <button @click="giveFeedback(false)" :disabled="feedbackGiven">沒幫助</button>
    </template>
    <div v-else class="feedback-result">
      <button :class="{ selected: feedback === true }" disabled>有幫助</button>
      <button v-if="feedback === false" :class="{ selected: feedback === false }" disabled>沒幫助</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useChatStore } from "../stores/chatStore";

const props = defineProps<{
  isVisible: boolean;
  messageId: number;
  isProcessMessage: boolean;
}>();

const chatStore = useChatStore();

const feedbackGiven = computed(() => chatStore.getFeedbackStatus(props.messageId));
const feedback = computed(() => chatStore.getFeedback(props.messageId));

const giveFeedback = (isHelpful: boolean) => {
  chatStore.setFeedback(props.messageId, isHelpful);
};
</script>

<style scoped>
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

.feedback-section button:disabled {
  cursor: default;
  opacity: 0.5;
}

.feedback-section button.selected {
  background-color: #007bff;
  color: white;
}

.feedback-result {
  display: flex;
}
</style>
