<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand">Путь к спокойствию</div>
      <nav class="app-nav">
        <router-link to="/patients">Пациенты</router-link>
        <router-link to="/login">Войти как врач</router-link>
      </nav>
    </header>


<main class="app-main">
  <router-view/>
</main>

</div>
</template>


<script>
export default {
  name: 'App'
}
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap');

:root {
  --bg: #F8F3F3;
  --card: #ffffff;
  --text: #1f2937;
  --muted: #6b7280;
  --primary: #758385;
  --background:#F0E4D8;
  --border: #e5e7eb;
  --shadow: 0 6px 20px rgba(0,0,0,.05);
}

html, body, #app { height: 100%; }
body { 
  margin: 0; 
  font-family: "Raleway", sans-serif;
  font-optical-sizing: auto;
  background: var(--bg); 
  color: var(--text); 
}

.app-header {
  position: sticky; top: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 150px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow);
  z-index: 10;
}
.brand { font-weight: 700; font-size: 1.05rem; color: var(--primary); }
.app-nav { display: flex; gap: 14px; }
.app-nav a { color: var(--primary); text-decoration: none; font-weight: 500; }
.app-main { 
  padding: 28px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  min-height: calc(100vh - 60px);
}
@media (max-width: 700px) {
  .app-nav { display: none; }
}
</style>