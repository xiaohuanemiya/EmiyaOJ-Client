import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { permission, permissionAny, permissionAll } from './directives/permission'

const app = createApp(App)

// Register all Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Register custom directives
app.directive('permission', permission)
app.directive('permission-any', permissionAny)
app.directive('permission-all', permissionAll)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
