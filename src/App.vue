<script setup lang="ts">
import { ref } from 'vue'
import RegisterPage from './components/RegisterPage.vue'
import LoginPage from './components/LoginPage.vue'

const currentPage = ref<'register' | 'login'>('register')

const goToLogin = () => {
  currentPage.value = 'login'
}

const goToRegister = () => {
  currentPage.value = 'register'
}
</script>

<template>
  <RegisterPage v-if="currentPage === 'register'" @go-to-login="goToLogin" />
  <LoginPage v-else-if="currentPage === 'login'" @go-to-register="goToRegister" />
</template>
