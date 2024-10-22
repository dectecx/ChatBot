<template>
  <div id="app">
    <AIChatDialog />
  </div>
</template>

<script lang="ts" setup>
import AIChatDialog from "./components/AIChatDialog.vue";
</script>

<style>
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: Arial, sans-serif;
}

#app {
  height: 100%;
}
</style>
