<script lang="ts">
import RegisterPage from './components/RegisterPage.vue'
import LoginPage from './components/LoginPage.vue'

export default {
  name: 'App',
  components: {
    RegisterPage,
    LoginPage
  },
  data() {
    return {
      currentPage: 'register' as 'register' | 'login'
    }
  },
  methods: {
    goToLogin() {
      this.currentPage = 'login'
    },
    goToRegister() {
      this.currentPage = 'register'
    }
  }
}
</script>

<template>
  <RegisterPage v-if="currentPage === 'register'" @go-to-login="goToLogin" />
  <LoginPage v-else-if="currentPage === 'login'" @go-to-register="goToRegister" />
</template>
