# 业务管理系统 - UniApp X 版本

这是一个基于 UniApp X 框架开发的完整业务管理系统，包含订单管理、商品管理、客户管理、采购管理、仓库管理等功能模块。

## 🚀 项目特色

- **🎨 现代化 UI 设计**: 采用渐变色彩和卡片式布局
- **📱 响应式布局**: 适配不同屏幕尺寸
- **🔄 统一交互体验**: 一致的按钮样式和操作反馈
- **📊 数据可视化**: 统计图表和进度条展示
- **🏷️ 状态管理**: 清晰的状态标识和颜色区分
- **🔧 完整工具链**: 包含 API 服务、状态管理、工具类等

## 📋 功能清单

### 核心功能模块

- ✅ **用户认证**: 手机号登录、短信验证码、第三方登录
- ✅ **首页仪表板**: 实时数据展示、快捷操作、业绩统计
- ✅ **订单管理**: 订单列表、状态筛选、详情查看、CRUD 操作
- ✅ **商品管理**: 商品列表、分类筛选、库存管理、图片上传
- ✅ **客户管理**: 客户列表、等级分类、回访记录、详情管理
- ✅ **采购管理**: 采购计划、采购单管理、拼箱管理、统计
- ✅ **仓库管理**: 仓库信息、入库出库、库存维护、货期提醒
- ✅ **统计分析**: 多维度统计、图表展示、数据导出
- ✅ **搜索功能**: 全局搜索、高级筛选、搜索历史
- ✅ **个人中心**: 用户信息、系统设置、安全配置

### 技术特性

- ✅ **多端支持**: H5、小程序、App 全平台
- ✅ **状态管理**: 全局状态管理、数据持久化
- ✅ **API 集成**: 统一 API 服务、错误处理、网络监听
- ✅ **工具类库**: 格式化、验证、文件处理等工具
- ✅ **性能优化**: 懒加载、防抖节流、内存优化

## 🛠️ 技术栈

- **框架**: UniApp X + Vue.js 3
- **状态管理**: 自定义 Store 类
- **API 服务**: 统一封装的 API 服务类
- **工具库**: 通用工具类和格式化函数
- **UI 组件**: 自定义组件 + 图标字体
- **样式**: CSS3 + 响应式设计

## 📁 项目结构

```
uniapp-x-dgt/
├── pages/                    # 页面目录
│   ├── login/               # 登录页面
│   ├── welcome/              # 欢迎页（临时页面）
│   ├── order/               # 订单管理（主页面）
│   ├── purchase/            # 采购管理
│   ├── product/             # 商品管理
│   ├── warehouse/           # 仓库管理
│   ├── customer/            # 客户管理
│   ├── profile/             # 我的页面
│   ├── statistics/          # 统计分析
│   └── search/              # 搜索页面
├── static/                  # 静态资源
│   └── tabbar/             # 底部导航图标
├── common/                  # 公共资源
│   ├── uni.css             # 官方样式库
│   ├── animate.min.css     # 动画库
│   └── iconfont/           # 图标字体
├── utils/                   # 工具类
│   ├── api.js              # API服务类
│   ├── config.js           # 配置文件
│   ├── common.js           # 通用工具类
│   └── store.js            # 状态管理
├── pages.json              # 页面配置
├── manifest.json           # 应用配置
├── App.vue                 # 应用入口
├── main.js                 # 主入口文件
├── README.md               # 项目说明
├── API_INTEGRATION.md      # API集成文档
├── RUNNING_GUIDE.md        # 运行指南
└── FEATURE_LIST.md         # 功能清单
```

## 🚀 快速开始

### 环境要求

- **HBuilderX**: 最新版本
- **Node.js**: 14.0 或更高版本

### 运行步骤

1. **克隆项目**

   ```bash
   git clone [项目地址]
   cd uniapp-x-dgt
   ```

2. **使用 HBuilderX 打开项目**

   - 打开 HBuilderX
   - 选择 `文件` -> `打开目录`
   - 选择项目文件夹

3. **运行项目**
   - 右键点击项目根目录
   - 选择 `运行` -> `运行到浏览器` -> `Chrome`
   - 或选择其他运行方式（小程序、App 等）

### 开发调试

- **实时预览**: 修改代码后自动重新编译
- **调试工具**: 浏览器开发者工具、微信开发者工具
- **错误处理**: 全局错误捕获和用户提示

## 📖 文档说明

### 核心文档

- **[API 集成文档](API_INTEGRATION.md)**: 详细的 API 接口说明和使用方法
- **[运行指南](RUNNING_GUIDE.md)**: 完整的项目运行和部署指南
- **[功能清单](FEATURE_LIST.md)**: 详细的功能模块清单和完成状态

### 配置说明

#### API 配置 (`utils/config.js`)

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

#### 页面配置 (`pages.json`)

- 配置了完整的页面路由
- 设置了底部 Tab 导航
- 统一了导航栏样式

## 🔧 核心功能

### 1. 用户登录接口

最新的登录接口支持以下参数格式：

```javascript
{
  "offline_id": "abc",        // 离线ID
  "tel_no": "13478433372",    // 手机号
  "password": "1"             // 密码
}
```

**接口地址**: `POST /user/login`

**请求示例**:

```javascript
import apiService from '../../utils/api.js'

const loginData = {
  offline_id: 'abc',
  tel_no: '13478433372',
  password: '1',
}

const response = await apiService.login(loginData)
```

**响应格式**:

```javascript
{
  success: true,
  data: {
    token: "xxx",
    userInfo: { ... }
  },
  message: "登录成功"
}
```

### 2. 全局状态管理

```javascript
import store from '../../utils/store.js'

// 设置用户信息
store.setUserInfo(userInfo)
store.setToken(token)

// 获取状态
const state = store.getState()
```

### 2. API 服务调用

```javascript
import apiService from '../../utils/api.js'

// 获取订单列表
const response = await apiService.getOrder({
  userId: this.userId,
  page: 1,
  size: 20,
})
```

### 3. 工具类使用

```javascript
import CommonUtils from '../../utils/common.js'

// 格式化日期
const date = CommonUtils.formatDate(new Date(), 'YYYY-MM-DD')

// 显示提示
CommonUtils.showSuccess('操作成功')
```

## 🎨 UI/UX 设计

### 设计理念

- **现代化**: 采用最新的设计趋势
- **一致性**: 统一的色彩和布局规范
- **响应式**: 适配不同设备和屏幕尺寸
- **用户友好**: 直观的操作反馈和状态提示

### 色彩方案

- **主色调**: #007AFF (蓝色渐变)
- **成功色**: #52c41a (绿色)
- **警告色**: #fa8c16 (橙色)
- **错误色**: #ff4d4f (红色)
- **信息色**: #1890ff (蓝色)

## 📱 多端支持

### 支持的平台

- ✅ **H5 网页版**: 现代浏览器
- ✅ **微信小程序**: 微信生态
- ✅ **支付宝小程序**: 支付宝生态
- ✅ **百度小程序**: 百度生态
- ✅ **字节跳动小程序**: 抖音生态
- ✅ **Android App**: 原生应用
- ✅ **iOS App**: 原生应用

### 适配特性

- 响应式布局适配
- 安全区域适配
- 横竖屏切换
- 不同屏幕密度

## 🔒 安全特性

### 数据安全

- Token 验证机制
- 数据加密传输
- 敏感信息保护
- 权限控制

### 网络安全

- HTTPS 协议
- 请求签名验证
- 防重放攻击
- 错误处理机制

## 📊 性能优化

### 加载优化

- 懒加载机制
- 分页加载
- 图片压缩
- 代码分割

### 交互优化

- 防抖处理
- 节流处理
- 加载状态提示
- 错误反馈

### 内存优化

- 组件销毁清理
- 事件解绑
- 定时器清理
- 大列表优化

## 🚀 部署方案

### H5 部署

1. 在 HBuilderX 中选择 `发行` -> `网站-H5手机版`
2. 配置发布参数
3. 点击发行，生成 H5 文件
4. 上传到 Web 服务器

### 小程序部署

1. 在 HBuilderX 中选择 `发行` -> `小程序-微信`
2. 配置小程序 AppID
3. 点击发行，生成小程序代码
4. 使用微信开发者工具上传

### App 部署

1. 在 HBuilderX 中选择 `发行` -> `原生App-云打包`
2. 配置应用信息
3. 选择打包平台（Android/iOS）
4. 点击打包，生成安装包

## 🤝 贡献指南

### 开发规范

- 使用 ES6+ 语法
- 遵循 Vue.js 3 组合式 API 规范
- 使用 rpx 单位适配不同屏幕
- 统一使用单引号

### 提交规范

- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 📞 技术支持

### 官方资源

- [UniApp 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue.js 官方文档](https://cn.vuejs.org/)

### 社区资源

- [DCloud 社区](https://ask.dcloud.net.cn/)
- [GitHub Issues](https://github.com/dcloudio/uni-app/issues)

### 联系方式

- 邮箱：support@example.com
- 微信：example_wechat
- QQ 群：123456789

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和设计师。

---

**项目状态**: ✅ 已完成所有核心功能开发

**最后更新**: 2024 年 1 月

**版本**: v1.0.0

---

> 这是一个功能完整、技术先进的业务管理系统，采用现代化的技术栈和设计理念，提供了全面的业务管理功能，支持多端发布，具有良好的用户体验和扩展性。
