<script lang="ts">
import RegisterPage from './components/RegisterPage.vue'
import LoginPage from './components/LoginPage.vue'
import ResetPassword from './components/ResetPassword.vue'

export default {
  name: 'App',
  components: {
    RegisterPage,
    LoginPage,
    ResetPassword
  },
  data() {
    return {
      currentPage: 'register' as 'register' | 'login' | 'reset'
    }
  },
  methods: {
    goToLogin() {
      this.currentPage = 'login'
    },
    goToRegister() {
      this.currentPage = 'register'
    },
    goToReset() {
      this.currentPage = 'reset'
    }
  }
}
</script>

<template>
  <RegisterPage v-if="currentPage === 'register'" @go-to-login="goToLogin" />
  <LoginPage v-else-if="currentPage === 'login'" @go-to-register="goToRegister" @go-to-reset="goToReset" />
  <ResetPassword v-else-if="currentPage === 'reset'" @go-to-login="goToLogin" />
</template>
