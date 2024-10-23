<template>
  <div id="app">
    <ChatDialog />
  </div>
</template>

<script lang="ts" setup>
import ChatDialog from "./components/chats/ChatDialog.vue";
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
