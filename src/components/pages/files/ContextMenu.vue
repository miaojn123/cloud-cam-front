<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="context-menu__overlay"
      @mousedown.left="onOverlayMouseDown"
      @contextmenu.prevent
    >
      <div
        class="context-menu"
        :style="{ left: `${x}px`, top: `${y}px` }"
        role="menu"
        @mousedown.stop
      >
        <template v-for="it in items" :key="it.id">
          <div v-if="it.divider" class="context-menu__divider" />
          <button
            v-else
            class="context-menu__item"
            :class="{
              'context-menu__item--disabled': it.disabled,
              'context-menu__item--danger': it.danger,
            }"
            type="button"
            role="menuitem"
            :disabled="it.disabled"
            @click="onItemClick(it.id)"
          >
            {{ it.label }}
          </button>
        </template>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { ContextMenuItem } from './contextMenu/types'

export default {
  name: 'ContextMenu',
  props: {
    visible: { type: Boolean, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    items: { type: Array as PropType<ContextMenuItem[]>, required: true },
  },
  emits: ['close', 'select'],
  mounted() {
    window.addEventListener('keydown', this.onKeyDown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeyDown)
  },
  methods: {
    onKeyDown(e: KeyboardEvent) {
      if (!this.visible) return
      if (e.key === 'Escape') this.$emit('close')
    },
    onOverlayMouseDown() {
      this.$emit('close')
    },
    onItemClick(id: string) {
      this.$emit('select', id)
      this.$emit('close')
    },
  },
}
</script>

<style scoped>
.context-menu__overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
}

.context-menu {
  position: fixed;
  min-width: 160px;
  padding: 6px;
  background: #ffffff;
  border: 1px solid var(--files-border-color, lightgray);
  border-radius: 6px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.context-menu__divider {
  height: 1px;
  background: #e5e7eb;
  margin: 6px 4px;
}

.context-menu__item {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  text-align: left;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #111827;
  cursor: pointer;
}

.context-menu__item:hover {
  background: #f3f4f6;
}

.context-menu__item--danger {
  color: #b91c1c;
}

.context-menu__item--disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.context-menu__item--disabled:hover {
  background: transparent;
}
</style>
