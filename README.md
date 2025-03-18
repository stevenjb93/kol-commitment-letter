# KOL无务迹承诺书在线签署系统

这是一个用于生成和签署KOL无务迹承诺书的Web应用，可以让用户在线填写信息、进行电子签名并生成PDF文档。

## 主要功能

- 用户可以在线填写承诺书上的必要信息（平台名称、账号名称、账号ID、项目名称等）
- 提供电子签名功能
- 可以根据填写内容生成PDF文档并下载
- 支持中文内容的PDF生成

## 技术栈

- 前端：React + TypeScript + Vite
- PDF生成：pdf-lib
- 电子签名：signature_pad

## 安装与使用

### 前提条件

- Node.js 16+
- npm 8+

### 安装依赖

```bash
cd frontend
npm install
```

### 开发模式运行

```bash
cd frontend
npm run dev
```

### 构建生产版本

```bash
cd frontend
npm run build
```

### 预览生产版本

```bash
cd frontend
npm run preview
```

## 项目结构

- `/frontend` - 前端React应用
  - `/src/components` - React组件
  - `/src/styles` - CSS样式文件

## 使用指南

1. 在浏览器中打开应用
2. 填写承诺书上的必要信息（品牌或项目名称、平台名称、账号名称等）
3. 点击签名区域进行电子签名
4. 点击"生成并下载PDF"按钮下载签署好的PDF文档

## 许可

[MIT](LICENSE) 