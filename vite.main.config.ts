import type { ConfigEnv, UserConfig, Plugin } from 'vite'
import { defineConfig, mergeConfig } from 'vite'

import {
  getBuildConfig,
  getBuildDefine,
  external,
  pluginHotRestart,
} from './vite.base.config'

const externalizeNode: Plugin = {
  name: 'externalize-node',
  resolveId(source) {
    if (source.endsWith('.node')) {
      return { id: source, external: true }
    }
  },
}

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'build'>
  const { forgeConfigSelf } = forgeEnv
  const define = getBuildDefine(forgeEnv)
  const config: UserConfig = {
    build: {
      chunkSizeWarningLimit: 2000,
      lib: {
        entry: forgeConfigSelf.entry!,
        fileName: () => '[name].js',
        formats: ['cjs'],
      },
      rollupOptions: {
        external: [...external, 'node-process-watcher'],
        onwarn(warning, warn) {
          // Suppress "Module level directives cause errors when bundled" warnings
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return
          }

          warn(warning)
        },
      },
    },
    plugins: [externalizeNode, pluginHotRestart('restart')],
    define,
    resolve: {
      // Load the Node.js entry.
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
  }

  return mergeConfig(getBuildConfig(forgeEnv), config)
})
