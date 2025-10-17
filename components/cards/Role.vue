<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'

const props = defineProps({
  id: {
    type: [String, Number],
    required: false,
    default: undefined,
  },
  role: {
    type: Object,
    required: true,
  },
  scopedModel: {
    type: String,
    required: false,
    default: null,
  },
  icon: {
    type: String,
    default: 'mdi-account',
  },
  color: {
    type: String,
    default: 'primary',
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['selectRole'])

const handleSelect = () => {
  emit('selectRole', props)
}
</script>

<template>
  <VCard
    :color="undefined"
    :variant="selected ? 'flat' : 'elevated'"
    class="role-card h-100"
    :class="{ 'selected-card': selected }"
    elevation="3"
    @click="handleSelect"
  >
    <VCardItem>
      <template #prepend>
        <VAvatar
          :color="color"
          size="large"
          rounded
        >
          <VIcon
            :icon="icon"
            size="32"
            color="white"
          />
        </VAvatar>
      </template>
      <VCardTitle class="text-h5 text-center">
        {{ role.name }}
      </VCardTitle>
    </VCardItem>

    <VCardText>
      <p v-if="role.description">
        {{ role.description }}
      </p>
      <VDivider class="my-4" />
      <div class="d-flex flex-column">
        {{ scopedModel ? `${scopedModel?.scope_string?.split(':')[1].trim()}` : '&nbsp;' }}
      </div>
    </VCardText>

    <VCardActions>
      <VBtn
        :color="selected ? 'white' : color"
        :variant="selected ? 'flat' : 'tonal'"
        block
        class="font-weight-bold"
        :style="selected ? 'color: #43a047; border: 2px solid #43a047; background: #fff;' : ''"
      >
        <template v-if="selected">
          <VIcon
            icon="mdi-check-circle"
            color="success"
            class="me-2"
          />
          Terpilih
        </template>
        <template v-else>
          Pilih Role
        </template>
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<style lang="scss" scoped>
.role-card {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  &.selected-card {
    box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.4) !important;
    transform: translateY(-5px);
  }
}
</style>
