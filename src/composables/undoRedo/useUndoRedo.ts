import { getUndoRedoStackApi } from '@/api/undoRedo'

/** 撤销重做相关业务流程。 */
export function useUndoRedo() {
  return {
    /** 同步当前工作区撤销重做栈。 */
    async syncUndoRedoStack() {
      const result = await getUndoRedoStackApi({
        _skipAuthRedirect: true,
        _skipUndoRedoSync: true
      })
      // TODO: 将 result.data 同步到 workspace store 的 undo/redo 栈状态。
      return result
    }
  }
}
