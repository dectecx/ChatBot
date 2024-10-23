<template>
  <div v-if="show" class="common-questions">
    <div class="question-container">
      <button v-for="question in questions" :key="question" @click="$emit('select', question)">
        {{ question }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  show: boolean;
  questions: string[];
}>();

defineEmits<{
  (e: "select", question: string): void;
}>();
</script>

<style scoped>
.common-questions {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  padding: 12px;
  background-color: rgba(230, 237, 237, 0.95);
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  margin: 0;
  z-index: 10;
  box-shadow: 0 -5px 20px rgba(69, 178, 157, 0.1);
}

.question-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.common-questions button {
  flex-grow: 0;
  padding: 8px 15px;
  background-color: #ffffff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #45b29d;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(69, 178, 157, 0.1);
  white-space: nowrap;
}

.common-questions button:hover {
  background-color: #f0f4f4;
  box-shadow: 0 4px 8px rgba(69, 178, 157, 0.15);
}

.common-questions button:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .common-questions {
    padding: 10px;
  }

  .common-questions button {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
