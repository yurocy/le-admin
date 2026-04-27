# 乐回收管理系统 (le-admin)

基于 Vue 3 + TypeScript + Element Plus 的后台管理系统，替换原有 xadmin。

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **UI 框架**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP**: Axios
- **后端 API**: [le-go](https://github.com/yurocy/le-go)

## 功能模块

| 模块 | 功能 |
|------|------|
| 仪表盘 | 订单统计、收入统计、会员统计、库存概览、近期订单 |
| 系统管理 | 管理员管理、角色管理、菜单管理、操作日志 |
| 产品管理 | 分类管理、品牌管理、产品列表、订单管理、描述包管理、优惠券管理 |
| 库存管理 | 库存商品、库存统计 |
| 分销管理 | 等级管理、分销商品、分销商管理、分销订单 |
| 合作商管理 | 代理商管理、商家管理、门店管理、入驻申请、子网站管理 |
| 报价管理 | 报价分类、报价品牌、报价员管理、报价列表 |
| 竞拍管理 | 竞拍分类、竞拍商品、竞拍订单 |
| 文章管理 | 文章分类、文章列表、评论管理 |
| 网站管理 | 网站配置、轮播图管理、收款银行、会员管理、快递管理 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 开发配置

开发服务器默认代理 API 请求到 `http://localhost:8080`（le-go 后端）。

## 项目结构

```
src/
├── api/            # API 接口封装
│   ├── system.ts   # 系统 API（登录、RBAC、仪表盘）
│   └── business.ts # 业务 API（产品、库存、销售等）
├── layout/         # 布局组件
│   ├── index.vue   # 主布局
│   ├── Sidebar.vue # 侧边栏
│   └── Header.vue  # 顶部导航
├── router/         # 路由配置
├── stores/         # Pinia 状态管理
├── styles/         # 全局样式
├── utils/          # 工具函数
│   ├── auth.ts     # Token 管理
│   └── request.ts  # Axios 封装
└── views/          # 页面组件
    ├── dashboard/  # 仪表盘
    ├── system/     # 系统管理
    ├── product/    # 产品管理
    ├── stock/      # 库存管理
    ├── sale/       # 分销管理
    ├── partner/    # 合作商管理
    ├── pricing/    # 报价管理
    ├── bidding/    # 竞拍管理
    ├── article/    # 文章管理
    └── web/        # 网站管理
```
