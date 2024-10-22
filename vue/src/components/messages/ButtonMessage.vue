<template>
  <div class="message assistant">
    <div class="assistant-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
      </svg>
    </div>
    <div class="message-wrapper">
      <div class="message-content">
        <p>{{ content }}</p>
        <div class="button-group">
          <button v-for="(btn, btnIndex) in buttons" :key="btnIndex" @click="handleButtonClick(btn)">
            {{ btn.text }}
          </button>
        </div>
        <div v-if="isContentComplete" class="feedback-section">
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
import { defineProps, defineEmits } from "vue";
import { ref, onMounted } from "vue";

const props = defineProps<{
  content: string;
  time: string;
  buttons: Array<{
    text: string;
    action: "dialog" | "process";
    payload?: string;
  }>;
}>();

const emit = defineEmits(["buttonClick"]);

const feedbackGiven = ref(false);
const feedbackResponse = ref("");
const isContentComplete = ref(false);

const handleButtonClick = (button: { action: string; payload?: string }) => {
  emit("buttonClick", button);
};

const giveFeedback = (isHelpful: boolean) => {
  feedbackGiven.value = true;
  if (isHelpful) {
    feedbackResponse.value = "非常感謝您的支持！我會持續努力提供更好的服務。";
  } else {
    feedbackResponse.value = "感謝您的回饋，請提供建議";
  }
};

onMounted(() => {
  // 模擬內容加載完成
  setTimeout(() => {
    isContentComplete.value = true;
  }, 500);
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
  gap: 10px;
  margin-top: 10px;
}

.button-group button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-group button:hover {
  background-color: #0056b3;
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
