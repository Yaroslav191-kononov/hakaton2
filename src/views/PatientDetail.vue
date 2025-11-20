<template>
  <div class="patient-detail">
    <div v-if="patient">
      <h2 class="title">Пациент: {{ patient.name }}</h2>
      <p>Возраст: {{ patient.age }}</p>
      <p>Пол: {{ patient.gender }}</p>
  <h3 class="section-title">Сессии</h3>
  <ul class="sessions-list">
    <li class="session-card" v-for="s in sessions" :key="s.id">
      {{ new Date(s.date).toLocaleString() }} — SUD: {{ s.sud_rating }}, Качество: {{ s.session_quality }}
      <br/>Примечания: {{ s.therapist_notes || '—' }}
    </li>
  </ul>

  <button  class="btn logout" @click="show">Добавить запись сессии</button>
  <SessionForm :patientId="patient.id" @added="load" />
</div>
<div v-else>Загрузка...</div>

</div>
</template>


<script>
import SessionForm from '../components/SessionForm.vue';
export default {
  name: 'PatientDetail',
  components: { SessionForm },
  data() {
    return { patient: null, sessions: [] };
  },
  async created() {
    await this.load();
  },
  methods: {
    async load() {
      const token = localStorage.getItem('pt_token');
      const id = this.$route.params.id;
      const res = await fetch(`http://localhost:3000/api/patients/${id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        const data = await res.json();
        this.patient = data.patient;
        this.sessions = data.sessions;
      }
    },
    show(){
       document.querySelector(".fon").style.display="block";
    }
  }
}
</script>


<style scoped>
.patient-detail { padding: 12px; background: #fff; border: 1px solid var(--border); border-radius: 12px; }
.title { margin: 0 0 6px; font-size: 1.25rem; }
.section-title { margin-top: 16px; font-size: 1.05rem; }
.sessions-list { list-style: none; padding: 0; margin: 6px 0 0; display: grid; gap: 8px; }
.session-card { padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; background: #fff; }
.btn { width: auto; padding: 8px 12px; border-radius: 8px; border: none; background: var(--primary); color: white; font-weight: 600; cursor: pointer; }
.btn.logout { margin-top: 14px; display: inline-block; }
@media (max-width: 640px) {
  .patient-detail { padding: 8px; }
}
.fon{
  display:none;
}
</style>