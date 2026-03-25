<script lang="ts">
export default {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      password: ''
    }
  }
}
</script>

<template>
  <div class="login-container">
    <!-- GitHub Logo -->
    <div class="logo">
      <svg height="48" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="48" data-view-component="true">
        <path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
      </svg>
    </div>

    <h1 class="title">Sign in to GitHub</h1>

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
      <span>New to GitHub?</span>
      <a href="#">Create an account</a>
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #0d1117;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
}

.logo {
  color: #f0f6fc;
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 300;
  letter-spacing: -0.5px;
  color: #f0f6fc;
  margin: 0 0 16px 0;
  text-align: center;
}

.login-box {
  width: 100%;
  max-width: 308px;
  background-color: #161b22;
  border: 1px solid #30363d;
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
  color: #f0f6fc;
  margin-bottom: 8px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-size: 12px;
  color: #2f81f7;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

input {
  width: 100%;
  padding: 5px 12px;
  font-size: 14px;
  line-height: 20px;
  color: #f0f6fc;
  background-color: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  border-color: #2f81f7;
  box-shadow: inset 0 0 0 1px #2f81f7;
}

.sign-in-btn {
  width: 100%;
  margin-top: 16px;
  padding: 5px 16px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #ffffff;
  background-color: #238636;
  border: 1px solid rgba(240, 246, 252, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sign-in-btn:hover {
  background-color: #2ea043;
}

.create-account-box {
  width: 100%;
  max-width: 308px;
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #30363d;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  color: #f0f6fc;
}

.create-account-box a {
  color: #2f81f7;
  text-decoration: none;
  margin-left: 4px;
}

.create-account-box a:hover {
  text-decoration: underline;
}

.footer {
  margin-top: 40px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
}

.footer a {
  color: #8b949e;
  text-decoration: none;
}

.footer a:hover {
  color: #2f81f7;
  text-decoration: underline;
}
</style>
