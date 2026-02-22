<script setup lang="ts">
import Navbar from "../components/Navbar.vue";
</script>

<template>
  <div class="app">
    <header>
      <Navbar />
    </header>

    <main class="content">
      <router-view />
    </main>

    <footer>
      <p>Footer</p>
    </footer>
  </div>
</template>