# Evolution RoadMap

项目产品协同演进看板（RoadMap）桌面版与网页版源码。

## 功能概览

- 项目与产品双轴演进展示
- 子项目可展开/收起
- 反哺配置支持绑定到项目或子项目
- SVG 导出
- macOS 桌面应用打包（Electron）

## 本地开发

直接打开页面：

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

浏览器访问：

`http://127.0.0.1:4173/`

## 桌面打包（macOS）

安装依赖：

```bash
npm install
```

生成安装包：

```bash
npm run dist
```

产物位置：

- `dist/RoadMap-1.0.0-arm64.dmg`

## Release 下载

本仓库的 GitHub Releases 会提供 `.dmg` 安装包下载。

