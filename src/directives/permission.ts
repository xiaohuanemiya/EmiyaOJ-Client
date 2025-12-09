import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * 权限指令 - 单个权限校验
 * 使用方式: v-permission="'USER.ADD'"
 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (value && !userStore.hasPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * 权限指令 - 满足任一权限即可
 * 使用方式: v-permission-any="['USER.ADD', 'USER.EDIT']"
 */
export const permissionAny: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (Array.isArray(value) && value.length > 0) {
      const hasAnyPermission = value.some(permission => 
        userStore.hasPermission(permission)
      )
      
      if (!hasAnyPermission) {
        el.parentNode?.removeChild(el)
      }
    }
  }
}

/**
 * 权限指令 - 需要满足所有权限
 * 使用方式: v-permission-all="['USER.ADD', 'USER.EDIT']"
 */
export const permissionAll: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const userStore = useUserStore()
    
    if (Array.isArray(value) && value.length > 0) {
      const hasAllPermissions = value.every(permission => 
        userStore.hasPermission(permission)
      )
      
      if (!hasAllPermissions) {
        el.parentNode?.removeChild(el)
      }
    }
  }
}
