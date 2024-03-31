import { init } from '@waline/client';
import { local } from 'd3';

// 资源清理
function walineContentExit() {
  if (window.waline_content_global) {
    window.waline_content_global?.destroy()
    window.waline_content_global = null
  }
}

// 资源初始化
function walineContentInit() {
  if (window.waline_content_global) {
    return;
  }
  // 不在主页渲染
  if (window.location.pathname !== '/') {
    window.waline_content_global = init({
      el: '#waline',
      dark: 'html[saved-theme=\'dark\']',
      serverURL: 'https://waline-blog.observerkei.top',
      reaction: [
        "/static/reaction-like.png"
      ],
      locale: {
        reactionTitle: ""
      }
    });
    
    // 清理反应标题

    window?.addCleanup(() => walineContentExit())
  }
}

export default () => {
  // 首次执行
  walineContentInit()
  // SPA操作通知的时候执行
  document.addEventListener("nav", walineContentInit)
}
