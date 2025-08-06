// Dynamically require the native module at runtime to avoid bundler issues.
// Using `createRequire` prevents Vite's build step from attempting to process
// the `.node` binary inside `node-process-watcher`, which previously caused the
// development build to fail with a "No loader is configured for '.node' files"
// error.
import { createRequire } from 'node:module'
import { ElectronAPIEventKeys } from '../../config/constants/main-process'
import { MainWindow } from '../startup/windows/main'

let node_process_watcher:
  | (typeof import('node-process-watcher'))['node_process_watcher']
  | null = null

try {
  node_process_watcher = createRequire(import.meta.url)(
    'node-process-watcher'
  ).node_process_watcher
} catch (error) {
  console.warn(
    'Failed to load node-process-watcher. Native dependency might be missing.',
    error
  )
}

export class CustomProcess {
  private static id: number | null = null
  private static name: string | null = null
  private static isRunning = false

  static init() {
    if (!CustomProcess.name) {
      return
    }

    node_process_watcher?.on('custom-process', (list) => {
      const filtered = list.find(
        (item) => item.name === CustomProcess.name
      )
      const isRunning = filtered !== undefined

      if (filtered?.id !== undefined) {
        CustomProcess.id = filtered.id
      }

      CustomProcess.isRunning = isRunning

      MainWindow.instance.webContents.send(
        ElectronAPIEventKeys.CustomProcessStatus,
        CustomProcess.isRunning
      )
    })
  }

  static kill() {
    if (typeof CustomProcess.id !== 'number') {
      return
    }

    node_process_watcher?.kill_process(CustomProcess.id, true)
  }

  static setName(value: string, restart?: boolean) {
    if (value === CustomProcess.name) {
      return
    }

    CustomProcess.name = value

    if (restart) {
      CustomProcess.destroy()
      CustomProcess.init()
    }
  }

  static destroy() {
    CustomProcess.id = null
    CustomProcess.name = null
    CustomProcess.isRunning = false
    node_process_watcher?.close('custom-process')
  }
}
