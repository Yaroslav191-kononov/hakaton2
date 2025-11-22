<template>
  <div class="login-page">
    <div class="card login-card">
      <h2 class="title">Авторизация</h2>
      <form @submit.prevent="login">
        <div class="field">
          <label class="label">Электронная почта</label>
          <input class="input" v-model="email" type="email" placeholder="Введите электронную почту" required />
        </div>
        <div class="field">
          <label class="label">Пароль</label>
          <input class="input" v-model="password" type="password" placeholder="Введите пароль" required />
        </div>
        <div class="vue-to-server">
          <button @click="sendToUnity">Send to Unity</button>
      </div>
        <button class="btn" type="submit">Войти</button>
        <div v-if="error" class="error">{{ error }}</div>
      </form>
    </div>
  </div>
</template>


<script>
import { io } from 'socket.io-client';
export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      error: ''
    };
  },
  created() {
    this.socket = io('http://localhost:3000');
    this.socket.on('connect', () => console.log('Vue connected to server'));
  },
  methods: {
    async login() {
      try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password })
        });
        if (!res.ok) {
          const err = await res.json();
          this.error = err.error || 'Ошибка авторизации';
          return;
        }
        const data = await res.json();
        localStorage.setItem('pt_token', data.token);
        this.$router.push('/patients');
      } catch (e) {
        this.error = 'Не удалось подключиться к серверу';
      }
    },
    sendToUnity() {
    const payload = {
      type: 'command',
      action: 'SpawnObject',
      data: { x: 0, y: 1, z: 2 }
    };

    fetch('http://localhost:3000/to-unity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(res => res.json())
        .then(r => console.log('Sent to Unity:', r))
        .catch(err => console.error('Error sending to Unity', err));

  }
}
}
</script>


<style scoped>
.login-page {
  min-height: 76vh;
  display: grid; place-items: center;
  padding: 24px;
}
.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 20px 40px rgba(0,0,0,.05);
}
.title { 
  margin: 0 0 12px;
  font-size: 1.65rem;
}
.field { 
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  justify-content:space-around;
 }
.label { 
  display: block;
  font-size: 0.95rem;
  color: var(--muted);
  margin-bottom: 6px;
 }
.input {
  width: 390px;
  padding: 10px 12px; 
  border: 1px solid var(--border);
  border-radius: 10px; 
  background: #fff;
  font-size: 1rem;
  outline: none; 
  transition: box-shadow .2s, border-color .2s;
}
.input:focus { 
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99,102,241,.15);
}
.btn {
  width: 100%; 
  padding: 10px 12px;
  border-radius: 10px; 
  border: none;
  background: var(--primary);
  color: #fff; 
  font-weight: 600; 
  cursor: pointer; 
  margin-top: 6px;
}
.btn:hover { 
  background: #4338ca;
 }
.error { 
  color: #b91c1c;
  margin-top: 8px;
  font-size: 0.9rem;
}
@media (max-width: 420px) {
  .login-card { 
  width: 92%;
  padding: 20px;
}
}
</style>

