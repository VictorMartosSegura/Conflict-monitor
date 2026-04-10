<script setup>
import { reactive } from 'vue'
import { storeToRefs } from 'pinia'

import { useI18n } from '../composables/useI18n'
import { useConflictStore } from '../stores/conflictStore'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'created'])

const conflictStore = useConflictStore()
const { error, loading } = storeToRefs(conflictStore)
const { t } = useI18n()

const formData = reactive({
  name: '',
  startDate: '',
  status: 'ACTIVE',
  description: '',
})

const validationErrors = reactive({
  name: '',
  startDate: '',
  status: '',
  description: '',
})

function resetForm() {
  formData.name = ''
  formData.startDate = ''
  formData.status = 'ACTIVE'
  formData.description = ''

  validationErrors.name = ''
  validationErrors.startDate = ''
  validationErrors.status = ''
  validationErrors.description = ''
}

function validateForm() {
  validationErrors.name = formData.name.trim() ? '' : `${t('conflictName')} is required.`
  validationErrors.startDate = formData.startDate ? '' : `${t('startDate')} is required.`
  validationErrors.status = formData.status ? '' : `${t('status')} is required.`
  validationErrors.description = formData.description.trim() ? '' : `${t('description')} is required.`

  return !Object.values(validationErrors).some(Boolean)
}

function closeForm() {
  emit('close')
}

async function submitForm() {
  if (!validateForm()) {
    return
  }

  try {
    await conflictStore.createConflict({
      name: formData.name.trim(),
      startDate: formData.startDate,
      status: formData.status,
      description: formData.description.trim(),
    })

    emit('created')
    resetForm()
    emit('close')
  } catch {
    // The store exposes the error through error for the template.
  }
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="closeForm">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="conflict-form-title">
      <h2 id="conflict-form-title">{{ t('createConflict') }}</h2>

      <p v-if="error" class="store-error">{{ error }}</p>

      <form class="conflict-form" @submit.prevent="submitForm">
        <label>
          <span>{{ t('conflictName') }}</span>
          <input v-model="formData.name" type="text" required :placeholder="t('conflictName')" />
          <small v-if="validationErrors.name">{{ validationErrors.name }}</small>
        </label>

        <label>
          <span>{{ t('startDate') }}</span>
          <input v-model="formData.startDate" type="date" required />
          <small v-if="validationErrors.startDate">{{ validationErrors.startDate }}</small>
        </label>

        <label>
          <span>{{ t('status') }}</span>
          <select v-model="formData.status">
            <option value="ACTIVE">ACTIVE</option>
            <option value="FROZEN">FROZEN</option>
            <option value="ENDED">ENDED</option>
          </select>
          <small v-if="validationErrors.status">{{ validationErrors.status }}</small>
        </label>

        <label>
          <span>{{ t('description') }}</span>
          <textarea
            v-model="formData.description"
            rows="4"
            :placeholder="t('description')"
          />
          <small v-if="validationErrors.description">{{ validationErrors.description }}</small>
        </label>

        <div class="form-actions">
          <button class="cancel-button" type="button" @click="closeForm">{{ t('cancel') }}</button>
          <button class="submit-button" type="submit" :disabled="loading">
            {{ t('createConflict') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: #00000099;
}

.modal-card {
  width: min(100%, 500px);
  padding: 2rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.45);
}

h2 {
  margin-bottom: 1.5rem;
  color: #ffffff;
  font-size: 1.8rem;
}

.conflict-form {
  display: grid;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.45rem;
  color: #cbd5e1;
  font-weight: 700;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.9rem 1rem;
  color: #ffffff;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  outline: none;
}

input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

small,
.store-error {
  color: #fca5a5;
  font-weight: 700;
}

.store-error {
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.form-actions button {
  padding: 0.85rem 1rem;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 800;
  transition:
    background 170ms ease,
    transform 170ms ease;
}

.form-actions button:hover {
  transform: translateY(-1px);
}

.cancel-button {
  color: #e2e8f0;
  background: #475569;
}

.cancel-button:hover {
  background: #64748b;
}

.submit-button {
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
  .modal-card {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>
