# Evolution Roadmap

一个用于展示项目演进、产品迭代、子项目管线和反哺关系的可视化看板。

## 功能特性

- 项目与子项目配置管理
- 产品迭代时间轴展示
- 反哺关系连线与节点悬浮信息卡片
- 项目/产品筛选下拉菜单
- 顶部时间刻度切换（周 / 月）
- 左侧项目与产品名称锁定列

## 本地启动

### 方式一：静态服务（推荐）

```bash
cd /Users/riqi/project/RoadMap
python3 -m http.server 4173
```

打开浏览器访问：

`http://127.0.0.1:4173/`

### 方式二：Electron 开发模式

```bash
npm install
npm run dev
```

## 打包

```bash
npm run dist
```

产物默认输出到 `dist/` 目录（包含 macOS 安装包）。

## 项目结构

- `index.html`：页面入口（浏览器内 Babel 转译 JSX）
- `evolution_roadmap_pro.jsx`：核心看板逻辑与 UI
- `main.js`：Electron 主进程
- `package.json`：脚本与依赖配置

## GitHub

仓库地址：

`https://github.com/LYU-QI/Evolution-Roadmap-`
