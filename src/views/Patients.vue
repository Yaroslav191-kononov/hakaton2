<template>
  <div class="patients">
    <h2 class="page-title">Пациенты</h2>


<div class="cards-grid">
  <div class="card patient-item" v-for="p in patients" :key="p.id">
    <router-link :to="`/patients/${p.id}`" class="patient-link">
      <div class="avatar"></div>
      <div class="info">
        <div class="name">{{ p.name }}</div>
        <div class="sub">{{ p.age ?? '-' }} лет • {{ p.gender ?? '-' }}</div>
      </div>
    </router-link>
  </div>
</div>

<button class="btn logout" @click="logout">Выйти</button>

</div>
</template>


<script>
export default {
  name: 'Patients',
  data() {
    return { patients: [] };
  },
  created() {
    this.fetchPatients();
  },
  methods: {
    async fetchPatients() {
      const token = localStorage.getItem('pt_token');
      try {
        const res = await fetch('http://localhost:3000/api/patients', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
          this.patients = await res.json();
        } else {
          // обработка ошибок
        }
      } catch (e) {}
    },
    logout() {
      localStorage.removeItem('pt_token');
      this.$router.push('/login');
    }
  }
}
</script>


<style scoped>
.patients { padding: 8px 0; }
.page-title { margin: 0 0 12px; font-size: 1.25rem; }
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(1fr, 240px));
  gap: 12px;
}
.card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 12px; box-shadow: 0 2px 6px rgba(0,0,0,.04); }
.patient-link { display: flex; align-items: center; text-decoration: none; color: inherit; gap: 12px; }
.avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
}
.info { display: grid; gap: 2px; }
.name { font-weight: 600; }
.sub { font-size: 0.85rem; color: var(--muted); }
.btn { width: auto; padding: 8px 12px; border-radius: 8px; border: none; background: var(--primary); color: white; font-weight: 600; cursor: pointer; }
.btn.logout { margin-top: 14px; display: inline-block; }
@media (max-width: 600px) {
  .cards-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
}
</style>