<script setup lang="ts">
import Login from "../components/Login.vue"
import Register from "../components/Register.vue"
</script>

<template>
  <section class="container">
    <header class="page-header">
      <h1>Welcome</h1>
      <p>Login or create an account to manage organizations and invitations.</p>
    </header>

    <div style="display:flex; flex-wrap:wrap; gap:2rem;">
      <div class="card" style="flex:1 1 260px;">
        <Login />
      </div>
      <div class="card" style="flex:1 1 260px;">
        <Register />
      </div>
    </div>
  </section>
</template>