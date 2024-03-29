import { pageviewCount } from '@waline/client'

// 资源初始化
function walinePageviewInit() {
  const cancel = pageviewCount({
    path: window.location.pathname,
    serverURL: 'https://waline-blog.observerkei.top',
  });

  function has_count() {
    var elements = document.getElementsByClassName('waline-pageview-count');
    // 遍历所有找到的元素
    for (var i = 0; i < elements.length; i++) {
        if (elements[i]?.innerHTML.length) {
          return true
        } 
    }
    return false
  }
  
  function checkShowPageView() {
    if (has_count()) {
      var element = document.getElementById('waline-pageview-wait');

      // 如果找到了符合条件的元素
      if (element) {
          // 清除该元素的所有 class
          element.style.visibility = 'visible';
          return true
      }
    }
    return false
  }

  function checkTimeout(cnt) {
    if (cnt > 0 && !checkShowPageView()) {
      setTimeout(() => checkTimeout(cnt - 1), 1000);
    }
  }
  // 10秒后能获取到就显示, 不然就不显示
  checkTimeout(10)
}

export default () => {
  document.addEventListener("nav", walinePageviewInit)
}