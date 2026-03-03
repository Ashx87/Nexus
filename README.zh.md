# Nexus

[English](README.md)

**Nexus** 是一款 iOS 应用，通过本地 Wi-Fi 将 iPhone 变成 Windows PC 的无线遥控器。iOS 客户端经由 WebSocket 发送指令，Windows 服务端使用原生 API 将其注入操作系统。

## 功能特性

| 功能 | 说明 |
|------|------|
| **触控板** | 多点触控手势 → 鼠标移动、点击、右键、滚轮 |
| **虚拟键盘** | 文本输入、功能键（F1–F12）、修饰键锁定（Ctrl/Alt/Shift/Win）、组合键 |
| **媒体控制** | 播放/暂停、上/下一曲、音量调节、静音 |
| **宏 / 快捷键** | 内置预设 + 自定义步骤宏、拖拽排序、导入/导出 |
| **剪贴板同步** | 手机 ↔ PC 双向同步，支持文本与图片，附历史记录 |
| **系统托盘** | Windows 托盘图标，开机自启，设置界面 |

## 架构

```
iOS 客户端 (React Native)  ←→  WebSocket (JSON)  ←→  Windows 服务端 (Node.js)
        client/                                              server/
                          packages/shared/
                        (共享 TypeScript 类型)
```

三个独立包，各自拥有 `package.json`：

- **`packages/shared/`** — 双端共用的 TypeScript 类型与常量（需先构建）
- **`client/`** — React Native iOS 应用（Expo SDK 54）
- **`server/`** — Node.js Windows 服务

## 快速开始

### 前置条件

- **服务端**：Node.js 18+（Windows）、cmake（用于 nut.js 原生模块）
- **客户端**：Node.js 18+、iPhone（安装 Expo Go）或 EAS Dev Build

### 安装与运行

```bash
# 1. 安装三个包的依赖
cd packages/shared && npm install
cd ../server && npm install
cd ../client && npm install

# 2. 构建共享类型（任何对 protocol.ts 的修改后都需重新构建）
cd ../packages/shared && npm run build

# 3. 启动服务端（终端 1）
cd ../server && npm run dev

# 4. 启动客户端 Metro（终端 2）
cd ../client && npx expo start
# → 在 iPhone 上打开 Expo Go → 扫描二维码
```

### 防火墙配置

服务端默认监听 **9001 端口**，首次运行需在 Windows 防火墙开放该端口（服务端启动时会打印提示）。

## 开发命令

### 共享类型

```bash
cd packages/shared
npm run build        # 构建（修改 protocol.ts 后必须执行）
```

### 服务端

```bash
cd server
npm run dev          # ts-node-dev 热重载开发
npm test             # Jest 单元测试
npm run build        # 编译至 dist/
npm run build:exe    # 打包为 nexus-server.exe（pkg）
```

### 客户端

```bash
cd client
npx expo start                                              # 启动 Metro（Expo Go 扫码）
npx eas-cli build --profile development --platform ios     # EAS 开发构建（首次）
npx eas-cli build --profile production --platform ios      # EAS 正式 IPA
```

### 连通性测试

```bash
# 服务端运行后执行
node server/scripts/test-client.js 127.0.0.1 9001
```

## 通信协议

所有消息通过 WebSocket 以统一 JSON 信封传输：

```json
{ "module": "mouse|keyboard|media|macro|clipboard", "action": "动作名", "payload": {} }
```

完整类型定义见 [`packages/shared/src/protocol.ts`](packages/shared/src/protocol.ts)。

## 目录结构

```
nexus/
├── packages/shared/src/
│   └── protocol.ts
├── client/src/
│   ├── modules/
│   │   ├── connection/
│   │   ├── touchpad/
│   │   ├── keyboard/
│   │   ├── media/
│   │   ├── macro/
│   │   ├── clipboard/
│   │   └── settings/
│   ├── services/
│   └── stores/
└── server/src/
    ├── modules/
    ├── server.ts
    ├── router.ts
    └── discovery.ts
```

## 技术栈

| 关注点 | 技术选型 |
|--------|---------|
| iOS 客户端 | Expo SDK 54 + React Native 0.81 + TypeScript |
| iOS 构建 | EAS Build（云端，无需 Mac） |
| 状态管理 | Zustand |
| 服务端运行时 | Node.js + TypeScript，`ws` 包 |
| 鼠标/键盘注入 | `@nut-tree-fork/nut-js` |
| 服务端打包 | `pkg` → `.exe` + `systray2` 托盘 |

## 许可证

[MIT](LICENSE)
