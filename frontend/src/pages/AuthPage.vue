<script setup lang="ts">
import Login from "./Login.vue"
import Register from "./Register.vue"
</script>

<template>
  <div>
    <h1>Authentication</h1>

    <div style="display: flex; gap: 40px;">
      <div>
        <h2>Login</h2>
        <Login />
      </div>

      <div>
        <h2>Register</h2>
        <Register />
      </div>
    </div>
  </div>
</template>