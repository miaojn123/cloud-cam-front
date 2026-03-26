<script lang="ts">
export default {
  name: 'RegisterPage',
  data() {
    return {
      email: '',
      password: '',
      username: '',
      receiveUpdates: false
    }
  },
  methods: {
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<template>
  <div class="signup-container">
    <div class="signup-main">
      <!-- Header Logo -->
      <div class="header">
        <a href="#" class="qjcam-logo">
          <img src="/logo.ico" height="32" width="32" alt="Logo" />
        </a>
      </div>

      <!-- Signup Form -->
      <div class="signup-content">
      <h1 class="title">Create your account</h1>

      <form @submit.prevent class="signup-form">
        <!-- Email -->
        <div class="form-group">
          <label for="email">Enter your email</label>
          <input 
            id="email" 
            type="email" 
            v-model="email"
            placeholder="you@example.com"
            autocomplete="email"
          />
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password">Create a password</label>
          <input 
            id="password" 
            type="password" 
            v-model="password"
            placeholder="Password"
            autocomplete="new-password"
          />
          <p class="password-hint">Password should be at least 15 characters OR at least 8 characters including a number and a lowercase letter.</p>
        </div>

        <!-- Username -->
        <div class="form-group">
          <label for="username">Enter a username</label>
          <input 
            id="username" 
            type="text" 
            v-model="username"
            placeholder="Username"
            autocomplete="username"
          />
        </div>

        <!-- Receive Updates -->
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="receiveUpdates" />
            <span class="checkmark"></span>
            <span class="checkbox-text">
              Receive occasional product updates and announcements via email. 
              <a href="#" class="text-link">Unsubscribe anytime</a>.
            </span>
          </label>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="create-account-btn">Create account</button>

        <!-- Terms Notice -->
        <p class="terms-notice">
          By creating an account, you agree to the 
          <a href="#">Terms of Service</a> and 
          <a href="#">Privacy Policy</a>.
        </p>
      </form>

      <!-- Sign In Link -->
      <div class="signin-link">
        Already have an account？ <a href="#" @click.prevent="goToLogin">Sign in </a>
      </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signup-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  overflow: hidden;
}

.signup-main {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Header */
.header {
  padding: 0 0 16px;
}

.qjcam-logo {
  color: #1f2328;
  text-decoration: none;
}

.qjcam-logo:hover {
  color: #656d76;
}

/* Content */
.signup-content {
  max-width: 340px;
  margin: 0 auto;
  padding: 0 16px;
}

.title {
  font-size: 24px;
  font-weight: 400;
  color: #1f2328;
  margin: 0 0 24px 0;
  text-align: center;
}

/* Form */
.signup-form {
  border-radius: 6px;
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
  margin-bottom: 4px;
  text-align: left;
}

input[type="email"],
input[type="password"],
input[type="text"] {
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

input[type="email"]:focus,
input[type="password"]:focus,
input[type="text"]:focus {
  border-color: #0969da;
  box-shadow: inset 0 0 0 1px #0969da;
}

input::placeholder {
  color: #6e7781;
}

.password-hint {
  font-size: 12px;
  color: #656d76;
  margin: 4px 0 0 0;
  line-height: 1.5;
}

/* Checkbox */
.checkbox-group {
  margin-top: 16px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #1f2328;
  line-height: 1.5;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border: 1px solid #d0d7de;
  border-radius: 3px;
  background-color: #ffffff;
  margin-top: 2px;
  transition: all 0.2s;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background-color: #0969da;
  border-color: #0969da;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'%3E%3Cpath d='M13.78 4.22a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 0 1 1.06-1.06L6 11.19l6.97-6.97a.75.75 0 0 1 1.06 0z'/%3E%3C/svg%3E");
  background-size: 12px;
  background-position: center;
  background-repeat: no-repeat;
}

.checkbox-text {
  font-size: 12px;
  color: #656d76;
}

.text-link {
  color: #0969da;
  text-decoration: none;
}

.text-link:hover {
  text-decoration: underline;
}

/* Button */
.create-account-btn {
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

.create-account-btn:hover {
  background-color: #2c974b;
}

/* Terms Notice */
.terms-notice {
  font-size: 12px;
  color: #656d76;
  text-align: center;
  margin: 16px 0 0 0;
  line-height: 1.5;
}

.terms-notice a {
  color: #0969da;
  text-decoration: none;
}

.terms-notice a:hover {
  text-decoration: underline;
}

/* Sign In Link */
.signin-link {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  color: #1f2328;
}

.signin-link a {
  color: #0969da;
  text-decoration: none;
}

.signin-link a:hover {
  text-decoration: underline;
}
</style>
