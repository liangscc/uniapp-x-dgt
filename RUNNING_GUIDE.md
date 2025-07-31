# UniApp X 业务管理系统 - 运行指南

## 项目概述

这是一个基于 UniApp X 框架开发的完整业务管理系统，包含订单管理、商品管理、客户管理、采购管理、仓库管理等功能模块。

## 环境要求

- **HBuilderX**: 最新版本
- **Node.js**: 14.0 或更高版本
- **操作系统**: Windows、macOS 或 Linux

## 快速开始

### 1. 克隆项目

```bash
git clone [项目地址]
cd uniapp-x-dgt
```

### 2. 使用 HBuilderX 打开项目

1. 打开 HBuilderX
2. 选择 `文件` -> `打开目录`
3. 选择项目文件夹 `uniapp-x-dgt`

### 3. 运行项目

#### 方式一：HBuilderX 内置浏览器

1. 在 HBuilderX 中右键点击项目根目录
2. 选择 `运行` -> `运行到浏览器` -> `Chrome`
3. 项目将在浏览器中打开

#### 方式二：微信开发者工具

1. 在 HBuilderX 中右键点击项目根目录
2. 选择 `运行` -> `运行到小程序模拟器` -> `微信开发者工具`
3. 确保已安装微信开发者工具并配置好路径

#### 方式三：手机 App

1. 在 HBuilderX 中右键点击项目根目录
2. 选择 `运行` -> `运行到手机或模拟器` -> `运行到 Android App 基座`
3. 确保手机已连接并开启 USB 调试

### 4. 开发调试

#### 实时预览

- 修改代码后，HBuilderX 会自动重新编译
- 在浏览器中刷新页面即可看到最新效果

#### 调试工具

- **浏览器开发者工具**: 查看控制台日志、网络请求等
- **微信开发者工具**: 小程序调试
- **HBuilderX 内置调试**: 断点调试、变量查看等

## 项目结构

```
uniapp-x-dgt/
├── pages/                    # 页面目录
│   ├── login/               # 登录页面
│   ├── index/               # 首页
│   ├── order/               # 订单管理
│   ├── product/             # 商品管理
│   ├── customer/            # 客户管理
│   ├── purchase/            # 采购管理
│   ├── warehouse/           # 仓库管理
│   ├── profile/             # 我的页面
│   ├── statistics/          # 统计分析
│   └── search/              # 搜索页面
├── static/                  # 静态资源
├── common/                  # 公共资源
├── utils/                   # 工具类
│   ├── api.js              # API 服务
│   ├── config.js           # 配置文件
│   ├── common.js           # 通用工具
│   └── store.js            # 状态管理
├── pages.json              # 页面配置
├── manifest.json           # 应用配置
└── App.vue                 # 应用入口
```

## 功能模块

### 1. 登录模块

- 手机号密码登录
- 短信验证码登录
- 第三方登录（微信、QQ、微博）
- 忘记密码功能

### 2. 首页模块

- 实时时间显示
- 当月业绩统计
- 待办事项提醒
- 快捷功能入口
- 最近订单展示

### 3. 订单管理

- 订单列表展示
- 订单状态筛选
- 订单搜索功能
- 订单详情查看
- 订单操作（添加、编辑、删除）

### 4. 商品管理

- 商品列表展示
- 商品分类筛选
- 库存状态管理
- 商品详情查看
- 商品操作（添加、编辑、删除）

### 5. 客户管理

- 客户列表展示
- 客户等级分类
- 客户信息管理
- 客户详情查看
- 客户操作（添加、编辑、删除）

### 6. 采购管理

- 采购计划生成
- 采购单管理
- 拼箱管理
- 采购统计
- 状态维护

### 7. 仓库管理

- 仓库信息管理
- 采购单入仓
- 库存状态维护
- 货期提醒
- 仓库总结

### 8. 统计分析

- 订单主题统计
- 运单主题统计
- 支付单主题统计
- 商品主题统计
- 时间主题统计

## API 配置

### 1. 环境配置

编辑 `utils/config.js` 文件，配置不同环境的 API 地址：

```javascript
const config = {
  development: {
    baseUrl: 'http://localhost:8080/dgt-core',
    timeout: 10000,
  },
  production: {
    baseUrl: 'https://your-production-domain.com/dgt-core',
    timeout: 15000,
  },
}
```

### 2. API 服务

项目使用 `utils/api.js` 统一管理 API 请求：

```javascript
import apiService from '../../utils/api.js'

// 在页面中使用
const response = await apiService.getOrder({
  userId: this.userId,
  page: 1,
  size: 20,
})
```

## 开发规范

### 1. 代码规范

- 使用 ES6+ 语法
- 遵循 Vue.js 3 组合式 API 规范
- 使用 rpx 单位适配不同屏幕
- 统一使用单引号

### 2. 命名规范

- 文件夹：小写字母，多个单词用连字符分隔
- 组件名：大驼峰命名
- 变量名：小驼峰命名
- 常量名：大写下划线分隔

### 3. 样式规范

- 使用 BEM 命名规范
- 优先使用 flexbox 布局
- 统一使用项目定义的色彩规范

## 调试技巧

### 1. 控制台调试

```javascript
// 在页面中添加调试信息
console.log('调试信息:', data)
console.error('错误信息:', error)
```

### 2. 网络请求调试

- 在浏览器开发者工具的 Network 面板查看请求
- 在 API 服务中添加请求日志

### 3. 状态调试

```javascript
import store from '../../utils/store.js'

// 查看当前状态
console.log('当前状态:', store.getState())

// 监听状态变化
store.addListener((state) => {
  console.log('状态变化:', state)
})
```

## 常见问题

### 1. 项目无法运行

**解决方案：**

- 检查 HBuilderX 版本是否最新
- 确认项目依赖是否完整
- 检查 manifest.json 配置是否正确

### 2. API 请求失败

**解决方案：**

- 检查网络连接
- 确认 API 服务器是否正常运行
- 检查 config.js 中的 baseUrl 配置
- 查看浏览器控制台的错误信息

### 3. 页面样式异常

**解决方案：**

- 检查 rpx 单位使用是否正确
- 确认样式文件是否正确引入
- 检查设备兼容性

### 4. 数据不显示

**解决方案：**

- 检查 API 返回数据格式
- 确认页面数据绑定是否正确
- 查看控制台是否有错误信息

## 部署说明

### 1. H5 部署

1. 在 HBuilderX 中选择 `发行` -> `网站-H5手机版`
2. 配置发布参数
3. 点击发行，生成 H5 文件
4. 将生成的文件上传到 Web 服务器

### 2. 小程序部署

1. 在 HBuilderX 中选择 `发行` -> `小程序-微信`
2. 配置小程序 AppID
3. 点击发行，生成小程序代码
4. 使用微信开发者工具上传代码

### 3. App 部署

1. 在 HBuilderX 中选择 `发行` -> `原生App-云打包`
2. 配置应用信息
3. 选择打包平台（Android/iOS）
4. 点击打包，生成安装包

## 技术支持

### 1. 官方文档

- [UniApp 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue.js 官方文档](https://cn.vuejs.org/)

### 2. 社区资源

- [DCloud 社区](https://ask.dcloud.net.cn/)
- [GitHub Issues](https://github.com/dcloudio/uni-app/issues)

### 3. 联系方式

如有问题，请通过以下方式联系：

- 邮箱：support@example.com
- 微信：example_wechat
- QQ 群：123456789

## 更新日志

### v1.0.0 (2024-01-01)

- 初始版本发布
- 完成基础功能模块
- 实现用户登录和权限管理
- 完成订单、商品、客户管理功能
- 实现采购和仓库管理
- 添加统计分析功能
- 优化用户界面和交互体验

---

**注意：** 本项目为演示版本，实际使用时需要根据具体业务需求进行调整和完善。
