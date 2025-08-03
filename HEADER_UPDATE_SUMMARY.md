# Header 统一修改总结

## 修改概述

为五个主要tab页面（订单、采购、商品、仓库、客户）统一添加了header部分，包含：
- 左边：个人中心图标（👤）
- 中间：页面标题
- 右边：统计图标（📊）

## 修改的页面

### 1. 订单管理页面 (`pages/order/order.vue`)
- 添加了header部分
- 左边图标点击跳转到个人中心
- 右边图标点击跳转到统计页面
- 中间显示"订单管理"标题

### 2. 采购管理页面 (`pages/purchase/purchase.vue`)
- 添加了header部分
- 左边图标点击跳转到个人中心
- 右边图标点击跳转到统计页面
- 中间显示"采购管理"标题

### 3. 商品管理页面 (`pages/product/product.vue`)
- 修改了现有的header部分
- 左边图标点击跳转到个人中心
- 右边图标点击跳转到统计页面
- 中间显示"商品管理"标题

### 4. 仓库管理页面 (`pages/warehouse/warehouse.vue`)
- 添加了header部分
- 左边图标点击跳转到个人中心
- 右边图标点击跳转到统计页面
- 中间显示"仓库管理"标题

### 5. 客户管理页面 (`pages/customer/customer.vue`)
- 添加了header部分
- 左边图标点击跳转到个人中心
- 右边图标点击跳转到统计页面
- 中间显示"客户管理"标题

## 样式特点

### Header 样式
```css
.header {
  background: #007aff;
  padding: 20rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}

.header-left,
.header-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.header-icon {
  font-size: 32rpx;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
}
```

### 功能特点
- **统一设计**：所有页面使用相同的header样式
- **响应式布局**：适配不同屏幕尺寸
- **交互反馈**：图标有半透明背景，提供视觉反馈
- **侧滑菜单**：左边图标点击从左侧滑入个人中心组件
- **导航功能**：右边图标跳转到统计页面

## 添加的方法

每个页面都添加了以下方法：

```javascript
// 显示侧滑菜单
showSlideMenu() {
  this.slideMenuVisible = true
},

// 隐藏侧滑菜单
hideSlideMenu() {
  this.slideMenuVisible = false
},

// 跳转到统计页面
gotoChart() {
  uni.navigateTo({
    url: '/pages/statistics/statistics'
  })
}
```

## 用户体验改进

1. **一致性**：所有tab页面现在都有统一的header设计
2. **易用性**：用户可以快速访问个人中心和统计功能
3. **视觉层次**：header提供了清晰的页面标识
4. **导航便利**：减少了用户在不同功能间的切换成本
5. **侧滑菜单**：点击个人中心图标从左侧滑入个人中心组件，提供更好的交互体验
6. **全屏覆盖**：侧滑菜单覆盖整个屏幕包括footer（tabBar），提供沉浸式体验

## 技术实现

- 使用Vue.js模板语法
- 采用flexbox布局
- 使用emoji图标（👤和📊）
- 集成uni-app导航API
- 响应式设计，适配移动端
- 创建了SlideMenu侧滑菜单组件
- 使用CSS3动画实现平滑的侧滑效果
- 使用fixed定位和z-index确保覆盖整个屏幕包括footer

## 注意事项

1. 所有页面都保持了原有的功能不变
2. Header样式与现有设计风格保持一致
3. 图标使用emoji，确保跨平台兼容性
4. 导航路径使用了正确的uni-app路由方式
5. 使用`navigationStyle: "custom"`隐藏默认导航栏，避免重复显示
6. 添加状态栏高度适配，确保在不同设备上显示正确

## 修复内容

### 问题描述
由于uni-app默认会显示导航栏，而我们又添加了自定义header，导致每个页面出现了两个header。

### 解决方案
1. **隐藏默认导航栏**：在`pages.json`中为五个tab页面设置`navigationStyle: "custom"`
2. **状态栏适配**：在header样式中添加`padding-top: calc(20rpx + var(--status-bar-height))`，确保在有状态栏的设备上显示正确

### 修改的文件
- `pages.json` - 为五个tab页面添加`navigationStyle: "custom"`
- 所有五个tab页面的header样式 - 添加状态栏高度适配
- `components/SlideMenu.vue` - 创建侧滑菜单组件
- 所有五个tab页面 - 引入SlideMenu组件并修改交互逻辑 