<template>
  <div class="files-layout">
    <slot name="nav" />

    <main class="files-layout__main-wrap">
      <div class="files-layout__body">
        <aside class="files-layout__aside">
          <slot name="aside" />
        </aside>

        <section class="files-layout__main">
          <slot name="main" />
        </section>

        <aside v-if="showDetail" class="files-layout__detail">
          <slot name="detail" />
        </aside>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FilesLayout',
  props: {
    showDetail: { type: Boolean, default: false },
  },
}
</script>

<style scoped>
.files-layout {
  height: 100%;
  width: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  --files-border-color: lightgray;
}

.files-layout__main-wrap {
  flex: 1 1 auto;
  overflow: hidden;
}

.files-layout__body {
  height: 100%;
  display: flex;
  overflow: hidden;
}

.files-layout__aside {
  width: 240px;
  border-right: 1px solid var(--files-border-color);
  overflow: hidden;
}

.files-layout__detail {
  width: 280px;
  border-left: 1px solid var(--files-border-color);
  background: #ffffff;
  overflow: hidden;
}

.files-layout__main {
  flex: 1 1 auto;
  overflow: hidden;
}
</style>
