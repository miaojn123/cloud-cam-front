<script lang="ts">
export default {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    goToRegister() {
      this.$router.push('/register')
    }
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-main">
      <!-- qjcam Logo -->
      <div class="logo">
        <a href="#" class="qjcam-logo">
          <img src="/logo.ico" height="48" width="48" alt="Logo" />
        </a>
      </div>

      <h1 class="title">Sign in to QJCAM</h1>

      <!-- Login Form -->
      <div class="login-box">
        <form @submit.prevent>
          <div class="form-group">
            <label for="username">Username or email address</label>
            <input 
              id="username" 
              type="text" 
              v-model="username"
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="password">Password</label>
              <a href="#" class="forgot-link">Forgot password?</a>
            </div>
            <input 
              id="password" 
              type="password" 
              v-model="password"
              autocomplete="current-password"
            />
          </div>

          <button type="submit" class="sign-in-btn">Sign in</button>
        </form>
      </div>

      <!-- Create Account -->
      <div class="create-account-box">
        <span>New to qjcam?</span>
        <a href="#" @click.prevent="goToRegister">Create an account</a>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <a href="#">Terms</a>
      <a href="#">Privacy</a>
      <a href="#">Docs</a>
      <a href="#">Contact</a>
      <a href="#">Manage cookies</a>
      <a href="#">Do not share my personal information</a>
    </footer>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  overflow: hidden;
}

.login-main {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1 1 auto;
}

.logo {
  color: #1f2328;
  margin-bottom: 24px;
}

.qjcam-logo {
  color: #1f2328;
  text-decoration: none;
}

.title {
  font-size: 24px;
  font-weight: 300;
  letter-spacing: -0.5px;
  color: #1f2328;
  margin: 0 0 16px 0;
  text-align: center;
}

.login-box {
  width: 100%;
  max-width: 308px;
  background-color: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  padding: 16px;
  margin-top: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-of-type {
  margin-bottom: 0;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 400;
  color: #1f2328;
  margin-bottom: 8px;
  text-align: left;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-size: 12px;
  color: #0969da;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

input {
  width: 100%;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 20px;
  color: #1f2328;
  background-color: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  border-color: #0969da;
  box-shadow: inset 0 0 0 1px #0969da;
}

.sign-in-btn {
  width: 100%;
  margin-top: 16px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #ffffff;
  background-color: #2da44e;
  border: 1px solid rgba(27, 31, 36, 0.15);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sign-in-btn:hover {
  background-color: #2c974b;
}

.create-account-box {
  width: 100%;
  max-width: 308px;
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  color: #1f2328;
}

.create-account-box a {
  color: #0969da;
  text-decoration: none;
  margin-left: 4px;
}

.create-account-box a:hover {
  text-decoration: underline;
}

.footer {
  padding-top: 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
}

.footer a {
  color: #656d76;
  text-decoration: none;
}

.footer a:hover {
  color: #0969da;
  text-decoration: underline;
}
</style>
