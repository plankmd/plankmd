import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import PlankPreview from './PlankPreview.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PlankPreview', PlankPreview)
  },
} satisfies Theme
