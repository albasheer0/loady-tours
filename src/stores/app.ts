// Utilities
import { defineStore } from 'pinia'
import { useTheme } from 'vuetify'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const theme = useTheme()
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
  
  const themeMode = ref(localStorage.getItem('theme') || 'system')
  
  function updateTheme(mode: 'system' | 'light' | 'dark') {
    themeMode.value = mode
    localStorage.setItem('theme', mode)
    
    if (mode === 'system') {
      theme.global.name.value = prefersDark.matches ? 'dark' : 'light'
    } else {
      theme.global.name.value = mode
    }
  }
  
  // Initialize theme
  updateTheme(themeMode.value as 'system' | 'light' | 'dark')
  
  // Watch for system theme changes
  prefersDark.addEventListener('change', (e) => {
    if (themeMode.value === 'system') {
      theme.global.name.value = e.matches ? 'dark' : 'light'
    }
  })
  
  return {
    themeMode,
    updateTheme
  }
})
