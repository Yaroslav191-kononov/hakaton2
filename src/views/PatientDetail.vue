<template>
  <div class="patient-detail">
    <div v-if="patient">
      <h2 class="title">Пациент: {{ patient.name }}</h2>
      <p>Возраст: {{ patient.age }}</p>
      <p>Пол: {{ patient.gender }}</p>

      <!-- VR поток (WebSocket-смещение) -->
      <div class="vr-section">
        <h3 class="section-title">VR поток</h3>
        <div class="vr-stream">
          <canvas ref="vrCanvas" class="vr-canvas" width="960" height="540"></canvas>
          <div class="vr-controls">
            <button v-if="!streaming" class="btn" @click="startStreaming">Начать трансляцию</button>
            <button v-if="streaming" class="btn" @click="stopStreaming">Остановить</button>
          </div>
        </div>
      </div>

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
    return {
      patient: null,
      sessions: [],
      streaming: false,
      ws: null,
      canvasW: 960,
      canvasH: 540
    };
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
    },

    // VR поток через WebSocket
    startStreaming() {
      // если уже есть соединение, закрываем его
      this.stopStreaming();

      this.ws = new WebSocket('http://localhost:3000/viewer');
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        this.streaming = true;
        // можно отправлять инициализационные сообщения, если нужно
      };

      this.ws.onmessage = async (ev) => {
        try {
          // Данные — бинарный JPEG кадр
          const blob = new Blob([ev.data], { type: 'image/jpeg' });
          const bitmap = await createImageBitmap(blob);

          const canvas = this.$refs.vrCanvas;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
          }
          bitmap.close();
        } catch (e) {
          console.error('VR stream error', e);
        }
      };

      this.ws.onerror = (e) => {
        console.error('WebSocket error', e);
      };

      this.ws.onclose = () => {
        this.streaming = false;
        this.ws = null;
      };
    },
    stopStreaming() {
      if (this.ws) {
        try { this.ws.close(); } catch (e) { /* ignore */ }
        this.ws = null;
      }
      this.streaming = false;
    }
  },
  beforeDestroy() {
    this.stopStreaming();
  }
}
</script>

<style scoped>
.patient-detail { padding: 12px; background: #fff; border: 1px solid var(--border); border-radius: 12px; }
.title { margin: 0 0 6px; font-size: 1.25rem; }
.section-title { margin-top: 16px; font-size: 1.05rem; }

.vr-section { margin-top: 12px; }
.vr-stream { display: grid; grid-template-columns: 1fr; gap: 8px; align-items: start; }
.vr-canvas { width: 100%; height: auto; border: 1px solid #ddd; display: block; background: #000; }
.vr-controls { display: flex; gap: 8px; align-items: center; justify-content: flex-start; }

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
