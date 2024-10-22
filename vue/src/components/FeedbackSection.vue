<template>
  <div v-if="isVisible" class="feedback-section">
    <template v-if="!feedbackGiven">
      <button @click="giveFeedback(true)">有幫助</button>
      <button @click="giveFeedback(false)">沒幫助</button>
    </template>
    <div v-else class="feedback-response">{{ feedbackResponse }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const props = defineProps<{
  isVisible: boolean;
}>();

const feedbackGiven = ref(false);
const feedbackResponse = ref("");

const giveFeedback = (isHelpful: boolean) => {
  feedbackGiven.value = true;
  if (isHelpful) {
    feedbackResponse.value = "非常感謝您的支持！我會持續努力提供更好的服務。";
  } else {
    feedbackResponse.value = "感謝您的回饋，請提供建議";
  }
  // 這裡可以添加發送回饋到後端的邏輯
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

.feedback-response {
  font-style: italic;
  color: #666;
}
</style>
