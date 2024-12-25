---
title: 
date: 2024-11-03
tags:
  - Note
draft: false
permalink: /30
---
# 简介

Electron 简单来说就是一个浏览器套壳打包方案，相当于你开发了一个网页后，通过浏览器能访问这个网页；然后如果你想把网页打包成一个单独的应用的话，可以使用Electron，它内置了 chromium 和 node.js 运行环境，使用 Electron 相当于构建了一个只显示你的网页的浏览器程序。  

React 是一个能用来写网页界面的JavaScript库，可以简单理解为一种能通过JavaScript函数生成页面组件内容的工具包。  

Next.js 是一个用 React 来实现的框架，可以简单理解为 React 的拓展工具库。  


文章内容计划使用以下步骤来编写    
- 构建  React(Next.js) 应用
-  React(Next.js) 应用适配到 Electron 框架

Electron 支持 URL 加载和文件加载两种方式，URL加载就是你构建好Electron应用后，给他传入一个URL，他只显示你这个URL内容。  
文件加载就是传入HTML文件，Electron通过文件渲染内容。  
本文构建的时候，提供了 Electron 文件加载方式，因此理论上来说，只要能进行静态导出，就能兼容各种前端框架。同时也提供了 Next.js 动态路由的加载的方式。  

通过使用Electron，可以实现 Linux/Windows/MacOS 三平台桌面端应用构建。  

# 参考资料

- [简介 | Electron](https://www.electronjs.org/zh/docs/latest)
- [Building Desktop Apps with Electron + Next.JS (without Nextron) | by RBFraphael | Medium](https://rbfraphael.medium.com/building-desktop-apps-with-electron-next-js-without-nextron-01bbf1fdd72e)
- [Options | @electron/packager](https://electron.github.io/packager/main/interfaces/Options.html)
- [导入现有项目 | Electron Forge 中文](https://forge.electron.js.cn/import-existing-project)
- [使用 Electron 和 React 构建桌面应用-腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/article/2071153)
- [用Next.js和Electron构建一个应用程序的方法自从引入Node.js以来，基本的网络技术（HTML、CSS和J - 掘金](https://juejin.cn/post/7111724609635876894)
- [Electron Forge | 跨平台实战详解(中)-CSDN博客](https://blog.csdn.net/qq_39517117/article/details/138757291)
- [spa5k/nextjs_approuter_electron: This is a template for building Electron apps with Next.js App router, SSR and Server Components](https://github.com/spa5k/nextjs_approuter_electron)
- [next.config.js Options: output | Next.js](https://nextjs.org/docs/app/api-reference/next-config-js/output#automatically-copying-traced-files)

# 构建React(Next.js)应用

 React(Next.js) 应用需要node.js环境，需要先在设备上安装node.js运行环境，安装好后，设备将支持`node`和`npm`命令。  

```bash
# 查看node (javascript运行环境)的版本
node -v 
# 查看npm (node包管理工具)的版本
npm -v 
# 安装 yarn 包管理工具
npm i -g yarn
# 如设备有 brew，也可以这样更新 yran
brew upgrade yarn  
```

如果 node 需要更新版本，可以使用工具 n 

```bash
# 安装 n 
npm install -g n
# 更新 node
n lts
```

创建 React(Next.js) 应用  

```bash
# 安装react应用创建工具
npm install -g create-nect-app
# 创建 next-electron-test 的nect.js应用
npx create-nect-app next-electron-test
# 启动应用
npx start
```

# 安装 Electron

```bash
# 进入工作路径
cd react-electron-test
# 全局安装 electron
yarn global add electron 
# 使用 npm 也可以安装
npm install --save-dev electron
# 如果 npm 出错，也可以尝试 cnpm
cnpm install -g electron
```

安装好 Electron 后，从 [[#动态路由项目适配 Electron]] 和 [[#静态路由项目适配 Electron]] 中选择一种适合自己的构建方法进行构建。如果是支持导出不需要服务器运行代码的`index.html`的框架，可以使用第二种方法。   

如果不清楚自己的 Next.js 是哪种路由方法，就直接使用 [[#动态路由项目适配 Electron]] 的方法。  


# 动态路由项目适配 Electron

一般情况下，无特殊设置，默认 Next.js 是会产生非静态路由项目，如果是静态路由项目，建议使用[[#静态路由项目适配 Electron]]方法，这样占用的空间比较小。  

## 使用 Electron 加载项目

安装辅助工具
```bash
npm install -g concurrently  
```
### 修改 `package.json`

其中 main.js 是指定 package.json 目录下的 Electron 入口文件， 你的 Electron 应用会以这个文件作为开始启动，在里面需要编写加载自己网页的逻辑。    
`author/description/license` 这些打包要用到。  
`edev` 是开发模式运行项目  
`ebuild` 是构建项目静态文件
`build` 添加了 `standalone` 支持 

```json
// package.json

   ...
+  "main": "main.js",
+  "author": "observerkei",
+  "description": "Test App",
+  "license": "MIT",
   "scripts": {
+    "build": "next build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/",
+    "edev": "concurrently -n \"NEXT,ELECTRON\" -c \"yellow,blue\" --kill-others \"next dev\" \"electron .\"",
+    "ebuild": "npm run build",
     ...
   },
   ...
```


### 修改 `next.config.js`

`next.config.js`添加独立导出支持：  

```json
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...
  output: 'standalone',
};

module.exports = nextConfig;
```


### 添加 Electron 入口 `main.js`

先添加依赖：  

```bash
cnpm install get-port-please
cnpm install @electron-toolkit/utils
```

修改 `main.js` 文件：  

```javascript
// main.js

const { is } = require('@electron-toolkit/utils');
const { app, BrowserWindow, ipcMain } =  require('electron');
const { getPort } = require('get-port-please');
const { startServer } = require('next/dist/server/lib/start-server');
const { join } = require('path');

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  mainWindow.on("ready-to-show", () => mainWindow.show());

  const loadURL = async () => {
    if (is.dev) {
      mainWindow.loadURL("http://localhost:3000");
    } else {
      try {
        const port = await startNextJSServer();
        console.log("Next.js server started on port:", port);
        mainWindow.loadURL(`http://localhost:${port}`);
      } catch (error) {
        console.error("Error starting Next.js server:", error);
      }
    }
  };

  loadURL();
  return mainWindow;
};

const startNextJSServer = async () => {
  try {
    const nextJSPort = await getPort({ portRange: [30_011, 50_000] });
    const webDir = join(app.getAppPath(), ".next/standalone/");

    await startServer({
      dir: webDir,
      isDev: false,
      hostname: "localhost",
      port: nextJSPort,
      customServer: true,
      allowRetry: false,
      keepAliveTimeout: 5000,
      minimalMode: true,
    });

    return nextJSPort;
  } catch (error) {
    console.error("Error starting Next.js server:", error);
    throw error;
  }
};

app.whenReady().then(() => {
  createWindow();

  ipcMain.on("ping", () => console.log("pong"));
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
```

### 添加 Electron 预加载文件  `preload.js`  

```javascript
// preload.js

// 所有的 Node.js API接口 都可以在 preload 进程中被调用.
// 它拥有与Chrome扩展一样的沙盒。
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})
```

### 尝试运行 Electron 项目

```bash
# 因为是使用文件加载，所以需要先构建文件
npm run ebuild 
npm run edev
```


## Electron 打 Linux 包

^dfb59d

官方推荐使用 `electron-forge` 进行打包。  

### 配置 `electron-forge`

先安装 `electron-forge`  

```bash
# 先进入工程根目录，然后再执行命令
cnpm install --save-dev @electron-forge/cli
```

构建打包配置，默认同意选项即可，如果询问是否向 `package.json` 添加命令的时候，选否

```bash
npm exec --package=@electron-forge/cli -c "electron-forge import"
```

配置 `package.json`  ，添加 `efmake/efpackage`  

```json
// package.json

  ...
  "scripts": {
+    "efmake": "electron-forge make",
+    "efpackage": "electron-forge package", 
     ...
  }
  ...
```

编辑 `forge.config.js` 配置文件，其中 makers 里面定义了构建哪些平台的包，这里只构建了1个平台的包。   
`packagerConfig.ignore` 可以通过配置不打包项目的文件夹  
`packagerConfig.extraResource` 可以配置需要直接导出的资源文件  

```json
// forge.config.js

const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    ignore: [
    ],
    extraResource: [
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
```


其中 `makers`中[支持的打包方式](https://www.electronforge.io/config/makers)：  

| 包名                               | 后缀         | 说明                            |
| -------------------------------- | ---------- | ----------------------------- |
| `electron-squirrel-startup`      | N/A        | 管理 Windows 平台下的 Squirrel 安装过程 |
| `@electron-forge/maker-squirrel` | `.exe`     | Windows 的 Squirrel 安装包        |
| `@electron-forge/maker-deb`      | `.deb`     | Debian-based Linux 系统的 DEB 包  |
| `@electron-forge/maker-rpm`      | `.rpm`     | RPM-based Linux 系统的 RPM 包     |
| `@electron-forge/maker-zip`      | `.zip`     | 为各平台创建 ZIP 压缩包                |
| `@electron-forge/maker-dmg`      | `.dmg`     | macOS 的 DMG 镜像文件              |
| `@electron-forge/maker-flatpak`  | `.flatpak` | Linux 的 Flatpak 包             |
| `@electron-forge/maker-snap`     | `.snap`    | Linux 的 Snapcraft 包           |
| `@electron-forge/maker-appx`     | `.appx`    | Windows Store 的 AppX 安装程序     |
### Linux 进行打包

```bash
# 创建资源文件
npm run ebuild
# 预打包, 运行 electron-forge package 命令，文件输出到了 ./out/{项目命名}
npm run efpackage
# 打包, 运行 electron-forge make 命令，文件输出到了 out/make 中
npm run efmake
```

打包完成后可以安装体验一下(ubuntu)  

```bash
# 资源文件会安装到 /usr/lib/{项目命名} 中
sudo dpkg -i 安装包.deb
```


## Electron 打 Windows 包

使用 [[#^dfb59d|动态路由项目 Electron 打 Linux 包的配置]] 参考 [[#^f52b23|静态路由项目 Electron 打 Windows 包]] 方法，进行打包。  


# 静态路由项目适配 Electron

静态路由项目的要求如下：[Deploying: Static Exports | Next.js](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)  

## 使用 Electron 加载项目

安装辅助工具
```bash
npm install -g concurrently  
npm install -g next-export-fixer 
```
### 修改 `package.json`

其中 main.js 是指定 package.json 目录下的 Electron 入口文件， 你的 Electron 应用会以这个文件作为开始启动，在里面需要编写加载自己网页的逻辑。    
`author/description/license` 这些打包要用到。  
`edev` 是开发模式运行项目  
`ebuild` 是构建项目静态文件

```json
// package.json

   ...
+  "main": "main.js",
+  "author": "observerkei",
+  "description": "Test App",
+  "license": "MIT",
   "scripts": {
+    "build": "next build && next-export-fixer",
+    "edev": "concurrently -n \"NEXT,ELECTRON\" -c \"yellow,blue\" --kill-others \"next dev\" \"electron .\"",
+    "ebuild": "npm run build",
     ...
   },
   ...
```

### 修改 `next.config.js`

`next.config.js`添加静态导出支持：  

```json
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...
  output: 'export',
};

module.exports = nextConfig;
```


### 添加 Electron 入口 `main.js`

```javascript
// main.js

const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')


function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'main/preload.js')
    }
  })

  // 适配开发模式和运行模式的不同路径
  if (!app.isPackaged) {
    win.loadFile('out/index.html') 
  } else {
    win.loadFile(path.join(process.resourcesPath, "index.html"));
  }

  win.once('ready-to-show', (event) => {
      win.show()
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```


### 添加 Electron 预加载文件  `preload.js`  

```javascript
// preload.js

// 所有的 Node.js API接口 都可以在 preload 进程中被调用.
// 它拥有与Chrome扩展一样的沙盒。
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})
```

### 尝试运行 Electron 项目

```bash
# 因为是使用文件加载，所以需要先构建文件
npm run ebuild 
npm run edev
```


## Electron 打 Linux 包

官方推荐使用 `electron-forge` 进行打包。  

### 配置 `electron-forge`

先安装 `electron-forge`  

```bash
# 先进入工程根目录，然后再执行命令
npm install --save-dev @electron-forge/cli
```

构建打包配置，默认同意选项即可，如果询问是否向 `package.json` 添加命令的时候，选否
```bash
npm exec --package=@electron-forge/cli -c "electron-forge import"
```

配置 `package.json`  ，添加 `efmake/efpackage`  

```json
// package.json

  ...
  "scripts": {
+    "efmake": "electron-forge make",
+    "efpackage": "electron-forge package", 
     ...
  }
  ...
```

编辑 `forge.config.js` 配置文件，其中 makers 里面定义了构建哪些平台的包，这里只构建了1个平台的包。   
`packagerConfig.ignore` 可以通过配置`"^/.*/.*$"`过滤不打包项目的所有文件夹，当项目是通过文件加载的时候，可以不依赖源码  
`packagerConfig.extraResource` 可以配置需要直接导出的资源文件  

```json
// forge.config.js

const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    ignore: [
        "^/.*/.*$"
    ],
    extraResource: [
      "./out/_next/",
      "./out/index.html",
      "./out/404.html",
      "./out/favicon.ico",
      "./out/locales/",
      "./out/tiktoken_bg.wasm",
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
```


### Linux 进行打包

```bash
# 创建资源文件
npm run ebuild
# 预打包, 运行 electron-forge package 命令，文件输出到了 ./out/{项目命名}
npm run efpackage
# 打包, 运行 electron-forge make 命令，文件输出到了 out/make 中
npm run efmake
```

打包完成后可以安装体验一下(ubuntu)  

```bash
# 资源文件会安装到 /usr/lib/{项目命名} 中
sudo dpkg -i 安装包.deb
```


## Electron 打 Windows 包

^f52b23

Windows 的 Election 打包需要用到 Windows 设备来进行打包，虽然官方提供了Linux+Wine的打包方式，但是我尝试的时候，发现打出来的包放到Windows下不能运行，以及安装Wine也是一大坑，出于稳定性和方便考虑，直接用Windows来进行打包  


### Windows 环境配置

首先默认已经把源码下载好，并配置好 `electron-forge` 配置了。    
然后电脑安装好Node.js程序：  [Node.js — Run JavaScript Everywhere](https://nodejs.org/en)  
安装好后，可以使用PowerShell来直接运行node的相关命令（npm/node）,  
出于代码编写方便的考虑，可以使用VSCode打开源码目录，然后在菜单 `View -> Terminal` 打开控制台窗口，然后进入源码路径中执行代码。   
关于代理的一些配置这里就略过了，国内使用可以配置镜像源，网上有很多教程就不赘述了。  

需要注意的是，electron在国内环境安装的时候，容易出现网络问题，可以用cnpm安装。
npm进行初始化的时候，也容易有问题，所以用yarn初始化。   

```bash
npm install -g cnpm --save-dev
cnpm install electron --save-dev

# 安装工具
npm install -g concurrently 
npm install next-export-fixer 

npm install -g yarn
yarn install
```

### 配置 `electron-forge` 

先安装 `electron-forge`  

```bash
# 先进入工程根目录，然后再执行命令
npm install --save-dev @electron-forge/cli
```

构建打包配置，默认同意选项即可，如果询问是否向 package.json 添加命令的时候，选否
```bash
npm exec --package=@electron-forge/cli -c "electron-forge import"
```


在 `makers -> @electron-forge/maker-zip -> platforms` 中添加 `win32` 以便能打包win程序压缩包。  

```json
// forge.config.js

const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    icon: './out/favicon.ico',
    asar: true,
    ignore: [
        "^/.*/.*$"
    ],
    extraResource: [
      "./out/_next/",
      "./out/index.html",
      "./out/404.html",
      "./out/favicon.ico",
      "./out/locales/",
      "./out/tiktoken_bg.wasm",
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupIcon: './out/favicon.ico'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'darwin'],
    },
    { 
      name: '@electron-forge/maker-deb', 
      config: {}, 
    }, 
    { 
      name: '@electron-forge/maker-rpm', 
      config: {}, 
    }, 
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

```

这个是 `package.json` 打包命令配置：  

```json
// package.json

  ...
  "scripts": {
    "edev": "concurrently -n \"NEXT,ELECTRON\" -c \"yellow,blue\" --kill-others \"next dev\" \"electron .\"",
    "ebuild": "npm run build",
    "estart": "electron .",
    "efmake": "electron-forge make",
    "efstart": "electron-forge start",
    "efpackage": "electron-forge package",
    "efbuild": "npm run ebuild && electron-forge make",
    ...
  }
...
```


### Windows 运行打包

进行Windows打包可以使用以下命令：  

```bash
# 生成静态文件
npm run ebuild
# 进行打包
npm run efmake
```

打包结束后，进入目录 `out/make/zip` 下能看到打包好的win程序，解压后就能直接运行。  
在 `out/{项目名称}` 目录下也能看到预打包的程序文件。  

如果要进行调试开发，需要注意的是Windows运行node可能不是2300端口，可能需要手动指定环境变量PORT为2300端口再运行。  
# 其他功能

## 隐藏标题菜单方法

在 main.js 添加以下代码:  

```javascript
const electron = require('electron') 

/*获取electron窗体的菜单栏*/
const Menu = electron.Menu 
/*隐藏electron创听的菜单栏*/ 
Menu.setApplicationMenu(null) 
```

# 碰到的坑

## Next.js静态导出后找不到资源文件

因为Next.js导出的资源文件默认使用 `/` 进行开头索引，在Electron进行文件加载的时候，会以为是从根目录找文件。  

![[WB/Develop/WEB/file/next-electron-lost-file.png]]  

解决方法： 在进行Next.js的静态导出以后，再继续使用 `next-export-fixer` 修复一下 Next.js 的静态导出即可。  

```bash
npm install -g next-export-fixer
npx next build 
npx next-export-fixer
```


## Electron 打开后，先白屏一段时间才显示页面

这是因为Electron启动的时候，渲染还没完成，所以页面是白的，在应用不大的时候可以修改为先渲染好在显示。  

```javascript
// main.js

// 先设置页面为隐藏。  
const win = new BrowserWindow({
    show: false,
    ...
})

// 可以显示的时候再进行显示
win.once('ready-to-show', (event) => {
    win.show()
})
```

## 打出来的包太大

这个只能部分缓解，因为Electron本身打包的时候会把 chromium 也打包进去，所以会比较大。  
Electron打包的时候，会把源码也一起打包进去，也会包括项目的 `node_modules` 文件夹，因此会非常大。  
如果依赖的模块在 `package.json` 中定义为属于 `devDependencies` 而不是 `dependencies` ， 则打包的时候，Electron会自动剔除 `devDependencies` 中的包，否则会一起打包到源码中。  

也就是说，把不需要运行的时候使用的包放到`devDependencies`可以减少空间占用。  

使用文中静态路由项目构建方法的时候，并不需要依赖模块，这个时候可以完全把 `node_modules` 给屏蔽掉，不进行打包，根据 Next.js 官方的说明，动态路由方式也支持（未验证）。   
具体操作方法如下：  

修改 `forge.config.js` 把 `node_modules` 添加进 `packagerConfig.ignore` 中，就能在打包的时候过滤掉`node_modules` 文件夹。  
然后把构建好的网页静态文件都通过 `packagerConfig.extraResource` 导出，这样的话，就能直接在 `main.js` 中通过 `process.resourcesPath` + 文件的方式访问到。  理论上不导出也可以，不过需要适配一下 asar 的路径；  
Electron 打包的时候，会把默认把源码拷贝到 app.asar 文件里面，asar 打包文件可以在 `main.js` 通过 ``process.resourcesPath`` + app.asar  方式访问到，官方有提供里面资源的调用方法。    

```json
// forge.config.js

module.exports = {
  packagerConfig: {
    asar: true,
    ignore: [
        "^/node_modules/.*$"
    ],
    extraResource: [
      "./out/_next/",
      "./out/index.html",
      "./out/404.html",
      "./out/favicon.ico",
      "./out/locales/",
      "./out/tiktoken_bg.wasm",
    ],
  },
```

## Linux 打 Windows 包异常(Wine 安装方法)

最后为了打Electron包使用的方法是在Windows下进行打包： [[#Windows 打包]]  

下面记录一下踩坑过程。

使用 WSL2 打 Windows 包的时候，使用了如下命令：  

```bash
npx electron-forge make --platform=win32
```

会报错提示需要Wine+Mono，

```bash
Error: You must install both Mono and Wine on non-Windows  
```

费劲装上后，会提示还需要wine32，同样装上后，再次运行还是报错，看了下wine版本比较低，官方的方法是无法直接装上的，查阅大量资料后，使用以下方法进行wine更新：  

[How to Install Wine on Ubuntu 24.04 | Liberian Geek](https://www.liberiangeek.net/2024/04/install-wine-ubuntu-24-04/)  

修改好配置后，wine还是会装不上，需要用到以下命令：  

```bash
sudo apt-get update
sudo aptitude install winehq-stable  
# 如果直接回车不能装上，那么先按下n回车，然后再按下Y回车
```

当wine装好后，需要运行一下以下命名配置一下wine：  

```bash
winecfg
```

如果之前已经有 `~/.wine` 目录，则在初始安装的时候建议删除再运行，因为之前版本配置可能不一样。  

继续 `npx electron-forge make --platform=win32` 的时候，如果还是报错，可以尝试装下`mono-complete`  

```bash
sudo apt-get install mono-complete
```

后面基本上就能打包了——不过打出来的包是有问题的，程序放到Windows下无法运行，点开后程序会马上闪退，也没有任何日志，通过终端方式运行，可以看到有以下一个报错：  

```bash
Failed to find file integrity info for resources\app.asar 
```

手动检查`app.asar`文件发现文件正常，根据报错无法得出更多结论，考虑到如果深入研究源码会占用更多时间，在询问他人建议后，遂尝试使用Windows进行打包： [[#Windows 打包]]  


## Windows 下 npm install 运行报错

在 CMD/PowerShell 执行以下命令初始化工程的时候，会出现报错  

```bash
npm install
```

其中一个报错如下：  

```bash
...
 [Error: EPERM: operation not permitted, rmdir 'C:\test\node_modules\next\dist\build\webpack'] {
4042 warn cleanup       errno: -4048,
4042 warn cleanup       code: 'EPERM',
4042 warn cleanup       syscall: 'rmdir',
...
```

electron包怎么都装不上，据查，electron内部自己也下载了资源，由于不可描述的网络问题，导致报错。  

解决方法是用 cnpm + yarn  进行安装：  

```bash
npm install -g cnpm
cnpm install electron --save-dev

npm install -g yarn
yarn install
```

## WSL2 和 Windows 的 Electron 冲突

因为 WSL2 默认会引入 Windows 的环境变量，在 Windows 下全局安装了 Electron 后，再在WSL2中使用的话，会调用Windows的 Electron。  

验证方法也比较简单，wsl中直接启动Electron，看是不是exe程序。  

```
electron
```

解决办法也很简单，就是修改环境变量。  

> 方法1. 配置 Windows 用户文件夹下的 `C:\Users\{你的用户名}\.wslconfig` 添加配置不同步 Windows 环境变量：  

```ini
[interop]
appendWindowsPath = false
```

但是这个方法会把Windows所有环境变量剔除。  

> 方法2. 过滤环境变量中Windows的npm路径, 可添加到 `/etc/profile` 中全局启用：  

```bash
export PATH=$(p=$(echo $PATH | tr ":" "\n" | grep -v "AppData/Roaming/npm" | tr "\n" ":"); echo ${p%:})
```

## `electron-forge import` 很慢

自动安装很慢的话，可以选择手动安装。  

> 手动配置 `package.json`  

```json
// package.json

   ...
+  "main": "main.js",
+  "author": "observerkei",
+  "description": "Test App",
+  "license": "MIT",
   "scripts": {
+    "efmake": "electron-forge make",
+    "efpackage": "electron-forge package", 
     ...
   },
   "devDependencies": {
+    "@electron-forge/cli": "^7.5.0",
+    "@electron-forge/maker-deb": "^7.5.0",
+    "@electron-forge/maker-rpm": "^7.5.0",
+    "@electron-forge/maker-squirrel": "^7.5.0",
+    "@electron-forge/maker-zip": "^7.5.0",
+    "@electron-forge/plugin-auto-unpack-natives": "^7.5.0",
+    "@electron-forge/plugin-fuses": "^7.5.0",
+    "@electron/fuses": "^1.8.0",
     ...
   }
   ...
```

> 手动添加文件 `forge.config.js`  

```json
// forge.config.js

const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    ignore: [
    ],
    extraResource: [
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
```

安装依赖：  

```bash
cnpm i
```


[*****](WB/Develop/WEB/WEB.md)
