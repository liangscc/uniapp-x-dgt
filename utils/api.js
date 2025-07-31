import { getConfig } from './config.js';

// API服务类
class ApiService {
  constructor() {
    // 从配置文件获取基础配置
    const config = getConfig();
    this.configUrl = config.baseUrl;
    this.timeout = config.timeout;
  }

  // 通用请求方法
  async request(url, options = {}) {
    const defaultOptions = {
      url: url,
      timeout: this.timeout,
      header: {
        'Content-Type': 'application/json'
      }
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await uni.request(finalOptions);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

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

  // GET请求
  async get(url, params = {}) {
    const queryString = this.buildQueryString(params);
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    return this.request(fullUrl, {
      method: 'GET'
    });
  }

  // POST请求
  async post(url, data = {}) {
    return this.request(url, {
      method: 'POST',
      data: data
    });
  }

  // PUT请求
  async put(url, data = {}) {
    return this.request(url, {
      method: 'PUT',
      data: data
    });
  }

  // DELETE请求
  async delete(url, params = {}) {
    const queryString = this.buildQueryString(params);
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    return this.request(fullUrl, {
      method: 'DELETE'
    });
  }

  // 构建查询字符串
  buildQueryString(params) {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    return Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  // ==================== 用户相关接口 ====================

  // 用户登录
  async login(paramObj) {
    return this.post(`${this.configUrl}/user/login`, paramObj);
  }

  // 用户注册
  async register(paramObj) {
    return this.post(`${this.configUrl}/user/register`, paramObj);
  }

  // 获取用户信息
  async getUserInfo(paramObj) {
    return this.post(`${this.configUrl}/user/getUserInfo`, paramObj);
  }

  // 获取短信验证码
  async getSms(paramObj) {
    return this.post(`${this.configUrl}/user/getSms`, paramObj);
  }

  // 验证短信验证码
  async validateSms(paramObj) {
    return this.post(`${this.configUrl}/user/smsVolidate`, paramObj);
  }

  // 短信登录
  async smsLogin(paramObj) {
    return this.post(`${this.configUrl}/user/smsLogin`, paramObj);
  }

  // 更新用户信息
  async updateUser(paramObj) {
    return this.post(`${this.configUrl}/user/update`, paramObj);
  }

  // 用户退出登录
  async logout(paramObj) {
    return this.post(`${this.configUrl}/user/logout`, paramObj);
  }

  // 修改密码
  async updatePassword(paramObj) {
    return this.post(`${this.configUrl}/user/resetPassword`, paramObj);
  }

  // 修改高级密码
  async updateHighPassword(paramObj) {
    return this.post(`${this.configUrl}/user/updateHighPassword`, paramObj);
  }

  // 删除用户
  async deleteUser(userId, paramObj) {
    return this.delete(`${this.configUrl}/user/del/${userId}`, paramObj);
  }

  // 首页数据
  async getHomepage(paramObj) {
    return this.post(`${this.configUrl}/user/homepage`, paramObj);
  }

  // 首页数据(备用)
  async getHomepage1(paramObj) {
    return this.post(`${this.configUrl}/home/load`, paramObj);
  }

  // 客户回访
  async visitor(paramObj) {
    return this.post(`${this.configUrl}/user/visit`, paramObj);
  }

  // ==================== 客户相关接口 ====================

  // 获取客户列表
  async getCustomerList(paramObj) {
    return this.post(`${this.configUrl}/customer/getall`, paramObj);
  }

  // 添加客户
  async addCustomer(paramObj) {
    return this.put(`${this.configUrl}/customer/add`, paramObj);
  }

  // 更新客户
  async updateCustomer(paramObj) {
    return this.put(`${this.configUrl}/customer/upt`, paramObj);
  }

  // 搜索客户
  async searchCustomer(paramObj) {
    return this.post(`${this.configUrl}/customer/search`, paramObj);
  }

  // 查询客户
  async queryCustomer(paramObj) {
    return this.post(`${this.configUrl}/customer/query`, paramObj);
  }

  // 删除客户
  async deleteCustomer(customerId, paramObj) {
    return this.delete(`${this.configUrl}/customer/del/${customerId}`, paramObj);
  }

  // 获取客户回访列表
  async getVisitCustomerList(paramObj) {
    return this.post(`${this.configUrl}/customer/visitList`, paramObj);
  }

  // 更新客户回访
  async updateVisitCustomer(paramObj) {
    return this.put(`${this.configUrl}/customer/uptVisitList`, paramObj);
  }

  // ==================== 订单相关接口 ====================

  // 获取订单列表
  async getOrder(paramObj) {
    return this.post(`${this.configUrl}/order/get`, paramObj);
  }

  // 搜索订单
  async searchOrder(paramObj) {
    return this.post(`${this.configUrl}/order/search`, paramObj);
  }

  // 添加订单
  async addOrder(paramObj) {
    return this.put(`${this.configUrl}/order/add`, paramObj);
  }

  // 更新订单
  async updateOrder(paramObj) {
    return this.put(`${this.configUrl}/order/upt`, paramObj);
  }

  // 删除订单
  async deleteOrder(orderId) {
    return this.delete(`${this.configUrl}/order/del/${orderId}`);
  }

  // 删除账单
  async deleteBill(billId) {
    return this.delete(`${this.configUrl}/bill/del/${billId}`);
  }

  // 删除运单
  async deleteExpress(expressId) {
    return this.delete(`${this.configUrl}/express/del/${expressId}`);
  }

  // 删除清单
  async deleteListDetail(listId) {
    return this.delete(`${this.configUrl}/list/del/${listId}`);
  }

  // 查询订单
  async queryOrder(paramObj) {
    return this.post(`${this.configUrl}/order/query`, paramObj);
  }

  // 查询运单轨迹
  async queryExpressTrace(expressId) {
    return this.get(`${this.configUrl}/express/${expressId}`);
  }

  // ==================== 商品相关接口 ====================

  // 获取商品列表
  async getGoodsList(paramObj) {
    return this.post(`${this.configUrl}/goods/queryList`, paramObj);
  }

  // 搜索商品
  async searchGoodsList(paramObj) {
    return this.post(`${this.configUrl}/goods/search`, paramObj);
  }

  // 添加商品
  async addProduct(paramObj) {
    return this.put(`${this.configUrl}/goods/add`, paramObj);
  }

  // 更新商品
  async updateProduct(paramObj) {
    return this.put(`${this.configUrl}/goods/update`, paramObj);
  }

  // 删除商品
  async deleteProduct(productId) {
    return this.delete(`${this.configUrl}/goods/del/${productId}`);
  }

  // 上传图片
  async uploadImg(paramObj) {
    return this.put(`${this.configUrl}/goods/uploadImg`, paramObj);
  }

  // ==================== 采购相关接口 ====================

  // 获取采购单列表
  async getAllBucket(paramObj) {
    return this.post(`${this.configUrl}/bucket/getall`, paramObj);
  }

  // 筛选采购单
  async filterAllBucket(paramObj) {
    return this.post(`${this.configUrl}/bucket/filter`, paramObj);
  }

  // 添加采购单
  async addBucket(paramObj) {
    return this.put(`${this.configUrl}/bucket/add`, paramObj);
  }

  // 更新采购单
  async updateBucket(paramObj) {
    return this.put(`${this.configUrl}/bucket/upt`, paramObj);
  }

  // 删除采购单
  async deleteBucket(bucketId) {
    return this.delete(`${this.configUrl}/bucket/del/${bucketId}`);
  }

  // 添加采购单商品
  async addBucketList(paramObj) {
    return this.put(`${this.configUrl}/bucket/addBucketList`, paramObj);
  }

  // 更新采购单商品
  async updateBucketList(paramObj) {
    return this.put(`${this.configUrl}/bucket/uptBucketList`, paramObj);
  }

  // 重置采购单商品
  async resetBucketList(paramObj) {
    return this.post(`${this.configUrl}/bucket/resetBucketList`, paramObj);
  }

  // 删除采购单商品
  async deleteBucketList(bucketListId) {
    return this.delete(`${this.configUrl}/bucket/delBucketList/${bucketListId}`);
  }

  // 获取采购单商品列表
  async getAllBucketList(paramObj) {
    return this.post(`${this.configUrl}/bucket/getAllBucketList`, paramObj);
  }

  // 添加额外商品
  async addExtraBucketList(paramObj) {
    return this.put(`${this.configUrl}/bucket/addExtraBucketList`, paramObj);
  }

  // 更新额外商品
  async updateExtraBucketList(paramObj) {
    return this.put(`${this.configUrl}/bucket/uptExtraBucketList`, paramObj);
  }

  // 删除额外商品
  async deleteExtraBucketList(extraId) {
    return this.delete(`${this.configUrl}/bucket/delExtraBucketList/${extraId}`);
  }

  // 获取额外商品列表
  async getAllExtraBucketList(paramObj) {
    return this.post(`${this.configUrl}/bucket/getAllExtraBucketList`, paramObj);
  }

  // 从订单导入商品
  async importGoods(paramObj) {
    return this.post(`${this.configUrl}/bucket/import`, paramObj);
  }

  // 采购小结
  async getSummary(paramObj) {
    return this.post(`${this.configUrl}/bucket/summary`, paramObj);
  }

  // 批量入库
  async addToStore(paramObj, bucketId) {
    return this.post(`${this.configUrl}/bucket/addToStore/${bucketId}`, paramObj);
  }

  // ==================== 仓库相关接口 ====================

  // 查询仓库列表
  async queryStore(paramObj) {
    return this.post(`${this.configUrl}/store/queryList`, paramObj);
  }

  // 添加仓库
  async addStore(paramObj) {
    return this.put(`${this.configUrl}/store/add`, paramObj);
  }

  // 更新仓库
  async updateStore(paramObj) {
    return this.put(`${this.configUrl}/store/update`, paramObj);
  }

  // 删除仓库
  async deleteStore(storeId) {
    return this.delete(`${this.configUrl}/store/delete/${storeId}`);
  }

  // 仓库统计
  async sasStore(paramObj) {
    return this.post(`${this.configUrl}/store/sas`, paramObj);
  }

  // 搜索仓库商品
  async searchInStore(paramObj, storeId) {
    return this.post(`${this.configUrl}/store/search/${storeId}`, paramObj);
  }

  // 查询仓库流水
  async queryStoreDetail(paramObj) {
    return this.post(`${this.configUrl}/storeDetail/queryList`, paramObj);
  }

  // 添加仓库流水
  async addStoreDetail(paramObj) {
    return this.put(`${this.configUrl}/storeDetail/add`, paramObj);
  }

  // 更新仓库流水
  async updateStoreDetail(paramObj) {
    return this.put(`${this.configUrl}/storeDetail/update`, paramObj);
  }

  // 删除仓库流水
  async deleteStoreDetail(detailId) {
    return this.delete(`${this.configUrl}/storeDetail/delete/${detailId}`);
  }

  // 查询商品规格余量
  async countGoodsNum(paramObj) {
    return this.post(`${this.configUrl}/storeDetail/countGoodsNum`, paramObj);
  }

  // 拣货
  async pickGoods(paramObj) {
    return this.put(`${this.configUrl}/storeDetail/pick`, paramObj);
  }

  // ==================== 分类相关接口 ====================

  // 获取用户分类
  async getUserCategory(paramObj) {
    return this.post(`${this.configUrl}/category/userAll`, paramObj);
  }

  // 获取一级分类
  async getCategory(paramObj) {
    return this.post(`${this.configUrl}/category/first`, paramObj);
  }

  // 获取二级分类
  async getSecondCategory(paramObj) {
    return this.post(`${this.configUrl}/category/secondall`, paramObj);
  }

  // 获取三级分类
  async getThirdCategory(paramObj) {
    return this.post(`${this.configUrl}/category/thirdall`, paramObj);
  }

  // 设置用户一级分类
  async setFirstCategory(paramObj) {
    return this.post(`${this.configUrl}/category/setfirst`, paramObj);
  }

  // 移除用户一级分类
  async removeFirstCategory(paramObj) {
    return this.post(`${this.configUrl}/category/removefirst`, paramObj);
  }

  // 获取所有分类
  async getAllCategory() {
    return this.get(`${this.configUrl}/category/all`);
  }

  // ==================== 设置相关接口 ====================

  // 设置颜色
  async setColor(paramObj) {
    return this.put(`${this.configUrl}/color/upt`, paramObj);
  }

  // 获取颜色列表
  async getColor(paramObj) {
    return this.post(`${this.configUrl}/color/getall`, paramObj);
  }

  // 添加汇率
  async addExchangeRate(paramObj) {
    return this.put(`${this.configUrl}/exchangeRate/add`, paramObj);
  }

  // 删除汇率
  async deleteExchangeRate(rateId) {
    return this.delete(`${this.configUrl}/exchangeRate/del/${rateId}`);
  }

  // 更新汇率
  async updateExchangeRate(paramObj) {
    return this.put(`${this.configUrl}/exchangeRate/upt`, paramObj);
  }

  // 获取汇率列表
  async getExchangeRate(paramObj) {
    return this.post(`${this.configUrl}/exchangeRate/getall`, paramObj);
  }

  // ==================== 统计相关接口 ====================

  // 订单统计
  async sasOrder(paramObj) {
    return this.post(`${this.configUrl}/sas/order`, paramObj);
  }

  // 采购统计
  async sasBucket(paramObj) {
    return this.post(`${this.configUrl}/sas/bucket`, paramObj);
  }

  // 商品统计
  async sasGoods(paramObj) {
    return this.post(`${this.configUrl}/sas/goods`, paramObj);
  }

  // 仓库统计
  async sasStoreDetail(paramObj) {
    return this.post(`${this.configUrl}/sas/store`, paramObj);
  }

  // 客户统计
  async sasCustomer(paramObj) {
    return this.post(`${this.configUrl}/sas/customer`, paramObj);
  }

  // ==================== 城市相关接口 ====================

  // 获取省份列表
  async getProvince() {
    return this.get(`${this.configUrl}/city/province`);
  }

  // 获取城市列表
  async getCity(provinceId) {
    return this.get(`${this.configUrl}/city/city/${provinceId}`);
  }
}

// 创建单例实例
const apiService = new ApiService();

// 导出实例
export default apiService; 