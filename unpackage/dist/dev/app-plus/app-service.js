if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const config = {
    // 开发环境配置
    development: {
      baseUrl: "http://localhost:8080/dgt-core",
      timeout: 1e4
    },
    // 生产环境配置
    production: {
      baseUrl: "https://your-production-domain.com/dgt-core",
      timeout: 15e3
    },
    // 测试环境配置
    test: {
      baseUrl: "https://your-test-domain.com/dgt-core",
      timeout: 1e4
    }
  };
  function getConfig() {
    const env = "development";
    return config[env];
  }
  class ApiService {
    constructor() {
      const config2 = getConfig();
      this.configUrl = config2.baseUrl;
      this.timeout = config2.timeout;
    }
    // 通用请求方法
    async request(url, options = {}) {
      const token = uni.getStorageSync("token");
      const userInfo = uni.getStorageSync("userInfo");
      const defaultOptions = {
        url,
        timeout: this.timeout,
        header: {
          "Content-Type": "application/json"
        }
      };
      if (token) {
        defaultOptions.header["Authorization"] = `Bearer ${token}`;
      }
      if (userInfo && userInfo.offline_id && !options.skipOfflineId) {
        if (!options.data) {
          options.data = {};
        }
        options.data.offline_id = userInfo.offline_id;
      }
      const finalOptions = { ...defaultOptions, ...options };
      formatAppLog("log", "at utils/api.js:42", "=== API请求调试信息 ===");
      formatAppLog("log", "at utils/api.js:43", "请求URL:", finalOptions.url);
      formatAppLog("log", "at utils/api.js:44", "请求方法:", finalOptions.method || "GET");
      formatAppLog("log", "at utils/api.js:45", "请求头:", finalOptions.header);
      formatAppLog("log", "at utils/api.js:46", "请求数据:", finalOptions.data);
      formatAppLog("log", "at utils/api.js:47", "Token:", token);
      formatAppLog("log", "at utils/api.js:48", "用户信息:", userInfo);
      try {
        const response = await uni.request(finalOptions);
        formatAppLog("log", "at utils/api.js:52", "=== API响应调试信息 ===");
        formatAppLog("log", "at utils/api.js:53", "响应状态:", response.statusCode);
        formatAppLog("log", "at utils/api.js:54", "响应数据:", response.data);
        return this.handleResponse(response);
      } catch (error) {
        formatAppLog("error", "at utils/api.js:57", "=== API请求错误 ===");
        formatAppLog("error", "at utils/api.js:58", "错误信息:", error);
        return this.handleError(error);
      }
    }
    // 处理响应
    handleResponse(response) {
      if (response.statusCode === 200) {
        const data = response.data;
        if (data && data.code === 207) {
          formatAppLog("log", "at utils/api.js:70", "登录状态校验失败，清除登录信息");
          uni.removeStorageSync("token");
          uni.removeStorageSync("userInfo");
          uni.setStorageSync("authFailRedirect", true);
          uni.showToast({
            title: "登录已过期，正在重新登录...",
            icon: "none",
            duration: 2e3
          });
          setTimeout(() => {
            uni.reLaunch({
              url: "/pages/login/login"
            });
          }, 2e3);
          throw new Error("登录状态校验失败");
        }
        return data;
      } else {
        throw new Error(`请求失败: ${response.statusCode}`);
      }
    }
    // 处理错误
    handleError(error) {
      formatAppLog("error", "at utils/api.js:103", "API请求错误:", error);
      uni.showToast({
        title: "网络请求失败",
        icon: "none"
      });
      throw error;
    }
    // GET请求
    async get(url, params = {}) {
      const queryString = this.buildQueryString(params);
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      return this.request(fullUrl, {
        method: "GET"
      });
    }
    // POST请求
    async post(url, data = {}) {
      return this.request(url, {
        method: "POST",
        data
      });
    }
    // PUT请求
    async put(url, data = {}, options = {}) {
      return this.request(url, {
        method: "PUT",
        data,
        ...options
      });
    }
    // DELETE请求
    async delete(url, params = {}) {
      const queryString = this.buildQueryString(params);
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      return this.request(fullUrl, {
        method: "DELETE"
      });
    }
    // 构建查询字符串
    buildQueryString(params) {
      if (!params || Object.keys(params).length === 0) {
        return "";
      }
      return Object.keys(params).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join("&");
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
      const normalizedPayload = this.normalizeAddProductPayload(paramObj);
      formatAppLog("log", "at utils/api.js:340", "addProduct normalized payload:", normalizedPayload);
      return this.put(`${this.configUrl}/goods/add`, normalizedPayload, { skipOfflineId: true });
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
    // =============== 内部辅助：添加商品入参归一化 ===============
    normalizeAddProductPayload(paramObj) {
      if (paramObj && typeof paramObj === "object" && paramObj.goodsBean) {
        const listGoodsImg2 = this.normalizeImageList(paramObj.listGoodsImg || paramObj.images || []);
        const goodsBean2 = this.normalizeGoodsBean(paramObj.goodsBean, listGoodsImg2);
        const listGoodsSpec2 = Array.isArray(paramObj.listGoodsSpec) ? paramObj.listGoodsSpec : Array.isArray(paramObj.specs) ? paramObj.specs : [];
        return { goodsBean: goodsBean2, listGoodsSpec: listGoodsSpec2, listGoodsImg: listGoodsImg2 };
      }
      const listGoodsImg = this.normalizeImageList((paramObj == null ? void 0 : paramObj.images) || (paramObj == null ? void 0 : paramObj.listGoodsImg) || []);
      const goodsBean = this.normalizeGoodsBean({
        name: paramObj == null ? void 0 : paramObj.name,
        code: paramObj == null ? void 0 : paramObj.code,
        description: paramObj == null ? void 0 : paramObj.description,
        category_id: (paramObj == null ? void 0 : paramObj.category_id) || (paramObj == null ? void 0 : paramObj.categoryId) || (paramObj == null ? void 0 : paramObj.cateId),
        brand: paramObj == null ? void 0 : paramObj.brand,
        specification: paramObj == null ? void 0 : paramObj.specification,
        unit: paramObj == null ? void 0 : paramObj.unit,
        weight: paramObj == null ? void 0 : paramObj.weight,
        account_id: (paramObj == null ? void 0 : paramObj.account_id) || (paramObj == null ? void 0 : paramObj.accountId),
        offline_id: (paramObj == null ? void 0 : paramObj.offline_id) || (paramObj == null ? void 0 : paramObj.offlineId)
      }, listGoodsImg);
      const listGoodsSpec = Array.isArray(paramObj == null ? void 0 : paramObj.specs) ? paramObj.specs : [];
      return { goodsBean, listGoodsSpec, listGoodsImg };
    }
    normalizeGoodsBean(bean, imageList = []) {
      const userInfo = uni.getStorageSync("userInfo") || {};
      const storageOfflineId = uni.getStorageSync("offline_id");
      const storageAccountId = uni.getStorageSync("account_id");
      const resolvedAccountId = (bean == null ? void 0 : bean.account_id) || (bean == null ? void 0 : bean.accountId) || (userInfo == null ? void 0 : userInfo.account_id) || (userInfo == null ? void 0 : userInfo.accountId) || (userInfo == null ? void 0 : userInfo.id) || (userInfo == null ? void 0 : userInfo.user_id) || (userInfo == null ? void 0 : userInfo.userId) || storageAccountId || "";
      const resolvedOfflineId = (bean == null ? void 0 : bean.offline_id) || (bean == null ? void 0 : bean.offlineId) || (userInfo == null ? void 0 : userInfo.offline_id) || storageOfflineId || "";
      const toNumberOrDefault = (val, def = 0) => {
        if (val === void 0 || val === null || val === "")
          return def;
        const n = Number(val);
        return Number.isNaN(n) ? def : n;
      };
      const toIntOrDefault = (val, def = 0) => {
        if (val === void 0 || val === null || val === "")
          return def;
        const n = parseInt(val, 10);
        return Number.isNaN(n) ? def : n;
      };
      const mapped = {
        uuid: (bean == null ? void 0 : bean.uuid) || "",
        show_name: (bean == null ? void 0 : bean.show_name) || (bean == null ? void 0 : bean.name) || "",
        name: (bean == null ? void 0 : bean.name) || "",
        hs_code: (bean == null ? void 0 : bean.hs_code) || "",
        unit: (bean == null ? void 0 : bean.unit) || "",
        model: (bean == null ? void 0 : bean.model) || (bean == null ? void 0 : bean.specification) || "",
        bar_code: (bean == null ? void 0 : bean.bar_code) || (bean == null ? void 0 : bean.code) || "",
        brand: (bean == null ? void 0 : bean.brand) || "",
        currency: (bean == null ? void 0 : bean.currency) || "",
        is_gift: toIntOrDefault(bean == null ? void 0 : bean.is_gift, 0),
        color: (bean == null ? void 0 : bean.color) || "",
        weight: toNumberOrDefault(bean == null ? void 0 : bean.weight, 0),
        remark: (bean == null ? void 0 : bean.remark) || (bean == null ? void 0 : bean.description) || "",
        category_id: ((bean == null ? void 0 : bean.category_id) || (bean == null ? void 0 : bean.categoryId) || "") + "",
        discount_rate: toIntOrDefault(bean == null ? void 0 : bean.discount_rate, 0),
        publish_status: toIntOrDefault(bean == null ? void 0 : bean.publish_status, 0),
        // 以下日期/时间类字段若前端无值则不传或传空字符串
        input_date: (bean == null ? void 0 : bean.input_date) || "",
        remind_day: toIntOrDefault(bean == null ? void 0 : bean.remind_day, 0),
        limit_date: (bean == null ? void 0 : bean.limit_date) || "",
        buy_way: (bean == null ? void 0 : bean.buy_way) || "",
        promotion_time: (bean == null ? void 0 : bean.promotion_time) || "",
        tax_rate: toIntOrDefault(bean == null ? void 0 : bean.tax_rate, 0),
        in_store: toIntOrDefault(bean == null ? void 0 : bean.in_store, 0),
        visit_day: toIntOrDefault(bean == null ? void 0 : bean.visit_day, 0),
        visit_flag: toIntOrDefault(bean == null ? void 0 : bean.visit_flag, 0),
        from_name: (bean == null ? void 0 : bean.from_name) || "",
        country: (bean == null ? void 0 : bean.country) || "",
        // 将图片数组转为后端期望的字符串（逗号分隔）
        image_arr: Array.isArray(imageList) && imageList.length > 0 ? imageList.join(",") : (bean == null ? void 0 : bean.image_arr) || "",
        account_id: resolvedAccountId ? String(resolvedAccountId) : "",
        offline_id: resolvedOfflineId ? String(resolvedOfflineId) : "",
        slogan: (bean == null ? void 0 : bean.slogan) || ""
      };
      return mapped;
    }
    normalizeImageList(list) {
      if (!Array.isArray(list))
        return [];
      const urls = list.map((item) => {
        if (typeof item === "string")
          return item;
        if (item && typeof item === "object") {
          return item.url || item.imgUrl || item.imageUrl || "";
        }
        return "";
      }).filter((u) => !!u);
      return urls;
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
  const apiService = new ApiService();
  const _imports_0 = "/static/logo.png";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$i = {
    data() {
      return {
        loginForm: {
          offline_id: "abc",
          tel_no: "17709816336",
          password: "1"
        },
        rememberPassword: false
      };
    },
    onLoad() {
      const isFromAuthFail = uni.getStorageSync("authFailRedirect");
      if (isFromAuthFail) {
        uni.removeStorageSync("authFailRedirect");
        this.autoLogin();
      }
    },
    methods: {
      // 自动登录方法
      async autoLogin() {
        formatAppLog("log", "at pages/login/login.vue:124", "开始自动登录");
        try {
          const response = await apiService.login({
            offline_id: this.loginForm.offline_id,
            tel_no: this.loginForm.tel_no,
            password: this.loginForm.password
          });
          formatAppLog("log", "at pages/login/login.vue:132", "自动登录响应:", response);
          if (response.success || response.code === 1) {
            const userInfo = response.data || response || {
              offline_id: this.loginForm.offline_id,
              tel_no: this.loginForm.tel_no,
              nickname: "测试用户",
              token: "mock-token-" + Date.now()
            };
            formatAppLog("log", "at pages/login/login.vue:143", "保存用户信息:", userInfo);
            uni.setStorageSync("isLoggedIn", true);
            uni.setStorageSync("userInfo", userInfo);
            uni.setStorageSync("token", userInfo.token || "mock-token-" + Date.now());
            uni.showToast({
              title: "自动登录成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.reLaunch({
                url: "/pages/welcome/welcome"
              });
            }, 1500);
          } else {
            formatAppLog("log", "at pages/login/login.vue:161", "自动登录失败，显示登录表单");
          }
        } catch (error) {
          formatAppLog("error", "at pages/login/login.vue:164", "自动登录失败:", error);
          formatAppLog("log", "at pages/login/login.vue:165", "自动登录失败，显示登录表单");
        }
      },
      async handleLogin() {
        if (!this.loginForm.offline_id) {
          uni.showToast({
            title: "请输入离线ID",
            icon: "none"
          });
          return;
        }
        if (!this.loginForm.tel_no) {
          uni.showToast({
            title: "请输入手机号",
            icon: "none"
          });
          return;
        }
        if (!/^1[3-9]\d{9}$/.test(this.loginForm.tel_no)) {
          uni.showToast({
            title: "请输入正确的手机号",
            icon: "none"
          });
          return;
        }
        if (!this.loginForm.password) {
          uni.showToast({
            title: "请输入密码",
            icon: "none"
          });
          return;
        }
        uni.showLoading({
          title: "登录中..."
        });
        try {
          formatAppLog("log", "at pages/login/login.vue:212", "发送登录请求:", {
            offline_id: this.loginForm.offline_id,
            tel_no: this.loginForm.tel_no,
            password: this.loginForm.password
          });
          const response = await apiService.login({
            offline_id: this.loginForm.offline_id,
            tel_no: this.loginForm.tel_no,
            password: this.loginForm.password
          });
          uni.hideLoading();
          formatAppLog("log", "at pages/login/login.vue:227", "登录响应:", response);
          const mockSuccess = false;
          if (mockSuccess || response.success || response.code === 1) {
            const userInfo = response.data || response || {
              offline_id: this.loginForm.offline_id,
              tel_no: this.loginForm.tel_no,
              nickname: "测试用户",
              token: "mock-token-" + Date.now()
            };
            formatAppLog("log", "at pages/login/login.vue:242", "保存用户信息:", userInfo);
            uni.setStorageSync("isLoggedIn", true);
            uni.setStorageSync("userInfo", userInfo);
            uni.setStorageSync("token", userInfo.token || "mock-token-" + Date.now());
            uni.showToast({
              title: "登录成功",
              icon: "success"
            });
            formatAppLog("log", "at pages/login/login.vue:254", "准备跳转到welcome欢迎页面");
            uni.navigateTo({
              url: "/pages/welcome/welcome",
              success: () => {
                formatAppLog("log", "at pages/login/login.vue:260", "navigateTo跳转成功");
              },
              fail: (err) => {
                formatAppLog("error", "at pages/login/login.vue:263", "navigateTo跳转失败:", err);
                uni.reLaunch({
                  url: "/pages/welcome/welcome",
                  success: () => {
                    formatAppLog("log", "at pages/login/login.vue:268", "reLaunch跳转成功");
                  },
                  fail: (err2) => {
                    formatAppLog("error", "at pages/login/login.vue:271", "reLaunch也失败:", err2);
                    uni.showToast({
                      title: "页面跳转失败",
                      icon: "none"
                    });
                  }
                });
              }
            });
          } else {
            uni.showToast({
              title: response.message || "登录失败",
              icon: "none"
            });
          }
        } catch (error) {
          uni.hideLoading();
          formatAppLog("error", "at pages/login/login.vue:288", "登录失败:", error);
          uni.showToast({
            title: "网络错误，请重试",
            icon: "none"
          });
        }
      },
      toggleRemember() {
        this.rememberPassword = !this.rememberPassword;
      },
      async forgotPassword() {
        uni.showToast({
          title: "忘记密码功能开发中",
          icon: "none"
        });
      },
      async goToRegister() {
        uni.showToast({
          title: "注册功能开发中",
          icon: "none"
        });
      },
      async thirdPartyLogin(type) {
        uni.showToast({
          title: `${type}登录功能开发中`,
          icon: "none"
        });
      },
      async viewUserAgreement() {
        uni.showToast({
          title: "用户协议功能开发中",
          icon: "none"
        });
      },
      async viewPrivacyPolicy() {
        uni.showToast({
          title: "隐私政策功能开发中",
          icon: "none"
        });
      },
      testJump() {
        formatAppLog("log", "at pages/login/login.vue:336", "测试跳转");
        uni.showToast({
          title: "开始测试跳转",
          icon: "none"
        });
        setTimeout(() => {
          uni.navigateTo({
            url: "/pages/welcome/welcome",
            success: () => {
              formatAppLog("log", "at pages/login/login.vue:348", "跳转成功");
              uni.showToast({
                title: "跳转成功",
                icon: "success"
              });
            },
            fail: (err) => {
              formatAppLog("error", "at pages/login/login.vue:355", "跳转失败:", err);
              uni.showToast({
                title: `跳转失败: ${err.errMsg}`,
                icon: "none"
              });
            }
          });
        }, 1e3);
      },
      testJumpToOrder() {
        formatAppLog("log", "at pages/login/login.vue:366", "测试跳转到welcome页");
        uni.navigateTo({
          url: "/pages/welcome/welcome",
          success: () => {
            formatAppLog("log", "at pages/login/login.vue:370", "跳转到welcome页成功");
            uni.showToast({
              title: "跳转到welcome页成功",
              icon: "success"
            });
          },
          fail: (err) => {
            formatAppLog("error", "at pages/login/login.vue:377", "跳转到welcome页失败:", err);
            uni.showToast({
              title: "跳转到welcome页失败",
              icon: "none"
            });
          }
        });
      }
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createCommentVNode(" 顶部Logo区域 "),
      vue.createElementVNode("view", { class: "logo-section" }, [
        vue.createElementVNode("image", {
          class: "logo-image",
          src: _imports_0,
          mode: "aspectFit"
        }),
        vue.createElementVNode("text", { class: "app-name" }, "业务管理系统"),
        vue.createElementVNode("text", { class: "app-slogan" }, "高效管理，智能决策")
      ]),
      vue.createCommentVNode(" 登录表单 "),
      vue.createElementVNode("view", { class: "login-form" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "离线ID"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              type: "text",
              placeholder: "请输入离线ID",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.loginForm.offline_id = $event)
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.loginForm.offline_id]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "手机号"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              type: "number",
              placeholder: "请输入手机号",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.loginForm.tel_no = $event),
              maxlength: "11"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.loginForm.tel_no]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "密码"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              type: "password",
              placeholder: "请输入密码",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.loginForm.password = $event)
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.loginForm.password]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-options" }, [
          vue.createElementVNode("text", {
            class: "remember-pwd",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.toggleRemember && $options.toggleRemember(...args))
          }, [
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["checkbox", { checked: $data.rememberPassword }])
              },
              "✓",
              2
              /* CLASS */
            ),
            vue.createTextVNode(" 记住密码 ")
          ]),
          vue.createElementVNode("text", {
            class: "forgot-pwd",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.forgotPassword && $options.forgotPassword(...args))
          }, "忘记密码？")
        ]),
        vue.createElementVNode("button", {
          class: "login-btn",
          onClick: _cache[5] || (_cache[5] = (...args) => $options.handleLogin && $options.handleLogin(...args))
        }, "登录"),
        vue.createElementVNode("view", { class: "register-link" }, [
          vue.createElementVNode("text", null, "还没有账号？"),
          vue.createElementVNode("text", {
            class: "register-text",
            onClick: _cache[6] || (_cache[6] = (...args) => $options.goToRegister && $options.goToRegister(...args))
          }, "立即注册")
        ])
      ]),
      vue.createCommentVNode(" 第三方登录 "),
      vue.createCommentVNode(` <view class="third-party-login">
      <view class="divider">
        <text class="divider-text">其他登录方式</text>
      </view>

      <view class="third-party-buttons">
        <view class="third-party-btn wechat" @click="thirdPartyLogin('wechat')">
          <text class="third-party-icon">微</text>
          <text class="third-party-text">微信</text>
        </view>
        <view class="third-party-btn qq" @click="thirdPartyLogin('qq')">
          <text class="third-party-icon">Q</text>
          <text class="third-party-text">QQ</text>
        </view>
        <view class="third-party-btn weibo" @click="thirdPartyLogin('weibo')">
          <text class="third-party-icon">微</text>
          <text class="third-party-text">微博</text>
        </view>
      </view>
    </view> `),
      vue.createCommentVNode(" 底部协议 "),
      vue.createCommentVNode(' <view class="agreement-section">\n      <text class="agreement-text">\n        登录即表示同意\n        <text class="agreement-link" @click="viewUserAgreement"\n          >《用户协议》</text\n        >\n        和\n        <text class="agreement-link" @click="viewPrivacyPolicy"\n          >《隐私政策》</text\n        >\n      </text>\n    </view> ')
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$i], ["__scopeId", "data-v-e4e4508d"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/login/login.vue"]]);
  const _sfc_main$h = {
    data() {
      return {
        userInfo: {},
        todoBean: {
          monthOrderCount: 0,
          monthPayMoneySum: 0,
          monthSaleMoneySum: 0,
          monthProfit: 0,
          waitToBuy: 0,
          waitToMail: 0,
          waitToPay: 0,
          waitToVisit: 0
        }
      };
    },
    onLoad() {
      this.initData();
    },
    onShow() {
      this.loadHomepageData();
    },
    methods: {
      initData() {
        const userInfo = uni.getStorageSync("userInfo");
        if (userInfo) {
          this.userInfo = userInfo;
        }
      },
      async loadHomepageData() {
        try {
          const response = await apiService.getHomepage({
            offline_id: this.userInfo.offline_id || "abc"
          });
          if (response.success) {
            this.todoBean = response.data;
          } else {
            formatAppLog("error", "at pages/welcome/welcome.vue:107", "加载首页数据失败:", response.message);
          }
        } catch (error) {
          formatAppLog("error", "at pages/welcome/welcome.vue:111", "加载首页数据失败:", error);
        }
      },
      goInto() {
        uni.reLaunch({
          url: "/pages/order/order",
          success: () => {
            formatAppLog("log", "at pages/welcome/welcome.vue:121", "跳转到订单页面成功");
          },
          fail: (err) => {
            formatAppLog("error", "at pages/welcome/welcome.vue:124", "跳转到订单页面失败:", err);
            uni.showToast({
              title: "跳转失败",
              icon: "none"
            });
          }
        });
      }
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "welcome-container" }, [
      vue.createCommentVNode(" 欢迎区域 "),
      vue.createElementVNode("view", { class: "welcome-section" }, [
        vue.createElementVNode("text", { class: "welcome-title" }, [
          vue.createTextVNode(" 欢迎 "),
          !$data.userInfo.nickname ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "游客")) : (vue.openBlock(), vue.createElementBlock(
            "text",
            { key: 1 },
            vue.toDisplayString($data.userInfo.nickname),
            1
            /* TEXT */
          )),
          vue.createTextVNode(" ! ")
        ])
      ]),
      vue.createCommentVNode(" 数据统计卡片 "),
      vue.createElementVNode("view", { class: "stats-section" }, [
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode("text", { class: "stat-label" }, "当月订单总数"),
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($data.todoBean.monthOrderCount),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode("text", { class: "stat-label" }, "当月总花费(采购商品总额+采购差旅成本)"),
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($data.todoBean.monthPayMoneySum),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode("text", { class: "stat-label" }, "当月总销售额"),
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($data.todoBean.monthSaleMoneySum),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode("text", { class: "stat-label" }, "当月总利润"),
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($data.todoBean.monthProfit),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode("text", { class: "stat-label" }, "待备货数"),
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($data.todoBean.waitToBuy),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode("text", { class: "stat-label" }, "待发货"),
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($data.todoBean.waitToMail),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode("text", { class: "stat-label" }, "待收款"),
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($data.todoBean.waitToPay),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode("text", { class: "stat-label" }, "待回访"),
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($data.todoBean.waitToVisit),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 进入按钮 "),
      vue.createElementVNode("view", { class: "enter-section" }, [
        vue.createElementVNode("button", {
          class: "enter-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goInto && $options.goInto(...args))
        }, "进入业务管理系统")
      ])
    ]);
  }
  const PagesWelcomeWelcome = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$h], ["__scopeId", "data-v-085f0530"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/welcome/welcome.vue"]]);
  const _sfc_main$g = {
    name: "SlideMenu",
    props: {
      visible: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        statusBarHeight: 0,
        userInfo: {
          name: "管理员",
          avatar: "",
          phone: "138****8888",
          level: "VIP会员"
        }
      };
    },
    mounted() {
      const systemInfo = uni.getSystemInfoSync();
      this.statusBarHeight = systemInfo.statusBarHeight || 0;
    },
    methods: {
      closeMenu() {
        this.$emit("close");
      },
      gotoUserPage() {
        this.closeMenu();
        uni.showToast({
          title: "个人主页功能开发中",
          icon: "none"
        });
      },
      openPage(pageName) {
        this.closeMenu();
        switch (pageName) {
          case "todoPage":
            uni.showToast({
              title: "待办查看功能开发中",
              icon: "none"
            });
            break;
          case "settingCategoryPage":
            uni.navigateTo({
              url: "/pages/setting-category/setting-category"
            });
            break;
          case "settingExchangeratePage":
            uni.showToast({
              title: "汇率设置功能开发中",
              icon: "none"
            });
            break;
          case "settingColorPage":
            uni.showToast({
              title: "颜色设置功能开发中",
              icon: "none"
            });
            break;
          case "settingSharePage":
            uni.showToast({
              title: "分享功能开发中",
              icon: "none"
            });
            break;
          case "settingMemberPage":
            uni.showToast({
              title: "开通会员功能开发中",
              icon: "none"
            });
            break;
          case "settingHelpPage":
            uni.showToast({
              title: "帮助与留言功能开发中",
              icon: "none"
            });
            break;
          case "settingContactusPage":
            uni.showToast({
              title: "联系我们功能开发中",
              icon: "none"
            });
            break;
        }
      }
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    return $props.visible ? (vue.openBlock(), vue.createElementBlock("view", {
      key: 0,
      class: "slide-menu-container"
    }, [
      vue.createCommentVNode(" 遮罩层 "),
      vue.createElementVNode("view", {
        class: "mask",
        onClick: _cache[0] || (_cache[0] = (...args) => $options.closeMenu && $options.closeMenu(...args))
      }),
      vue.createCommentVNode(" 侧滑菜单 "),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["slide-menu", { "slide-in": $props.visible }])
        },
        [
          vue.createCommentVNode(" 菜单内容 "),
          vue.createElementVNode("view", { class: "menu-content" }, [
            vue.createCommentVNode(" 头部区域 "),
            vue.createElementVNode(
              "view",
              {
                class: "margin-top",
                style: vue.normalizeStyle({ paddingTop: $data.statusBarHeight + "px" })
              },
              [
                vue.createElementVNode("view", {
                  class: "close-icon",
                  onClick: _cache[1] || (_cache[1] = (...args) => $options.closeMenu && $options.closeMenu(...args))
                }, [
                  vue.createElementVNode("text", { class: "icon" }, "✕")
                ]),
                vue.createElementVNode("view", {
                  class: "user-item",
                  onClick: _cache[2] || (_cache[2] = (...args) => $options.gotoUserPage && $options.gotoUserPage(...args))
                }, [
                  vue.createElementVNode("view", { class: "user-avatar" }, [
                    vue.createElementVNode("image", {
                      src: $data.userInfo.avatar || "/static/default-avatar.png",
                      class: "avatar-img",
                      mode: "aspectFill"
                    }, null, 8, ["src"])
                  ]),
                  vue.createElementVNode("view", { class: "user-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "username" },
                      vue.toDisplayString($data.userInfo.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "user-desc" }, "查看个人主页或编辑简介")
                  ])
                ])
              ],
              4
              /* STYLE */
            ),
            vue.createCommentVNode(" 菜单列表 "),
            vue.createElementVNode("view", { class: "list-wrap" }, [
              vue.createElementVNode("view", { class: "menu-list" }, [
                vue.createElementVNode("view", {
                  class: "menu-item",
                  onClick: _cache[3] || (_cache[3] = ($event) => $options.openPage("todoPage"))
                }, [
                  vue.createElementVNode("view", { class: "menu-icon" }, "📋"),
                  vue.createElementVNode("text", { class: "menu-text" }, "待办查看"),
                  vue.createElementVNode("view", { class: "menu-arrow" }, "›")
                ]),
                vue.createElementVNode("view", {
                  class: "menu-item",
                  onClick: _cache[4] || (_cache[4] = ($event) => $options.openPage("settingCategoryPage"))
                }, [
                  vue.createElementVNode("view", { class: "menu-icon" }, "📂"),
                  vue.createElementVNode("text", { class: "menu-text" }, "商品分类设置"),
                  vue.createElementVNode("view", { class: "menu-arrow" }, "›")
                ]),
                vue.createElementVNode("view", {
                  class: "menu-item",
                  onClick: _cache[5] || (_cache[5] = ($event) => $options.openPage("settingExchangeratePage"))
                }, [
                  vue.createElementVNode("view", { class: "menu-icon" }, "💱"),
                  vue.createElementVNode("text", { class: "menu-text" }, "汇率设置"),
                  vue.createElementVNode("view", { class: "menu-arrow" }, "›")
                ]),
                vue.createElementVNode("view", {
                  class: "menu-item",
                  onClick: _cache[6] || (_cache[6] = ($event) => $options.openPage("settingColorPage"))
                }, [
                  vue.createElementVNode("view", { class: "menu-icon" }, "🎨"),
                  vue.createElementVNode("text", { class: "menu-text" }, "颜色设置"),
                  vue.createElementVNode("view", { class: "menu-arrow" }, "›")
                ]),
                vue.createElementVNode("view", {
                  class: "menu-item",
                  onClick: _cache[7] || (_cache[7] = ($event) => $options.openPage("settingSharePage"))
                }, [
                  vue.createElementVNode("view", { class: "menu-icon" }, "📤"),
                  vue.createElementVNode("text", { class: "menu-text" }, "分享"),
                  vue.createElementVNode("view", { class: "menu-arrow" }, "›")
                ]),
                vue.createElementVNode("view", {
                  class: "menu-item",
                  onClick: _cache[8] || (_cache[8] = ($event) => $options.openPage("settingMemberPage"))
                }, [
                  vue.createElementVNode("view", { class: "menu-icon" }, "👑"),
                  vue.createElementVNode("text", { class: "menu-text" }, "开通会员"),
                  vue.createElementVNode("view", { class: "menu-arrow" }, "›")
                ]),
                vue.createElementVNode("view", {
                  class: "menu-item",
                  onClick: _cache[9] || (_cache[9] = ($event) => $options.openPage("settingHelpPage"))
                }, [
                  vue.createElementVNode("view", { class: "menu-icon" }, "❓"),
                  vue.createElementVNode("text", { class: "menu-text" }, "帮助与留言"),
                  vue.createElementVNode("view", { class: "menu-arrow" }, "›")
                ]),
                vue.createElementVNode("view", {
                  class: "menu-item",
                  onClick: _cache[10] || (_cache[10] = ($event) => $options.openPage("settingContactusPage"))
                }, [
                  vue.createElementVNode("view", { class: "menu-icon" }, "📞"),
                  vue.createElementVNode("text", { class: "menu-text" }, "联系我们"),
                  vue.createElementVNode("view", { class: "menu-arrow" }, "›")
                ])
              ])
            ])
          ])
        ],
        2
        /* CLASS */
      )
    ])) : vue.createCommentVNode("v-if", true);
  }
  const SlideMenu = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$g], ["__scopeId", "data-v-edaabf93"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/components/SlideMenu.vue"]]);
  const _sfc_main$f = {
    name: "CustomTabBar",
    data() {
      return {
        currentTab: 0,
        tabList: [
          {
            pagePath: "/pages/order/order",
            icon: "📋",
            activeIcon: "📋",
            text: "订单"
          },
          {
            pagePath: "/pages/purchase/purchase",
            icon: "🛒",
            activeIcon: "🛒",
            text: "采购"
          },
          {
            pagePath: "/pages/product/product",
            icon: "📦",
            activeIcon: "📦",
            text: "商品"
          },
          {
            pagePath: "/pages/warehouse/warehouse",
            icon: "🏭",
            activeIcon: "🏭",
            text: "仓库"
          },
          {
            pagePath: "/pages/customer/customer",
            icon: "👥",
            activeIcon: "👥",
            text: "客户"
          }
        ]
      };
    },
    mounted() {
      formatAppLog("log", "at components/CustomTabBar.vue:59", "CustomTabBar mounted");
      this.setCurrentTab();
      uni.$on("updateTabBar", this.handleUpdateTabBar);
    },
    onShow() {
      formatAppLog("log", "at components/CustomTabBar.vue:66", "CustomTabBar onShow");
      this.setCurrentTab();
    },
    beforeDestroy() {
      uni.$off("updateTabBar", this.handleUpdateTabBar);
    },
    methods: {
      // 切换tab
      switchTab(index, pagePath) {
        if (this.currentTab === index)
          return;
        formatAppLog("log", "at components/CustomTabBar.vue:78", "切换到tab:", index, pagePath);
        this.currentTab = index;
        uni.reLaunch({
          url: pagePath,
          success: () => {
            formatAppLog("log", "at components/CustomTabBar.vue:85", "切换成功:", pagePath);
          },
          fail: (error) => {
            formatAppLog("error", "at components/CustomTabBar.vue:88", "切换tab失败:", error);
            uni.navigateTo({
              url: pagePath
            });
          }
        });
      },
      // 设置当前tab
      setCurrentTab() {
        try {
          const pages = getCurrentPages();
          if (pages.length > 0) {
            const currentPage = pages[pages.length - 1];
            const route = "/" + currentPage.route;
            formatAppLog("log", "at components/CustomTabBar.vue:104", "当前页面路径:", route);
            const index = this.tabList.findIndex((item) => item.pagePath === route);
            formatAppLog("log", "at components/CustomTabBar.vue:107", "找到的tab索引:", index);
            if (index !== -1) {
              this.currentTab = index;
              formatAppLog("log", "at components/CustomTabBar.vue:110", "设置当前tab为:", index);
            } else {
              formatAppLog("log", "at components/CustomTabBar.vue:112", "未找到匹配的tab页面");
            }
          }
        } catch (error) {
          formatAppLog("error", "at components/CustomTabBar.vue:116", "设置当前tab失败:", error);
        }
      },
      // 更新当前tab（供外部调用）
      updateCurrentTab(pagePath) {
        const index = this.tabList.findIndex((item) => item.pagePath === pagePath);
        if (index !== -1) {
          this.currentTab = index;
        }
      },
      // 处理页面更新事件
      handleUpdateTabBar(pagePath) {
        formatAppLog("log", "at components/CustomTabBar.vue:130", "收到页面更新事件:", pagePath);
        this.updateCurrentTab(pagePath);
      },
      // 调试方法：检查组件状态
      debugTabBarStatus() {
        formatAppLog("log", "at components/CustomTabBar.vue:136", "当前tab索引:", this.currentTab);
        formatAppLog("log", "at components/CustomTabBar.vue:137", "tabList:", this.tabList);
        formatAppLog("log", "at components/CustomTabBar.vue:138", "当前页面:", getCurrentPages());
      }
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "custom-tabbar" }, [
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($data.tabList, (item, index) => {
          return vue.openBlock(), vue.createElementBlock("view", {
            class: vue.normalizeClass(["tab-item", { active: $data.currentTab === index }]),
            key: index,
            onClick: ($event) => $options.switchTab(index, item.pagePath)
          }, [
            vue.createElementVNode("view", { class: "tab-icon" }, [
              vue.createElementVNode(
                "text",
                { class: "icon-text" },
                vue.toDisplayString($data.currentTab === index ? item.activeIcon : item.icon),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode(
              "text",
              { class: "tab-text" },
              vue.toDisplayString(item.text),
              1
              /* TEXT */
            )
          ], 10, ["onClick"]);
        }),
        128
        /* KEYED_FRAGMENT */
      ))
    ]);
  }
  const CustomTabBar = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$f], ["__scopeId", "data-v-6def6a3b"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/components/CustomTabBar.vue"]]);
  const _sfc_main$e = {
    components: {
      SlideMenu,
      CustomTabBar
    },
    data() {
      return {
        slideMenuVisible: false,
        currentFilter: "all",
        orderStats: {
          total: 0,
          pending: 0,
          processing: 0,
          completed: 0
        },
        orderList: []
      };
    },
    computed: {
      filteredOrders() {
        if (this.currentFilter === "all") {
          return this.orderList;
        }
        return this.orderList.filter(
          (order) => order.status === this.currentFilter
        );
      }
    },
    onLoad() {
      this.loadOrderData();
    },
    onShow() {
      this.loadOrderData();
    },
    methods: {
      async loadOrderData() {
        try {
          const response = await apiService.getOrder({
            userId: this.getUserId(),
            page: 1,
            size: 50
          });
          if (response.success) {
            this.orderList = response.data.orders || [];
            this.updateOrderStats();
          } else {
            this.loadMockData();
          }
        } catch (error) {
          formatAppLog("error", "at pages/order/order.vue:189", "加载订单数据失败:", error);
          this.loadMockData();
        }
      },
      loadMockData() {
        this.orderList = [
          {
            id: 1,
            orderNo: "ORD20241201001",
            customerName: "张三",
            customerPhone: "138****8888",
            amount: "2,580.00",
            productCount: 3,
            status: "pending",
            statusText: "待处理",
            createTime: "2024-12-01 14:30"
          },
          {
            id: 2,
            orderNo: "ORD20241201002",
            customerName: "李四",
            customerPhone: "139****9999",
            amount: "1,890.00",
            productCount: 2,
            status: "processing",
            statusText: "处理中",
            createTime: "2024-12-01 15:20"
          },
          {
            id: 3,
            orderNo: "ORD20241201003",
            customerName: "王五",
            customerPhone: "137****7777",
            amount: "3,420.00",
            productCount: 4,
            status: "completed",
            statusText: "已完成",
            createTime: "2024-12-01 16:45"
          },
          {
            id: 4,
            orderNo: "ORD20241201004",
            customerName: "赵六",
            customerPhone: "136****6666",
            amount: "1,200.00",
            productCount: 1,
            status: "pending",
            statusText: "待处理",
            createTime: "2024-12-01 17:10"
          }
        ];
        this.updateOrderStats();
      },
      updateOrderStats() {
        const stats = {
          total: this.orderList.length,
          pending: this.orderList.filter((order) => order.status === "pending").length,
          processing: this.orderList.filter(
            (order) => order.status === "processing"
          ).length,
          completed: this.orderList.filter(
            (order) => order.status === "completed"
          ).length
        };
        this.orderStats = stats;
      },
      getUserId() {
        const userInfo = uni.getStorageSync("userInfo");
        return userInfo ? userInfo.id : null;
      },
      setFilter(filter) {
        this.currentFilter = filter;
      },
      showSearch() {
        uni.navigateTo({
          url: "/pages/search/search"
        });
      },
      viewOrderDetail(orderId) {
        uni.navigateTo({
          url: `/pages/order/detail?id=${orderId}`
        });
      },
      async addOrder() {
        uni.showToast({
          title: "新增订单功能开发中",
          icon: "none"
        });
      },
      async editOrder(orderId) {
        uni.showToast({
          title: "编辑订单功能开发中",
          icon: "none"
        });
      },
      async deleteOrder(orderId) {
        uni.showModal({
          title: "确认删除",
          content: "确定要删除这个订单吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                const response = await apiService.deleteOrder(orderId);
                if (response.success) {
                  const index = this.orderList.findIndex(
                    (order) => order.id === orderId
                  );
                  if (index > -1) {
                    this.orderList.splice(index, 1);
                    this.updateOrderStats();
                  }
                  uni.showToast({
                    title: "删除成功",
                    icon: "success"
                  });
                } else {
                  uni.showToast({
                    title: response.message || "删除失败",
                    icon: "none"
                  });
                }
              } catch (error) {
                formatAppLog("error", "at pages/order/order.vue:323", "删除订单失败:", error);
                uni.showToast({
                  title: "删除失败，请重试",
                  icon: "none"
                });
              }
            }
          }
        });
      },
      // 显示侧滑菜单
      showSlideMenu() {
        this.slideMenuVisible = true;
      },
      // 隐藏侧滑菜单
      hideSlideMenu() {
        this.slideMenuVisible = false;
      },
      // 跳转到统计页面
      gotoChart() {
        uni.navigateTo({
          url: "/pages/statistics/statistics"
        });
      }
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_SlideMenu = vue.resolveComponent("SlideMenu");
    const _component_CustomTabBar = vue.resolveComponent("CustomTabBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "order-container" }, [
      vue.createCommentVNode(" 头部导航 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "header-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.showSlideMenu && $options.showSlideMenu(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "👤")
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("text", { class: "header-title" }, "订单管理")
        ]),
        vue.createElementVNode("view", {
          class: "header-right",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.gotoChart && $options.gotoChart(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "📊")
        ])
      ]),
      vue.createCommentVNode(" 侧滑菜单 "),
      vue.createVNode(_component_SlideMenu, {
        visible: $data.slideMenuVisible,
        onClose: $options.hideSlideMenu
      }, null, 8, ["visible", "onClose"]),
      vue.createCommentVNode(" 订单统计 "),
      vue.createElementVNode("view", { class: "stats-section" }, [
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.orderStats.total),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "总订单")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.orderStats.pending),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "待处理")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.orderStats.processing),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "处理中")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.orderStats.completed),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "已完成")
        ])
      ]),
      vue.createCommentVNode(" 筛选栏 "),
      vue.createElementVNode("view", { class: "filter-section" }, [
        vue.createElementVNode("view", { class: "filter-tabs" }, [
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["filter-tab", { active: $data.currentFilter === "all" }]),
              onClick: _cache[2] || (_cache[2] = ($event) => $options.setFilter("all"))
            },
            "全部",
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["filter-tab", { active: $data.currentFilter === "pending" }]),
              onClick: _cache[3] || (_cache[3] = ($event) => $options.setFilter("pending"))
            },
            "待处理",
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["filter-tab", { active: $data.currentFilter === "processing" }]),
              onClick: _cache[4] || (_cache[4] = ($event) => $options.setFilter("processing"))
            },
            "处理中",
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["filter-tab", { active: $data.currentFilter === "completed" }]),
              onClick: _cache[5] || (_cache[5] = ($event) => $options.setFilter("completed"))
            },
            "已完成",
            2
            /* CLASS */
          )
        ]),
        vue.createElementVNode("view", {
          class: "search-btn",
          onClick: _cache[6] || (_cache[6] = (...args) => $options.showSearch && $options.showSearch(...args))
        }, [
          vue.createElementVNode("text", { class: "search-icon" }, "🔍")
        ])
      ]),
      vue.createCommentVNode(" 订单列表 "),
      vue.createElementVNode("view", { class: "order-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($options.filteredOrders, (order, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "order-item",
              key: index,
              onClick: ($event) => $options.viewOrderDetail(order.id)
            }, [
              vue.createElementVNode("view", { class: "order-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "order-number" },
                  vue.toDisplayString(order.orderNo),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  {
                    class: vue.normalizeClass(["order-status", order.status])
                  },
                  vue.toDisplayString(order.statusText),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              vue.createElementVNode("view", { class: "order-info" }, [
                vue.createElementVNode("view", { class: "customer-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "customer-name" },
                    vue.toDisplayString(order.customerName),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "customer-phone" },
                    vue.toDisplayString(order.customerPhone),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "order-amount" }, [
                  vue.createElementVNode("text", { class: "amount-label" }, "订单金额"),
                  vue.createElementVNode(
                    "text",
                    { class: "amount-value" },
                    "¥" + vue.toDisplayString(order.amount),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "order-details" }, [
                vue.createElementVNode("view", { class: "product-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "product-count" },
                    vue.toDisplayString(order.productCount) + "件商品",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "order-time" },
                    vue.toDisplayString(order.createTime),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "order-actions" }, [
                  vue.createElementVNode("text", {
                    class: "action-btn edit",
                    onClick: vue.withModifiers(($event) => $options.editOrder(order.id), ["stop"])
                  }, "编辑", 8, ["onClick"]),
                  vue.createElementVNode("text", {
                    class: "action-btn delete",
                    onClick: vue.withModifiers(($event) => $options.deleteOrder(order.id), ["stop"])
                  }, "删除", 8, ["onClick"])
                ])
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 空状态 "),
      $options.filteredOrders.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "empty-state"
      }, [
        vue.createElementVNode("text", { class: "empty-icon" }, "📦"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无订单数据"),
        vue.createElementVNode("text", { class: "empty-tip" }, "点击下方按钮添加新订单")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 悬浮添加按钮 "),
      vue.createElementVNode("view", {
        class: "fab-button",
        onClick: _cache[7] || (_cache[7] = (...args) => $options.addOrder && $options.addOrder(...args))
      }, [
        vue.createElementVNode("text", { class: "fab-icon" }, "+")
      ]),
      vue.createCommentVNode(" 自定义 TabBar "),
      vue.createVNode(_component_CustomTabBar)
    ]);
  }
  const PagesOrderOrder = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$e], ["__scopeId", "data-v-93207a4f"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/order/order.vue"]]);
  const _sfc_main$d = {
    components: {
      SlideMenu,
      CustomTabBar
    },
    data() {
      return {
        slideMenuVisible: false,
        purchaseStats: {
          total: 45,
          pending: 12,
          approved: 20,
          completed: 13
        },
        purchasePlans: [
          {
            id: "PLAN001",
            status: "pending",
            statusText: "待审核",
            createTime: "2024-12-01",
            totalItems: 25
          },
          {
            id: "PLAN002",
            status: "approved",
            statusText: "已审核",
            createTime: "2024-11-28",
            totalItems: 18
          },
          {
            id: "PLAN003",
            status: "completed",
            statusText: "已完成",
            createTime: "2024-11-25",
            totalItems: 32
          }
        ],
        purchaseList: [
          {
            id: "PUR001",
            supplier: "苹果官方",
            amount: "89,990.00",
            itemCount: 10,
            status: "pending",
            statusText: "待审核",
            createTime: "2024-12-01"
          },
          {
            id: "PUR002",
            supplier: "华为官方",
            amount: "45,600.00",
            itemCount: 8,
            status: "approved",
            statusText: "已审核",
            createTime: "2024-11-30"
          },
          {
            id: "PUR003",
            supplier: "小米官方",
            amount: "23,400.00",
            itemCount: 15,
            status: "completed",
            statusText: "已完成",
            createTime: "2024-11-28"
          }
        ],
        consolidationList: [
          {
            id: "CON001",
            status: "shipping",
            statusText: "运输中",
            itemCount: 5,
            logisticsCompany: "顺丰速运"
          },
          {
            id: "CON002",
            status: "arrived",
            statusText: "已到货",
            itemCount: 3,
            logisticsCompany: "圆通速递"
          },
          {
            id: "CON003",
            status: "pending",
            statusText: "待发货",
            itemCount: 7,
            logisticsCompany: "中通快递"
          }
        ],
        purchaseSummary: {
          monthlyTotal: "158,990.00",
          productTypes: 12,
          avgCycle: 7,
          supplierCount: 8
        }
      };
    },
    methods: {
      generatePlan() {
        uni.showToast({
          title: "生成采购计划功能开发中",
          icon: "none"
        });
      },
      viewPlanDetail(planId) {
        uni.showToast({
          title: "查看计划详情功能开发中",
          icon: "none"
        });
      },
      editPlan(planId) {
        uni.showToast({
          title: "编辑计划功能开发中",
          icon: "none"
        });
      },
      addPurchase() {
        uni.showToast({
          title: "新增采购单功能开发中",
          icon: "none"
        });
      },
      viewPurchaseDetail(purchaseId) {
        uni.showToast({
          title: "查看采购单详情功能开发中",
          icon: "none"
        });
      },
      editPurchase(purchaseId) {
        uni.showToast({
          title: "编辑采购单功能开发中",
          icon: "none"
        });
      },
      deletePurchase(purchaseId) {
        uni.showModal({
          title: "确认删除",
          content: "确定要删除这个采购单吗？",
          success: (res) => {
            if (res.confirm) {
              uni.showToast({
                title: "删除成功",
                icon: "success"
              });
            }
          }
        });
      },
      createConsolidation() {
        uni.showToast({
          title: "创建拼箱功能开发中",
          icon: "none"
        });
      },
      viewConsolidation(consolidationId) {
        uni.showToast({
          title: "查看拼箱详情功能开发中",
          icon: "none"
        });
      },
      trackConsolidation(consolidationId) {
        uni.showToast({
          title: "跟踪拼箱功能开发中",
          icon: "none"
        });
      },
      // 显示侧滑菜单
      showSlideMenu() {
        this.slideMenuVisible = true;
      },
      // 隐藏侧滑菜单
      hideSlideMenu() {
        this.slideMenuVisible = false;
      },
      // 跳转到统计页面
      gotoChart() {
        uni.navigateTo({
          url: "/pages/statistics/statistics"
        });
      }
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_SlideMenu = vue.resolveComponent("SlideMenu");
    const _component_CustomTabBar = vue.resolveComponent("CustomTabBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "purchase-container" }, [
      vue.createCommentVNode(" 头部导航 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "header-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.showSlideMenu && $options.showSlideMenu(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "👤")
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("text", { class: "header-title" }, "采购管理")
        ]),
        vue.createElementVNode("view", {
          class: "header-right",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.gotoChart && $options.gotoChart(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "📊")
        ])
      ]),
      vue.createCommentVNode(" 侧滑菜单 "),
      vue.createVNode(_component_SlideMenu, {
        visible: $data.slideMenuVisible,
        onClose: $options.hideSlideMenu
      }, null, 8, ["visible", "onClose"]),
      vue.createCommentVNode(" 采购统计 "),
      vue.createElementVNode("view", { class: "stats-section" }, [
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.purchaseStats.total),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "总采购单")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.purchaseStats.pending),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "待审核")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.purchaseStats.approved),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "已审核")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.purchaseStats.completed),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "已完成")
        ])
      ]),
      vue.createCommentVNode(" 采购计划生成 "),
      vue.createElementVNode("view", { class: "plan-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "采购计划"),
          vue.createElementVNode("text", {
            class: "section-action",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.generatePlan && $options.generatePlan(...args))
          }, "生成计划")
        ]),
        vue.createElementVNode("view", { class: "plan-content" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.purchasePlans, (plan, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "plan-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "plan-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "plan-id" },
                    vue.toDisplayString(plan.id),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["plan-status", plan.status])
                    },
                    vue.toDisplayString(plan.statusText),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createElementVNode("view", { class: "plan-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "plan-date" },
                    vue.toDisplayString(plan.createTime),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "plan-total" },
                    "总计: " + vue.toDisplayString(plan.totalItems) + "件商品",
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "plan-actions" }, [
                  vue.createElementVNode("text", {
                    class: "action-btn view",
                    onClick: ($event) => $options.viewPlanDetail(plan.id)
                  }, "查看详情", 8, ["onClick"]),
                  vue.createElementVNode("text", {
                    class: "action-btn edit",
                    onClick: ($event) => $options.editPlan(plan.id)
                  }, "编辑", 8, ["onClick"])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 采购单列表 "),
      vue.createElementVNode("view", { class: "purchase-list-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "采购单管理"),
          vue.createElementVNode("text", {
            class: "section-action",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.addPurchase && $options.addPurchase(...args))
          }, "新增采购单")
        ]),
        vue.createElementVNode("view", { class: "purchase-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.purchaseList, (purchase, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "purchase-item",
                key: index,
                onClick: ($event) => $options.viewPurchaseDetail(purchase.id)
              }, [
                vue.createElementVNode("view", { class: "purchase-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "purchase-id" },
                    vue.toDisplayString(purchase.id),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["purchase-status", purchase.status])
                    },
                    vue.toDisplayString(purchase.statusText),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createElementVNode("view", { class: "purchase-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "purchase-supplier" },
                    vue.toDisplayString(purchase.supplier),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "purchase-amount" },
                    "¥" + vue.toDisplayString(purchase.amount),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "purchase-details" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "purchase-items" },
                    vue.toDisplayString(purchase.itemCount) + "件商品",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "purchase-date" },
                    vue.toDisplayString(purchase.createTime),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "purchase-actions" }, [
                  vue.createElementVNode("text", {
                    class: "action-btn edit",
                    onClick: vue.withModifiers(($event) => $options.editPurchase(purchase.id), ["stop"])
                  }, "编辑", 8, ["onClick"]),
                  vue.createElementVNode("text", {
                    class: "action-btn delete",
                    onClick: vue.withModifiers(($event) => $options.deletePurchase(purchase.id), ["stop"])
                  }, "删除", 8, ["onClick"])
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 拼箱管理 "),
      vue.createElementVNode("view", { class: "consolidation-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "拼箱管理"),
          vue.createElementVNode("text", {
            class: "section-action",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.createConsolidation && $options.createConsolidation(...args))
          }, "创建拼箱")
        ]),
        vue.createElementVNode("view", { class: "consolidation-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.consolidationList, (consolidation, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "consolidation-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "consolidation-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "consolidation-id" },
                    vue.toDisplayString(consolidation.id),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["consolidation-status", consolidation.status])
                    },
                    vue.toDisplayString(consolidation.statusText),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createElementVNode("view", { class: "consolidation-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "consolidation-items" },
                    vue.toDisplayString(consolidation.itemCount) + "个货品",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "consolidation-logistics" },
                    vue.toDisplayString(consolidation.logisticsCompany),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "consolidation-actions" }, [
                  vue.createElementVNode("text", {
                    class: "action-btn view",
                    onClick: ($event) => $options.viewConsolidation(consolidation.id)
                  }, "查看", 8, ["onClick"]),
                  vue.createElementVNode("text", {
                    class: "action-btn track",
                    onClick: ($event) => $options.trackConsolidation(consolidation.id)
                  }, "跟踪", 8, ["onClick"])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 采购小结 "),
      vue.createElementVNode("view", { class: "summary-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "采购小结"),
        vue.createElementVNode("view", { class: "summary-content" }, [
          vue.createElementVNode("view", { class: "summary-item" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "本月采购总额"),
            vue.createElementVNode(
              "text",
              { class: "summary-value" },
              "¥" + vue.toDisplayString($data.purchaseSummary.monthlyTotal),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "summary-item" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "采购商品种类"),
            vue.createElementVNode(
              "text",
              { class: "summary-value" },
              vue.toDisplayString($data.purchaseSummary.productTypes) + "种",
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "summary-item" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "平均采购周期"),
            vue.createElementVNode(
              "text",
              { class: "summary-value" },
              vue.toDisplayString($data.purchaseSummary.avgCycle) + "天",
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "summary-item" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "供应商数量"),
            vue.createElementVNode(
              "text",
              { class: "summary-value" },
              vue.toDisplayString($data.purchaseSummary.supplierCount) + "家",
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 悬浮添加按钮 "),
      vue.createElementVNode("view", {
        class: "fab-button",
        onClick: _cache[5] || (_cache[5] = (...args) => $options.addPurchase && $options.addPurchase(...args))
      }, [
        vue.createElementVNode("text", { class: "fab-icon" }, "+")
      ]),
      vue.createCommentVNode(" 自定义 TabBar "),
      vue.createVNode(_component_CustomTabBar)
    ]);
  }
  const PagesPurchasePurchase = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$d], ["__scopeId", "data-v-313e55f0"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/purchase/purchase.vue"]]);
  class CommonUtils {
    // 格式化日期
    static formatDate(date, format = "YYYY-MM-DD") {
      if (!date)
        return "";
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hour = String(d.getHours()).padStart(2, "0");
      const minute = String(d.getMinutes()).padStart(2, "0");
      const second = String(d.getSeconds()).padStart(2, "0");
      return format.replace("YYYY", year).replace("MM", month).replace("DD", day).replace("HH", hour).replace("mm", minute).replace("ss", second);
    }
    // 格式化金额
    static formatMoney(amount, currency = "¥") {
      if (amount === null || amount === void 0)
        return "0.00";
      return currency + parseFloat(amount).toFixed(2);
    }
    // 格式化文件大小
    static formatFileSize(bytes) {
      if (bytes === 0)
        return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
    // 防抖函数
    static debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
    // 节流函数
    static throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
    // 深拷贝
    static deepClone(obj) {
      if (obj === null || typeof obj !== "object")
        return obj;
      if (obj instanceof Date)
        return new Date(obj.getTime());
      if (obj instanceof Array)
        return obj.map((item) => this.deepClone(item));
      if (typeof obj === "object") {
        const clonedObj = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            clonedObj[key] = this.deepClone(obj[key]);
          }
        }
        return clonedObj;
      }
    }
    // 生成随机ID
    static generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    // 验证手机号
    static validatePhone(phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      return phoneRegex.test(phone);
    }
    // 验证邮箱
    static validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
    // 验证身份证号
    static validateIdCard(idCard) {
      const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
      return idCardRegex.test(idCard);
    }
    // 获取状态颜色
    static getStatusColor(status) {
      const statusColors = {
        "success": "#52c41a",
        "warning": "#fa8c16",
        "error": "#ff4d4f",
        "info": "#1890ff",
        "processing": "#1890ff",
        "default": "#d9d9d9"
      };
      return statusColors[status] || statusColors.default;
    }
    // 获取状态文本
    static getStatusText(status) {
      const statusTexts = {
        "pending": "待处理",
        "processing": "处理中",
        "completed": "已完成",
        "cancelled": "已取消",
        "failed": "失败",
        "success": "成功",
        "warning": "警告",
        "error": "错误"
      };
      return statusTexts[status] || status;
    }
    // 显示加载提示
    static showLoading(title = "加载中...") {
      uni.showLoading({
        title,
        mask: true
      });
    }
    // 隐藏加载提示
    static hideLoading() {
      uni.hideLoading();
    }
    // 显示成功提示
    static showSuccess(message, duration = 2e3) {
      uni.showToast({
        title: message,
        icon: "success",
        duration
      });
    }
    // 显示错误提示
    static showError(message, duration = 2e3) {
      uni.showToast({
        title: message,
        icon: "none",
        duration
      });
    }
    // 显示确认对话框
    static showConfirm(content, title = "提示") {
      return new Promise((resolve) => {
        uni.showModal({
          title,
          content,
          success: (res) => {
            resolve(res.confirm);
          }
        });
      });
    }
    // 显示操作菜单
    static showActionSheet(itemList) {
      return new Promise((resolve) => {
        uni.showActionSheet({
          itemList,
          success: (res) => {
            resolve(res.tapIndex);
          },
          fail: () => {
            resolve(-1);
          }
        });
      });
    }
    // 复制到剪贴板
    static copyToClipboard(text) {
      uni.setClipboardData({
        data: text,
        success: () => {
          this.showSuccess("复制成功");
        },
        fail: () => {
          this.showError("复制失败");
        }
      });
    }
    // 获取系统信息
    static getSystemInfo() {
      return new Promise((resolve) => {
        uni.getSystemInfo({
          success: (res) => {
            resolve(res);
          },
          fail: () => {
            resolve(null);
          }
        });
      });
    }
    // 检查网络状态
    static checkNetworkStatus() {
      return new Promise((resolve) => {
        uni.getNetworkType({
          success: (res) => {
            resolve(res.networkType !== "none");
          },
          fail: () => {
            resolve(false);
          }
        });
      });
    }
    // 拨打电话
    static makePhoneCall(phoneNumber) {
      uni.makePhoneCall({
        phoneNumber,
        fail: () => {
          this.showError("拨打电话失败");
        }
      });
    }
    // 发送短信
    static sendSms(phoneNumber, content) {
      uni.showToast({
        title: "请手动发送短信",
        icon: "none"
      });
    }
    // 保存图片到相册
    static saveImageToPhotosAlbum(filePath) {
      return new Promise((resolve, reject) => {
        uni.saveImageToPhotosAlbum({
          filePath,
          success: () => {
            this.showSuccess("保存成功");
            resolve(true);
          },
          fail: () => {
            this.showError("保存失败");
            reject(false);
          }
        });
      });
    }
    // 选择图片
    static chooseImage(count = 1, sizeType = ["original", "compressed"]) {
      return new Promise((resolve, reject) => {
        uni.chooseImage({
          count,
          sizeType,
          success: (res) => {
            resolve(res.tempFilePaths);
          },
          fail: () => {
            reject("选择图片失败");
          }
        });
      });
    }
    // 选择文件
    static chooseFile() {
      return new Promise((resolve, reject) => {
        uni.chooseFile({
          success: (res) => {
            resolve(res.tempFiles);
          },
          fail: () => {
            reject("选择文件失败");
          }
        });
      });
    }
    // 获取当前位置
    static getLocation() {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: "gcj02",
          success: (res) => {
            resolve(res);
          },
          fail: () => {
            reject("获取位置失败");
          }
        });
      });
    }
    // 打开地图
    static openLocation(latitude, longitude, name = "", address = "") {
      uni.openLocation({
        latitude,
        longitude,
        name,
        address,
        fail: () => {
          this.showError("打开地图失败");
        }
      });
    }
    // 设置导航栏标题
    static setNavigationBarTitle(title) {
      uni.setNavigationBarTitle({
        title
      });
    }
    // 设置导航栏颜色
    static setNavigationBarColor(frontColor, backgroundColor) {
      uni.setNavigationBarColor({
        frontColor,
        backgroundColor
      });
    }
    // 页面跳转
    static navigateTo(url, params = {}) {
      const query = Object.keys(params).map((key) => `${key}=${encodeURIComponent(params[key])}`).join("&");
      const fullUrl = query ? `${url}?${query}` : url;
      uni.navigateTo({
        url: fullUrl,
        fail: () => {
          this.showError("页面跳转失败");
        }
      });
    }
    // 重定向页面
    static redirectTo(url, params = {}) {
      const query = Object.keys(params).map((key) => `${key}=${encodeURIComponent(params[key])}`).join("&");
      const fullUrl = query ? `${url}?${query}` : url;
      uni.redirectTo({
        url: fullUrl,
        fail: () => {
          this.showError("页面跳转失败");
        }
      });
    }
    // 返回上一页
    static navigateBack(delta = 1) {
      uni.navigateBack({
        delta,
        fail: () => {
          this.showError("返回失败");
        }
      });
    }
    // 重启应用
    static reLaunch(url) {
      uni.reLaunch({
        url,
        fail: () => {
          this.showError("重启失败");
        }
      });
    }
    // 切换Tab（使用 reLaunch 替代 switchTab）
    static switchTab(url) {
      uni.reLaunch({
        url,
        fail: () => {
          this.showError("切换失败");
        }
      });
    }
  }
  class Store {
    constructor() {
      this.state = {
        // 用户信息
        userInfo: null,
        token: null,
        isLogin: false,
        // 网络状态
        networkStatus: true,
        // 应用配置
        appConfig: {
          theme: "light",
          language: "zh-CN",
          fontSize: "normal"
        },
        // 缓存数据
        cache: {
          categories: [],
          provinces: [],
          cities: {}
        },
        // 页面状态
        pageState: {
          currentPage: "",
          loading: false,
          refreshing: false
        }
      };
      this.listeners = [];
    }
    // 获取状态
    getState() {
      return this.state;
    }
    // 设置状态
    setState(newState) {
      this.state = { ...this.state, ...newState };
      this.notifyListeners();
    }
    // 更新部分状态
    updateState(path, value) {
      const keys = path.split(".");
      let current = this.state;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      this.notifyListeners();
    }
    // 添加监听器
    addListener(listener) {
      this.listeners.push(listener);
      return () => {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      };
    }
    // 通知监听器
    notifyListeners() {
      this.listeners.forEach((listener) => {
        try {
          listener(this.state);
        } catch (error) {
          formatAppLog("error", "at utils/store.js:82", "状态监听器错误:", error);
        }
      });
    }
    // 用户相关方法
    setUserInfo(userInfo) {
      this.setState({ userInfo, isLogin: true });
    }
    setToken(token) {
      this.setState({ token });
    }
    clearUserInfo() {
      this.setState({
        userInfo: null,
        token: null,
        isLogin: false
      });
    }
    // 网络状态
    setNetworkStatus(status) {
      this.setState({ networkStatus: status });
    }
    // 应用配置
    setAppConfig(config2) {
      this.setState({
        appConfig: { ...this.state.appConfig, ...config2 }
      });
    }
    // 缓存管理
    setCache(key, value) {
      this.updateState(`cache.${key}`, value);
    }
    getCache(key) {
      const keys = key.split(".");
      let current = this.state.cache;
      for (const k of keys) {
        if (current && current[k] !== void 0) {
          current = current[k];
        } else {
          return null;
        }
      }
      return current;
    }
    clearCache(key) {
      if (key) {
        this.updateState(`cache.${key}`, null);
      } else {
        this.setState({ cache: {} });
      }
    }
    // 页面状态
    setPageState(state) {
      this.setState({
        pageState: { ...this.state.pageState, ...state }
      });
    }
    setLoading(loading) {
      this.setPageState({ loading });
    }
    setRefreshing(refreshing) {
      this.setPageState({ refreshing });
    }
    // 持久化存储
    saveToStorage() {
      try {
        const dataToSave = {
          userInfo: this.state.userInfo,
          token: this.state.token,
          isLogin: this.state.isLogin,
          appConfig: this.state.appConfig
        };
        uni.setStorageSync("appState", JSON.stringify(dataToSave));
      } catch (error) {
        formatAppLog("error", "at utils/store.js:171", "保存状态失败:", error);
      }
    }
    // 从存储恢复
    loadFromStorage() {
      try {
        const savedData = uni.getStorageSync("appState");
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          this.setState(parsedData);
        }
      } catch (error) {
        formatAppLog("error", "at utils/store.js:184", "恢复状态失败:", error);
      }
    }
    // 清除存储
    clearStorage() {
      try {
        uni.removeStorageSync("appState");
      } catch (error) {
        formatAppLog("error", "at utils/store.js:193", "清除存储失败:", error);
      }
    }
  }
  const store = new Store();
  store.loadFromStorage();
  const _sfc_main$c = {
    components: {
      SlideMenu,
      CustomTabBar
    },
    data() {
      return {
        slideMenuVisible: false,
        leftSideActive: 0,
        cateA: "",
        categoryAll: [],
        categoryBCur: [],
        categoryChooseBean: {
          id: null,
          offline_id: this.getOfflineId()
        }
      };
    },
    mounted() {
      this.getUserCategory();
    },
    // 页面显示时重新加载数据
    onShow() {
      const needReload = uni.getStorageSync("category_updated");
      if (needReload) {
        this.getUserCategory();
        uni.removeStorageSync("category_updated");
      }
    },
    methods: {
      // 获取离线ID
      getOfflineId() {
        let offlineId = uni.getStorageSync("offline_id");
        if (!offlineId) {
          offlineId = this.generateOfflineId();
          uni.setStorageSync("offline_id", offlineId);
        }
        return offlineId;
      },
      // 生成离线ID
      generateOfflineId() {
        return "web_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      },
      // 检查登录状态
      checkLoginStatus() {
        const isLoggedIn = uni.getStorageSync("isLoggedIn");
        const token = uni.getStorageSync("token");
        const userInfo = uni.getStorageSync("userInfo");
        if (!isLoggedIn || !token || !userInfo) {
          this.gotoLogin();
          return false;
        }
        return true;
      },
      // 获取用户分类数据
      async getUserCategory() {
        if (!this.checkLoginStatus()) {
          return;
        }
        try {
          CommonUtils.showLoading("加载分类数据...");
          formatAppLog("log", "at pages/product/product.vue:148", "=== 调试信息 ===");
          formatAppLog("log", "at pages/product/product.vue:149", "登录状态:", uni.getStorageSync("isLoggedIn"));
          formatAppLog("log", "at pages/product/product.vue:150", "Token:", uni.getStorageSync("token"));
          formatAppLog("log", "at pages/product/product.vue:151", "用户信息:", uni.getStorageSync("userInfo"));
          formatAppLog("log", "at pages/product/product.vue:152", "请求参数:", this.categoryChooseBean);
          const response = await apiService.getUserCategory(this.categoryChooseBean);
          formatAppLog("log", "at pages/product/product.vue:156", "API响应:", response);
          if (response.code === 1) {
            const arr = response.data;
            if (arr && arr.length > 0) {
              this.processCategoryData(arr);
            } else {
              this.showSetCategoryDialog();
            }
          } else if (response.code === 207) {
            formatAppLog("log", "at pages/product/product.vue:167", "登录状态失效，错误信息:", response.message);
            CommonUtils.showError(response.message || "登录状态失效");
            this.gotoLogin();
          } else {
            formatAppLog("log", "at pages/product/product.vue:172", "其他错误，错误码:", response.code, "错误信息:", response.message);
            this.showSetCategoryDialog();
          }
        } catch (error) {
          formatAppLog("error", "at pages/product/product.vue:176", "获取分类数据失败:", error);
          CommonUtils.showError("获取分类数据失败");
        } finally {
          CommonUtils.hideLoading();
        }
      },
      // 处理分类数据
      processCategoryData(arr) {
        const level_A = [];
        const level_B = [];
        const level_C = [];
        arr.forEach((item) => {
          if (item.level === "1") {
            level_A.push(item);
          } else if (item.level === "2") {
            level_B.push(item);
          } else if (item.level === "3") {
            level_C.push(item);
          }
        });
        level_A.forEach((categoryA) => {
          const group_b = [];
          level_B.forEach((categoryB) => {
            if (categoryB.parentid === categoryA.id) {
              const group_c = [];
              level_C.forEach((categoryC) => {
                if (categoryC.parentid === categoryB.id) {
                  group_c.push(categoryC);
                }
              });
              categoryB.group = group_c;
              group_b.push(categoryB);
            }
          });
          categoryA.group = group_b;
        });
        this.categoryAll = level_A;
        this.categoryBCur = level_A[0] ? level_A[0].group : [];
        this.cateA = level_A[0] ? level_A[0].name : "";
      },
      // 显示设置分类对话框
      showSetCategoryDialog() {
        CommonUtils.showConfirm(
          "请设置您销售的商品种类",
          "提示"
        ).then((confirmed) => {
          if (confirmed) {
            this.gotoSetCategory();
          }
        });
      },
      // 跳转到设置分类页面
      gotoSetCategory() {
        uni.navigateTo({
          url: "/pages/setting-category/setting-category"
        });
      },
      // 跳转到登录页面
      gotoLogin() {
        uni.reLaunch({
          url: "/pages/login/login"
        });
      },
      selectCategoryA(index, pid, name) {
        this.leftSideActive = index;
        this.getCategoryB(pid, name);
      },
      getCategoryB(pid, name) {
        this.cateA = name;
        const category = this.categoryAll.find((item) => item.id === pid);
        if (category) {
          this.categoryBCur = category.group;
        }
      },
      gotoProductList(item, subItem, cateA, category_id) {
        formatAppLog("log", "at pages/product/product.vue:263", "跳转到商品列表:", item, subItem, cateA, category_id);
        uni.navigateTo({
          url: `/pages/product-list/product-list?cate1=${cateA}&cate2=${item}&cate3=${subItem}&category_id=${category_id}`
        });
      },
      gotoChart() {
        uni.navigateTo({
          url: "/pages/statistics/statistics"
        });
      },
      // 显示侧滑菜单
      showSlideMenu() {
        this.slideMenuVisible = true;
      },
      // 隐藏侧滑菜单
      hideSlideMenu() {
        this.slideMenuVisible = false;
      }
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_SlideMenu = vue.resolveComponent("SlideMenu");
    const _component_CustomTabBar = vue.resolveComponent("CustomTabBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "product-container" }, [
      vue.createCommentVNode(" 头部导航 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "header-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.showSlideMenu && $options.showSlideMenu(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "👤")
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("text", { class: "header-title" }, "商品管理")
        ]),
        vue.createElementVNode("view", {
          class: "header-right",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.gotoChart && $options.gotoChart(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "📊")
        ])
      ]),
      vue.createCommentVNode(" 侧滑菜单 "),
      vue.createVNode(_component_SlideMenu, {
        visible: $data.slideMenuVisible,
        onClose: $options.hideSlideMenu
      }, null, 8, ["visible", "onClose"]),
      vue.createCommentVNode(" 分类商品布局 "),
      vue.createElementVNode("view", { class: "category-wrap" }, [
        vue.createCommentVNode(" 左侧分类列表 "),
        vue.createElementVNode("scroll-view", {
          class: "left-side",
          "scroll-y": "true"
        }, [
          vue.createElementVNode("view", { class: "category-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.categoryAll, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: vue.normalizeClass(["category-item", { active: $data.leftSideActive === index }]),
                  key: index,
                  onClick: ($event) => $options.selectCategoryA(index, item.id, item.name)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "category-name" },
                    vue.toDisplayString(item.name),
                    1
                    /* TEXT */
                  )
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createCommentVNode(" 右侧子分类和商品 "),
        vue.createElementVNode("scroll-view", {
          class: "right-side",
          "scroll-y": "true"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.categoryBCur, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "subcategory-section",
                key: item.id
              }, [
                vue.createElementVNode("view", { class: "category-name" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "name-text" },
                    vue.toDisplayString(item.name),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "subcategory-grid" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(item.group, (subItem) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: "subcategory-item",
                        key: subItem.id,
                        onClick: ($event) => $options.gotoProductList(item.name, subItem.name, $data.cateA, subItem.id)
                      }, [
                        vue.createElementVNode(
                          "text",
                          { class: "subcategory-name" },
                          vue.toDisplayString(subItem.name),
                          1
                          /* TEXT */
                        )
                      ], 8, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 自定义 TabBar "),
      vue.createVNode(_component_CustomTabBar)
    ]);
  }
  const PagesProductProduct = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$c], ["__scopeId", "data-v-946a9793"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/product/product.vue"]]);
  const _sfc_main$b = {
    components: {
      SlideMenu,
      CustomTabBar
    },
    data() {
      return {
        slideMenuVisible: false,
        warehouseStats: {
          totalProducts: 1256,
          totalValue: 89.5,
          lowStock: 23,
          expiring: 8
        },
        warehouseList: [
          {
            id: 1,
            name: "主仓库",
            location: "北京市朝阳区",
            capacity: "1000㎡",
            status: "active",
            statusText: "正常运营"
          },
          {
            id: 2,
            name: "分仓库A",
            location: "上海市浦东新区",
            capacity: "500㎡",
            status: "active",
            statusText: "正常运营"
          },
          {
            id: 3,
            name: "临时仓库",
            location: "广州市天河区",
            capacity: "200㎡",
            status: "maintenance",
            statusText: "维护中"
          }
        ],
        inboundList: [
          {
            id: "IN001",
            supplier: "苹果官方",
            itemCount: 50,
            status: "pending",
            statusText: "待处理"
          },
          {
            id: "IN002",
            supplier: "华为官方",
            itemCount: 30,
            status: "processing",
            statusText: "处理中"
          },
          {
            id: "IN003",
            supplier: "小米官方",
            itemCount: 25,
            status: "completed",
            statusText: "已完成"
          }
        ],
        inventoryList: [
          {
            id: 1,
            name: "iPhone 15 Pro",
            stock: 15,
            value: "134,985.00",
            location: "A区-01-01",
            expiryDate: "2025-12-01",
            stockStatus: "normal",
            stockText: "正常"
          },
          {
            id: 2,
            name: "MacBook Air M2",
            stock: 5,
            value: "49,995.00",
            location: "A区-01-02",
            expiryDate: "2025-11-15",
            stockStatus: "low",
            stockText: "库存不足"
          },
          {
            id: 3,
            name: "AirPods Pro",
            stock: 0,
            value: "0.00",
            location: "B区-02-01",
            expiryDate: "2025-10-30",
            stockStatus: "out",
            stockText: "缺货"
          }
        ],
        expiryList: [
          {
            id: 1,
            productName: "iPhone 14 Pro",
            expiryDate: "2024-12-15",
            remainingDays: 14,
            status: "warning",
            statusText: "即将过期"
          },
          {
            id: 2,
            productName: "iPad Air",
            expiryDate: "2024-12-20",
            remainingDays: 19,
            status: "normal",
            statusText: "正常"
          },
          {
            id: 3,
            productName: "Apple Watch Series 8",
            expiryDate: "2024-12-10",
            remainingDays: 9,
            status: "urgent",
            statusText: "紧急"
          }
        ],
        warehouseSummary: {
          monthlyInbound: 156,
          monthlyOutbound: 142,
          turnoverRate: 85.2,
          accuracyRate: 98.5
        }
      };
    },
    methods: {
      addWarehouse() {
        uni.showToast({
          title: "新增仓库功能开发中",
          icon: "none"
        });
      },
      viewWarehouse(warehouseId) {
        uni.showToast({
          title: "查看仓库详情功能开发中",
          icon: "none"
        });
      },
      editWarehouse(warehouseId) {
        uni.showToast({
          title: "编辑仓库功能开发中",
          icon: "none"
        });
      },
      processInbound() {
        uni.showToast({
          title: "处理入仓功能开发中",
          icon: "none"
        });
      },
      processInboundItem(inboundId) {
        uni.showToast({
          title: "处理入仓项目功能开发中",
          icon: "none"
        });
      },
      viewInboundDetail(inboundId) {
        uni.showToast({
          title: "查看入仓详情功能开发中",
          icon: "none"
        });
      },
      updateStatus() {
        uni.showToast({
          title: "更新状态功能开发中",
          icon: "none"
        });
      },
      adjustStock(itemId) {
        uni.showToast({
          title: "调整库存功能开发中",
          icon: "none"
        });
      },
      moveItem(itemId) {
        uni.showToast({
          title: "移库功能开发中",
          icon: "none"
        });
      },
      setExpiryReminder() {
        uni.showToast({
          title: "设置提醒功能开发中",
          icon: "none"
        });
      },
      extendExpiry(expiryId) {
        uni.showToast({
          title: "延期功能开发中",
          icon: "none"
        });
      },
      disposeItem(expiryId) {
        uni.showToast({
          title: "处理过期商品功能开发中",
          icon: "none"
        });
      },
      // 显示侧滑菜单
      showSlideMenu() {
        this.slideMenuVisible = true;
      },
      // 隐藏侧滑菜单
      hideSlideMenu() {
        this.slideMenuVisible = false;
      },
      // 跳转到统计页面
      gotoChart() {
        uni.navigateTo({
          url: "/pages/statistics/statistics"
        });
      }
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_SlideMenu = vue.resolveComponent("SlideMenu");
    const _component_CustomTabBar = vue.resolveComponent("CustomTabBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "warehouse-container" }, [
      vue.createCommentVNode(" 头部导航 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "header-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.showSlideMenu && $options.showSlideMenu(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "👤")
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("text", { class: "header-title" }, "仓库管理")
        ]),
        vue.createElementVNode("view", {
          class: "header-right",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.gotoChart && $options.gotoChart(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "📊")
        ])
      ]),
      vue.createCommentVNode(" 侧滑菜单 "),
      vue.createVNode(_component_SlideMenu, {
        visible: $data.slideMenuVisible,
        onClose: $options.hideSlideMenu
      }, null, 8, ["visible", "onClose"]),
      vue.createCommentVNode(" 仓库统计 "),
      vue.createElementVNode("view", { class: "stats-section" }, [
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.warehouseStats.totalProducts),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "总商品数")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.warehouseStats.totalValue),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "库存总值(万)")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.warehouseStats.lowStock),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "库存不足")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.warehouseStats.expiring),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "即将过期")
        ])
      ]),
      vue.createCommentVNode(" 仓库管理 "),
      vue.createElementVNode("view", { class: "warehouse-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "仓库管理"),
          vue.createElementVNode("text", {
            class: "section-action",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.addWarehouse && $options.addWarehouse(...args))
          }, "新增仓库")
        ]),
        vue.createElementVNode("view", { class: "warehouse-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.warehouseList, (warehouse, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "warehouse-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "warehouse-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "warehouse-name" },
                    vue.toDisplayString(warehouse.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["warehouse-status", warehouse.status])
                    },
                    vue.toDisplayString(warehouse.statusText),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createElementVNode("view", { class: "warehouse-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "warehouse-location" },
                    vue.toDisplayString(warehouse.location),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "warehouse-capacity" },
                    "容量: " + vue.toDisplayString(warehouse.capacity),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "warehouse-actions" }, [
                  vue.createElementVNode("text", {
                    class: "action-btn view",
                    onClick: ($event) => $options.viewWarehouse(warehouse.id)
                  }, "查看详情", 8, ["onClick"]),
                  vue.createElementVNode("text", {
                    class: "action-btn edit",
                    onClick: ($event) => $options.editWarehouse(warehouse.id)
                  }, "编辑", 8, ["onClick"])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 采购单入仓 "),
      vue.createElementVNode("view", { class: "inbound-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "采购单入仓"),
          vue.createElementVNode("text", {
            class: "section-action",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.processInbound && $options.processInbound(...args))
          }, "处理入仓")
        ]),
        vue.createElementVNode("view", { class: "inbound-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.inboundList, (inbound, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "inbound-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "inbound-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "inbound-id" },
                    vue.toDisplayString(inbound.id),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["inbound-status", inbound.status])
                    },
                    vue.toDisplayString(inbound.statusText),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createElementVNode("view", { class: "inbound-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "inbound-supplier" },
                    vue.toDisplayString(inbound.supplier),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "inbound-items" },
                    vue.toDisplayString(inbound.itemCount) + "件商品",
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "inbound-actions" }, [
                  vue.createElementVNode("text", {
                    class: "action-btn process",
                    onClick: ($event) => $options.processInboundItem(inbound.id)
                  }, "处理", 8, ["onClick"]),
                  vue.createElementVNode("text", {
                    class: "action-btn view",
                    onClick: ($event) => $options.viewInboundDetail(inbound.id)
                  }, "查看", 8, ["onClick"])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 库存状态 "),
      vue.createElementVNode("view", { class: "inventory-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "库存状态"),
          vue.createElementVNode("text", {
            class: "section-action",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.updateStatus && $options.updateStatus(...args))
          }, "更新状态")
        ]),
        vue.createElementVNode("view", { class: "inventory-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.inventoryList, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "inventory-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "inventory-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "inventory-name" },
                    vue.toDisplayString(item.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["inventory-status", item.stockStatus])
                    },
                    vue.toDisplayString(item.stockText),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createElementVNode("view", { class: "inventory-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "inventory-stock" },
                    "库存: " + vue.toDisplayString(item.stock),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "inventory-value" },
                    "价值: ¥" + vue.toDisplayString(item.value),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "inventory-details" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "inventory-location" },
                    "位置: " + vue.toDisplayString(item.location),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "inventory-expiry" },
                    "到期: " + vue.toDisplayString(item.expiryDate),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "inventory-actions" }, [
                  vue.createElementVNode("text", {
                    class: "action-btn adjust",
                    onClick: ($event) => $options.adjustStock(item.id)
                  }, "调整库存", 8, ["onClick"]),
                  vue.createElementVNode("text", {
                    class: "action-btn move",
                    onClick: ($event) => $options.moveItem(item.id)
                  }, "移库", 8, ["onClick"])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 货期提醒 "),
      vue.createElementVNode("view", { class: "expiry-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "货期提醒"),
          vue.createElementVNode("text", {
            class: "section-action",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.setExpiryReminder && $options.setExpiryReminder(...args))
          }, "设置提醒")
        ]),
        vue.createElementVNode("view", { class: "expiry-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.expiryList, (expiry, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "expiry-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "expiry-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "expiry-product" },
                    vue.toDisplayString(expiry.productName),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["expiry-status", expiry.status])
                    },
                    vue.toDisplayString(expiry.statusText),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createElementVNode("view", { class: "expiry-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "expiry-date" },
                    "到期日期: " + vue.toDisplayString(expiry.expiryDate),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "expiry-days" },
                    "剩余: " + vue.toDisplayString(expiry.remainingDays) + "天",
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "expiry-actions" }, [
                  vue.createElementVNode("text", {
                    class: "action-btn extend",
                    onClick: ($event) => $options.extendExpiry(expiry.id)
                  }, "延期", 8, ["onClick"]),
                  vue.createElementVNode("text", {
                    class: "action-btn dispose",
                    onClick: ($event) => $options.disposeItem(expiry.id)
                  }, "处理", 8, ["onClick"])
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 仓库总结 "),
      vue.createElementVNode("view", { class: "summary-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "仓库总结"),
        vue.createElementVNode("view", { class: "summary-content" }, [
          vue.createElementVNode("view", { class: "summary-item" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "本月入库"),
            vue.createElementVNode(
              "text",
              { class: "summary-value" },
              vue.toDisplayString($data.warehouseSummary.monthlyInbound) + "件",
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "summary-item" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "本月出库"),
            vue.createElementVNode(
              "text",
              { class: "summary-value" },
              vue.toDisplayString($data.warehouseSummary.monthlyOutbound) + "件",
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "summary-item" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "库存周转率"),
            vue.createElementVNode(
              "text",
              { class: "summary-value" },
              vue.toDisplayString($data.warehouseSummary.turnoverRate) + "%",
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "summary-item" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "库存准确率"),
            vue.createElementVNode(
              "text",
              { class: "summary-value" },
              vue.toDisplayString($data.warehouseSummary.accuracyRate) + "%",
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 悬浮添加按钮 "),
      vue.createElementVNode("view", {
        class: "fab-button",
        onClick: _cache[6] || (_cache[6] = (...args) => $options.addWarehouse && $options.addWarehouse(...args))
      }, [
        vue.createElementVNode("text", { class: "fab-icon" }, "+")
      ]),
      vue.createCommentVNode(" 自定义 TabBar "),
      vue.createVNode(_component_CustomTabBar)
    ]);
  }
  const PagesWarehouseWarehouse = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$b], ["__scopeId", "data-v-41554ef3"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/warehouse/warehouse.vue"]]);
  const _sfc_main$a = {
    components: {
      SlideMenu,
      CustomTabBar
    },
    data() {
      return {
        slideMenuVisible: false,
        currentLevel: "all",
        customerStats: {
          total: 234,
          vip: 45,
          new: 23,
          active: 156
        },
        customerList: [
          {
            id: 1,
            name: "张三",
            phone: "138****8888",
            level: "vip",
            levelText: "VIP客户",
            isVip: true,
            orderCount: 15,
            totalAmount: "25,680.00",
            lastOrderTime: "2024-12-01"
          },
          {
            id: 2,
            name: "李四",
            phone: "139****9999",
            level: "regular",
            levelText: "普通客户",
            isVip: false,
            orderCount: 8,
            totalAmount: "12,450.00",
            lastOrderTime: "2024-11-28"
          },
          {
            id: 3,
            name: "王五",
            phone: "137****7777",
            level: "vip",
            levelText: "VIP客户",
            isVip: true,
            orderCount: 22,
            totalAmount: "38,920.00",
            lastOrderTime: "2024-11-30"
          },
          {
            id: 4,
            name: "赵六",
            phone: "136****6666",
            level: "new",
            levelText: "新客户",
            isVip: false,
            orderCount: 2,
            totalAmount: "3,200.00",
            lastOrderTime: "2024-11-25"
          },
          {
            id: 5,
            name: "钱七",
            phone: "135****5555",
            level: "regular",
            levelText: "普通客户",
            isVip: false,
            orderCount: 5,
            totalAmount: "8,750.00",
            lastOrderTime: "2024-11-20"
          },
          {
            id: 6,
            name: "孙八",
            phone: "134****4444",
            level: "vip",
            levelText: "VIP客户",
            isVip: true,
            orderCount: 18,
            totalAmount: "31,600.00",
            lastOrderTime: "2024-11-29"
          }
        ]
      };
    },
    computed: {
      filteredCustomers() {
        if (this.currentLevel === "all") {
          return this.customerList;
        }
        return this.customerList.filter(
          (customer) => customer.level === this.currentLevel
        );
      }
    },
    methods: {
      setLevel(level) {
        this.currentLevel = level;
      },
      viewCustomerDetail(customerId) {
        uni.navigateTo({
          url: `/pages/customer/detail?id=${customerId}`
        });
      },
      addCustomer() {
        uni.showToast({
          title: "新增客户功能开发中",
          icon: "none"
        });
      },
      editCustomer(customerId) {
        uni.showToast({
          title: "编辑客户功能开发中",
          icon: "none"
        });
      },
      deleteCustomer(customerId) {
        uni.showModal({
          title: "确认删除",
          content: "确定要删除这个客户吗？",
          success: (res) => {
            if (res.confirm) {
              const index = this.customerList.findIndex(
                (customer) => customer.id === customerId
              );
              if (index > -1) {
                this.customerList.splice(index, 1);
                uni.showToast({
                  title: "删除成功",
                  icon: "success"
                });
              }
            }
          }
        });
      },
      // 显示侧滑菜单
      showSlideMenu() {
        this.slideMenuVisible = true;
      },
      // 隐藏侧滑菜单
      hideSlideMenu() {
        this.slideMenuVisible = false;
      },
      // 跳转到统计页面
      gotoChart() {
        uni.navigateTo({
          url: "/pages/statistics/statistics"
        });
      }
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_SlideMenu = vue.resolveComponent("SlideMenu");
    const _component_CustomTabBar = vue.resolveComponent("CustomTabBar");
    return vue.openBlock(), vue.createElementBlock("view", { class: "customer-container" }, [
      vue.createCommentVNode(" 头部导航 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "header-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.showSlideMenu && $options.showSlideMenu(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "👤")
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("text", { class: "header-title" }, "客户管理")
        ]),
        vue.createElementVNode("view", {
          class: "header-right",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.gotoChart && $options.gotoChart(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "📊")
        ])
      ]),
      vue.createCommentVNode(" 侧滑菜单 "),
      vue.createVNode(_component_SlideMenu, {
        visible: $data.slideMenuVisible,
        onClose: $options.hideSlideMenu
      }, null, 8, ["visible", "onClose"]),
      vue.createCommentVNode(" 客户统计 "),
      vue.createElementVNode("view", { class: "stats-section" }, [
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.customerStats.total),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "总客户")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.customerStats.vip),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "VIP客户")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.customerStats.new),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "新增客户")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.customerStats.active),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "活跃客户")
        ])
      ]),
      vue.createCommentVNode(" 客户等级筛选 "),
      vue.createElementVNode("view", { class: "level-section" }, [
        vue.createElementVNode("scroll-view", {
          class: "level-scroll",
          "scroll-x": "true"
        }, [
          vue.createElementVNode("view", { class: "level-list" }, [
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["level-item", { active: $data.currentLevel === "all" }]),
                onClick: _cache[2] || (_cache[2] = ($event) => $options.setLevel("all"))
              },
              "全部",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["level-item", { active: $data.currentLevel === "vip" }]),
                onClick: _cache[3] || (_cache[3] = ($event) => $options.setLevel("vip"))
              },
              "VIP",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["level-item", { active: $data.currentLevel === "regular" }]),
                onClick: _cache[4] || (_cache[4] = ($event) => $options.setLevel("regular"))
              },
              "普通",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["level-item", { active: $data.currentLevel === "new" }]),
                onClick: _cache[5] || (_cache[5] = ($event) => $options.setLevel("new"))
              },
              "新客户",
              2
              /* CLASS */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 客户列表 "),
      vue.createElementVNode("view", { class: "customer-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($options.filteredCustomers, (customer, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "customer-item",
              key: index,
              onClick: ($event) => $options.viewCustomerDetail(customer.id)
            }, [
              vue.createElementVNode("view", { class: "customer-avatar" }, [
                vue.createElementVNode(
                  "text",
                  { class: "avatar-text" },
                  vue.toDisplayString(customer.name.charAt(0)),
                  1
                  /* TEXT */
                ),
                customer.isVip ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "vip-badge"
                }, "VIP")) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode("view", { class: "customer-info" }, [
                vue.createElementVNode("view", { class: "customer-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "customer-name" },
                    vue.toDisplayString(customer.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["customer-level", customer.level])
                    },
                    vue.toDisplayString(customer.levelText),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createElementVNode("view", { class: "customer-details" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "customer-phone" },
                    vue.toDisplayString(customer.phone),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "customer-orders" },
                    vue.toDisplayString(customer.orderCount) + "个订单",
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "customer-stats" }, [
                  vue.createElementVNode("text", { class: "stat-item" }, [
                    vue.createElementVNode("text", { class: "stat-label" }, "消费总额:"),
                    vue.createElementVNode(
                      "text",
                      { class: "stat-value" },
                      "¥" + vue.toDisplayString(customer.totalAmount),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("text", { class: "stat-item" }, [
                    vue.createElementVNode("text", { class: "stat-label" }, "最后购买:"),
                    vue.createElementVNode(
                      "text",
                      { class: "stat-value" },
                      vue.toDisplayString(customer.lastOrderTime),
                      1
                      /* TEXT */
                    )
                  ])
                ])
              ]),
              vue.createElementVNode("view", { class: "customer-actions" }, [
                vue.createElementVNode("text", {
                  class: "action-btn edit",
                  onClick: vue.withModifiers(($event) => $options.editCustomer(customer.id), ["stop"])
                }, "编辑", 8, ["onClick"]),
                vue.createElementVNode("text", {
                  class: "action-btn delete",
                  onClick: vue.withModifiers(($event) => $options.deleteCustomer(customer.id), ["stop"])
                }, "删除", 8, ["onClick"])
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 空状态 "),
      $options.filteredCustomers.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "empty-state"
      }, [
        vue.createElementVNode("text", { class: "empty-icon" }, "👥"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无客户数据"),
        vue.createElementVNode("text", { class: "empty-tip" }, "点击下方按钮添加新客户")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 悬浮添加按钮 "),
      vue.createElementVNode("view", {
        class: "fab-button",
        onClick: _cache[6] || (_cache[6] = (...args) => $options.addCustomer && $options.addCustomer(...args))
      }, [
        vue.createElementVNode("text", { class: "fab-icon" }, "+")
      ]),
      vue.createCommentVNode(" 自定义 TabBar "),
      vue.createVNode(_component_CustomTabBar)
    ]);
  }
  const PagesCustomerCustomer = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$a], ["__scopeId", "data-v-02222c4a"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/customer/customer.vue"]]);
  const _sfc_main$9 = {
    data() {
      return {
        userInfo: {
          name: "管理员",
          phone: "138****8888",
          level: "VIP会员"
        },
        settings: {
          notifications: true,
          hideAmount: false
        }
      };
    },
    methods: {
      editProfile() {
        uni.showToast({
          title: "编辑资料功能开发中",
          icon: "none"
        });
      },
      otherLogin() {
        uni.showToast({
          title: "其他登录功能开发中",
          icon: "none"
        });
      },
      backup() {
        uni.showToast({
          title: "备份功能开发中",
          icon: "none"
        });
      },
      restore() {
        uni.showToast({
          title: "还原功能开发中",
          icon: "none"
        });
      },
      changePassword() {
        uni.showToast({
          title: "改密码功能开发中",
          icon: "none"
        });
      },
      upgradeMember() {
        uni.showToast({
          title: "开通会员功能开发中",
          icon: "none"
        });
      },
      dailyReport() {
        uni.showToast({
          title: "每日简报功能开发中",
          icon: "none"
        });
      },
      reminderMonitor() {
        uni.showToast({
          title: "提醒监控功能开发中",
          icon: "none"
        });
      },
      shareApp() {
        uni.showToast({
          title: "分享APP功能开发中",
          icon: "none"
        });
      },
      passwordlessLogin() {
        uni.showToast({
          title: "免密登录功能开发中",
          icon: "none"
        });
      },
      customExchangeRate() {
        uni.showToast({
          title: "自定义汇率功能开发中",
          icon: "none"
        });
      },
      customColors() {
        uni.showToast({
          title: "自定义颜色功能开发中",
          icon: "none"
        });
      },
      customCategories() {
        uni.showToast({
          title: "自定义商品分类功能开发中",
          icon: "none"
        });
      },
      toggleNotifications(e) {
        this.settings.notifications = e.detail.value;
        uni.showToast({
          title: this.settings.notifications ? "已开启通知" : "已关闭通知",
          icon: "none"
        });
      },
      toggleHideAmount(e) {
        this.settings.hideAmount = e.detail.value;
        uni.showToast({
          title: this.settings.hideAmount ? "已隐藏金额" : "已显示金额",
          icon: "none"
        });
      },
      contactUs() {
        uni.showToast({
          title: "联系我们功能开发中",
          icon: "none"
        });
      },
      aboutSoftware() {
        uni.showToast({
          title: "关于软件功能开发中",
          icon: "none"
        });
      },
      helpAndFeedback() {
        uni.showToast({
          title: "帮助与留言功能开发中",
          icon: "none"
        });
      },
      logout() {
        uni.showModal({
          title: "确认退出",
          content: "确定要退出登录吗？",
          success: (res) => {
            if (res.confirm) {
              uni.reLaunch({
                url: "/pages/login/login"
              });
            }
          }
        });
      }
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "profile-container" }, [
      vue.createCommentVNode(" 用户信息头部 "),
      vue.createElementVNode("view", { class: "user-header" }, [
        vue.createElementVNode("view", { class: "user-info" }, [
          vue.createElementVNode("view", { class: "user-avatar" }, [
            vue.createElementVNode(
              "text",
              { class: "avatar-text" },
              vue.toDisplayString($data.userInfo.name.charAt(0)),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "user-details" }, [
            vue.createElementVNode(
              "text",
              { class: "user-name" },
              vue.toDisplayString($data.userInfo.name),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "user-phone" },
              vue.toDisplayString($data.userInfo.phone),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "user-level" },
              vue.toDisplayString($data.userInfo.level),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "user-actions" }, [
          vue.createElementVNode("text", {
            class: "action-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.editProfile && $options.editProfile(...args))
          }, "编辑资料")
        ])
      ]),
      vue.createCommentVNode(" 基本功能 "),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "基本功能"),
        vue.createElementVNode("view", { class: "menu-list" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.otherLogin && $options.otherLogin(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "🔐"),
            vue.createElementVNode("text", { class: "menu-text" }, "其他登录"),
            vue.createElementVNode("text", { class: "menu-desc" }, "微信、微博、QQ登录"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.backup && $options.backup(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "💾"),
            vue.createElementVNode("text", { class: "menu-text" }, "备份"),
            vue.createElementVNode("text", { class: "menu-desc" }, "数据全备份"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.restore && $options.restore(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "🔄"),
            vue.createElementVNode("text", { class: "menu-text" }, "还原"),
            vue.createElementVNode("text", { class: "menu-desc" }, "按备份编号还原"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.changePassword && $options.changePassword(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "🔑"),
            vue.createElementVNode("text", { class: "menu-text" }, "改密码"),
            vue.createElementVNode("text", { class: "menu-desc" }, "修改登录密码"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.upgradeMember && $options.upgradeMember(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "👑"),
            vue.createElementVNode("text", { class: "menu-text" }, "开通会员"),
            vue.createElementVNode("text", { class: "menu-desc" }, "认证会员等级"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ])
        ])
      ]),
      vue.createCommentVNode(" 高级功能 "),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "高级功能"),
        vue.createElementVNode("view", { class: "menu-list" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[6] || (_cache[6] = (...args) => $options.dailyReport && $options.dailyReport(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "📊"),
            vue.createElementVNode("text", { class: "menu-text" }, "每日简报"),
            vue.createElementVNode("text", { class: "menu-desc" }, "查看每日情况汇总"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[7] || (_cache[7] = (...args) => $options.reminderMonitor && $options.reminderMonitor(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "🔔"),
            vue.createElementVNode("text", { class: "menu-text" }, "提醒监控"),
            vue.createElementVNode("text", { class: "menu-desc" }, "设置催账、到货提醒"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ])
        ])
      ]),
      vue.createCommentVNode(" 设置 "),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "设置"),
        vue.createElementVNode("view", { class: "menu-list" }, [
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[8] || (_cache[8] = (...args) => $options.shareApp && $options.shareApp(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "📤"),
            vue.createElementVNode("text", { class: "menu-text" }, "分享APP"),
            vue.createElementVNode("text", { class: "menu-desc" }, "分享到微信、QQ、微博"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[9] || (_cache[9] = (...args) => $options.passwordlessLogin && $options.passwordlessLogin(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "🔓"),
            vue.createElementVNode("text", { class: "menu-text" }, "免密登录"),
            vue.createElementVNode("text", { class: "menu-desc" }, "设置时间内免密码登录"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[10] || (_cache[10] = (...args) => $options.customExchangeRate && $options.customExchangeRate(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "💱"),
            vue.createElementVNode("text", { class: "menu-text" }, "自定义汇率"),
            vue.createElementVNode("text", { class: "menu-desc" }, "设置货币对人民币汇率"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[11] || (_cache[11] = (...args) => $options.customColors && $options.customColors(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "🎨"),
            vue.createElementVNode("text", { class: "menu-text" }, "自定义颜色"),
            vue.createElementVNode("text", { class: "menu-desc" }, "用不同颜色代表状态"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[12] || (_cache[12] = (...args) => $options.customCategories && $options.customCategories(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "📂"),
            vue.createElementVNode("text", { class: "menu-text" }, "自定义商品分类"),
            vue.createElementVNode("text", { class: "menu-desc" }, "设置商品多级分类"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", { class: "menu-item" }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "🔔"),
            vue.createElementVNode("text", { class: "menu-text" }, "消息通知开关"),
            vue.createElementVNode("text", { class: "menu-desc" }, "控制消息推送"),
            vue.createElementVNode("switch", {
              checked: $data.settings.notifications,
              onChange: _cache[13] || (_cache[13] = (...args) => $options.toggleNotifications && $options.toggleNotifications(...args))
            }, null, 40, ["checked"])
          ]),
          vue.createElementVNode("view", { class: "menu-item" }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "👁️"),
            vue.createElementVNode("text", { class: "menu-text" }, "隐藏金额开关"),
            vue.createElementVNode("text", { class: "menu-desc" }, "隐藏敏感金额信息"),
            vue.createElementVNode("switch", {
              checked: $data.settings.hideAmount,
              onChange: _cache[14] || (_cache[14] = (...args) => $options.toggleHideAmount && $options.toggleHideAmount(...args))
            }, null, 40, ["checked"])
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[15] || (_cache[15] = (...args) => $options.contactUs && $options.contactUs(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "📞"),
            vue.createElementVNode("text", { class: "menu-text" }, "联系我们"),
            vue.createElementVNode("text", { class: "menu-desc" }, "客服联系方式"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[16] || (_cache[16] = (...args) => $options.aboutSoftware && $options.aboutSoftware(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "ℹ️"),
            vue.createElementVNode("text", { class: "menu-text" }, "关于软件"),
            vue.createElementVNode("text", { class: "menu-desc" }, "版本信息和版权"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "menu-item",
            onClick: _cache[17] || (_cache[17] = (...args) => $options.helpAndFeedback && $options.helpAndFeedback(...args))
          }, [
            vue.createElementVNode("view", { class: "menu-icon" }, "❓"),
            vue.createElementVNode("text", { class: "menu-text" }, "帮助与留言"),
            vue.createElementVNode("text", { class: "menu-desc" }, "使用帮助和反馈"),
            vue.createElementVNode("text", { class: "menu-arrow" }, ">")
          ])
        ])
      ]),
      vue.createCommentVNode(" 退出登录 "),
      vue.createElementVNode("view", { class: "logout-section" }, [
        vue.createElementVNode("button", {
          class: "logout-btn",
          onClick: _cache[18] || (_cache[18] = (...args) => $options.logout && $options.logout(...args))
        }, "退出登录")
      ])
    ]);
  }
  const PagesProfileProfile = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$9], ["__scopeId", "data-v-dd383ca2"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/profile/profile.vue"]]);
  const _sfc_main$8 = {
    data() {
      return {
        startDate: "2024-12-01",
        endDate: "2024-12-31",
        currentTheme: "order",
        themeOptions: [
          { label: "订单主题", value: "order" },
          { label: "运单主题", value: "logistics" },
          { label: "支付单主题", value: "payment" },
          { label: "商品主题", value: "product" },
          { label: "时间主题", value: "time" }
        ],
        overview: {
          totalRevenue: 89.5,
          totalOrders: 156,
          totalProfit: 23.8,
          avgOrderValue: 5736
        },
        orderStats: [
          { label: "待确认", value: 12, percentage: 20 },
          { label: "已确认", value: 45, percentage: 75 },
          { label: "已发货", value: 89, percentage: 90 },
          { label: "已完成", value: 10, percentage: 15 }
        ],
        orderDetails: [
          { label: "按时间维度", value: "156个订单" },
          { label: "按金钱", value: "¥895,000" },
          { label: "按利润", value: "¥238,000" },
          { label: "按状态", value: "4种状态" }
        ],
        logisticsStats: [
          { icon: "🚚", label: "按时间维度", value: "89个运单" },
          { icon: "💰", label: "按金钱", value: "¥450,000" },
          { icon: "🏢", label: "按物流商", value: "5家物流商" },
          { icon: "📊", label: "按状态", value: "3种状态" }
        ],
        paymentStats: [
          { method: "微信支付", value: "45%", percentage: 45 },
          { method: "支付宝", value: "35%", percentage: 35 },
          { method: "银行卡", value: "15%", percentage: 15 },
          { method: "现金", value: "5%", percentage: 5 }
        ],
        productStats: [
          {
            name: "iPhone 15 Pro",
            category: "手机数码",
            sales: 25,
            revenue: "224,975"
          },
          {
            name: "MacBook Air M2",
            category: "电脑办公",
            sales: 15,
            revenue: "149,985"
          },
          {
            name: "AirPods Pro",
            category: "手机数码",
            sales: 30,
            revenue: "56,970"
          },
          {
            name: "iPad Air",
            category: "平板电脑",
            sales: 12,
            revenue: "57,588"
          }
        ],
        timeStats: [
          { period: "本周", orders: 45, revenue: "125,680" },
          { period: "本月", orders: 156, revenue: "895,000" },
          { period: "本季度", orders: 420, revenue: "2,350,000" },
          { period: "本年度", orders: 1680, revenue: "9,500,000" }
        ]
      };
    },
    methods: {
      onStartDateChange(e) {
        this.startDate = e.detail.value;
      },
      onEndDateChange(e) {
        this.endDate = e.detail.value;
      },
      selectTheme(theme) {
        this.currentTheme = theme;
      },
      exportReport() {
        uni.showToast({
          title: "导出报告功能开发中",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "statistics-container" }, [
      vue.createCommentVNode(" 时间筛选 "),
      vue.createElementVNode("view", { class: "filter-section" }, [
        vue.createElementVNode("view", { class: "time-filter" }, [
          vue.createElementVNode("text", { class: "filter-label" }, "时间范围："),
          vue.createElementVNode("picker", {
            mode: "date",
            value: $data.startDate,
            onChange: _cache[0] || (_cache[0] = (...args) => $options.onStartDateChange && $options.onStartDateChange(...args))
          }, [
            vue.createElementVNode(
              "text",
              { class: "date-picker" },
              vue.toDisplayString($data.startDate),
              1
              /* TEXT */
            )
          ], 40, ["value"]),
          vue.createElementVNode("text", { class: "separator" }, "至"),
          vue.createElementVNode("picker", {
            mode: "date",
            value: $data.endDate,
            onChange: _cache[1] || (_cache[1] = (...args) => $options.onEndDateChange && $options.onEndDateChange(...args))
          }, [
            vue.createElementVNode(
              "text",
              { class: "date-picker" },
              vue.toDisplayString($data.endDate),
              1
              /* TEXT */
            )
          ], 40, ["value"])
        ])
      ]),
      vue.createCommentVNode(" 统计概览 "),
      vue.createElementVNode("view", { class: "overview-section" }, [
        vue.createElementVNode("view", { class: "overview-item" }, [
          vue.createElementVNode(
            "text",
            { class: "overview-number" },
            vue.toDisplayString($data.overview.totalRevenue),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "overview-label" }, "总营收(万)")
        ]),
        vue.createElementVNode("view", { class: "overview-item" }, [
          vue.createElementVNode(
            "text",
            { class: "overview-number" },
            vue.toDisplayString($data.overview.totalOrders),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "overview-label" }, "总订单数")
        ]),
        vue.createElementVNode("view", { class: "overview-item" }, [
          vue.createElementVNode(
            "text",
            { class: "overview-number" },
            vue.toDisplayString($data.overview.totalProfit),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "overview-label" }, "总利润(万)")
        ]),
        vue.createElementVNode("view", { class: "overview-item" }, [
          vue.createElementVNode(
            "text",
            { class: "overview-number" },
            vue.toDisplayString($data.overview.avgOrderValue),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "overview-label" }, "平均订单金额")
        ])
      ]),
      vue.createCommentVNode(" 统计主题 "),
      vue.createElementVNode("view", { class: "theme-section" }, [
        vue.createElementVNode("view", { class: "theme-tabs" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.themeOptions, (theme) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: vue.normalizeClass(["theme-tab", { active: $data.currentTheme === theme.value }]),
                key: theme.value,
                onClick: ($event) => $options.selectTheme(theme.value)
              }, vue.toDisplayString(theme.label), 11, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createCommentVNode(" 订单主题 "),
        $data.currentTheme === "order" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "theme-content"
        }, [
          vue.createElementVNode("view", { class: "chart-section" }, [
            vue.createElementVNode("view", { class: "chart-title" }, "订单统计"),
            vue.createElementVNode("view", { class: "chart-container" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.orderStats, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "chart-item",
                    key: index
                  }, [
                    vue.createElementVNode(
                      "view",
                      {
                        class: "chart-bar",
                        style: vue.normalizeStyle({ height: item.percentage + "%" })
                      },
                      [
                        vue.createElementVNode(
                          "text",
                          { class: "bar-value" },
                          vue.toDisplayString(item.value),
                          1
                          /* TEXT */
                        )
                      ],
                      4
                      /* STYLE */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "chart-label" },
                      vue.toDisplayString(item.label),
                      1
                      /* TEXT */
                    )
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createElementVNode("view", { class: "stats-details" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.orderDetails, (detail, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "detail-item",
                  key: index
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "detail-label" },
                    vue.toDisplayString(detail.label),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "detail-value" },
                    vue.toDisplayString(detail.value),
                    1
                    /* TEXT */
                  )
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 运单主题 "),
        $data.currentTheme === "logistics" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "theme-content"
        }, [
          vue.createElementVNode("view", { class: "chart-section" }, [
            vue.createElementVNode("view", { class: "chart-title" }, "运单统计"),
            vue.createElementVNode("view", { class: "logistics-stats" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.logisticsStats, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "logistics-item",
                    key: index
                  }, [
                    vue.createElementVNode(
                      "view",
                      { class: "logistics-icon" },
                      vue.toDisplayString(item.icon),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "logistics-info" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "logistics-label" },
                        vue.toDisplayString(item.label),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "logistics-value" },
                        vue.toDisplayString(item.value),
                        1
                        /* TEXT */
                      )
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 支付单主题 "),
        $data.currentTheme === "payment" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "theme-content"
        }, [
          vue.createElementVNode("view", { class: "chart-section" }, [
            vue.createElementVNode("view", { class: "chart-title" }, "支付方式统计"),
            vue.createElementVNode("view", { class: "payment-stats" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.paymentStats, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "payment-item",
                    key: index
                  }, [
                    vue.createElementVNode(
                      "view",
                      { class: "payment-method" },
                      vue.toDisplayString(item.method),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "payment-bar" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: "payment-progress",
                          style: vue.normalizeStyle({ width: item.percentage + "%" })
                        },
                        null,
                        4
                        /* STYLE */
                      )
                    ]),
                    vue.createElementVNode(
                      "text",
                      { class: "payment-value" },
                      vue.toDisplayString(item.value),
                      1
                      /* TEXT */
                    )
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 商品主题 "),
        $data.currentTheme === "product" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 3,
          class: "theme-content"
        }, [
          vue.createElementVNode("view", { class: "chart-section" }, [
            vue.createElementVNode("view", { class: "chart-title" }, "商品销售统计"),
            vue.createElementVNode("view", { class: "product-stats" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.productStats, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "product-item",
                    key: index
                  }, [
                    vue.createElementVNode("view", { class: "product-info" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "product-name" },
                        vue.toDisplayString(item.name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "product-category" },
                        vue.toDisplayString(item.category),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "product-data" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "product-sales" },
                        "销量: " + vue.toDisplayString(item.sales),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "product-revenue" },
                        "营收: ¥" + vue.toDisplayString(item.revenue),
                        1
                        /* TEXT */
                      )
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 时间主题 "),
        $data.currentTheme === "time" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 4,
          class: "theme-content"
        }, [
          vue.createElementVNode("view", { class: "chart-section" }, [
            vue.createElementVNode("view", { class: "chart-title" }, "时间维度统计"),
            vue.createElementVNode("view", { class: "time-stats" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.timeStats, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "time-item",
                    key: index
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "time-period" },
                      vue.toDisplayString(item.period),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "time-data" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "time-orders" },
                        "订单: " + vue.toDisplayString(item.orders),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "time-revenue" },
                        "营收: ¥" + vue.toDisplayString(item.revenue),
                        1
                        /* TEXT */
                      )
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ]),
      vue.createCommentVNode(" 导出功能 "),
      vue.createElementVNode("view", { class: "export-section" }, [
        vue.createElementVNode("button", {
          class: "export-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.exportReport && $options.exportReport(...args))
        }, "导出报告")
      ])
    ]);
  }
  const PagesStatisticsStatistics = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$8], ["__scopeId", "data-v-fc23ec97"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/statistics/statistics.vue"]]);
  const _sfc_main$7 = {
    data() {
      return {
        searchKeyword: "",
        currentType: "all",
        searchTypes: [
          { label: "全部", value: "all" },
          { label: "订单", value: "order" },
          { label: "商品", value: "product" },
          { label: "客户", value: "customer" }
        ],
        filters: {
          namePhone: "",
          categoryPrice: "",
          date: "",
          statusIndex: 0
        },
        statusOptions: ["全部状态", "待确认", "已确认", "已发货", "已完成"],
        searchHistory: ["iPhone 15", "张三", "ORD20241201001", "MacBook Air"],
        searchResults: []
      };
    },
    methods: {
      onSearch() {
      },
      performSearch() {
        if (!this.searchKeyword.trim()) {
          uni.showToast({
            title: "请输入搜索关键词",
            icon: "none"
          });
          return;
        }
        if (!this.searchHistory.includes(this.searchKeyword)) {
          this.searchHistory.unshift(this.searchKeyword);
          if (this.searchHistory.length > 10) {
            this.searchHistory.pop();
          }
        }
        this.searchResults = this.getMockResults();
      },
      selectType(type) {
        this.currentType = type;
        this.performSearch();
      },
      onDateChange(e) {
        this.filters.date = e.detail.value;
      },
      onStatusChange(e) {
        this.filters.statusIndex = e.detail.value;
      },
      clearFilters() {
        this.filters = {
          namePhone: "",
          categoryPrice: "",
          date: "",
          statusIndex: 0
        };
      },
      applyFilters() {
        this.performSearch();
      },
      getMockResults() {
        if (this.currentType === "order" || this.currentType === "all") {
          return [
            {
              id: 1,
              orderNo: "ORD20241201001",
              customerName: "张三",
              amount: "2,580.00",
              status: "pending",
              statusText: "待确认",
              createTime: "2024-12-01 14:30"
            },
            {
              id: 2,
              orderNo: "ORD20241201002",
              customerName: "李四",
              amount: "1,890.00",
              status: "confirmed",
              statusText: "已确认",
              createTime: "2024-12-01 13:15"
            }
          ];
        } else if (this.currentType === "product") {
          return [
            {
              id: 1,
              name: "iPhone 15 Pro",
              category: "手机数码",
              price: "8,999.00",
              stock: 15,
              stockStatus: "inStock",
              stockText: "有库存"
            },
            {
              id: 2,
              name: "MacBook Air M2",
              category: "电脑办公",
              price: "9,999.00",
              stock: 5,
              stockStatus: "lowStock",
              stockText: "库存不足"
            }
          ];
        } else if (this.currentType === "customer") {
          return [
            {
              id: 1,
              name: "张三",
              phone: "138****8888",
              email: "zhangsan@example.com",
              level: "vip",
              levelText: "VIP客户"
            },
            {
              id: 2,
              name: "李四",
              phone: "139****9999",
              email: "lisi@example.com",
              level: "regular",
              levelText: "普通客户"
            }
          ];
        }
        return [];
      },
      viewOrderDetail(orderId) {
        uni.navigateTo({
          url: `/pages/order/detail?id=${orderId}`
        });
      },
      viewProductDetail(productId) {
        uni.navigateTo({
          url: `/pages/product/detail?id=${productId}`
        });
      },
      viewCustomerDetail(customerId) {
        uni.navigateTo({
          url: `/pages/customer/detail?id=${customerId}`
        });
      },
      useHistory(keyword) {
        this.searchKeyword = keyword;
        this.performSearch();
      },
      deleteHistory(index) {
        this.searchHistory.splice(index, 1);
      },
      clearHistory() {
        this.searchHistory = [];
      }
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "search-container" }, [
      vue.createCommentVNode(" 搜索栏 "),
      vue.createElementVNode("view", { class: "search-header" }, [
        vue.createElementVNode("view", { class: "search-bar" }, [
          vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "search-input",
              placeholder: "搜索订单、商品、客户...",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.searchKeyword = $event),
              onInput: _cache[1] || (_cache[1] = (...args) => $options.onSearch && $options.onSearch(...args)),
              onConfirm: _cache[2] || (_cache[2] = (...args) => $options.performSearch && $options.performSearch(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.searchKeyword]
          ]),
          vue.createElementVNode("text", {
            class: "search-btn",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.performSearch && $options.performSearch(...args))
          }, "搜索")
        ])
      ]),
      vue.createCommentVNode(" 搜索类型选择 "),
      vue.createElementVNode("view", { class: "search-types" }, [
        vue.createElementVNode("view", { class: "type-tabs" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.searchTypes, (type) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: vue.normalizeClass(["type-tab", { active: $data.currentType === type.value }]),
                key: type.value,
                onClick: ($event) => $options.selectType(type.value)
              }, vue.toDisplayString(type.label), 11, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 高级筛选 "),
      vue.createElementVNode("view", { class: "filter-section" }, [
        vue.createElementVNode("view", { class: "filter-row" }, [
          vue.createElementVNode("view", { class: "filter-item" }, [
            vue.createElementVNode("text", { class: "filter-label" }, "按名字/电话"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "filter-input",
                placeholder: "输入姓名或电话",
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.filters.namePhone = $event)
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.filters.namePhone]
            ])
          ]),
          vue.createElementVNode("view", { class: "filter-item" }, [
            vue.createElementVNode("text", { class: "filter-label" }, "按类别/价格"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "filter-input",
                placeholder: "输入类别或价格",
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.filters.categoryPrice = $event)
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.filters.categoryPrice]
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "filter-row" }, [
          vue.createElementVNode("view", { class: "filter-item" }, [
            vue.createElementVNode("text", { class: "filter-label" }, "按时间"),
            vue.createElementVNode("picker", {
              mode: "date",
              value: $data.filters.date,
              onChange: _cache[6] || (_cache[6] = (...args) => $options.onDateChange && $options.onDateChange(...args))
            }, [
              vue.createElementVNode(
                "text",
                { class: "date-picker" },
                vue.toDisplayString($data.filters.date || "选择日期"),
                1
                /* TEXT */
              )
            ], 40, ["value"])
          ]),
          vue.createElementVNode("view", { class: "filter-item" }, [
            vue.createElementVNode("text", { class: "filter-label" }, "按状态"),
            vue.createElementVNode("picker", {
              range: $data.statusOptions,
              value: $data.filters.statusIndex,
              onChange: _cache[7] || (_cache[7] = (...args) => $options.onStatusChange && $options.onStatusChange(...args))
            }, [
              vue.createElementVNode(
                "text",
                { class: "status-picker" },
                vue.toDisplayString($data.statusOptions[$data.filters.statusIndex] || "选择状态"),
                1
                /* TEXT */
              )
            ], 40, ["range", "value"])
          ])
        ]),
        vue.createElementVNode("view", { class: "filter-actions" }, [
          vue.createElementVNode("button", {
            class: "filter-btn clear",
            onClick: _cache[8] || (_cache[8] = (...args) => $options.clearFilters && $options.clearFilters(...args))
          }, "清除筛选"),
          vue.createElementVNode("button", {
            class: "filter-btn apply",
            onClick: _cache[9] || (_cache[9] = (...args) => $options.applyFilters && $options.applyFilters(...args))
          }, "应用筛选")
        ])
      ]),
      vue.createCommentVNode(" 搜索结果 "),
      $data.searchResults.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "search-results"
      }, [
        vue.createElementVNode("view", { class: "results-header" }, [
          vue.createElementVNode("text", { class: "results-title" }, "搜索结果"),
          vue.createElementVNode(
            "text",
            { class: "results-count" },
            "共找到 " + vue.toDisplayString($data.searchResults.length) + " 条结果",
            1
            /* TEXT */
          )
        ]),
        vue.createCommentVNode(" 订单结果 "),
        $data.currentType === "order" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "result-section"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.searchResults, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "result-item",
                key: item.id,
                onClick: ($event) => $options.viewOrderDetail(item.id)
              }, [
                vue.createElementVNode("view", { class: "result-icon" }, "📦"),
                vue.createElementVNode("view", { class: "result-content" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "result-title" },
                    vue.toDisplayString(item.orderNo),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "result-desc" },
                    vue.toDisplayString(item.customerName) + " - ¥" + vue.toDisplayString(item.amount),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "result-time" },
                    vue.toDisplayString(item.createTime),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  {
                    class: vue.normalizeClass(["result-status", item.status])
                  },
                  vue.toDisplayString(item.statusText),
                  3
                  /* TEXT, CLASS */
                )
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 商品结果 "),
        $data.currentType === "product" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "result-section"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.searchResults, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "result-item",
                key: item.id,
                onClick: ($event) => $options.viewProductDetail(item.id)
              }, [
                vue.createElementVNode("view", { class: "result-icon" }, "📦"),
                vue.createElementVNode("view", { class: "result-content" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "result-title" },
                    vue.toDisplayString(item.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "result-desc" },
                    vue.toDisplayString(item.category) + " - ¥" + vue.toDisplayString(item.price),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "result-stock" },
                    "库存: " + vue.toDisplayString(item.stock),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  {
                    class: vue.normalizeClass(["result-status", item.stockStatus])
                  },
                  vue.toDisplayString(item.stockText),
                  3
                  /* TEXT, CLASS */
                )
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 客户结果 "),
        $data.currentType === "customer" ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "result-section"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.searchResults, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "result-item",
                key: item.id,
                onClick: ($event) => $options.viewCustomerDetail(item.id)
              }, [
                vue.createElementVNode("view", { class: "result-icon" }, "👥"),
                vue.createElementVNode("view", { class: "result-content" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "result-title" },
                    vue.toDisplayString(item.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "result-desc" },
                    vue.toDisplayString(item.phone) + " - " + vue.toDisplayString(item.email),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "result-level" },
                    vue.toDisplayString(item.levelText),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  {
                    class: vue.normalizeClass(["result-status", item.level])
                  },
                  vue.toDisplayString(item.levelText),
                  3
                  /* TEXT, CLASS */
                )
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true)
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 空状态 "),
      $data.searchKeyword && $data.searchResults.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-state"
      }, [
        vue.createElementVNode("text", { class: "empty-icon" }, "🔍"),
        vue.createElementVNode("text", { class: "empty-text" }, "未找到相关结果"),
        vue.createElementVNode("text", { class: "empty-desc" }, "请尝试其他关键词或调整筛选条件")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 搜索历史 "),
      !$data.searchKeyword && $data.searchHistory.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "search-history"
      }, [
        vue.createElementVNode("view", { class: "history-header" }, [
          vue.createElementVNode("text", { class: "history-title" }, "搜索历史"),
          vue.createElementVNode("text", {
            class: "history-clear",
            onClick: _cache[10] || (_cache[10] = (...args) => $options.clearHistory && $options.clearHistory(...args))
          }, "清除")
        ]),
        vue.createElementVNode("view", { class: "history-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.searchHistory, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "history-item",
                key: index,
                onClick: ($event) => $options.useHistory(item)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "history-text" },
                  vue.toDisplayString(item),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", {
                  class: "history-delete",
                  onClick: vue.withModifiers(($event) => $options.deleteHistory(index), ["stop"])
                }, "×", 8, ["onClick"])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesSearchSearch = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$7], ["__scopeId", "data-v-c10c040c"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/search/search.vue"]]);
  const _sfc_main$6 = {
    data() {
      return {
        orderInfo: {
          orderNo: "ORD20241201001",
          status: "confirmed",
          statusText: "已确认",
          customerName: "张三",
          customerPhone: "138****8888",
          customerAddress: "北京市朝阳区xxx街道xxx小区",
          customerLevel: "VIP客户",
          products: [
            {
              name: "iPhone 15 Pro",
              category: "手机数码",
              price: "8,999.00",
              quantity: 1,
              total: "8,999.00",
              image: "/static/logo.png"
            },
            {
              name: "AirPods Pro",
              category: "手机数码",
              price: "1,899.00",
              quantity: 1,
              total: "1,899.00",
              image: "/static/logo.png"
            }
          ],
          subtotal: "10,898.00",
          shipping: "0.00",
          discount: "500.00",
          total: "10,398.00",
          logistics: {
            company: "顺丰速运",
            trackingNo: "SF1234567890",
            status: "运输中"
          },
          remark: "请尽快发货，客户急需"
        },
        timeline: [
          {
            icon: "📝",
            title: "订单创建",
            time: "2024-12-01 14:30",
            active: true
          },
          {
            icon: "💰",
            title: "支付完成",
            time: "2024-12-01 14:35",
            active: true
          },
          {
            icon: "✅",
            title: "订单确认",
            time: "2024-12-01 15:00",
            active: true
          },
          {
            icon: "📦",
            title: "商品出库",
            time: "2024-12-01 16:00",
            active: true
          },
          {
            icon: "🚚",
            title: "物流发货",
            time: "2024-12-01 17:00",
            active: true
          },
          {
            icon: "📮",
            title: "签收完成",
            time: "待签收",
            active: false
          }
        ]
      };
    },
    onLoad(options) {
      if (options.id) {
        this.loadOrderDetail(options.id);
      }
    },
    methods: {
      loadOrderDetail(orderId) {
        formatAppLog("log", "at pages/order/detail.vue:240", "加载订单详情:", orderId);
      },
      generateReceipt() {
        uni.showToast({
          title: "生成小票功能开发中",
          icon: "none"
        });
      },
      forwardReceipt() {
        uni.showToast({
          title: "转发小票功能开发中",
          icon: "none"
        });
      },
      trackLogistics() {
        uni.showToast({
          title: "跟踪物流功能开发中",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "order-detail-container" }, [
      vue.createCommentVNode(" 订单状态 "),
      vue.createElementVNode("view", { class: "status-section" }, [
        vue.createElementVNode("view", { class: "status-header" }, [
          vue.createElementVNode(
            "text",
            { class: "order-number" },
            vue.toDisplayString($data.orderInfo.orderNo),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["order-status", $data.orderInfo.status])
            },
            vue.toDisplayString($data.orderInfo.statusText),
            3
            /* TEXT, CLASS */
          )
        ]),
        vue.createElementVNode("view", { class: "status-timeline" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.timeline, (item, index) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  class: vue.normalizeClass(["timeline-item", { active: item.active }]),
                  key: index
                },
                [
                  vue.createElementVNode(
                    "view",
                    { class: "timeline-icon" },
                    vue.toDisplayString(item.icon),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "timeline-content" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "timeline-title" },
                      vue.toDisplayString(item.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "timeline-time" },
                      vue.toDisplayString(item.time),
                      1
                      /* TEXT */
                    )
                  ])
                ],
                2
                /* CLASS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 客户信息 "),
      vue.createElementVNode("view", { class: "info-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "客户信息"),
        vue.createElementVNode("view", { class: "info-content" }, [
          vue.createElementVNode("view", { class: "info-item" }, [
            vue.createElementVNode("text", { class: "info-label" }, "客户姓名"),
            vue.createElementVNode(
              "text",
              { class: "info-value" },
              vue.toDisplayString($data.orderInfo.customerName),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "info-item" }, [
            vue.createElementVNode("text", { class: "info-label" }, "联系电话"),
            vue.createElementVNode(
              "text",
              { class: "info-value" },
              vue.toDisplayString($data.orderInfo.customerPhone),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "info-item" }, [
            vue.createElementVNode("text", { class: "info-label" }, "客户地址"),
            vue.createElementVNode(
              "text",
              { class: "info-value" },
              vue.toDisplayString($data.orderInfo.customerAddress),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "info-item" }, [
            vue.createElementVNode("text", { class: "info-label" }, "客户等级"),
            vue.createElementVNode(
              "text",
              { class: "info-value" },
              vue.toDisplayString($data.orderInfo.customerLevel),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 订单商品 "),
      vue.createElementVNode("view", { class: "products-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "订单商品"),
        vue.createElementVNode("view", { class: "product-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.orderInfo.products, (product, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "product-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "product-image" }, [
                  vue.createElementVNode("image", {
                    src: product.image,
                    mode: "aspectFill",
                    class: "product-img"
                  }, null, 8, ["src"])
                ]),
                vue.createElementVNode("view", { class: "product-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "product-name" },
                    vue.toDisplayString(product.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "product-category" },
                    vue.toDisplayString(product.category),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "product-price-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "product-price" },
                      "¥" + vue.toDisplayString(product.price),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "product-quantity" },
                      "×" + vue.toDisplayString(product.quantity),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "product-total" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "total-amount" },
                    "¥" + vue.toDisplayString(product.total),
                    1
                    /* TEXT */
                  )
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 订单金额 "),
      vue.createElementVNode("view", { class: "amount-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "订单金额"),
        vue.createElementVNode("view", { class: "amount-content" }, [
          vue.createElementVNode("view", { class: "amount-item" }, [
            vue.createElementVNode("text", { class: "amount-label" }, "商品总额"),
            vue.createElementVNode(
              "text",
              { class: "amount-value" },
              "¥" + vue.toDisplayString($data.orderInfo.subtotal),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "amount-item" }, [
            vue.createElementVNode("text", { class: "amount-label" }, "运费"),
            vue.createElementVNode(
              "text",
              { class: "amount-value" },
              "¥" + vue.toDisplayString($data.orderInfo.shipping),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "amount-item" }, [
            vue.createElementVNode("text", { class: "amount-label" }, "优惠金额"),
            vue.createElementVNode(
              "text",
              { class: "amount-value discount" },
              "-¥" + vue.toDisplayString($data.orderInfo.discount),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "amount-item total" }, [
            vue.createElementVNode("text", { class: "amount-label" }, "订单总额"),
            vue.createElementVNode(
              "text",
              { class: "amount-value" },
              "¥" + vue.toDisplayString($data.orderInfo.total),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 物流信息 "),
      vue.createElementVNode("view", { class: "logistics-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "物流信息"),
        vue.createElementVNode("view", { class: "logistics-content" }, [
          vue.createElementVNode("view", { class: "logistics-item" }, [
            vue.createElementVNode("text", { class: "logistics-label" }, "物流公司"),
            vue.createElementVNode(
              "text",
              { class: "logistics-value" },
              vue.toDisplayString($data.orderInfo.logistics.company),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "logistics-item" }, [
            vue.createElementVNode("text", { class: "logistics-label" }, "运单号"),
            vue.createElementVNode(
              "text",
              { class: "logistics-value" },
              vue.toDisplayString($data.orderInfo.logistics.trackingNo),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "logistics-item" }, [
            vue.createElementVNode("text", { class: "logistics-label" }, "物流状态"),
            vue.createElementVNode(
              "text",
              { class: "logistics-value" },
              vue.toDisplayString($data.orderInfo.logistics.status),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 备注信息 "),
      $data.orderInfo.remark ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "remark-section"
      }, [
        vue.createElementVNode("view", { class: "section-title" }, "备注信息"),
        vue.createElementVNode("view", { class: "remark-content" }, [
          vue.createElementVNode(
            "text",
            { class: "remark-text" },
            vue.toDisplayString($data.orderInfo.remark),
            1
            /* TEXT */
          )
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 操作按钮 "),
      vue.createElementVNode("view", { class: "action-section" }, [
        vue.createElementVNode("view", { class: "action-buttons" }, [
          vue.createElementVNode("button", {
            class: "action-btn primary",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.generateReceipt && $options.generateReceipt(...args))
          }, " 生成小票 "),
          vue.createElementVNode("button", {
            class: "action-btn secondary",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.forwardReceipt && $options.forwardReceipt(...args))
          }, " 转发小票 "),
          vue.createElementVNode("button", {
            class: "action-btn secondary",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.trackLogistics && $options.trackLogistics(...args))
          }, " 跟踪物流 ")
        ])
      ])
    ]);
  }
  const PagesOrderDetail = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$6], ["__scopeId", "data-v-6b23c96c"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/order/detail.vue"]]);
  const _sfc_main$5 = {
    data() {
      return {
        productInfo: {
          name: "iPhone 15 Pro",
          category: "手机",
          price: "8,999",
          stock: 15,
          image: "/static/logo.png",
          stockStatus: "normal",
          stockText: "有库存",
          productNo: "IP15P001",
          brand: "Apple",
          model: "iPhone 15 Pro",
          color: "深空黑色",
          size: "6.1英寸",
          weight: "187g",
          sales: {
            monthly: 8,
            total: 156,
            amount: "1,403,844",
            profitRate: 25.6
          },
          inventoryRecords: [
            {
              type: "入库",
              time: "2024-12-01 14:30",
              quantity: 20,
              operator: "张三",
              remark: "新货入库"
            },
            {
              type: "出库",
              time: "2024-11-30 16:45",
              quantity: -3,
              operator: "李四",
              remark: "销售出库"
            },
            {
              type: "入库",
              time: "2024-11-28 10:20",
              quantity: 15,
              operator: "王五",
              remark: "补货入库"
            },
            {
              type: "出库",
              time: "2024-11-25 15:30",
              quantity: -5,
              operator: "赵六",
              remark: "销售出库"
            }
          ]
        }
      };
    },
    onLoad(options) {
      if (options.id) {
        this.loadProductDetail(options.id);
      }
    },
    methods: {
      loadProductDetail(productId) {
        formatAppLog("log", "at pages/product/detail.vue:189", "加载商品详情:", productId);
      },
      editProduct() {
        uni.showToast({
          title: "编辑商品功能开发中",
          icon: "none"
        });
      },
      adjustStock() {
        uni.showToast({
          title: "调整库存功能开发中",
          icon: "none"
        });
      },
      deleteProduct() {
        uni.showModal({
          title: "确认删除",
          content: "确定要删除这个商品吗？",
          success: (res) => {
            if (res.confirm) {
              uni.showToast({
                title: "删除成功",
                icon: "success"
              });
              setTimeout(() => {
                uni.navigateBack();
              }, 1500);
            }
          }
        });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "product-detail-container" }, [
      vue.createCommentVNode(" 商品图片 "),
      vue.createElementVNode("view", { class: "product-image-section" }, [
        vue.createElementVNode("image", {
          class: "product-image",
          src: $data.productInfo.image,
          mode: "aspectFill"
        }, null, 8, ["src"]),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["stock-badge", $data.productInfo.stockStatus])
          },
          vue.toDisplayString($data.productInfo.stockText),
          3
          /* TEXT, CLASS */
        )
      ]),
      vue.createCommentVNode(" 商品基本信息 "),
      vue.createElementVNode("view", { class: "product-info-section" }, [
        vue.createElementVNode(
          "text",
          { class: "product-name" },
          vue.toDisplayString($data.productInfo.name),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "product-category" },
          vue.toDisplayString($data.productInfo.category),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "product-price" }, [
          vue.createElementVNode("text", { class: "price-symbol" }, "¥"),
          vue.createElementVNode(
            "text",
            { class: "price-value" },
            vue.toDisplayString($data.productInfo.price),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "product-stock" }, [
          vue.createElementVNode("text", { class: "stock-label" }, "库存数量:"),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["stock-value", $data.productInfo.stockStatus])
            },
            vue.toDisplayString($data.productInfo.stock),
            3
            /* TEXT, CLASS */
          )
        ])
      ]),
      vue.createCommentVNode(" 商品详细信息 "),
      vue.createElementVNode("view", { class: "detail-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "详细信息"),
        vue.createElementVNode("view", { class: "detail-content" }, [
          vue.createElementVNode("view", { class: "detail-item" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "商品编号"),
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.productInfo.productNo),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "detail-item" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "品牌"),
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.productInfo.brand),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "detail-item" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "型号"),
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.productInfo.model),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "detail-item" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "颜色"),
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.productInfo.color),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "detail-item" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "尺寸"),
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.productInfo.size),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "detail-item" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "重量"),
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.productInfo.weight),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 销售统计 "),
      vue.createElementVNode("view", { class: "sales-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "销售统计"),
        vue.createElementVNode("view", { class: "sales-content" }, [
          vue.createElementVNode("view", { class: "sales-item" }, [
            vue.createElementVNode("text", { class: "sales-label" }, "本月销量"),
            vue.createElementVNode(
              "text",
              { class: "sales-value" },
              vue.toDisplayString($data.productInfo.sales.monthly),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "sales-item" }, [
            vue.createElementVNode("text", { class: "sales-label" }, "总销量"),
            vue.createElementVNode(
              "text",
              { class: "sales-value" },
              vue.toDisplayString($data.productInfo.sales.total),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "sales-item" }, [
            vue.createElementVNode("text", { class: "sales-label" }, "销售额"),
            vue.createElementVNode(
              "text",
              { class: "sales-value" },
              "¥" + vue.toDisplayString($data.productInfo.sales.amount),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "sales-item" }, [
            vue.createElementVNode("text", { class: "sales-label" }, "利润率"),
            vue.createElementVNode(
              "text",
              { class: "sales-value" },
              vue.toDisplayString($data.productInfo.sales.profitRate) + "%",
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 库存记录 "),
      vue.createElementVNode("view", { class: "inventory-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "库存记录"),
        vue.createElementVNode("view", { class: "inventory-content" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.productInfo.inventoryRecords, (record, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "inventory-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "record-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "record-type" },
                    vue.toDisplayString(record.type),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "record-time" },
                    vue.toDisplayString(record.time),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "record-details" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "record-quantity" },
                    vue.toDisplayString(record.quantity > 0 ? "+" : "") + vue.toDisplayString(record.quantity),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "record-operator" },
                    vue.toDisplayString(record.operator),
                    1
                    /* TEXT */
                  )
                ]),
                record.remark ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "record-remark"
                  },
                  vue.toDisplayString(record.remark),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 操作按钮 "),
      vue.createElementVNode("view", { class: "action-section" }, [
        vue.createElementVNode("view", { class: "action-buttons" }, [
          vue.createElementVNode("button", {
            class: "action-btn edit",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.editProduct && $options.editProduct(...args))
          }, "编辑商品"),
          vue.createElementVNode("button", {
            class: "action-btn adjust",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.adjustStock && $options.adjustStock(...args))
          }, "调整库存"),
          vue.createElementVNode("button", {
            class: "action-btn delete",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.deleteProduct && $options.deleteProduct(...args))
          }, " 删除商品 ")
        ])
      ])
    ]);
  }
  const PagesProductDetail = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$5], ["__scopeId", "data-v-acf502d9"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/product/detail.vue"]]);
  const _sfc_main$4 = {
    data() {
      return {
        formData: {
          name: "",
          code: "",
          description: "",
          category_Id: "",
          costPrice: "",
          salePrice: "",
          marketPrice: "",
          stock: "",
          stockWarning: "",
          brand: "",
          specification: "",
          unit: "",
          weight: "",
          images: []
        },
        // 仅用于界面展示的扩展字段（不参与接口入参）
        extraForm: {
          purchasePlace: "",
          expireAdvanceDays: "",
          needVisit: false,
          visitReminderDays: "",
          remark: ""
        },
        // 从商品列表页面传递过来的分类信息
        cate1: "",
        cate2: "",
        cate3: "",
        // 采购地选项
        purchasePlaceOptions: ["中国", "韩国", "日本", "美国", "东南亚", "欧洲", "澳洲", "非洲", "其他"]
      };
    },
    onLoad(options) {
      this.cate1 = options.cate1 || "";
      this.cate2 = options.cate2 || "";
      this.cate3 = options.cate3 || "";
      this.category_id = options.category_id || "";
    },
    computed: {
      categoryPathText() {
        return [this.cate1, this.cate2, this.cate3].filter(Boolean).join(" > ");
      }
    },
    methods: {
      toggleNeedVisit() {
        this.extraForm.needVisit = !this.extraForm.needVisit;
      },
      // 选择图片
      chooseImage() {
        uni.chooseImage({
          count: 5 - this.formData.images.length,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            this.addLocalImages(res.tempFilePaths);
            this.uploadImages(res.tempFilePaths);
          }
        });
      },
      // 添加本地图片到显示列表
      addLocalImages(tempFilePaths) {
        for (let i = 0; i < tempFilePaths.length; i++) {
          this.formData.images.push({ url: tempFilePaths[i], isLocal: true, uploading: true });
        }
        this.$forceUpdate();
      },
      // 上传图片
      async uploadImages(tempFilePaths) {
        try {
          for (let i = 0; i < tempFilePaths.length; i++) {
            const filePath = tempFilePaths[i];
            const imageIndex = this.formData.images.findIndex((img) => img.url === filePath);
            if (imageIndex === -1)
              continue;
            try {
              const uploadResult = await new Promise((resolve, reject) => {
                uni.uploadFile({
                  url: `${apiService.configUrl}/goods/uploadImg`,
                  filePath,
                  name: "file",
                  header: { "Content-Type": "multipart/form-data" },
                  success: (res) => {
                    try {
                      resolve(JSON.parse(res.data));
                    } catch (e) {
                      reject(new Error("解析响应失败"));
                    }
                  },
                  fail: (error) => reject(error)
                });
              });
              if (uploadResult && uploadResult.code === 200 && uploadResult.data) {
                this.formData.images[imageIndex] = {
                  url: uploadResult.data.url || uploadResult.data,
                  isLocal: false,
                  uploading: false
                };
              } else {
                this.formData.images[imageIndex].uploading = false;
              }
            } catch (error) {
              this.formData.images[imageIndex].uploading = false;
            }
          }
          uni.showToast({ title: "图片处理完成", icon: "success" });
        } catch (error) {
          uni.showToast({ title: "部分图片上传失败", icon: "none" });
        }
      },
      // 删除图片
      deleteImage(index) {
        this.formData.images.splice(index, 1);
      },
      onAddSpec() {
        uni.showToast({ title: "规格功能待扩展", icon: "none" });
      },
      // 验证表单（仅校验与接口相关字段）
      validateForm() {
        if (!this.formData.name.trim()) {
          uni.showToast({ title: "请输入商品名称", icon: "none" });
          return false;
        }
        return true;
      },
      // 保存商品（保持接口入参不变）
      async saveProduct() {
        if (!this.validateForm())
          return;
        uni.showLoading({ title: "保存中..." });
        try {
          const imageUrls = this.formData.images.map((img) => img.url);
          const goodsBean = {
            name: this.formData.name,
            code: this.formData.code,
            description: this.formData.description,
            costPrice: this.formData.costPrice ? parseFloat(this.formData.costPrice) : void 0,
            salePrice: this.formData.salePrice ? parseFloat(this.formData.salePrice) : void 0,
            marketPrice: this.formData.marketPrice ? parseFloat(this.formData.marketPrice) : 0,
            stock: this.formData.stock ? parseInt(this.formData.stock) : void 0,
            stockWarning: this.formData.stockWarning ? parseInt(this.formData.stockWarning) : 0,
            brand: this.formData.brand,
            specification: this.formData.specification,
            unit: this.formData.unit,
            weight: this.formData.weight ? parseFloat(this.formData.weight) : 0,
            category_id: this.category_id
          };
          const productData = { goodsBean, listGoodsSpec: [], listGoodsImg: imageUrls };
          const response = await apiService.addProduct(productData);
          uni.hideLoading();
          if (response && response.code === 1) {
            uni.showToast({ title: "商品添加成功", icon: "success" });
            setTimeout(() => {
              uni.navigateBack({
                delta: 1
              });
            }, 1200);
          } else {
            uni.showToast({ title: (response == null ? void 0 : response.message) || "保存失败", icon: "none" });
          }
        } catch (error) {
          uni.hideLoading();
          uni.showToast({ title: "保存失败", icon: "none" });
        }
      },
      // 返回上一页
      // 打开采购地选择器
      openPurchasePlacePicker() {
        uni.showActionSheet({
          itemList: this.purchasePlaceOptions,
          success: ({ tapIndex }) => {
            this.extraForm.purchasePlace = this.purchasePlaceOptions[tapIndex];
          }
        });
      },
      goBack() {
        uni.navigateBack();
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "add-product-page" }, [
      vue.createCommentVNode(" 顶部导航 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "header-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "‹")
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("text", { class: "header-title" }, "新商品")
        ]),
        vue.createElementVNode("view", {
          class: "header-right",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.saveProduct && $options.saveProduct(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "✓")
        ])
      ]),
      vue.createElementVNode("scroll-view", {
        class: "page-scroll",
        "scroll-y": "true"
      }, [
        vue.createCommentVNode(" 必填内容 "),
        vue.createElementVNode("view", { class: "section-divider" }, "必填内容"),
        vue.createElementVNode("view", { class: "list-card" }, [
          vue.createElementVNode("view", { class: "list-item-row" }, [
            vue.createElementVNode("text", { class: "row-label" }, "商品名称："),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "row-input",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.formData.name = $event),
                placeholder: "请输入商品名称",
                maxlength: "50"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.formData.name]
            ])
          ]),
          vue.createElementVNode("view", { class: "list-item-row" }, [
            vue.createElementVNode("text", { class: "row-label" }, "品牌"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "row-input",
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.formData.brand = $event),
                placeholder: "请输入品牌"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.formData.brand]
            ])
          ]),
          vue.createElementVNode("view", { class: "list-item-row" }, [
            vue.createElementVNode("text", { class: "row-label" }, "分类"),
            vue.createElementVNode("view", { class: "row-value" }, [
              vue.createElementVNode(
                "text",
                { class: "value-text" },
                vue.toDisplayString($options.categoryPathText || "未设置"),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", {
            class: "list-item-row selectable",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.openPurchasePlacePicker && $options.openPurchasePlacePicker(...args))
          }, [
            vue.createElementVNode("text", { class: "row-label" }, "商品采购地"),
            vue.createElementVNode("view", { class: "row-value" }, [
              vue.createElementVNode(
                "text",
                { class: "value-text" },
                vue.toDisplayString($data.extraForm.purchasePlace || "请选择采购地"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ])
          ])
        ]),
        vue.createCommentVNode(" 选填内容 "),
        vue.createElementVNode("view", { class: "section-divider" }, "选填内容"),
        vue.createElementVNode("view", { class: "list-card" }, [
          vue.createElementVNode("view", { class: "list-item-row" }, [
            vue.createElementVNode("text", { class: "row-label" }, "过期提醒提前天数"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "row-input",
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.extraForm.expireAdvanceDays = $event),
                type: "number",
                placeholder: "如：7"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                vue.vModelText,
                $data.extraForm.expireAdvanceDays,
                void 0,
                { number: true }
              ]
            ])
          ]),
          vue.createElementVNode("view", {
            class: "list-item-row selectable",
            onClick: _cache[6] || (_cache[6] = (...args) => $options.toggleNeedVisit && $options.toggleNeedVisit(...args))
          }, [
            vue.createElementVNode("text", { class: "row-label" }, "是否需要回访"),
            vue.createElementVNode("view", { class: "row-value" }, [
              vue.createElementVNode(
                "text",
                { class: "value-text" },
                vue.toDisplayString($data.extraForm.needVisit ? "需要" : "不需要"),
                1
                /* TEXT */
              ),
              vue.createElementVNode("text", { class: "arrow" }, "›")
            ])
          ]),
          $data.extraForm.needVisit ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "list-item-row"
          }, [
            vue.createElementVNode("text", { class: "row-label" }, "回访提醒天数(货到几天)"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "row-input",
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.extraForm.visitReminderDays = $event),
                type: "number",
                placeholder: "如：3"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [
                vue.vModelText,
                $data.extraForm.visitReminderDays,
                void 0,
                { number: true }
              ]
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "list-item-row" }, [
            vue.createElementVNode("text", { class: "row-label" }, "宣传语"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "row-input",
                "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $data.formData.description = $event),
                placeholder: "用于商品展示的简短文案",
                maxlength: "200"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.formData.description]
            ])
          ]),
          vue.createElementVNode("view", { class: "list-item-row" }, [
            vue.createElementVNode("text", { class: "row-label" }, "备注"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "row-input",
                "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $data.extraForm.remark = $event),
                placeholder: "可填写补充信息",
                maxlength: "200"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.extraForm.remark]
            ])
          ])
        ]),
        vue.createCommentVNode(" 添加规格条 "),
        vue.createElementVNode("view", { class: "specs-bar" }, [
          vue.createElementVNode("text", { class: "specs-label" }, "添加规格："),
          vue.createElementVNode("view", {
            class: "add-spec-btn",
            onClick: _cache[10] || (_cache[10] = (...args) => $options.onAddSpec && $options.onAddSpec(...args))
          }, [
            vue.createElementVNode("text", { class: "plus" }, "＋"),
            vue.createElementVNode("text", { class: "btn-text" }, "添加规格")
          ])
        ]),
        vue.createCommentVNode(" 图片上传（保持原逻辑） "),
        vue.createElementVNode("view", { class: "image-upload-card" }, [
          vue.createElementVNode("view", { class: "image-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.formData.images, (image, index) => {
                return vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: index },
                  [
                    image && image.url ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "image-item"
                    }, [
                      vue.createElementVNode("image", {
                        class: "uploaded-image",
                        src: image.url,
                        mode: "aspectFill"
                      }, null, 8, ["src"]),
                      image.uploading ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "upload-status"
                      }, [
                        vue.createElementVNode("text", { class: "status-text" }, "上传中...")
                      ])) : vue.createCommentVNode("v-if", true),
                      vue.createElementVNode("view", {
                        class: "delete-btn",
                        onClick: ($event) => $options.deleteImage(index)
                      }, [
                        vue.createElementVNode("text", { class: "delete-icon" }, "×")
                      ], 8, ["onClick"])
                    ])) : vue.createCommentVNode("v-if", true)
                  ],
                  64
                  /* STABLE_FRAGMENT */
                );
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            $data.formData.images.length < 5 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "upload-btn",
              onClick: _cache[11] || (_cache[11] = (...args) => $options.chooseImage && $options.chooseImage(...args))
            }, [
              vue.createElementVNode("text", { class: "upload-icon" }, "＋"),
              vue.createElementVNode("text", { class: "upload-text" }, "添加图片")
            ])) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("text", { class: "upload-tip" }, "最多上传5张图片")
        ]),
        vue.createCommentVNode(" 分类选择器已移除 "),
        vue.createCommentVNode(" 分类信息从商品列表页面传递过来 ")
      ])
    ]);
  }
  const PagesProductAdd = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$4], ["__scopeId", "data-v-53c69cd1"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/product/add.vue"]]);
  const _sfc_main$3 = {
    data() {
      return {
        customerInfo: {
          name: "张三",
          phone: "138****8888",
          email: "zhangsan@example.com",
          address: "北京市朝阳区xxx街道xxx小区",
          level: "vip",
          levelText: "VIP客户",
          isVip: true,
          registerTime: "2023-01-15",
          lastOrderTime: "2024-12-01",
          stats: {
            orderCount: 15,
            totalAmount: 25.68,
            avgOrderValue: 1712,
            lastOrderDays: 5
          },
          recentOrders: [
            {
              id: 1,
              orderNo: "ORD20241201001",
              amount: "2,580.00",
              status: "confirmed",
              statusText: "已确认",
              createTime: "2024-12-01 14:30"
            },
            {
              id: 2,
              orderNo: "ORD20241125001",
              amount: "1,890.00",
              status: "completed",
              statusText: "已完成",
              createTime: "2024-11-25 10:15"
            },
            {
              id: 3,
              orderNo: "ORD20241120001",
              amount: "3,420.00",
              status: "completed",
              statusText: "已完成",
              createTime: "2024-11-20 16:45"
            }
          ],
          visitRecords: [
            {
              type: "电话回访",
              time: "2024-12-01 15:30",
              description: "客户对iPhone 15 Pro非常满意，表示会推荐给朋友",
              result: "positive",
              resultText: "正面反馈"
            },
            {
              type: "微信回访",
              time: "2024-11-25 14:20",
              description: "询问客户对MacBook Air的使用体验",
              result: "positive",
              resultText: "正面反馈"
            },
            {
              type: "上门回访",
              time: "2024-11-20 10:00",
              description: "客户反映AirPods Pro音质很好，但希望有更多颜色选择",
              result: "neutral",
              resultText: "中性反馈"
            }
          ]
        }
      };
    },
    onLoad(options) {
      if (options.id) {
        this.loadCustomerDetail(options.id);
      }
    },
    methods: {
      loadCustomerDetail(customerId) {
        formatAppLog("log", "at pages/customer/detail.vue:219", "加载客户详情:", customerId);
      },
      viewOrderDetail(orderId) {
        uni.navigateTo({
          url: `/pages/order/detail?id=${orderId}`
        });
      },
      editCustomer() {
        uni.showToast({
          title: "编辑客户功能开发中",
          icon: "none"
        });
      },
      addVisitRecord() {
        uni.showToast({
          title: "添加回访记录功能开发中",
          icon: "none"
        });
      },
      contactCustomer() {
        uni.showToast({
          title: "联系客户功能开发中",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "customer-detail-container" }, [
      vue.createCommentVNode(" 客户基本信息 "),
      vue.createElementVNode("view", { class: "customer-info-section" }, [
        vue.createElementVNode("view", { class: "customer-header" }, [
          vue.createElementVNode("view", { class: "customer-avatar" }, [
            vue.createElementVNode(
              "text",
              { class: "avatar-text" },
              vue.toDisplayString($data.customerInfo.name.charAt(0)),
              1
              /* TEXT */
            ),
            $data.customerInfo.isVip ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "vip-badge"
            }, "VIP")) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "customer-details" }, [
            vue.createElementVNode(
              "text",
              { class: "customer-name" },
              vue.toDisplayString($data.customerInfo.name),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "customer-level" },
              vue.toDisplayString($data.customerInfo.levelText),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "customer-phone" },
              vue.toDisplayString($data.customerInfo.phone),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 客户统计 "),
      vue.createElementVNode("view", { class: "stats-section" }, [
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.customerInfo.stats.orderCount),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "订单数")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.customerInfo.stats.totalAmount),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "消费总额(万)")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.customerInfo.stats.avgOrderValue),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "平均订单金额")
        ]),
        vue.createElementVNode("view", { class: "stat-item" }, [
          vue.createElementVNode(
            "text",
            { class: "stat-number" },
            vue.toDisplayString($data.customerInfo.stats.lastOrderDays),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "距上次购买(天)")
        ])
      ]),
      vue.createCommentVNode(" 客户详细信息 "),
      vue.createElementVNode("view", { class: "details-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "详细信息"),
        vue.createElementVNode("view", { class: "details-content" }, [
          vue.createElementVNode("view", { class: "detail-item" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "客户姓名"),
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.customerInfo.name),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "detail-item" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "联系电话"),
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.customerInfo.phone),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "detail-item" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "电子邮箱"),
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.customerInfo.email),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "detail-item" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "客户地址"),
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.customerInfo.address),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "detail-item" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "客户等级"),
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.customerInfo.levelText),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "detail-item" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "注册时间"),
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.customerInfo.registerTime),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "detail-item" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "最后购买"),
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.customerInfo.lastOrderTime),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 最近订单 "),
      vue.createElementVNode("view", { class: "recent-orders-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "最近订单"),
        vue.createElementVNode("view", { class: "orders-content" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.customerInfo.recentOrders, (order, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "order-item",
                key: index,
                onClick: ($event) => $options.viewOrderDetail(order.id)
              }, [
                vue.createElementVNode("view", { class: "order-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "order-number" },
                    vue.toDisplayString(order.orderNo),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["order-status", order.status])
                    },
                    vue.toDisplayString(order.statusText),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createElementVNode("view", { class: "order-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "order-amount" },
                    "¥" + vue.toDisplayString(order.amount),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "order-time" },
                    vue.toDisplayString(order.createTime),
                    1
                    /* TEXT */
                  )
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 客户回访记录 "),
      vue.createElementVNode("view", { class: "visit-records-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "回访记录"),
        vue.createElementVNode("view", { class: "records-content" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.customerInfo.visitRecords, (record, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "record-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "record-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "record-type" },
                    vue.toDisplayString(record.type),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "record-time" },
                    vue.toDisplayString(record.time),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "record-content" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "record-desc" },
                    vue.toDisplayString(record.description),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "record-result" }, [
                  vue.createElementVNode("text", { class: "result-label" }, "结果："),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["result-value", record.result])
                    },
                    vue.toDisplayString(record.resultText),
                    3
                    /* TEXT, CLASS */
                  )
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 操作按钮 "),
      vue.createElementVNode("view", { class: "action-section" }, [
        vue.createElementVNode("view", { class: "action-buttons" }, [
          vue.createElementVNode("button", {
            class: "action-btn edit",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.editCustomer && $options.editCustomer(...args))
          }, "编辑客户"),
          vue.createElementVNode("button", {
            class: "action-btn visit",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.addVisitRecord && $options.addVisitRecord(...args))
          }, " 添加回访 "),
          vue.createElementVNode("button", {
            class: "action-btn contact",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.contactCustomer && $options.contactCustomer(...args))
          }, " 联系客户 ")
        ])
      ])
    ]);
  }
  const PagesCustomerDetail = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$3], ["__scopeId", "data-v-25465ad7"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/customer/detail.vue"]]);
  const _sfc_main$2 = {
    name: "SettingCategory",
    data() {
      return {
        loading: false,
        categories: [
          {
            id: "00001",
            name: "护肤",
            enabled: false
          },
          {
            id: "00002",
            name: "彩妆",
            enabled: false
          },
          {
            id: "00003",
            name: "香水/美体/美发",
            enabled: false
          },
          {
            id: "00004",
            name: "箱包/钱包",
            enabled: false
          },
          {
            id: "00005",
            name: "手表/首饰",
            enabled: false
          },
          {
            id: "00006",
            name: "时尚/配件",
            enabled: false
          },
          {
            id: "00007",
            name: "数码电器",
            enabled: false
          },
          {
            id: "00008",
            name: "食品/生活",
            enabled: false
          }
        ],
        changeFlags: [false, false, false, false, false, false, false, false]
      };
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      // 跳转到登录页面
      gotoLogin() {
        uni.reLaunch({
          url: "/pages/login/login"
        });
      },
      toggleCategory(index) {
        this.categories[index].enabled = !this.categories[index].enabled;
        this.changeFlags[index] = true;
      },
      // 检查登录状态
      checkLoginStatus() {
        const isLoggedIn = uni.getStorageSync("isLoggedIn");
        const token = uni.getStorageSync("token");
        const userInfo = uni.getStorageSync("userInfo");
        if (!isLoggedIn || !token || !userInfo) {
          this.gotoLogin();
          return false;
        }
        return true;
      },
      // 获取用户分类设置
      async getUserCategory() {
        if (!this.checkLoginStatus()) {
          return;
        }
        try {
          this.loading = true;
          const paramObj = {};
          const response = await apiService.getUserCategory(paramObj);
          if (response && response.data) {
            const arr = response.data;
            if (arr && arr.length > 0) {
              arr.forEach((item) => {
                if (item.level === "1") {
                  const categoryIndex = this.categories.findIndex((cat) => cat.id === item.id);
                  if (categoryIndex !== -1) {
                    this.categories[categoryIndex].enabled = true;
                  }
                }
              });
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/setting-category/setting-category.vue:165", "获取用户分类失败:", error);
          uni.showToast({
            title: "获取分类设置失败",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      // 添加分类
      async addCategory(categoryId, index) {
        try {
          const paramObj = {
            id: categoryId
          };
          const response = await apiService.setFirstCategory(paramObj);
          if (response && response.message) {
            uni.showToast({
              title: response.message,
              icon: "success"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/setting-category/setting-category.vue:191", "添加分类失败:", error);
          uni.showToast({
            title: "操作失败",
            icon: "none"
          });
        }
      },
      // 移除分类
      async removeCategory(categoryId, index) {
        try {
          const paramObj = {
            id: categoryId
          };
          const response = await apiService.removeFirstCategory(paramObj);
          if (response && response.message) {
            uni.showToast({
              title: response.message,
              icon: "success"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/setting-category/setting-category.vue:215", "移除分类失败:", error);
          uni.showToast({
            title: "操作失败",
            icon: "none"
          });
        }
      },
      // 保存设置
      async saveSettings() {
        try {
          this.loading = true;
          for (let i = 0; i < this.categories.length; i++) {
            const category = this.categories[i];
            const categoryId = category.id;
            if (category.enabled) {
              await this.addCategory(categoryId, i);
            } else {
              await this.removeCategory(categoryId, i);
            }
          }
          this.changeFlags = [false, false, false, false, false, false, false, false];
          uni.showToast({
            title: "设置已保存",
            icon: "success"
          });
          uni.setStorageSync("category_updated", true);
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (error) {
          formatAppLog("error", "at pages/setting-category/setting-category.vue:257", "保存设置失败:", error);
          uni.showToast({
            title: "保存失败",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      }
    },
    onLoad() {
      this.getUserCategory();
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "setting-category-container" }, [
      vue.createCommentVNode(" 头部导航 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "header-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "✕")
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("text", { class: "header-title" }, "商品分类设置")
        ]),
        vue.createElementVNode("view", {
          class: "header-right",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.saveSettings && $options.saveSettings(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "✓")
        ])
      ]),
      vue.createCommentVNode(" 分类列表 "),
      vue.createElementVNode("view", { class: "category-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.categories, (category, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "category-item",
              key: category.id
            }, [
              vue.createElementVNode("view", { class: "category-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "category-name" },
                  vue.toDisplayString(category.name),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "category-toggle" }, [
                vue.createElementVNode("switch", {
                  checked: category.enabled,
                  onChange: ($event) => $options.toggleCategory(index),
                  color: "#FF5C5C",
                  style: { "transform": "scale(0.8)" }
                }, null, 40, ["checked", "onChange"])
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 空状态 "),
      $data.categories.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "empty-state"
      }, [
        vue.createElementVNode("view", { class: "empty-icon" }, "📂"),
        vue.createElementVNode("text", { class: "empty-text" }, "暂无分类"),
        vue.createElementVNode("text", { class: "empty-desc" }, "请先添加商品分类")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 加载状态 "),
      $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loading-overlay"
      }, [
        vue.createElementVNode("view", { class: "loading-content" }, [
          vue.createElementVNode("view", { class: "loading-spinner" }),
          vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesSettingCategorySettingCategory = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2], ["__scopeId", "data-v-4c694f6e"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/setting-category/setting-category.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        cate1: "",
        cate2: "",
        cate3: "",
        category_id: "",
        pageTitle: "商品列表",
        keyword: "",
        goodsList: [],
        pageNum: 1,
        pageSize: 20,
        hasMore: true,
        loading: false,
        loadingMore: false
      };
    },
    onLoad(options) {
      this.cate1 = options.cate1 || "";
      this.cate2 = options.cate2 || "";
      this.cate3 = options.cate3 || "";
      this.category_id = options.category_id || "";
      this.pageTitle = this.cate3 || this.cate2 || "商品列表";
    },
    onShow() {
      debugger;
      this.resetAndLoad();
    },
    onPullDownRefresh() {
      this.resetAndLoad().finally(() => {
        uni.stopPullDownRefresh();
      });
    },
    methods: {
      goBack() {
        CommonUtils.navigateBack();
      },
      openFilter() {
      },
      getCover(item) {
        var _a;
        const top = (item.image_arr || "").split(",").filter(Boolean);
        if (top.length > 0)
          return top[0];
        const beanArr = (((_a = item.goodsBean) == null ? void 0 : _a.image_arr) || "").split(",").filter(Boolean);
        if (beanArr.length > 0)
          return beanArr[0];
        const listImgs = Array.isArray(item.listGoodsImg) ? item.listGoodsImg : [];
        const url = listImgs.map((i) => typeof i === "string" ? i : (i == null ? void 0 : i.url) || (i == null ? void 0 : i.imgUrl) || (i == null ? void 0 : i.imageUrl) || "").find(Boolean);
        return url || "/static/logo.png";
      },
      resetAndLoad() {
        this.pageNum = 1;
        this.hasMore = true;
        this.goodsList = [];
        return this.loadList();
      },
      async onSearch() {
        this.pageNum = 1;
        this.hasMore = true;
        this.goodsList = [];
        await this.loadList();
      },
      async loadMore() {
        if (this.loading || this.loadingMore || !this.hasMore)
          return;
        this.pageNum += 1;
        this.loadingMore = true;
        try {
          await this.loadList(true);
        } finally {
          this.loadingMore = false;
        }
      },
      async loadList(append = false) {
        var _a;
        if (!this.hasMore && append)
          return;
        this.loading = !append;
        try {
          const payload = {
            // pageNum: this.pageNum,
            // pageSize: this.pageSize,
            category_id: this.category_id
            // keyword: this.keyword,
          };
          CommonUtils.showLoading("加载商品...");
          const res = await apiService.getGoodsList(payload);
          if (res && res.code === 1) {
            const raw = Array.isArray((_a = res.data) == null ? void 0 : _a.list) ? res.data.list : Array.isArray(res.data) ? res.data : [];
            const normalized = raw.map((x) => {
              const bean = (x == null ? void 0 : x.goodsBean) || {};
              const imageArr = (bean == null ? void 0 : bean.image_arr) || "";
              return {
                ...bean,
                id: bean.uuid || bean.id || "",
                uuid: bean.uuid || "",
                image_arr: imageArr,
                listGoodsSpec: (x == null ? void 0 : x.listGoodsSpec) || [],
                listGoodsImg: (x == null ? void 0 : x.listGoodsImg) || []
              };
            });
            const keyword = (this.keyword || "").trim();
            const filtered = keyword ? normalized.filter((it) => {
              const text = [it.show_name, it.name, it.brand, it.bar_code, it.model].filter(Boolean).join(" ").toLowerCase();
              return text.includes(keyword.toLowerCase());
            }) : normalized;
            this.goodsList = append ? this.goodsList.concat(filtered) : filtered;
            this.hasMore = false;
          } else if (res && res.code === 207) {
            this.hasMore = false;
          } else {
            this.hasMore = false;
            CommonUtils.showError((res == null ? void 0 : res.message) || "加载失败");
          }
        } catch (e) {
          this.hasMore = false;
          CommonUtils.showError("网络异常，加载失败");
        } finally {
          this.loading = false;
          CommonUtils.hideLoading();
        }
      },
      gotoDetail(item) {
        const id = item.id || item.goods_id || item.uuid || "";
        if (!id) {
          CommonUtils.showError("缺少商品ID，无法查看详情");
          return;
        }
        uni.navigateTo({
          url: `/pages/product/detail?id=${id}`
        });
      },
      addProduct() {
        uni.navigateTo({
          url: `/pages/product/add?cate1=${this.cate1}&cate2=${this.cate2}&cate3=${this.cate3}&category_id=${this.category_id}`
        });
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "product-list-container" }, [
      vue.createCommentVNode(" 头部导航 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "header-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "←")
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode(
            "text",
            { class: "header-title" },
            vue.toDisplayString($data.pageTitle),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", {
          class: "header-right",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.openFilter && $options.openFilter(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "🔍")
        ])
      ]),
      vue.createCommentVNode(" 分类路径提示 "),
      $data.cate1 || $data.cate2 || $data.cate3 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "breadcrumb"
      }, [
        $data.cate1 ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 0,
            class: "crumb"
          },
          vue.toDisplayString($data.cate1),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true),
        $data.cate1 && ($data.cate2 || $data.cate3) ? (vue.openBlock(), vue.createElementBlock("text", {
          key: 1,
          class: "sep"
        }, "/")) : vue.createCommentVNode("v-if", true),
        $data.cate2 ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 2,
            class: "crumb"
          },
          vue.toDisplayString($data.cate2),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true),
        $data.cate2 && $data.cate3 ? (vue.openBlock(), vue.createElementBlock("text", {
          key: 3,
          class: "sep"
        }, "/")) : vue.createCommentVNode("v-if", true),
        $data.cate3 ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 4,
            class: "crumb"
          },
          vue.toDisplayString($data.cate3),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true)
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 搜索栏 "),
      vue.createElementVNode("view", { class: "search-bar" }, [
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "search-input",
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.keyword = $event),
            type: "text",
            placeholder: "搜索商品名称/条码/品牌",
            "confirm-type": "search",
            onConfirm: _cache[3] || (_cache[3] = (...args) => $options.onSearch && $options.onSearch(...args))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [
          [
            vue.vModelText,
            $data.keyword,
            void 0,
            { trim: true }
          ]
        ]),
        vue.createElementVNode("button", {
          class: "search-btn",
          onClick: _cache[4] || (_cache[4] = (...args) => $options.onSearch && $options.onSearch(...args))
        }, "搜索")
      ]),
      vue.createCommentVNode(" 商品列表 "),
      vue.createElementVNode(
        "scroll-view",
        {
          class: "list-wrapper",
          "scroll-y": "true",
          onScrolltolower: _cache[5] || (_cache[5] = (...args) => $options.loadMore && $options.loadMore(...args))
        },
        [
          $data.goodsList.length === 0 && !$data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "empty"
          }, [
            vue.createElementVNode("text", null, "暂无商品")
          ])) : vue.createCommentVNode("v-if", true),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.goodsList, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "goods-card",
                key: item.id,
                onClick: ($event) => $options.gotoDetail(item)
              }, [
                vue.createElementVNode("image", {
                  class: "cover",
                  src: $options.getCover(item),
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "meta" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "name" },
                    vue.toDisplayString(item.show_name || item.name || "-"),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "sub" },
                    "品牌：" + vue.toDisplayString(item.brand || "-") + " · 型号：" + vue.toDisplayString(item.model || item.specification || "-"),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "tags" }, [
                    item.unit ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: 0,
                        class: "tag"
                      },
                      vue.toDisplayString(item.unit),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true),
                    item.color ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: 1,
                        class: "tag"
                      },
                      vue.toDisplayString(item.color),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true)
                  ])
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          $data.loadingMore ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "loading-more"
          }, [
            vue.createElementVNode("text", null, "加载中...")
          ])) : vue.createCommentVNode("v-if", true),
          !$data.hasMore && $data.goodsList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "no-more"
          }, [
            vue.createElementVNode("text", null, "没有更多了")
          ])) : vue.createCommentVNode("v-if", true)
        ],
        32
        /* NEED_HYDRATION */
      ),
      vue.createCommentVNode(" 悬浮添加按钮 "),
      vue.createElementVNode("view", {
        class: "fab-button",
        onClick: _cache[6] || (_cache[6] = (...args) => $options.addProduct && $options.addProduct(...args))
      }, [
        vue.createElementVNode("text", { class: "fab-icon" }, "+")
      ])
    ]);
  }
  const PagesProductListProductList = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__scopeId", "data-v-4317cb7a"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/product-list/product-list.vue"]]);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/welcome/welcome", PagesWelcomeWelcome);
  __definePage("pages/order/order", PagesOrderOrder);
  __definePage("pages/purchase/purchase", PagesPurchasePurchase);
  __definePage("pages/product/product", PagesProductProduct);
  __definePage("pages/warehouse/warehouse", PagesWarehouseWarehouse);
  __definePage("pages/customer/customer", PagesCustomerCustomer);
  __definePage("pages/profile/profile", PagesProfileProfile);
  __definePage("pages/statistics/statistics", PagesStatisticsStatistics);
  __definePage("pages/search/search", PagesSearchSearch);
  __definePage("pages/order/detail", PagesOrderDetail);
  __definePage("pages/product/detail", PagesProductDetail);
  __definePage("pages/product/add", PagesProductAdd);
  __definePage("pages/customer/detail", PagesCustomerDetail);
  __definePage("pages/setting-category/setting-category", PagesSettingCategorySettingCategory);
  __definePage("pages/product-list/product-list", PagesProductListProductList);
  const _sfc_main = {
    globalData: {
      userInfo: null,
      token: null,
      isLogin: false,
      networkStatus: true
    },
    onLaunch: function() {
      formatAppLog("log", "at App.vue:17", "App Launch");
      try {
        this.initStorage();
        this.checkNetworkStatus();
        this.checkLoginStatus();
      } catch (error) {
        formatAppLog("error", "at App.vue:30", "应用初始化失败:", error);
      }
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:35", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:41", "App Hide");
    },
    // 初始化应用（简化版）
    initApp() {
      try {
        this.setupGlobalErrorHandler();
        this.initStorage();
      } catch (error) {
        formatAppLog("error", "at App.vue:55", "初始化应用失败:", error);
      }
    },
    // 设置全局错误处理
    setupGlobalErrorHandler() {
      try {
        uni.onUnhandledRejection(({ reason, promise }) => {
          formatAppLog("error", "at App.vue:64", "未处理的Promise错误:", reason);
          uni.showToast({
            title: "操作失败，请重试",
            icon: "none"
          });
        });
        uni.onError((error) => {
          formatAppLog("error", "at App.vue:73", "全局错误:", error);
          uni.showToast({
            title: "系统异常，请重启应用",
            icon: "none"
          });
        });
      } catch (error) {
        formatAppLog("error", "at App.vue:80", "设置全局错误处理失败:", error);
      }
    },
    // 初始化存储
    initStorage() {
      try {
        const userInfo = uni.getStorageSync("userInfo");
        const token = uni.getStorageSync("token");
        if (userInfo && token) {
          this.globalData.userInfo = userInfo;
          this.globalData.token = token;
          this.globalData.isLogin = true;
        }
      } catch (error) {
        formatAppLog("error", "at App.vue:97", "初始化存储失败:", error);
      }
    },
    // 检查网络状态
    checkNetworkStatus() {
      try {
        uni.getNetworkType({
          success: (res) => {
            this.globalData.networkStatus = res.networkType !== "none";
            if (!this.globalData.networkStatus) {
              uni.showToast({
                title: "网络连接异常",
                icon: "none"
              });
            }
          },
          fail: (error) => {
            formatAppLog("error", "at App.vue:115", "获取网络状态失败:", error);
            this.globalData.networkStatus = true;
          }
        });
      } catch (error) {
        formatAppLog("error", "at App.vue:120", "检查网络状态失败:", error);
        this.globalData.networkStatus = true;
      }
    },
    // 开始网络监听（简化版）
    startNetworkListener() {
      formatAppLog("log", "at App.vue:127", "网络监听功能已禁用");
    },
    // 停止网络监听（简化版）
    stopNetworkListener() {
      formatAppLog("log", "at App.vue:133", "网络监听功能已禁用");
    },
    // 检查登录状态
    checkLoginStatus() {
      try {
        if (this.globalData.isLogin) {
          this.validateToken();
        }
      } catch (error) {
        formatAppLog("error", "at App.vue:145", "检查登录状态失败:", error);
      }
    },
    // 验证token
    validateToken() {
      try {
        setTimeout(() => {
          try {
            if (Math.random() > 0.8) {
              this.clearLoginStatus();
              uni.showToast({
                title: "登录已过期，请重新登录",
                icon: "none"
              });
            }
          } catch (error) {
            formatAppLog("error", "at App.vue:166", "验证token失败:", error);
          }
        }, 1e3);
      } catch (error) {
        formatAppLog("error", "at App.vue:170", "验证token失败:", error);
      }
    },
    // 清除登录状态
    clearLoginStatus() {
      try {
        this.globalData.userInfo = null;
        this.globalData.token = null;
        this.globalData.isLogin = false;
        uni.removeStorageSync("userInfo");
        uni.removeStorageSync("token");
      } catch (error) {
        formatAppLog("error", "at App.vue:185", "清除登录状态失败:", error);
      }
    },
    // 保存登录状态
    saveLoginStatus(userInfo, token) {
      this.globalData.userInfo = userInfo;
      this.globalData.token = token;
      this.globalData.isLogin = true;
      uni.setStorageSync("userInfo", userInfo);
      uni.setStorageSync("token", token);
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { id: "app" }, [
      vue.createCommentVNode(" 页面内容会在这里显示 ")
    ]);
  }
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
