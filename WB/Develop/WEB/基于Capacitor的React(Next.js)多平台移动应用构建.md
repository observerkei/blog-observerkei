---
title: 
date: 2024-11-07
tags:
  - Note
draft: false
permalink: /31
---
# 简介

Capacitor 可以理解为 Electron 的移动端版本（ [[WB/Develop/WEB/基于Electron的React(Next.js)多平台桌面应用构建|Electron 被设计成构建桌面端应用]] ），可以把 WEB应用 打包成 Android/IOS 移动应用。 
Capacitor 打包安卓应用的时候，会使用安卓内置的 WebView, 不需要额外内置 WEB/Node.js 运行环境，因此打出来的包相比 Electron 小很多。  
可以将 Capacitor 简单理解为一个移动端开发工具包（如 `Android Studio` 工具包），它提供了将 WEB独立项目(`HTML/CSS/JS`) 转化为移动端工程的脚本，以及一些原生的API。 


# 参考资料

- [Installing Capacitor | Capacitor Documentation](https://capacitorjs.com/docs/getting-started#add-capacitor-to-your-web-app)
- [Deploying: Static Exports | Next.js](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
- [Capacitor 打包 h5 到 Android 应用，uniapp https http net::ERR_CLEARTEXT_NOT_PERMITTED_capacitor打包-CSDN博客](https://blog.csdn.net/KimBing/article/details/134093769)


# 环境准备

需要准备：  

- 现成的，支持导出`index.html`的 WEB项目
- 给项目安装 Capacitor 的支持

先进入项目路径，然后安装框架  

```bash
npm i @capacitor/core
npm i -D @capacitor/cli
```


# 将 Capacitor 引入已有项目

进行 Capacitor 初始化，会询问你一些选项，根据提示选择即可。    

```bash
npx cap init
```

如果是Next.js，通过静态导出，可以生成`index.html`页面文件到`out`文件夹  
为了让Next.js支持静态导出，需要先给`next.config.js`的`nextConfig`添加`output: 'export'`  

```bash
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...
  output: 'export',
};

module.exports = nextConfig;
```

然后执行以下命令生成静态文件，将静态文件输出到`out`目录，

```bash
npx next build
npx next-export-fixer
```

然后编辑`capacitor.config.ts`文件，把 `webDir` 改成WEB导出含有`index.html`的目录，也就是`out`。     

```bash
// capacitor.config.ts

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.observerkei.test',
  appName: 'test',
  webDir: 'out'
};

export default config;

```

然后执行以下命令创建项目平台，有两种创建项目方式，这里选择`android`   

```bash
# android
npx cap add android

# IOS
npx cap add ios
```

执行完成命令后，会生成`android`目录，使用`Android Studio` 打开 `android` 目录即可进行下一步。  
首次打开 `Android Studio` 可能会要求设置代理，根据要求设置即可。  

如果后续项目代码有变动，可以通过以下代码更新项目平台代码  

```bash
npx cap sync
```


# `Android Studio` 构建项目

## 编译 APK

用 `Android Studio` 打开 `android` 目录，然后点击 `Make` 编译项目。  

点击 `File -> Sync Project with Gradle Files` 同步文件。  

点击 `Build -> Generate Signed App Bundle(s)/APK(s)` 构建应用。  

然后选择 APK 继续  

![[WB/Develop/WEB/file/apk-bundel.png]]

会提示需要程序签名。  
签名创建方法：  [为应用签名  |  Android Studio  |  Android Developers](https://developer.android.com/studio/publish/app-signing?hl=zh-cn#generate-key)  

![[WB/Develop/WEB/file/apk-build-key.png]]  


配置好签名后点击下一步，配置apk输出路径，然后选择 `debug/release` 版本，在点击构建即可。  

构建完成后，即可得到 APK 文件，复制到手机里面就能安装使用。  


## 配置 APK 名称

APK 的名称在 `capacitor.config.ts` 的 `appName` 中进行定义，修改配置后更新项目即可。  


## 配置 APK 图标

- [Splash Screens and Icons | Capacitor Documentation](https://capacitorjs.com/docs/guides/splash-screens-and-icons)  
- [8,425,000+ free and premium vector icons, illustrations and 3D illustrations](https://www.iconfinder.com/)

将大于或等于 `1024px x 1024px` 的图标命名为`icon.png` 和 `icon-dark.png`，然后放入项目根路径 `assets` 文件夹里面，安装工具   

```bash
npm install @capacitor/assets --save-dev
```

执行命令更新图标文件：  

```bash
npx capacitor-assets generate
# --android 指定 安卓应用
# --ios 指定 IOS应用
```

重新构建应用即可生效。  


# 碰到的问题

## `Android Studio` 打开项目报 Read timed out 错误

从报错看是网络原因，设置好代理后，通过 ` File -> Invalidate Caches / Restart` 重启即可  

## `Android Studio` 打开项目报 Java编译异常 

```bash
Caused by: java.lang.UnsupportedClassVersionError: com/android/tools/lint/model/LintModelSeverity has been compiled by a more recent version of the Java Runtime (class file version 61.0), this version of the Java Runtime only recognizes class file versions up to 55.0
	at org.gradle.internal.classloader.VisitableURLClassLoader$InstrumentingVisitableURLClassLoader.findClass(VisitableURLClassLoader.java:186)
	at org.gradle.internal.reflect.JavaPropertyReflectionUtil.resolveMethodReturnType(JavaPropertyReflectionUtil.java:176)
	at org.gradle.internal.instantiation.generator.AbstractClassGenerator$ClassMetadata.resolveTypeVariables(AbstractClassGenerator.java:578)
	at org.gradle.internal.instantiation.generator.AbstractClassGenerator.assembleProperties(AbstractClassGenerator.java:370)
	at org.gradle.internal.instantiation.generator.AbstractClassGenerator.inspectType(AbstractClassGenerator.java:286)
	at org.gradle.internal.instantiation.generator.AbstractClassGenerator.generateUnderLock(AbstractClassGenerator.java:224)
	... 272 more


CONFIGURE FAILED in 15s
```

处理方法：  更新最新版本 `Android Studio` ，然后重新初始化项目


[*****](WB/Develop/WEB/WEB.md)
