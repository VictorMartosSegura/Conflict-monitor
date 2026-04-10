<script setup>
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useI18n } from '../composables/useI18n'
import { useConflictStore } from '../stores/conflictStore'

const emit = defineEmits(['created', 'cancel'])

const conflictStore = useConflictStore()
const { error } = storeToRefs(conflictStore)
const { t } = useI18n()

const form = reactive({
  name: '',
  startDate: '',
  status: 'ACTIVE',
  description: '',
})

const errors = reactive({})
const isSubmitting = ref(false)

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    delete errors[key]
  })
}

function validateForm() {
  clearErrors()

  if (!form.name.trim()) {
    errors.name = `${t('conflictName')} is required.`
  } else if (form.name.trim().length < 3) {
    errors.name = `${t('conflictName')} must be at least 3 characters.`
  }

  if (!form.startDate) {
    errors.startDate = `${t('startDate')} is required.`
  }

  if (!form.status) {
    errors.status = `${t('status')} is required.`
  }

  if (!form.description.trim()) {
    errors.description = `${t('description')} is required.`
  } else if (form.description.trim().length < 10) {
    errors.description = `${t('description')} must be at least 10 characters.`
  }

  return Object.keys(errors).length === 0
}

function resetForm() {
  form.name = ''
  form.startDate = ''
  form.status = 'ACTIVE'
  form.description = ''
  clearErrors()
}

async function submitForm() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    await conflictStore.createConflict({
      name: form.name.trim(),
      startDate: form.startDate,
      status: form.status,
      description: form.description.trim(),
    })

    resetForm()
    emit('created')
  } catch {
    // The store exposes the failure through error for the template.
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="create-conflict-form" @submit.prevent="submitForm">
    <div class="form-header">
      <div>
        <p class="eyebrow">New Record</p>
        <h2>{{ t('createConflict') }}</h2>
      </div>

      <button class="ghost-button" type="button" @click="emit('cancel')">{{ t('cancel') }}</button>
    </div>

    <p v-if="error" class="form-error">{{ error }}</p>

    <label>
      <span>{{ t('conflictName') }}</span>
      <input v-model="form.name" type="text" required :placeholder="t('conflictName')" />
      <small v-if="errors.name">{{ errors.name }}</small>
    </label>

    <div class="form-grid">
      <label>
        <span>{{ t('startDate') }}</span>
        <input v-model="form.startDate" type="date" required />
        <small v-if="errors.startDate">{{ errors.startDate }}</small>
      </label>

      <label>
        <span>{{ t('status') }}</span>
        <select v-model="form.status" required>
          <option value="ACTIVE">ACTIVE</option>
          <option value="FROZEN">FROZEN</option>
          <option value="ENDED">ENDED</option>
        </select>
        <small v-if="errors.status">{{ errors.status }}</small>
      </label>
    </div>

    <label>
      <span>{{ t('description') }}</span>
      <textarea v-model="form.description" required rows="5" :placeholder="t('description')" />
      <small v-if="errors.description">{{ errors.description }}</small>
    </label>

    <button class="submit-button" type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? `${t('createConflict')}...` : t('createConflict') }}
    </button>
  </form>
</template>

<style scoped>
.create-conflict-form {
  display: grid;
  gap: 1rem;
  padding: clamp(1rem, 4vw, 2rem);
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
}

.form-header,
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.form-header {
  align-items: start;
}

.eyebrow {
  margin-bottom: 0.5rem;
  color: #f59e0b;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

h2 {
  color: #ffffff;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  line-height: 1;
}

label {
  display: grid;
  gap: 0.45rem;
  color: #cbd5e1;
  font-weight: 800;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.85rem 1rem;
  color: #ffffff;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  outline: none;
}

textarea {
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.18);
}

small,
.form-error {
  color: #fecaca;
  font-weight: 700;
}

.form-error {
  padding: 0.85rem 1rem;
  background: rgba(220, 38, 38, 0.14);
  border: 1px solid #dc2626;
  border-radius: 8px;
}

.ghost-button,
.submit-button {
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 800;
}

.ghost-button {
  justify-self: end;
  padding: 0.75rem 1rem;
  color: #e2e8f0;
  background: #334155;
  transition:
    background 170ms ease,
    color 170ms ease,
    transform 170ms ease;
}

.submit-button {
  padding: 0.95rem 1.25rem;
  color: #0f172a;
  background: #f59e0b;
  transition:
    background 170ms ease,
    transform 170ms ease;
}

.ghost-button:hover,
.submit-button:hover {
  transform: translateY(-1px);
}

.ghost-button:hover {
  color: #0f172a;
  background: #f59e0b;
}

.submit-button:hover {
  background: #fbbf24;
}

.submit-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

@media (max-width: 640px) {
  .form-header,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .ghost-button {
    justify-self: start;
  }
}
</style>
