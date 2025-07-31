# API 集成说明

本文档说明如何将前端页面与后端 API 进行集成。

## 项目结构

```
utils/
├── api.js          # API服务类
└── config.js       # API配置文件

pages/
├── login/login.vue     # 登录页面
├── index/index.vue     # 首页
├── order/order.vue     # 订单管理
├── product/product.vue # 商品管理
├── customer/customer.vue # 客户管理
└── ...
```

## API 服务类 (utils/api.js)

### 主要功能

1. **统一的请求处理**: 封装了 GET、POST、PUT、DELETE 请求方法
2. **错误处理**: 统一的错误处理和用户提示
3. **响应处理**: 统一的响应数据格式处理
4. **超时设置**: 可配置的请求超时时间

### 使用方法

```javascript
import apiService from '../../utils/api.js'

// 在页面中使用
export default {
  methods: {
    async loadData() {
      try {
        const response = await apiService.getOrder({
          userId: this.userId,
          page: 1,
          size: 20,
        })

        if (response.success) {
          this.orderList = response.data.orders
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    },
  },
}
```

## 配置文件 (utils/config.js)

### 环境配置

支持多环境配置：

```javascript
// 开发环境
development: {
  baseUrl: 'http://localhost:8080/dgt-core',
  timeout: 10000
}

// 生产环境
production: {
  baseUrl: 'https://your-production-domain.com/dgt-core',
  timeout: 15000
}

// 测试环境
test: {
  baseUrl: 'https://your-test-domain.com/dgt-core',
  timeout: 10000
}
```

### 环境切换

可以通过修改 `getConfig()` 函数中的环境判断逻辑来切换环境：

```javascript
export function getConfig() {
  // 根据实际需求判断环境
  const env = process.env.NODE_ENV || 'development'
  return config[env]
}
```

## 已集成的页面

### 1. 登录页面 (pages/login/login.vue)

**集成的 API:**

- `apiService.login()` - 用户登录
- `apiService.getSms()` - 获取短信验证码
- `apiService.validateSms()` - 验证短信验证码
- `apiService.smsLogin()` - 短信登录

**主要功能:**

- 手机号密码登录
- 短信验证码登录
- 登录状态保存
- 错误处理和用户提示

### 2. 首页 (pages/index/index.vue)

**集成的 API:**

- `apiService.getHomepage()` - 获取首页数据

**主要功能:**

- 实时时间显示
- 当月统计数据展示
- 待办事项统计
- 最近订单列表
- 快捷功能入口

### 3. 订单管理 (pages/order/order.vue)

**集成的 API:**

- `apiService.getOrder()` - 获取订单列表
- `apiService.deleteOrder()` - 删除订单
- `apiService.searchOrder()` - 搜索订单

**主要功能:**

- 订单列表展示
- 订单状态筛选
- 订单删除功能
- 订单搜索功能

## API 接口列表

### 用户相关接口

| 接口名称       | 方法   | 路径                       | 说明           |
| -------------- | ------ | -------------------------- | -------------- |
| 用户登录       | POST   | `/user/login`              | 手机号密码登录 |
| 用户注册       | POST   | `/user/register`           | 用户注册       |
| 获取用户信息   | POST   | `/user/getUserInfo`        | 获取用户详情   |
| 获取短信验证码 | POST   | `/user/getSms`             | 发送短信验证码 |
| 验证短信验证码 | POST   | `/user/smsVolidate`        | 验证短信验证码 |
| 短信登录       | POST   | `/user/smsLogin`           | 短信验证码登录 |
| 更新用户信息   | POST   | `/user/update`             | 更新用户信息   |
| 用户退出登录   | POST   | `/user/logout`             | 退出登录       |
| 修改密码       | POST   | `/user/resetPassword`      | 重置密码       |
| 修改高级密码   | POST   | `/user/updateHighPassword` | 修改高级密码   |
| 删除用户       | DELETE | `/user/del/{userId}`       | 删除用户       |
| 首页数据       | POST   | `/user/homepage`           | 获取首页数据   |
| 客户回访       | POST   | `/user/visit`              | 客户回访记录   |

### 客户相关接口

| 接口名称         | 方法   | 路径                         | 说明         |
| ---------------- | ------ | ---------------------------- | ------------ |
| 获取客户列表     | POST   | `/customer/getall`           | 获取客户列表 |
| 添加客户         | PUT    | `/customer/add`              | 新增客户     |
| 更新客户         | PUT    | `/customer/upt`              | 更新客户信息 |
| 搜索客户         | POST   | `/customer/search`           | 搜索客户     |
| 查询客户         | POST   | `/customer/query`            | 查询客户详情 |
| 删除客户         | DELETE | `/customer/del/{customerId}` | 删除客户     |
| 获取客户回访列表 | POST   | `/customer/visitList`        | 获取回访记录 |
| 更新客户回访     | PUT    | `/customer/uptVisitList`     | 更新回访记录 |

### 订单相关接口

| 接口名称     | 方法   | 路径                       | 说明         |
| ------------ | ------ | -------------------------- | ------------ |
| 获取订单列表 | POST   | `/order/get`               | 获取订单列表 |
| 搜索订单     | POST   | `/order/search`            | 搜索订单     |
| 添加订单     | PUT    | `/order/add`               | 新增订单     |
| 更新订单     | PUT    | `/order/upt`               | 更新订单     |
| 删除订单     | DELETE | `/order/del/{orderId}`     | 删除订单     |
| 删除账单     | DELETE | `/bill/del/{billId}`       | 删除账单     |
| 删除运单     | DELETE | `/express/del/{expressId}` | 删除运单     |
| 删除清单     | DELETE | `/list/del/{listId}`       | 删除清单     |
| 查询订单     | POST   | `/order/query`             | 查询订单详情 |
| 查询运单轨迹 | GET    | `/express/{expressId}`     | 查询运单轨迹 |

### 商品相关接口

| 接口名称     | 方法   | 路径                     | 说明         |
| ------------ | ------ | ------------------------ | ------------ |
| 获取商品列表 | POST   | `/goods/queryList`       | 获取商品列表 |
| 搜索商品     | POST   | `/goods/search`          | 搜索商品     |
| 添加商品     | PUT    | `/goods/add`             | 新增商品     |
| 更新商品     | PUT    | `/goods/update`          | 更新商品     |
| 删除商品     | DELETE | `/goods/del/{productId}` | 删除商品     |
| 上传图片     | PUT    | `/goods/uploadImg`       | 上传商品图片 |

### 采购相关接口

| 接口名称           | 方法   | 路径                                   | 说明             |
| ------------------ | ------ | -------------------------------------- | ---------------- |
| 获取采购单列表     | POST   | `/bucket/getall`                       | 获取采购单列表   |
| 筛选采购单         | POST   | `/bucket/filter`                       | 筛选采购单       |
| 添加采购单         | PUT    | `/bucket/add`                          | 新增采购单       |
| 更新采购单         | PUT    | `/bucket/upt`                          | 更新采购单       |
| 删除采购单         | DELETE | `/bucket/del/{bucketId}`               | 删除采购单       |
| 添加采购单商品     | PUT    | `/bucket/addBucketList`                | 添加采购商品     |
| 更新采购单商品     | PUT    | `/bucket/uptBucketList`                | 更新采购商品     |
| 重置采购单商品     | POST   | `/bucket/resetBucketList`              | 重置采购商品     |
| 删除采购单商品     | DELETE | `/bucket/delBucketList/{bucketListId}` | 删除采购商品     |
| 获取采购单商品列表 | POST   | `/bucket/getAllBucketList`             | 获取采购商品列表 |
| 添加额外商品       | PUT    | `/bucket/addExtraBucketList`           | 添加额外商品     |
| 更新额外商品       | PUT    | `/bucket/uptExtraBucketList`           | 更新额外商品     |
| 删除额外商品       | DELETE | `/bucket/delExtraBucketList/{extraId}` | 删除额外商品     |
| 获取额外商品列表   | POST   | `/bucket/getAllExtraBucketList`        | 获取额外商品列表 |
| 从订单导入商品     | POST   | `/bucket/import`                       | 从订单导入商品   |
| 采购小结           | POST   | `/bucket/summary`                      | 获取采购小结     |
| 批量入库           | POST   | `/bucket/addToStore/{bucketId}`        | 批量入库         |

### 仓库相关接口

| 接口名称         | 方法   | 路径                             | 说明         |
| ---------------- | ------ | -------------------------------- | ------------ |
| 查询仓库列表     | POST   | `/store/queryList`               | 获取仓库列表 |
| 添加仓库         | PUT    | `/store/add`                     | 新增仓库     |
| 更新仓库         | PUT    | `/store/update`                  | 更新仓库     |
| 删除仓库         | DELETE | `/store/delete/{storeId}`        | 删除仓库     |
| 仓库统计         | POST   | `/store/sas`                     | 获取仓库统计 |
| 搜索仓库商品     | POST   | `/store/search/{storeId}`        | 搜索仓库商品 |
| 查询仓库流水     | POST   | `/storeDetail/queryList`         | 获取仓库流水 |
| 添加仓库流水     | PUT    | `/storeDetail/add`               | 新增仓库流水 |
| 更新仓库流水     | PUT    | `/storeDetail/update`            | 更新仓库流水 |
| 删除仓库流水     | DELETE | `/storeDetail/delete/{detailId}` | 删除仓库流水 |
| 查询商品规格余量 | POST   | `/storeDetail/countGoodsNum`     | 查询商品余量 |
| 拣货             | PUT    | `/storeDetail/pick`              | 拣货操作     |

### 分类相关接口

| 接口名称         | 方法 | 路径                    | 说明         |
| ---------------- | ---- | ----------------------- | ------------ |
| 获取用户分类     | POST | `/category/userAll`     | 获取用户分类 |
| 获取一级分类     | POST | `/category/first`       | 获取一级分类 |
| 获取二级分类     | POST | `/category/secondall`   | 获取二级分类 |
| 获取三级分类     | POST | `/category/thirdall`    | 获取三级分类 |
| 设置用户一级分类 | POST | `/category/setfirst`    | 设置用户分类 |
| 移除用户一级分类 | POST | `/category/removefirst` | 移除用户分类 |
| 获取所有分类     | GET  | `/category/all`         | 获取所有分类 |

### 设置相关接口

| 接口名称     | 方法   | 路径                         | 说明         |
| ------------ | ------ | ---------------------------- | ------------ |
| 设置颜色     | PUT    | `/color/upt`                 | 设置颜色     |
| 获取颜色列表 | POST   | `/color/getall`              | 获取颜色列表 |
| 添加汇率     | PUT    | `/exchangeRate/add`          | 添加汇率     |
| 删除汇率     | DELETE | `/exchangeRate/del/{rateId}` | 删除汇率     |
| 更新汇率     | PUT    | `/exchangeRate/upt`          | 更新汇率     |
| 获取汇率列表 | POST   | `/exchangeRate/getall`       | 获取汇率列表 |

### 统计相关接口

| 接口名称 | 方法 | 路径            | 说明         |
| -------- | ---- | --------------- | ------------ |
| 订单统计 | POST | `/sas/order`    | 获取订单统计 |
| 采购统计 | POST | `/sas/bucket`   | 获取采购统计 |
| 商品统计 | POST | `/sas/goods`    | 获取商品统计 |
| 仓库统计 | POST | `/sas/store`    | 获取仓库统计 |
| 客户统计 | POST | `/sas/customer` | 获取客户统计 |

### 城市相关接口

| 接口名称     | 方法 | 路径                      | 说明         |
| ------------ | ---- | ------------------------- | ------------ |
| 获取省份列表 | GET  | `/city/province`          | 获取省份列表 |
| 获取城市列表 | GET  | `/city/city/{provinceId}` | 获取城市列表 |

## 错误处理

### 统一错误处理

API 服务类提供了统一的错误处理机制：

```javascript
// 处理响应
handleResponse(response) {
  if (response.statusCode === 200) {
    return response.data;
  } else {
    throw new Error(`请求失败: ${response.statusCode}`);
  }
}

// 处理错误
handleError(error) {
  console.error('API请求错误:', error);
  uni.showToast({
    title: '网络请求失败',
    icon: 'none'
  });
  throw error;
}
```

### 页面级错误处理

在页面中使用 try-catch 进行错误处理：

```javascript
async loadData() {
  try {
    const response = await apiService.getOrder({
      userId: this.userId,
      page: 1,
      size: 20
    });

    if (response.success) {
      this.orderList = response.data.orders;
    } else {
      uni.showToast({
        title: response.message || '加载失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    // 使用模拟数据作为备用
    this.loadMockData();
  }
}
```

## 数据格式

### 请求格式

POST 请求的数据格式：

```javascript
{
  body: {
    // 实际请求参数
    userId: 123,
    page: 1,
    size: 20
  }
}
```

### 响应格式

标准响应格式：

```javascript
{
  success: true,
  message: "操作成功",
  data: {
    // 实际数据
    orders: [...],
    total: 100
  }
}
```

## 使用建议

1. **环境配置**: 根据实际部署环境修改 `config.js` 中的配置
2. **错误处理**: 在页面中实现完善的错误处理机制
3. **备用数据**: 当 API 请求失败时，使用模拟数据保证页面正常显示
4. **加载状态**: 在请求过程中显示加载提示
5. **数据缓存**: 对于不经常变化的数据，可以考虑本地缓存

## 注意事项

1. 确保后端 API 服务正常运行
2. 检查网络连接和跨域配置
3. 注意 API 接口的权限验证
4. 在生产环境中使用 HTTPS 协议
5. 定期检查 API 接口的可用性
