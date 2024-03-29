import { init } from '@waline/client';

// 资源初始化
function walineInit() {
  // 不在主页渲染
  if (window.location.pathname !== '/') {
    window.waline_global = init({
      el: '#waline',
      dark: 'html[saved-theme=\'dark\']',
      serverURL: 'https://waline-blog.observerkei.top',
    });
    window.addCleanup(() => walineExit())
  }
}

// 资源清理
function walineExit() {
  if (window.waline_global) {
    window.waline_global?.destroy()
    window.waline_global = null
  }
}

document.addEventListener("nav", walineInit)