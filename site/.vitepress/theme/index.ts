import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import PlankPreview from './PlankPreview.vue'
import HeroAnimation from './HeroAnimation.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  // The home page shows models building themselves instead of the logo.
  Layout: () => h(DefaultTheme.Layout, null, { 'home-hero-image': () => h(HeroAnimation) }),
  enhanceApp({ app }) {
    app.component('PlankPreview', PlankPreview)
  },
} satisfies Theme
