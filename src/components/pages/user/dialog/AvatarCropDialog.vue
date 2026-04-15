<template>
  <AppDialog
    v-model="dialogVisible"
    title="裁剪头像"
    width="480px"
    destroy-on-close
    align-center
    class="avatar-crop-dialog"
    @opened="onDialogOpened"
    @closed="onDialogClosed"
  >
    <div class="avatar-crop-dialog__canvas-wrap">
      <img
        v-show="imageUrl"
        ref="cropImg"
        :src="imageUrl"
        alt=""
        class="avatar-crop-dialog__img"
      />
    </div>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </AppDialog>
</template>

<script lang="ts">
import AppDialog from '@/components/common/AppDialog.vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

export default {
  name: 'AvatarCropDialog',
  components: { AppDialog },
  props: {
    modelValue: { type: Boolean, default: false },
    file: { type: Object as () => File | null, default: null },
  },
  emits: {
    'update:modelValue': (_v: boolean) => true,
    confirm: (_payload: { dataUrl: string; blob: Blob }) => true,
  },
  data() {
    return {
      imageUrl: '',
      cropper: null as Cropper | null,
    }
  },
  computed: {
    dialogVisible: {
      get(): boolean {
        return this.modelValue
      },
      set(v: boolean) {
        this.$emit('update:modelValue', v)
      },
    },
  },
  watch: {
    modelValue(val: boolean) {
      if (val && this.file) {
        this.revokeUrl()
        this.imageUrl = URL.createObjectURL(this.file)
      } else if (!val) {
        this.cleanup()
      }
    },
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    revokeUrl() {
      if (this.imageUrl) {
        URL.revokeObjectURL(this.imageUrl)
        this.imageUrl = ''
      }
    },
    destroyCropper() {
      if (this.cropper) {
        this.cropper.destroy()
        this.cropper = null
      }
    },
    /** 关闭弹窗或切换图片时释放实例与 blob URL */
    cleanup() {
      this.destroyCropper()
      this.revokeUrl()
    },
    onDialogOpened() {
      // 等弹层与图片就绪后再挂 cropper，避免尺寸为 0
      this.$nextTick(() => {
        const img = this.$refs.cropImg as HTMLImageElement | undefined
        if (!img || !this.imageUrl) return
        const run = () => {
          this.destroyCropper()
          if (!img.naturalWidth) return
          this.cropper = new Cropper(img, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.85,
            background: false,
          })
        }
        if (img.complete && img.naturalWidth) run()
        else img.onload = () => run()
      })
    },
    onDialogClosed() {
      this.cleanup()
    },
    handleCancel() {
      this.dialogVisible = false
    },
    handleConfirm() {
      if (!this.cropper) return
      const canvas = this.cropper.getCroppedCanvas({
        width: 256,
        height: 256,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      })
      if (!canvas) {
        ElMessage.error('裁剪失败')
        return
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      // toBlob 是异步的；必须等拿到二进制后才能上传
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            ElMessage.error('裁剪失败')
            return
          }
          this.$emit('confirm', { dataUrl, blob })
          this.dialogVisible = false
        },
        'image/jpeg',
        0.9
      )
    },
  },
}
</script>

<style scoped>
.avatar-crop-dialog__canvas-wrap {
  max-height: 360px;
  overflow: hidden;
}

.avatar-crop-dialog__img {
  display: block;
  max-width: 100%;
}
</style>
