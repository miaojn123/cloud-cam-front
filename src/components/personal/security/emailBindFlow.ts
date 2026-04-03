import { h, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { sendCodeApi } from '@/api/auth'
import { requestButtonThrottle } from '@/utils/requestThrottle'
import { bindCurrentUserEmailApi, unbindCurrentUserEmailApi } from '@/api/user'
import VerifyCodeBox from '@/components/common/VerifyCodeBox.vue'

type EmailFlowDeps = {
  refreshUser: () => Promise<unknown>
}

type CountdownController = {
  countdown: number
  start: (seconds: number) => void
  stop: () => void
}

function createCountdownController(onTick: (next: number) => void): CountdownController {
  let timer: number | null = null
  let countdown = 0

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    countdown = 0
    onTick(0)
  }

  const start = (seconds: number) => {
    stop()
    countdown = seconds
    onTick(countdown)
    timer = window.setInterval(() => {
      countdown--
      onTick(Math.max(0, countdown))
      if (countdown <= 0) {
        stop()
      }
    }, 1000)
  }

  return {
    get countdown() {
      return countdown
    },
    start,
    stop,
  }
}

function isEmailValid(email: string) {
  const s = String(email ?? '').trim()
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailReg.test(s)
}

function maskEmail(email: string) {
  const s = String(email ?? '').trim()
  const at = s.indexOf('@')
  if (at <= 0) return '***'
  const local = s.slice(0, at)
  const domain = s.slice(at + 1)
  if (!domain) return '***'
  const visible = local.slice(0, 3)
  return `${visible || '*'}***@${domain}`
}

type OpenBindEmailBoxOptions = {
  deps: EmailFlowDeps
}

export async function openBindEmailBox(options: OpenBindEmailBoxOptions) {
  const state = reactive({
    email: '',
    code: '',
    countdown: 0,
    submitting: false,
  })

  const countdown = createCountdownController((next) => {
    state.countdown = next
  })

  const cleanup = () => countdown.stop()

  const throttledSendBindCode = requestButtonThrottle(async () => {
    const email = state.email.trim()
    if (!isEmailValid(email)) {
      ElMessage.error('请输入正确邮箱')
      return
    }
    try {
      await sendCodeApi(email, 'BIND_EMAIL')
      ElMessage.success('验证码已发送')
      countdown.start(60)
    } catch {
      ElMessage.error('发送验证码失败')
    }
  })

  try {
    await ElMessageBox({
      title: '绑定邮箱',
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      closeOnPressEscape: false,
      beforeClose: async (action: 'confirm' | 'cancel' | 'close', _instance: any, done: () => void) => {
        if (action !== 'confirm') {
          cleanup()
          done()
          return
        }
        const email = state.email.trim()
        const code = state.code.trim()
        if (!isEmailValid(email)) {
          ElMessage.error('请输入正确邮箱')
          return
        }
        if (!code) {
          ElMessage.error('请输入验证码')
          return
        }
        if (state.submitting) return
        state.submitting = true
        try {
          const result = await bindCurrentUserEmailApi(email, code)
          const msg = typeof result?.msg === 'string' ? result.msg : ''
          ElMessage.success(msg || '绑定邮箱成功')
          await options.deps.refreshUser()
          cleanup()
          done()
        } finally {
          state.submitting = false
        }
      },
      message: () =>
        h(VerifyCodeBox as any, {
          accountLabel: '邮箱',
          account: state.email,
          'onUpdate:account': (v: string) => (state.email = v),
          accountPlaceholder: '请输入邮箱',
          accountReadonly: false,
          showAccount: true,
          code: state.code,
          'onUpdate:code': (v: string) => (state.code = v),
          countdown: state.countdown,
          sendText: '发送验证码',
          helpLink: null,
          'onSend-code': () => {
            void throttledSendBindCode()
          },
        }),
    })
  } finally {
    cleanup()
  }
}

type OpenUnbindEmailBoxOptions = {
  currentEmail: string
  deps: EmailFlowDeps
}

export async function openUnbindEmailBox(options: OpenUnbindEmailBoxOptions) {
  const state = reactive({
    code: '',
    countdown: 0,
    submitting: false,
  })

  const countdown = createCountdownController((next) => {
    state.countdown = next
  })

  const cleanup = () => countdown.stop()
  const displayEmail = maskEmail(options.currentEmail)

  const throttledSendUnbindCode = requestButtonThrottle(async () => {
    const email = String(options.currentEmail ?? '').trim()
    if (!email) {
      ElMessage.error('未获取到已绑定邮箱')
      return
    }
    try {
      await sendCodeApi(email, 'UNBIND_EMAIL')
      ElMessage.success('验证码已发送')
      countdown.start(60)
    } catch {
      ElMessage.error('发送验证码失败')
    }
  })

  try {
    await ElMessageBox({
      title: '解绑邮箱',
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      closeOnPressEscape: false,
      beforeClose: async (action: 'confirm' | 'cancel' | 'close', _instance: any, done: () => void) => {
        if (action !== 'confirm') {
          cleanup()
          done()
          return
        }
        const code = state.code.trim()
        if (!code) {
          ElMessage.error('请输入验证码')
          return
        }
        if (state.submitting) return
        state.submitting = true
        try {
          const result = await unbindCurrentUserEmailApi(code)
          const msg = typeof result?.msg === 'string' ? result.msg : ''
          ElMessage.success(msg || '解绑邮箱成功')
          await options.deps.refreshUser()
          cleanup()
          done()
        } finally {
          state.submitting = false
        }
      },
      message: () =>
        h(VerifyCodeBox as any, {
          accountLabel: '邮箱',
          account: displayEmail,
          accountPlaceholder: '',
          accountReadonly: true,
          showAccount: true,
          code: state.code,
          'onUpdate:code': (v: string) => (state.code = v),
          countdown: state.countdown,
          sendText: '发送验证码',
          helpLink: null,
          'onSend-code': () => {
            void throttledSendUnbindCode()
          },
        }),
    })
  } finally {
    cleanup()
  }
}

