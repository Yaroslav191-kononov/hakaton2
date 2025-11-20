<template>
<div class="fon">
  <form class="session-form" @submit.prevent="submit">
    <div class="field">
      <h2>Заполни данные о сессии   <button  class="btn logout" @click="show">Закрыть</button></h2>
    </div>
    <div class="field">
      <label class="lbl">SUD (0-10)</label>
      <input class="input" type="number" v-model.number="sudRating" min="0" max="10" required />
    </div>
    <div class="field">
      <label class="lbl">Качество сессии (0-10)</label>
      <input class="input" type="number" v-model.number="sessionQuality" min="0" max="10" required />
    </div>
    <div class="field">
      <label class="lbl">Комментарии терапевта</label>
      <textarea class="textarea" v-model="therapistNotes"></textarea>
    </div>
    <button class="btn" type="submit">Сохранить</button>
  </form>
</div>
</template>


<script>
export default {
  props: ['patientId'],
  data() {
    return {
      sudRating: 5,
      sessionQuality: 5,
      therapistNotes: ''
    };
  },
  methods: {
    async submit() {
      const token = localStorage.getItem('pt_token');
      const payload = {
        sudRating: this.sudRating,
        sessionQuality: this.sessionQuality,
        therapistNotes: this.therapistNotes
      };
      const res = await fetch(`http://localhost:3000/api/patients/${this.patientId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        document.querySelector(".fon").style.display="none";
        this.sudRating = 5;
        this.sessionQuality = 5;
        this.therapistNotes = '';
        this.$emit('added');
      } else {
        console.error('Не удалось сохранить сессию');
      }
    },
    show(){
       document.querySelector(".fon").style.display="block";
    }
  }
}
</script>


<style scoped>
.fon{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.427);
  z-index: 20;
}
.session-form {
  margin: 150px auto;
  max-width: 50%;
  padding: 32px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  display: grid; gap: 10px;
}
.field { 
  display: grid;
  gap: 6px;
}
.lbl { 
  font-size: 0.88rem;
  color: var(--muted); 
}
.input, .textarea {
  padding: 10px 12px; border: 1px solid var(--border);
  border-radius: 8px; font-size: 0.95rem; background: #fff; outline: none;
}
.textarea { min-height: 90px; resize: vertical; }
.btn { 
  align-self: start;
  padding: 9px 14px;
  border-radius: 8px; 
  border: none;
  background: var(--primary);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.btn:hover { background: #4338ca; }
</style>