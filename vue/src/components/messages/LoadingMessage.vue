<template>
  <div class="message assistant">
    <div class="assistant-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
      </svg>
    </div>
    <div class="message-wrapper">
      <div class="message-content loading">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// No props or logic needed for this component
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

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #007bff;
  border-radius: 50%;
  margin: 0 4px;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>
