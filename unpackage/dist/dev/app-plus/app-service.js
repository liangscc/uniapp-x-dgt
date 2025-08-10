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
  const _sfc_main$n = {
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
  function _sfc_render$n(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["render", _sfc_render$n], ["__scopeId", "data-v-e4e4508d"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/login/login.vue"]]);
  const _sfc_main$m = {
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
  function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesWelcomeWelcome = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$m], ["__scopeId", "data-v-085f0530"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/welcome/welcome.vue"]]);
  const _sfc_main$l = {
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
  function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
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
  const SlideMenu = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$l], ["__scopeId", "data-v-edaabf93"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/components/SlideMenu.vue"]]);
  const _sfc_main$k = {
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
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
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
  const CustomTabBar = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$k], ["__scopeId", "data-v-6def6a3b"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/components/CustomTabBar.vue"]]);
  const _sfc_main$j = {
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
        uni.navigateTo({
          url: "/pages/order/add"
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
                formatAppLog("error", "at pages/order/order.vue:322", "删除订单失败:", error);
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
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesOrderOrder = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$j], ["__scopeId", "data-v-93207a4f"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/order/order.vue"]]);
  const _sfc_main$i = {
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
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesPurchasePurchase = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$i], ["__scopeId", "data-v-313e55f0"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/purchase/purchase.vue"]]);
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
  const _sfc_main$h = {
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
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesProductProduct = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$h], ["__scopeId", "data-v-946a9793"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/product/product.vue"]]);
  const _sfc_main$g = {
    components: {
      SlideMenu,
      CustomTabBar
    },
    data() {
      return {
        slideMenuVisible: false,
        warehouseStats: {
          totalProducts: 111,
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
      },
      // 查看仓库商品详情
      viewWarehouseDetails() {
        uni.showToast({
          title: "仓库商品详情功能开发中",
          icon: "none"
        });
      },
      // 查看仓库流水
      viewWarehouseFlow() {
        uni.showToast({
          title: "仓库流水功能开发中",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
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
        vue.createElementVNode("view", { class: "stats-number" }, [
          vue.createElementVNode(
            "text",
            { class: "main-stat-number" },
            vue.toDisplayString($data.warehouseStats.totalProducts),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "status-labels" }, [
          vue.createElementVNode("text", { class: "status-label gray" }, "空白"),
          vue.createElementVNode("text", { class: "status-label green" }, "无预警"),
          vue.createElementVNode("text", { class: "status-label green" }, "无过期")
        ])
      ]),
      vue.createCommentVNode(" 仓库管理按钮 "),
      vue.createElementVNode("view", { class: "action-buttons" }, [
        vue.createElementVNode("view", {
          class: "action-button",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.viewWarehouseDetails && $options.viewWarehouseDetails(...args))
        }, [
          vue.createElementVNode("text", { class: "button-text" }, "仓库商品详情")
        ]),
        vue.createElementVNode("view", {
          class: "action-button",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.viewWarehouseFlow && $options.viewWarehouseFlow(...args))
        }, [
          vue.createElementVNode("text", { class: "button-text" }, "仓库流水")
        ])
      ]),
      vue.createCommentVNode(" 仓库管理 "),
      vue.createElementVNode("view", { class: "warehouse-section" }, [
        vue.createElementVNode("view", { class: "section-header" }, [
          vue.createElementVNode("text", { class: "section-title" }, "仓库管理"),
          vue.createElementVNode("text", {
            class: "section-action",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.addWarehouse && $options.addWarehouse(...args))
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
            onClick: _cache[5] || (_cache[5] = (...args) => $options.processInbound && $options.processInbound(...args))
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
            onClick: _cache[6] || (_cache[6] = (...args) => $options.updateStatus && $options.updateStatus(...args))
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
            onClick: _cache[7] || (_cache[7] = (...args) => $options.setExpiryReminder && $options.setExpiryReminder(...args))
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
        onClick: _cache[8] || (_cache[8] = (...args) => $options.addWarehouse && $options.addWarehouse(...args))
      }, [
        vue.createElementVNode("text", { class: "fab-icon" }, "+")
      ]),
      vue.createCommentVNode(" 自定义 TabBar "),
      vue.createVNode(_component_CustomTabBar)
    ]);
  }
  const PagesWarehouseWarehouse = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$g], ["__scopeId", "data-v-41554ef3"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/warehouse/warehouse.vue"]]);
  const cityData = [
    {
      name: "北京市",
      code: "110000",
      children: [
        {
          name: "北京市",
          code: "110000",
          children: [
            {
              name: "东城区",
              code: "110101"
            },
            {
              name: "西城区",
              code: "110102"
            },
            {
              name: "朝阳区",
              code: "110105"
            },
            {
              name: "丰台区",
              code: "110106"
            },
            {
              name: "石景山区",
              code: "110107"
            },
            {
              name: "海淀区",
              code: "110108"
            },
            {
              name: "门头沟区",
              code: "110109"
            },
            {
              name: "房山区",
              code: "110111"
            },
            {
              name: "通州区",
              code: "110112"
            },
            {
              name: "顺义区",
              code: "110113"
            },
            {
              name: "昌平区",
              code: "110114"
            },
            {
              name: "大兴区",
              code: "110115"
            },
            {
              name: "怀柔区",
              code: "110116"
            },
            {
              name: "平谷区",
              code: "110117"
            },
            {
              name: "密云县",
              code: "110228"
            },
            {
              name: "延庆县",
              code: "110229"
            }
          ]
        }
      ]
    },
    {
      name: "天津市",
      code: "120000",
      children: [
        {
          name: "天津市",
          code: "120000",
          children: [
            {
              name: "和平区",
              code: "120101"
            },
            {
              name: "河东区",
              code: "120102"
            },
            {
              name: "河西区",
              code: "120103"
            },
            {
              name: "南开区",
              code: "120104"
            },
            {
              name: "河北区",
              code: "120105"
            },
            {
              name: "红桥区",
              code: "120106"
            },
            {
              name: "东丽区",
              code: "120110"
            },
            {
              name: "西青区",
              code: "120111"
            },
            {
              name: "津南区",
              code: "120112"
            },
            {
              name: "北辰区",
              code: "120113"
            },
            {
              name: "武清区",
              code: "120114"
            },
            {
              name: "宝坻区",
              code: "120115"
            },
            {
              name: "滨海新区",
              code: "120116"
            },
            {
              name: "宁河县",
              code: "120221"
            },
            {
              name: "静海县",
              code: "120223"
            },
            {
              name: "蓟县",
              code: "120225"
            }
          ]
        }
      ]
    },
    {
      name: "河北省",
      code: "130000",
      children: [
        {
          name: "石家庄市",
          code: "130100",
          children: [
            {
              name: "市辖区",
              code: "130101"
            },
            {
              name: "长安区",
              code: "130102"
            },
            {
              name: "桥东区",
              code: "130103"
            },
            {
              name: "桥西区",
              code: "130104"
            },
            {
              name: "新华区",
              code: "130105"
            },
            {
              name: "井陉矿区",
              code: "130107"
            },
            {
              name: "裕华区",
              code: "130108"
            },
            {
              name: "井陉县",
              code: "130121"
            },
            {
              name: "正定县",
              code: "130123"
            },
            {
              name: "栾城县",
              code: "130124"
            },
            {
              name: "行唐县",
              code: "130125"
            },
            {
              name: "灵寿县",
              code: "130126"
            },
            {
              name: "高邑县",
              code: "130127"
            },
            {
              name: "深泽县",
              code: "130128"
            },
            {
              name: "赞皇县",
              code: "130129"
            },
            {
              name: "无极县",
              code: "130130"
            },
            {
              name: "平山县",
              code: "130131"
            },
            {
              name: "元氏县",
              code: "130132"
            },
            {
              name: "赵县",
              code: "130133"
            },
            {
              name: "辛集市",
              code: "130181"
            },
            {
              name: "藁城市",
              code: "130182"
            },
            {
              name: "晋州市",
              code: "130183"
            },
            {
              name: "新乐市",
              code: "130184"
            },
            {
              name: "鹿泉市",
              code: "130185"
            }
          ]
        },
        {
          name: "唐山市",
          code: "130200",
          children: [
            {
              name: "市辖区",
              code: "130201"
            },
            {
              name: "路南区",
              code: "130202"
            },
            {
              name: "路北区",
              code: "130203"
            },
            {
              name: "古冶区",
              code: "130204"
            },
            {
              name: "开平区",
              code: "130205"
            },
            {
              name: "丰南区",
              code: "130207"
            },
            {
              name: "丰润区",
              code: "130208"
            },
            {
              name: "曹妃甸区",
              code: "130209"
            },
            {
              name: "滦县",
              code: "130223"
            },
            {
              name: "滦南县",
              code: "130224"
            },
            {
              name: "乐亭县",
              code: "130225"
            },
            {
              name: "迁西县",
              code: "130227"
            },
            {
              name: "玉田县",
              code: "130229"
            },
            {
              name: "遵化市",
              code: "130281"
            },
            {
              name: "迁安市",
              code: "130283"
            }
          ]
        },
        {
          name: "秦皇岛市",
          code: "130300",
          children: [
            {
              name: "市辖区",
              code: "130301"
            },
            {
              name: "海港区",
              code: "130302"
            },
            {
              name: "山海关区",
              code: "130303"
            },
            {
              name: "北戴河区",
              code: "130304"
            },
            {
              name: "青龙满族自治县",
              code: "130321"
            },
            {
              name: "昌黎县",
              code: "130322"
            },
            {
              name: "抚宁县",
              code: "130323"
            },
            {
              name: "卢龙县",
              code: "130324"
            }
          ]
        },
        {
          name: "邯郸市",
          code: "130400",
          children: [
            {
              name: "市辖区",
              code: "130401"
            },
            {
              name: "邯山区",
              code: "130402"
            },
            {
              name: "丛台区",
              code: "130403"
            },
            {
              name: "复兴区",
              code: "130404"
            },
            {
              name: "峰峰矿区",
              code: "130406"
            },
            {
              name: "邯郸县",
              code: "130421"
            },
            {
              name: "临漳县",
              code: "130423"
            },
            {
              name: "成安县",
              code: "130424"
            },
            {
              name: "大名县",
              code: "130425"
            },
            {
              name: "涉县",
              code: "130426"
            },
            {
              name: "磁县",
              code: "130427"
            },
            {
              name: "肥乡县",
              code: "130428"
            },
            {
              name: "永年县",
              code: "130429"
            },
            {
              name: "邱县",
              code: "130430"
            },
            {
              name: "鸡泽县",
              code: "130431"
            },
            {
              name: "广平县",
              code: "130432"
            },
            {
              name: "馆陶县",
              code: "130433"
            },
            {
              name: "魏县",
              code: "130434"
            },
            {
              name: "曲周县",
              code: "130435"
            },
            {
              name: "武安市",
              code: "130481"
            }
          ]
        },
        {
          name: "邢台市",
          code: "130500",
          children: [
            {
              name: "市辖区",
              code: "130501"
            },
            {
              name: "桥东区",
              code: "130502"
            },
            {
              name: "桥西区",
              code: "130503"
            },
            {
              name: "邢台县",
              code: "130521"
            },
            {
              name: "临城县",
              code: "130522"
            },
            {
              name: "内丘县",
              code: "130523"
            },
            {
              name: "柏乡县",
              code: "130524"
            },
            {
              name: "隆尧县",
              code: "130525"
            },
            {
              name: "任县",
              code: "130526"
            },
            {
              name: "南和县",
              code: "130527"
            },
            {
              name: "宁晋县",
              code: "130528"
            },
            {
              name: "巨鹿县",
              code: "130529"
            },
            {
              name: "新河县",
              code: "130530"
            },
            {
              name: "广宗县",
              code: "130531"
            },
            {
              name: "平乡县",
              code: "130532"
            },
            {
              name: "威县",
              code: "130533"
            },
            {
              name: "清河县",
              code: "130534"
            },
            {
              name: "临西县",
              code: "130535"
            },
            {
              name: "南宫市",
              code: "130581"
            },
            {
              name: "沙河市",
              code: "130582"
            }
          ]
        },
        {
          name: "保定市",
          code: "130600",
          children: [
            {
              name: "市辖区",
              code: "130601"
            },
            {
              name: "新市区",
              code: "130602"
            },
            {
              name: "北市区",
              code: "130603"
            },
            {
              name: "南市区",
              code: "130604"
            },
            {
              name: "满城县",
              code: "130621"
            },
            {
              name: "清苑县",
              code: "130622"
            },
            {
              name: "涞水县",
              code: "130623"
            },
            {
              name: "阜平县",
              code: "130624"
            },
            {
              name: "徐水县",
              code: "130625"
            },
            {
              name: "定兴县",
              code: "130626"
            },
            {
              name: "唐县",
              code: "130627"
            },
            {
              name: "高阳县",
              code: "130628"
            },
            {
              name: "容城县",
              code: "130629"
            },
            {
              name: "涞源县",
              code: "130630"
            },
            {
              name: "望都县",
              code: "130631"
            },
            {
              name: "安新县",
              code: "130632"
            },
            {
              name: "易县",
              code: "130633"
            },
            {
              name: "曲阳县",
              code: "130634"
            },
            {
              name: "蠡县",
              code: "130635"
            },
            {
              name: "顺平县",
              code: "130636"
            },
            {
              name: "博野县",
              code: "130637"
            },
            {
              name: "雄县",
              code: "130638"
            },
            {
              name: "涿州市",
              code: "130681"
            },
            {
              name: "定州市",
              code: "130682"
            },
            {
              name: "安国市",
              code: "130683"
            },
            {
              name: "高碑店市",
              code: "130684"
            }
          ]
        },
        {
          name: "张家口市",
          code: "130700",
          children: [
            {
              name: "市辖区",
              code: "130701"
            },
            {
              name: "桥东区",
              code: "130702"
            },
            {
              name: "桥西区",
              code: "130703"
            },
            {
              name: "宣化区",
              code: "130705"
            },
            {
              name: "下花园区",
              code: "130706"
            },
            {
              name: "宣化县",
              code: "130721"
            },
            {
              name: "张北县",
              code: "130722"
            },
            {
              name: "康保县",
              code: "130723"
            },
            {
              name: "沽源县",
              code: "130724"
            },
            {
              name: "尚义县",
              code: "130725"
            },
            {
              name: "蔚县",
              code: "130726"
            },
            {
              name: "阳原县",
              code: "130727"
            },
            {
              name: "怀安县",
              code: "130728"
            },
            {
              name: "万全县",
              code: "130729"
            },
            {
              name: "怀来县",
              code: "130730"
            },
            {
              name: "涿鹿县",
              code: "130731"
            },
            {
              name: "赤城县",
              code: "130732"
            },
            {
              name: "崇礼县",
              code: "130733"
            }
          ]
        },
        {
          name: "承德市",
          code: "130800",
          children: [
            {
              name: "市辖区",
              code: "130801"
            },
            {
              name: "双桥区",
              code: "130802"
            },
            {
              name: "双滦区",
              code: "130803"
            },
            {
              name: "鹰手营子矿区",
              code: "130804"
            },
            {
              name: "承德县",
              code: "130821"
            },
            {
              name: "兴隆县",
              code: "130822"
            },
            {
              name: "平泉县",
              code: "130823"
            },
            {
              name: "滦平县",
              code: "130824"
            },
            {
              name: "隆化县",
              code: "130825"
            },
            {
              name: "丰宁满族自治县",
              code: "130826"
            },
            {
              name: "宽城满族自治县",
              code: "130827"
            },
            {
              name: "围场满族蒙古族自治县",
              code: "130828"
            }
          ]
        },
        {
          name: "沧州市",
          code: "130900",
          children: [
            {
              name: "市辖区",
              code: "130901"
            },
            {
              name: "新华区",
              code: "130902"
            },
            {
              name: "运河区",
              code: "130903"
            },
            {
              name: "沧县",
              code: "130921"
            },
            {
              name: "青县",
              code: "130922"
            },
            {
              name: "东光县",
              code: "130923"
            },
            {
              name: "海兴县",
              code: "130924"
            },
            {
              name: "盐山县",
              code: "130925"
            },
            {
              name: "肃宁县",
              code: "130926"
            },
            {
              name: "南皮县",
              code: "130927"
            },
            {
              name: "吴桥县",
              code: "130928"
            },
            {
              name: "献县",
              code: "130929"
            },
            {
              name: "孟村回族自治县",
              code: "130930"
            },
            {
              name: "泊头市",
              code: "130981"
            },
            {
              name: "任丘市",
              code: "130982"
            },
            {
              name: "黄骅市",
              code: "130983"
            },
            {
              name: "河间市",
              code: "130984"
            }
          ]
        },
        {
          name: "廊坊市",
          code: "131000",
          children: [
            {
              name: "市辖区",
              code: "131001"
            },
            {
              name: "安次区",
              code: "131002"
            },
            {
              name: "广阳区",
              code: "131003"
            },
            {
              name: "固安县",
              code: "131022"
            },
            {
              name: "永清县",
              code: "131023"
            },
            {
              name: "香河县",
              code: "131024"
            },
            {
              name: "大城县",
              code: "131025"
            },
            {
              name: "文安县",
              code: "131026"
            },
            {
              name: "大厂回族自治县",
              code: "131028"
            },
            {
              name: "霸州市",
              code: "131081"
            },
            {
              name: "三河市",
              code: "131082"
            }
          ]
        },
        {
          name: "衡水市",
          code: "131100",
          children: [
            {
              name: "市辖区",
              code: "131101"
            },
            {
              name: "桃城区",
              code: "131102"
            },
            {
              name: "枣强县",
              code: "131121"
            },
            {
              name: "武邑县",
              code: "131122"
            },
            {
              name: "武强县",
              code: "131123"
            },
            {
              name: "饶阳县",
              code: "131124"
            },
            {
              name: "安平县",
              code: "131125"
            },
            {
              name: "故城县",
              code: "131126"
            },
            {
              name: "景县",
              code: "131127"
            },
            {
              name: "阜城县",
              code: "131128"
            },
            {
              name: "冀州市",
              code: "131181"
            },
            {
              name: "深州市",
              code: "131182"
            }
          ]
        }
      ]
    },
    {
      name: "山西省",
      code: "140000",
      children: [
        {
          name: "太原市",
          code: "140100",
          children: [
            {
              name: "市辖区",
              code: "140101"
            },
            {
              name: "小店区",
              code: "140105"
            },
            {
              name: "迎泽区",
              code: "140106"
            },
            {
              name: "杏花岭区",
              code: "140107"
            },
            {
              name: "尖草坪区",
              code: "140108"
            },
            {
              name: "万柏林区",
              code: "140109"
            },
            {
              name: "晋源区",
              code: "140110"
            },
            {
              name: "清徐县",
              code: "140121"
            },
            {
              name: "阳曲县",
              code: "140122"
            },
            {
              name: "娄烦县",
              code: "140123"
            },
            {
              name: "古交市",
              code: "140181"
            }
          ]
        },
        {
          name: "大同市",
          code: "140200",
          children: [
            {
              name: "市辖区",
              code: "140201"
            },
            {
              name: "城区",
              code: "140202"
            },
            {
              name: "矿区",
              code: "140203"
            },
            {
              name: "南郊区",
              code: "140211"
            },
            {
              name: "新荣区",
              code: "140212"
            },
            {
              name: "阳高县",
              code: "140221"
            },
            {
              name: "天镇县",
              code: "140222"
            },
            {
              name: "广灵县",
              code: "140223"
            },
            {
              name: "灵丘县",
              code: "140224"
            },
            {
              name: "浑源县",
              code: "140225"
            },
            {
              name: "左云县",
              code: "140226"
            },
            {
              name: "大同县",
              code: "140227"
            }
          ]
        },
        {
          name: "阳泉市",
          code: "140300",
          children: [
            {
              name: "市辖区",
              code: "140301"
            },
            {
              name: "城区",
              code: "140302"
            },
            {
              name: "矿区",
              code: "140303"
            },
            {
              name: "郊区",
              code: "140311"
            },
            {
              name: "平定县",
              code: "140321"
            },
            {
              name: "盂县",
              code: "140322"
            }
          ]
        },
        {
          name: "长治市",
          code: "140400",
          children: [
            {
              name: "市辖区",
              code: "140401"
            },
            {
              name: "城区",
              code: "140402"
            },
            {
              name: "郊区",
              code: "140411"
            },
            {
              name: "长治县",
              code: "140421"
            },
            {
              name: "襄垣县",
              code: "140423"
            },
            {
              name: "屯留县",
              code: "140424"
            },
            {
              name: "平顺县",
              code: "140425"
            },
            {
              name: "黎城县",
              code: "140426"
            },
            {
              name: "壶关县",
              code: "140427"
            },
            {
              name: "长子县",
              code: "140428"
            },
            {
              name: "武乡县",
              code: "140429"
            },
            {
              name: "沁县",
              code: "140430"
            },
            {
              name: "沁源县",
              code: "140431"
            },
            {
              name: "潞城市",
              code: "140481"
            }
          ]
        },
        {
          name: "晋城市",
          code: "140500",
          children: [
            {
              name: "市辖区",
              code: "140501"
            },
            {
              name: "城区",
              code: "140502"
            },
            {
              name: "沁水县",
              code: "140521"
            },
            {
              name: "阳城县",
              code: "140522"
            },
            {
              name: "陵川县",
              code: "140524"
            },
            {
              name: "泽州县",
              code: "140525"
            },
            {
              name: "高平市",
              code: "140581"
            }
          ]
        },
        {
          name: "朔州市",
          code: "140600",
          children: [
            {
              name: "市辖区",
              code: "140601"
            },
            {
              name: "朔城区",
              code: "140602"
            },
            {
              name: "平鲁区",
              code: "140603"
            },
            {
              name: "山阴县",
              code: "140621"
            },
            {
              name: "应县",
              code: "140622"
            },
            {
              name: "右玉县",
              code: "140623"
            },
            {
              name: "怀仁县",
              code: "140624"
            }
          ]
        },
        {
          name: "晋中市",
          code: "140700",
          children: [
            {
              name: "市辖区",
              code: "140701"
            },
            {
              name: "榆次区",
              code: "140702"
            },
            {
              name: "榆社县",
              code: "140721"
            },
            {
              name: "左权县",
              code: "140722"
            },
            {
              name: "和顺县",
              code: "140723"
            },
            {
              name: "昔阳县",
              code: "140724"
            },
            {
              name: "寿阳县",
              code: "140725"
            },
            {
              name: "太谷县",
              code: "140726"
            },
            {
              name: "祁县",
              code: "140727"
            },
            {
              name: "平遥县",
              code: "140728"
            },
            {
              name: "灵石县",
              code: "140729"
            },
            {
              name: "介休市",
              code: "140781"
            }
          ]
        },
        {
          name: "运城市",
          code: "140800",
          children: [
            {
              name: "市辖区",
              code: "140801"
            },
            {
              name: "盐湖区",
              code: "140802"
            },
            {
              name: "临猗县",
              code: "140821"
            },
            {
              name: "万荣县",
              code: "140822"
            },
            {
              name: "闻喜县",
              code: "140823"
            },
            {
              name: "稷山县",
              code: "140824"
            },
            {
              name: "新绛县",
              code: "140825"
            },
            {
              name: "绛县",
              code: "140826"
            },
            {
              name: "垣曲县",
              code: "140827"
            },
            {
              name: "夏县",
              code: "140828"
            },
            {
              name: "平陆县",
              code: "140829"
            },
            {
              name: "芮城县",
              code: "140830"
            },
            {
              name: "永济市",
              code: "140881"
            },
            {
              name: "河津市",
              code: "140882"
            }
          ]
        },
        {
          name: "忻州市",
          code: "140900",
          children: [
            {
              name: "市辖区",
              code: "140901"
            },
            {
              name: "忻府区",
              code: "140902"
            },
            {
              name: "定襄县",
              code: "140921"
            },
            {
              name: "五台县",
              code: "140922"
            },
            {
              name: "代县",
              code: "140923"
            },
            {
              name: "繁峙县",
              code: "140924"
            },
            {
              name: "宁武县",
              code: "140925"
            },
            {
              name: "静乐县",
              code: "140926"
            },
            {
              name: "神池县",
              code: "140927"
            },
            {
              name: "五寨县",
              code: "140928"
            },
            {
              name: "岢岚县",
              code: "140929"
            },
            {
              name: "河曲县",
              code: "140930"
            },
            {
              name: "保德县",
              code: "140931"
            },
            {
              name: "偏关县",
              code: "140932"
            },
            {
              name: "原平市",
              code: "140981"
            }
          ]
        },
        {
          name: "临汾市",
          code: "141000",
          children: [
            {
              name: "市辖区",
              code: "141001"
            },
            {
              name: "尧都区",
              code: "141002"
            },
            {
              name: "曲沃县",
              code: "141021"
            },
            {
              name: "翼城县",
              code: "141022"
            },
            {
              name: "襄汾县",
              code: "141023"
            },
            {
              name: "洪洞县",
              code: "141024"
            },
            {
              name: "古县",
              code: "141025"
            },
            {
              name: "安泽县",
              code: "141026"
            },
            {
              name: "浮山县",
              code: "141027"
            },
            {
              name: "吉县",
              code: "141028"
            },
            {
              name: "乡宁县",
              code: "141029"
            },
            {
              name: "大宁县",
              code: "141030"
            },
            {
              name: "隰县",
              code: "141031"
            },
            {
              name: "永和县",
              code: "141032"
            },
            {
              name: "蒲县",
              code: "141033"
            },
            {
              name: "汾西县",
              code: "141034"
            },
            {
              name: "侯马市",
              code: "141081"
            },
            {
              name: "霍州市",
              code: "141082"
            }
          ]
        },
        {
          name: "吕梁市",
          code: "141100",
          children: [
            {
              name: "市辖区",
              code: "141101"
            },
            {
              name: "离石区",
              code: "141102"
            },
            {
              name: "文水县",
              code: "141121"
            },
            {
              name: "交城县",
              code: "141122"
            },
            {
              name: "兴县",
              code: "141123"
            },
            {
              name: "临县",
              code: "141124"
            },
            {
              name: "柳林县",
              code: "141125"
            },
            {
              name: "石楼县",
              code: "141126"
            },
            {
              name: "岚县",
              code: "141127"
            },
            {
              name: "方山县",
              code: "141128"
            },
            {
              name: "中阳县",
              code: "141129"
            },
            {
              name: "交口县",
              code: "141130"
            },
            {
              name: "孝义市",
              code: "141181"
            },
            {
              name: "汾阳市",
              code: "141182"
            }
          ]
        }
      ]
    },
    {
      name: "内蒙古自治区",
      code: "150000",
      children: [
        {
          name: "呼和浩特市",
          code: "150100",
          children: [
            {
              name: "市辖区",
              code: "150101"
            },
            {
              name: "新城区",
              code: "150102"
            },
            {
              name: "回民区",
              code: "150103"
            },
            {
              name: "玉泉区",
              code: "150104"
            },
            {
              name: "赛罕区",
              code: "150105"
            },
            {
              name: "土默特左旗",
              code: "150121"
            },
            {
              name: "托克托县",
              code: "150122"
            },
            {
              name: "和林格尔县",
              code: "150123"
            },
            {
              name: "清水河县",
              code: "150124"
            },
            {
              name: "武川县",
              code: "150125"
            }
          ]
        },
        {
          name: "包头市",
          code: "150200",
          children: [
            {
              name: "市辖区",
              code: "150201"
            },
            {
              name: "东河区",
              code: "150202"
            },
            {
              name: "昆都仑区",
              code: "150203"
            },
            {
              name: "青山区",
              code: "150204"
            },
            {
              name: "石拐区",
              code: "150205"
            },
            {
              name: "白云鄂博矿区",
              code: "150206"
            },
            {
              name: "九原区",
              code: "150207"
            },
            {
              name: "土默特右旗",
              code: "150221"
            },
            {
              name: "固阳县",
              code: "150222"
            },
            {
              name: "达尔罕茂明安联合旗",
              code: "150223"
            }
          ]
        },
        {
          name: "乌海市",
          code: "150300",
          children: [
            {
              name: "市辖区",
              code: "150301"
            },
            {
              name: "海勃湾区",
              code: "150302"
            },
            {
              name: "海南区",
              code: "150303"
            },
            {
              name: "乌达区",
              code: "150304"
            }
          ]
        },
        {
          name: "赤峰市",
          code: "150400",
          children: [
            {
              name: "市辖区",
              code: "150401"
            },
            {
              name: "红山区",
              code: "150402"
            },
            {
              name: "元宝山区",
              code: "150403"
            },
            {
              name: "松山区",
              code: "150404"
            },
            {
              name: "阿鲁科尔沁旗",
              code: "150421"
            },
            {
              name: "巴林左旗",
              code: "150422"
            },
            {
              name: "巴林右旗",
              code: "150423"
            },
            {
              name: "林西县",
              code: "150424"
            },
            {
              name: "克什克腾旗",
              code: "150425"
            },
            {
              name: "翁牛特旗",
              code: "150426"
            },
            {
              name: "喀喇沁旗",
              code: "150428"
            },
            {
              name: "宁城县",
              code: "150429"
            },
            {
              name: "敖汉旗",
              code: "150430"
            }
          ]
        },
        {
          name: "通辽市",
          code: "150500",
          children: [
            {
              name: "市辖区",
              code: "150501"
            },
            {
              name: "科尔沁区",
              code: "150502"
            },
            {
              name: "科尔沁左翼中旗",
              code: "150521"
            },
            {
              name: "科尔沁左翼后旗",
              code: "150522"
            },
            {
              name: "开鲁县",
              code: "150523"
            },
            {
              name: "库伦旗",
              code: "150524"
            },
            {
              name: "奈曼旗",
              code: "150525"
            },
            {
              name: "扎鲁特旗",
              code: "150526"
            },
            {
              name: "霍林郭勒市",
              code: "150581"
            }
          ]
        },
        {
          name: "鄂尔多斯市",
          code: "150600",
          children: [
            {
              name: "市辖区",
              code: "150601"
            },
            {
              name: "东胜区",
              code: "150602"
            },
            {
              name: "达拉特旗",
              code: "150621"
            },
            {
              name: "准格尔旗",
              code: "150622"
            },
            {
              name: "鄂托克前旗",
              code: "150623"
            },
            {
              name: "鄂托克旗",
              code: "150624"
            },
            {
              name: "杭锦旗",
              code: "150625"
            },
            {
              name: "乌审旗",
              code: "150626"
            },
            {
              name: "伊金霍洛旗",
              code: "150627"
            }
          ]
        },
        {
          name: "呼伦贝尔市",
          code: "150700",
          children: [
            {
              name: "市辖区",
              code: "150701"
            },
            {
              name: "海拉尔区",
              code: "150702"
            },
            {
              name: "扎赉诺尔区",
              code: "150703"
            },
            {
              name: "阿荣旗",
              code: "150721"
            },
            {
              name: "莫力达瓦达斡尔族自治旗",
              code: "150722"
            },
            {
              name: "鄂伦春自治旗",
              code: "150723"
            },
            {
              name: "鄂温克族自治旗",
              code: "150724"
            },
            {
              name: "陈巴尔虎旗",
              code: "150725"
            },
            {
              name: "新巴尔虎左旗",
              code: "150726"
            },
            {
              name: "新巴尔虎右旗",
              code: "150727"
            },
            {
              name: "满洲里市",
              code: "150781"
            },
            {
              name: "牙克石市",
              code: "150782"
            },
            {
              name: "扎兰屯市",
              code: "150783"
            },
            {
              name: "额尔古纳市",
              code: "150784"
            },
            {
              name: "根河市",
              code: "150785"
            }
          ]
        },
        {
          name: "巴彦淖尔市",
          code: "150800",
          children: [
            {
              name: "市辖区",
              code: "150801"
            },
            {
              name: "临河区",
              code: "150802"
            },
            {
              name: "五原县",
              code: "150821"
            },
            {
              name: "磴口县",
              code: "150822"
            },
            {
              name: "乌拉特前旗",
              code: "150823"
            },
            {
              name: "乌拉特中旗",
              code: "150824"
            },
            {
              name: "乌拉特后旗",
              code: "150825"
            },
            {
              name: "杭锦后旗",
              code: "150826"
            }
          ]
        },
        {
          name: "乌兰察布市",
          code: "150900",
          children: [
            {
              name: "市辖区",
              code: "150901"
            },
            {
              name: "集宁区",
              code: "150902"
            },
            {
              name: "卓资县",
              code: "150921"
            },
            {
              name: "化德县",
              code: "150922"
            },
            {
              name: "商都县",
              code: "150923"
            },
            {
              name: "兴和县",
              code: "150924"
            },
            {
              name: "凉城县",
              code: "150925"
            },
            {
              name: "察哈尔右翼前旗",
              code: "150926"
            },
            {
              name: "察哈尔右翼中旗",
              code: "150927"
            },
            {
              name: "察哈尔右翼后旗",
              code: "150928"
            },
            {
              name: "四子王旗",
              code: "150929"
            },
            {
              name: "丰镇市",
              code: "150981"
            }
          ]
        },
        {
          name: "兴安盟",
          code: "152200",
          children: [
            {
              name: "乌兰浩特市",
              code: "152201"
            },
            {
              name: "阿尔山市",
              code: "152202"
            },
            {
              name: "科尔沁右翼前旗",
              code: "152221"
            },
            {
              name: "科尔沁右翼中旗",
              code: "152222"
            },
            {
              name: "扎赉特旗",
              code: "152223"
            },
            {
              name: "突泉县",
              code: "152224"
            }
          ]
        },
        {
          name: "锡林郭勒盟",
          code: "152500",
          children: [
            {
              name: "二连浩特市",
              code: "152501"
            },
            {
              name: "锡林浩特市",
              code: "152502"
            },
            {
              name: "阿巴嘎旗",
              code: "152522"
            },
            {
              name: "苏尼特左旗",
              code: "152523"
            },
            {
              name: "苏尼特右旗",
              code: "152524"
            },
            {
              name: "东乌珠穆沁旗",
              code: "152525"
            },
            {
              name: "西乌珠穆沁旗",
              code: "152526"
            },
            {
              name: "太仆寺旗",
              code: "152527"
            },
            {
              name: "镶黄旗",
              code: "152528"
            },
            {
              name: "正镶白旗",
              code: "152529"
            },
            {
              name: "正蓝旗",
              code: "152530"
            },
            {
              name: "多伦县",
              code: "152531"
            }
          ]
        },
        {
          name: "阿拉善盟",
          code: "152900",
          children: [
            {
              name: "阿拉善左旗",
              code: "152921"
            },
            {
              name: "阿拉善右旗",
              code: "152922"
            },
            {
              name: "额济纳旗",
              code: "152923"
            }
          ]
        }
      ]
    },
    {
      name: "辽宁省",
      code: "210000",
      children: [
        {
          name: "沈阳市",
          code: "210100",
          children: [
            {
              name: "市辖区",
              code: "210101"
            },
            {
              name: "和平区",
              code: "210102"
            },
            {
              name: "沈河区",
              code: "210103"
            },
            {
              name: "大东区",
              code: "210104"
            },
            {
              name: "皇姑区",
              code: "210105"
            },
            {
              name: "铁西区",
              code: "210106"
            },
            {
              name: "苏家屯区",
              code: "210111"
            },
            {
              name: "东陵区",
              code: "210112"
            },
            {
              name: "沈北新区",
              code: "210113"
            },
            {
              name: "于洪区",
              code: "210114"
            },
            {
              name: "辽中县",
              code: "210122"
            },
            {
              name: "康平县",
              code: "210123"
            },
            {
              name: "法库县",
              code: "210124"
            },
            {
              name: "新民市",
              code: "210181"
            }
          ]
        },
        {
          name: "大连市",
          code: "210200",
          children: [
            {
              name: "市辖区",
              code: "210201"
            },
            {
              name: "中山区",
              code: "210202"
            },
            {
              name: "西岗区",
              code: "210203"
            },
            {
              name: "沙河口区",
              code: "210204"
            },
            {
              name: "甘井子区",
              code: "210211"
            },
            {
              name: "旅顺口区",
              code: "210212"
            },
            {
              name: "金州区",
              code: "210213"
            },
            {
              name: "长海县",
              code: "210224"
            },
            {
              name: "瓦房店市",
              code: "210281"
            },
            {
              name: "普兰店市",
              code: "210282"
            },
            {
              name: "庄河市",
              code: "210283"
            }
          ]
        },
        {
          name: "鞍山市",
          code: "210300",
          children: [
            {
              name: "市辖区",
              code: "210301"
            },
            {
              name: "铁东区",
              code: "210302"
            },
            {
              name: "铁西区",
              code: "210303"
            },
            {
              name: "立山区",
              code: "210304"
            },
            {
              name: "千山区",
              code: "210311"
            },
            {
              name: "台安县",
              code: "210321"
            },
            {
              name: "岫岩满族自治县",
              code: "210323"
            },
            {
              name: "海城市",
              code: "210381"
            }
          ]
        },
        {
          name: "抚顺市",
          code: "210400",
          children: [
            {
              name: "市辖区",
              code: "210401"
            },
            {
              name: "新抚区",
              code: "210402"
            },
            {
              name: "东洲区",
              code: "210403"
            },
            {
              name: "望花区",
              code: "210404"
            },
            {
              name: "顺城区",
              code: "210411"
            },
            {
              name: "抚顺县",
              code: "210421"
            },
            {
              name: "新宾满族自治县",
              code: "210422"
            },
            {
              name: "清原满族自治县",
              code: "210423"
            }
          ]
        },
        {
          name: "本溪市",
          code: "210500",
          children: [
            {
              name: "市辖区",
              code: "210501"
            },
            {
              name: "平山区",
              code: "210502"
            },
            {
              name: "溪湖区",
              code: "210503"
            },
            {
              name: "明山区",
              code: "210504"
            },
            {
              name: "南芬区",
              code: "210505"
            },
            {
              name: "本溪满族自治县",
              code: "210521"
            },
            {
              name: "桓仁满族自治县",
              code: "210522"
            }
          ]
        },
        {
          name: "丹东市",
          code: "210600",
          children: [
            {
              name: "市辖区",
              code: "210601"
            },
            {
              name: "元宝区",
              code: "210602"
            },
            {
              name: "振兴区",
              code: "210603"
            },
            {
              name: "振安区",
              code: "210604"
            },
            {
              name: "宽甸满族自治县",
              code: "210624"
            },
            {
              name: "东港市",
              code: "210681"
            },
            {
              name: "凤城市",
              code: "210682"
            }
          ]
        },
        {
          name: "锦州市",
          code: "210700",
          children: [
            {
              name: "市辖区",
              code: "210701"
            },
            {
              name: "古塔区",
              code: "210702"
            },
            {
              name: "凌河区",
              code: "210703"
            },
            {
              name: "太和区",
              code: "210711"
            },
            {
              name: "黑山县",
              code: "210726"
            },
            {
              name: "义县",
              code: "210727"
            },
            {
              name: "凌海市",
              code: "210781"
            },
            {
              name: "北镇市",
              code: "210782"
            }
          ]
        },
        {
          name: "营口市",
          code: "210800",
          children: [
            {
              name: "市辖区",
              code: "210801"
            },
            {
              name: "站前区",
              code: "210802"
            },
            {
              name: "西市区",
              code: "210803"
            },
            {
              name: "鲅鱼圈区",
              code: "210804"
            },
            {
              name: "老边区",
              code: "210811"
            },
            {
              name: "盖州市",
              code: "210881"
            },
            {
              name: "大石桥市",
              code: "210882"
            }
          ]
        },
        {
          name: "阜新市",
          code: "210900",
          children: [
            {
              name: "市辖区",
              code: "210901"
            },
            {
              name: "海州区",
              code: "210902"
            },
            {
              name: "新邱区",
              code: "210903"
            },
            {
              name: "太平区",
              code: "210904"
            },
            {
              name: "清河门区",
              code: "210905"
            },
            {
              name: "细河区",
              code: "210911"
            },
            {
              name: "阜新蒙古族自治县",
              code: "210921"
            },
            {
              name: "彰武县",
              code: "210922"
            }
          ]
        },
        {
          name: "辽阳市",
          code: "211000",
          children: [
            {
              name: "市辖区",
              code: "211001"
            },
            {
              name: "白塔区",
              code: "211002"
            },
            {
              name: "文圣区",
              code: "211003"
            },
            {
              name: "宏伟区",
              code: "211004"
            },
            {
              name: "弓长岭区",
              code: "211005"
            },
            {
              name: "太子河区",
              code: "211011"
            },
            {
              name: "辽阳县",
              code: "211021"
            },
            {
              name: "灯塔市",
              code: "211081"
            }
          ]
        },
        {
          name: "盘锦市",
          code: "211100",
          children: [
            {
              name: "市辖区",
              code: "211101"
            },
            {
              name: "双台子区",
              code: "211102"
            },
            {
              name: "兴隆台区",
              code: "211103"
            },
            {
              name: "大洼县",
              code: "211121"
            },
            {
              name: "盘山县",
              code: "211122"
            }
          ]
        },
        {
          name: "铁岭市",
          code: "211200",
          children: [
            {
              name: "市辖区",
              code: "211201"
            },
            {
              name: "银州区",
              code: "211202"
            },
            {
              name: "清河区",
              code: "211204"
            },
            {
              name: "铁岭县",
              code: "211221"
            },
            {
              name: "西丰县",
              code: "211223"
            },
            {
              name: "昌图县",
              code: "211224"
            },
            {
              name: "调兵山市",
              code: "211281"
            },
            {
              name: "开原市",
              code: "211282"
            }
          ]
        },
        {
          name: "朝阳市",
          code: "211300",
          children: [
            {
              name: "市辖区",
              code: "211301"
            },
            {
              name: "双塔区",
              code: "211302"
            },
            {
              name: "龙城区",
              code: "211303"
            },
            {
              name: "朝阳县",
              code: "211321"
            },
            {
              name: "建平县",
              code: "211322"
            },
            {
              name: "喀喇沁左翼蒙古族自治县",
              code: "211324"
            },
            {
              name: "北票市",
              code: "211381"
            },
            {
              name: "凌源市",
              code: "211382"
            }
          ]
        },
        {
          name: "葫芦岛市",
          code: "211400",
          children: [
            {
              name: "市辖区",
              code: "211401"
            },
            {
              name: "连山区",
              code: "211402"
            },
            {
              name: "龙港区",
              code: "211403"
            },
            {
              name: "南票区",
              code: "211404"
            },
            {
              name: "绥中县",
              code: "211421"
            },
            {
              name: "建昌县",
              code: "211422"
            },
            {
              name: "兴城市",
              code: "211481"
            }
          ]
        }
      ]
    },
    {
      name: "吉林省",
      code: "220000",
      children: [
        {
          name: "长春市",
          code: "220100",
          children: [
            {
              name: "市辖区",
              code: "220101"
            },
            {
              name: "南关区",
              code: "220102"
            },
            {
              name: "宽城区",
              code: "220103"
            },
            {
              name: "朝阳区",
              code: "220104"
            },
            {
              name: "二道区",
              code: "220105"
            },
            {
              name: "绿园区",
              code: "220106"
            },
            {
              name: "双阳区",
              code: "220112"
            },
            {
              name: "农安县",
              code: "220122"
            },
            {
              name: "九台市",
              code: "220181"
            },
            {
              name: "榆树市",
              code: "220182"
            },
            {
              name: "德惠市",
              code: "220183"
            }
          ]
        },
        {
          name: "吉林市",
          code: "220200",
          children: [
            {
              name: "市辖区",
              code: "220201"
            },
            {
              name: "昌邑区",
              code: "220202"
            },
            {
              name: "龙潭区",
              code: "220203"
            },
            {
              name: "船营区",
              code: "220204"
            },
            {
              name: "丰满区",
              code: "220211"
            },
            {
              name: "永吉县",
              code: "220221"
            },
            {
              name: "蛟河市",
              code: "220281"
            },
            {
              name: "桦甸市",
              code: "220282"
            },
            {
              name: "舒兰市",
              code: "220283"
            },
            {
              name: "磐石市",
              code: "220284"
            }
          ]
        },
        {
          name: "四平市",
          code: "220300",
          children: [
            {
              name: "市辖区",
              code: "220301"
            },
            {
              name: "铁西区",
              code: "220302"
            },
            {
              name: "铁东区",
              code: "220303"
            },
            {
              name: "梨树县",
              code: "220322"
            },
            {
              name: "伊通满族自治县",
              code: "220323"
            },
            {
              name: "公主岭市",
              code: "220381"
            },
            {
              name: "双辽市",
              code: "220382"
            }
          ]
        },
        {
          name: "辽源市",
          code: "220400",
          children: [
            {
              name: "市辖区",
              code: "220401"
            },
            {
              name: "龙山区",
              code: "220402"
            },
            {
              name: "西安区",
              code: "220403"
            },
            {
              name: "东丰县",
              code: "220421"
            },
            {
              name: "东辽县",
              code: "220422"
            }
          ]
        },
        {
          name: "通化市",
          code: "220500",
          children: [
            {
              name: "市辖区",
              code: "220501"
            },
            {
              name: "东昌区",
              code: "220502"
            },
            {
              name: "二道江区",
              code: "220503"
            },
            {
              name: "通化县",
              code: "220521"
            },
            {
              name: "辉南县",
              code: "220523"
            },
            {
              name: "柳河县",
              code: "220524"
            },
            {
              name: "梅河口市",
              code: "220581"
            },
            {
              name: "集安市",
              code: "220582"
            }
          ]
        },
        {
          name: "白山市",
          code: "220600",
          children: [
            {
              name: "市辖区",
              code: "220601"
            },
            {
              name: "浑江区",
              code: "220602"
            },
            {
              name: "江源区",
              code: "220605"
            },
            {
              name: "抚松县",
              code: "220621"
            },
            {
              name: "靖宇县",
              code: "220622"
            },
            {
              name: "长白朝鲜族自治县",
              code: "220623"
            },
            {
              name: "临江市",
              code: "220681"
            }
          ]
        },
        {
          name: "松原市",
          code: "220700",
          children: [
            {
              name: "市辖区",
              code: "220701"
            },
            {
              name: "宁江区",
              code: "220702"
            },
            {
              name: "前郭尔罗斯蒙古族自治县",
              code: "220721"
            },
            {
              name: "长岭县",
              code: "220722"
            },
            {
              name: "乾安县",
              code: "220723"
            },
            {
              name: "扶余市",
              code: "220781"
            }
          ]
        },
        {
          name: "白城市",
          code: "220800",
          children: [
            {
              name: "市辖区",
              code: "220801"
            },
            {
              name: "洮北区",
              code: "220802"
            },
            {
              name: "镇赉县",
              code: "220821"
            },
            {
              name: "通榆县",
              code: "220822"
            },
            {
              name: "洮南市",
              code: "220881"
            },
            {
              name: "大安市",
              code: "220882"
            }
          ]
        },
        {
          name: "延边朝鲜族自治州",
          code: "222400",
          children: [
            {
              name: "延吉市",
              code: "222401"
            },
            {
              name: "图们市",
              code: "222402"
            },
            {
              name: "敦化市",
              code: "222403"
            },
            {
              name: "珲春市",
              code: "222404"
            },
            {
              name: "龙井市",
              code: "222405"
            },
            {
              name: "和龙市",
              code: "222406"
            },
            {
              name: "汪清县",
              code: "222424"
            },
            {
              name: "安图县",
              code: "222426"
            }
          ]
        }
      ]
    },
    {
      name: "黑龙江省",
      code: "230000",
      children: [
        {
          name: "哈尔滨市",
          code: "230100",
          children: [
            {
              name: "市辖区",
              code: "230101"
            },
            {
              name: "道里区",
              code: "230102"
            },
            {
              name: "南岗区",
              code: "230103"
            },
            {
              name: "道外区",
              code: "230104"
            },
            {
              name: "平房区",
              code: "230108"
            },
            {
              name: "松北区",
              code: "230109"
            },
            {
              name: "香坊区",
              code: "230110"
            },
            {
              name: "呼兰区",
              code: "230111"
            },
            {
              name: "阿城区",
              code: "230112"
            },
            {
              name: "依兰县",
              code: "230123"
            },
            {
              name: "方正县",
              code: "230124"
            },
            {
              name: "宾县",
              code: "230125"
            },
            {
              name: "巴彦县",
              code: "230126"
            },
            {
              name: "木兰县",
              code: "230127"
            },
            {
              name: "通河县",
              code: "230128"
            },
            {
              name: "延寿县",
              code: "230129"
            },
            {
              name: "双城市",
              code: "230182"
            },
            {
              name: "尚志市",
              code: "230183"
            },
            {
              name: "五常市",
              code: "230184"
            }
          ]
        },
        {
          name: "齐齐哈尔市",
          code: "230200",
          children: [
            {
              name: "市辖区",
              code: "230201"
            },
            {
              name: "龙沙区",
              code: "230202"
            },
            {
              name: "建华区",
              code: "230203"
            },
            {
              name: "铁锋区",
              code: "230204"
            },
            {
              name: "昂昂溪区",
              code: "230205"
            },
            {
              name: "富拉尔基区",
              code: "230206"
            },
            {
              name: "碾子山区",
              code: "230207"
            },
            {
              name: "梅里斯达斡尔族区",
              code: "230208"
            },
            {
              name: "龙江县",
              code: "230221"
            },
            {
              name: "依安县",
              code: "230223"
            },
            {
              name: "泰来县",
              code: "230224"
            },
            {
              name: "甘南县",
              code: "230225"
            },
            {
              name: "富裕县",
              code: "230227"
            },
            {
              name: "克山县",
              code: "230229"
            },
            {
              name: "克东县",
              code: "230230"
            },
            {
              name: "拜泉县",
              code: "230231"
            },
            {
              name: "讷河市",
              code: "230281"
            }
          ]
        },
        {
          name: "鸡西市",
          code: "230300",
          children: [
            {
              name: "市辖区",
              code: "230301"
            },
            {
              name: "鸡冠区",
              code: "230302"
            },
            {
              name: "恒山区",
              code: "230303"
            },
            {
              name: "滴道区",
              code: "230304"
            },
            {
              name: "梨树区",
              code: "230305"
            },
            {
              name: "城子河区",
              code: "230306"
            },
            {
              name: "麻山区",
              code: "230307"
            },
            {
              name: "鸡东县",
              code: "230321"
            },
            {
              name: "虎林市",
              code: "230381"
            },
            {
              name: "密山市",
              code: "230382"
            }
          ]
        },
        {
          name: "鹤岗市",
          code: "230400",
          children: [
            {
              name: "市辖区",
              code: "230401"
            },
            {
              name: "向阳区",
              code: "230402"
            },
            {
              name: "工农区",
              code: "230403"
            },
            {
              name: "南山区",
              code: "230404"
            },
            {
              name: "兴安区",
              code: "230405"
            },
            {
              name: "东山区",
              code: "230406"
            },
            {
              name: "兴山区",
              code: "230407"
            },
            {
              name: "萝北县",
              code: "230421"
            },
            {
              name: "绥滨县",
              code: "230422"
            }
          ]
        },
        {
          name: "双鸭山市",
          code: "230500",
          children: [
            {
              name: "市辖区",
              code: "230501"
            },
            {
              name: "尖山区",
              code: "230502"
            },
            {
              name: "岭东区",
              code: "230503"
            },
            {
              name: "四方台区",
              code: "230505"
            },
            {
              name: "宝山区",
              code: "230506"
            },
            {
              name: "集贤县",
              code: "230521"
            },
            {
              name: "友谊县",
              code: "230522"
            },
            {
              name: "宝清县",
              code: "230523"
            },
            {
              name: "饶河县",
              code: "230524"
            }
          ]
        },
        {
          name: "大庆市",
          code: "230600",
          children: [
            {
              name: "市辖区",
              code: "230601"
            },
            {
              name: "萨尔图区",
              code: "230602"
            },
            {
              name: "龙凤区",
              code: "230603"
            },
            {
              name: "让胡路区",
              code: "230604"
            },
            {
              name: "红岗区",
              code: "230605"
            },
            {
              name: "大同区",
              code: "230606"
            },
            {
              name: "肇州县",
              code: "230621"
            },
            {
              name: "肇源县",
              code: "230622"
            },
            {
              name: "林甸县",
              code: "230623"
            },
            {
              name: "杜尔伯特蒙古族自治县",
              code: "230624"
            }
          ]
        },
        {
          name: "伊春市",
          code: "230700",
          children: [
            {
              name: "市辖区",
              code: "230701"
            },
            {
              name: "伊春区",
              code: "230702"
            },
            {
              name: "南岔区",
              code: "230703"
            },
            {
              name: "友好区",
              code: "230704"
            },
            {
              name: "西林区",
              code: "230705"
            },
            {
              name: "翠峦区",
              code: "230706"
            },
            {
              name: "新青区",
              code: "230707"
            },
            {
              name: "美溪区",
              code: "230708"
            },
            {
              name: "金山屯区",
              code: "230709"
            },
            {
              name: "五营区",
              code: "230710"
            },
            {
              name: "乌马河区",
              code: "230711"
            },
            {
              name: "汤旺河区",
              code: "230712"
            },
            {
              name: "带岭区",
              code: "230713"
            },
            {
              name: "乌伊岭区",
              code: "230714"
            },
            {
              name: "红星区",
              code: "230715"
            },
            {
              name: "上甘岭区",
              code: "230716"
            },
            {
              name: "嘉荫县",
              code: "230722"
            },
            {
              name: "铁力市",
              code: "230781"
            }
          ]
        },
        {
          name: "佳木斯市",
          code: "230800",
          children: [
            {
              name: "市辖区",
              code: "230801"
            },
            {
              name: "向阳区",
              code: "230803"
            },
            {
              name: "前进区",
              code: "230804"
            },
            {
              name: "东风区",
              code: "230805"
            },
            {
              name: "郊区",
              code: "230811"
            },
            {
              name: "桦南县",
              code: "230822"
            },
            {
              name: "桦川县",
              code: "230826"
            },
            {
              name: "汤原县",
              code: "230828"
            },
            {
              name: "抚远县",
              code: "230833"
            },
            {
              name: "同江市",
              code: "230881"
            },
            {
              name: "富锦市",
              code: "230882"
            }
          ]
        },
        {
          name: "七台河市",
          code: "230900",
          children: [
            {
              name: "市辖区",
              code: "230901"
            },
            {
              name: "新兴区",
              code: "230902"
            },
            {
              name: "桃山区",
              code: "230903"
            },
            {
              name: "茄子河区",
              code: "230904"
            },
            {
              name: "勃利县",
              code: "230921"
            }
          ]
        },
        {
          name: "牡丹江市",
          code: "231000",
          children: [
            {
              name: "市辖区",
              code: "231001"
            },
            {
              name: "东安区",
              code: "231002"
            },
            {
              name: "阳明区",
              code: "231003"
            },
            {
              name: "爱民区",
              code: "231004"
            },
            {
              name: "西安区",
              code: "231005"
            },
            {
              name: "东宁县",
              code: "231024"
            },
            {
              name: "林口县",
              code: "231025"
            },
            {
              name: "绥芬河市",
              code: "231081"
            },
            {
              name: "海林市",
              code: "231083"
            },
            {
              name: "宁安市",
              code: "231084"
            },
            {
              name: "穆棱市",
              code: "231085"
            }
          ]
        },
        {
          name: "黑河市",
          code: "231100",
          children: [
            {
              name: "市辖区",
              code: "231101"
            },
            {
              name: "爱辉区",
              code: "231102"
            },
            {
              name: "嫩江县",
              code: "231121"
            },
            {
              name: "逊克县",
              code: "231123"
            },
            {
              name: "孙吴县",
              code: "231124"
            },
            {
              name: "北安市",
              code: "231181"
            },
            {
              name: "五大连池市",
              code: "231182"
            }
          ]
        },
        {
          name: "绥化市",
          code: "231200",
          children: [
            {
              name: "市辖区",
              code: "231201"
            },
            {
              name: "北林区",
              code: "231202"
            },
            {
              name: "望奎县",
              code: "231221"
            },
            {
              name: "兰西县",
              code: "231222"
            },
            {
              name: "青冈县",
              code: "231223"
            },
            {
              name: "庆安县",
              code: "231224"
            },
            {
              name: "明水县",
              code: "231225"
            },
            {
              name: "绥棱县",
              code: "231226"
            },
            {
              name: "安达市",
              code: "231281"
            },
            {
              name: "肇东市",
              code: "231282"
            },
            {
              name: "海伦市",
              code: "231283"
            }
          ]
        },
        {
          name: "大兴安岭地区",
          code: "232700",
          children: [
            {
              name: "呼玛县",
              code: "232721"
            },
            {
              name: "塔河县",
              code: "232722"
            },
            {
              name: "漠河县",
              code: "232723"
            }
          ]
        }
      ]
    },
    {
      name: "上海市",
      code: "310000",
      children: [
        {
          name: "上海市",
          code: "310000",
          children: [
            {
              name: "黄浦区",
              code: "310101"
            },
            {
              name: "徐汇区",
              code: "310104"
            },
            {
              name: "长宁区",
              code: "310105"
            },
            {
              name: "静安区",
              code: "310106"
            },
            {
              name: "普陀区",
              code: "310107"
            },
            {
              name: "闸北区",
              code: "310108"
            },
            {
              name: "虹口区",
              code: "310109"
            },
            {
              name: "杨浦区",
              code: "310110"
            },
            {
              name: "闵行区",
              code: "310112"
            },
            {
              name: "宝山区",
              code: "310113"
            },
            {
              name: "嘉定区",
              code: "310114"
            },
            {
              name: "浦东新区",
              code: "310115"
            },
            {
              name: "金山区",
              code: "310116"
            },
            {
              name: "松江区",
              code: "310117"
            },
            {
              name: "青浦区",
              code: "310118"
            },
            {
              name: "奉贤区",
              code: "310120"
            },
            {
              name: "崇明县",
              code: "310230"
            }
          ]
        }
      ]
    },
    {
      name: "江苏省",
      code: "320000",
      children: [
        {
          name: "南京市",
          code: "320100",
          children: [
            {
              name: "市辖区",
              code: "320101"
            },
            {
              name: "玄武区",
              code: "320102"
            },
            {
              name: "秦淮区",
              code: "320104"
            },
            {
              name: "建邺区",
              code: "320105"
            },
            {
              name: "鼓楼区",
              code: "320106"
            },
            {
              name: "浦口区",
              code: "320111"
            },
            {
              name: "栖霞区",
              code: "320113"
            },
            {
              name: "雨花台区",
              code: "320114"
            },
            {
              name: "江宁区",
              code: "320115"
            },
            {
              name: "六合区",
              code: "320116"
            },
            {
              name: "溧水区",
              code: "320117"
            },
            {
              name: "高淳区",
              code: "320118"
            }
          ]
        },
        {
          name: "无锡市",
          code: "320200",
          children: [
            {
              name: "市辖区",
              code: "320201"
            },
            {
              name: "崇安区",
              code: "320202"
            },
            {
              name: "南长区",
              code: "320203"
            },
            {
              name: "北塘区",
              code: "320204"
            },
            {
              name: "锡山区",
              code: "320205"
            },
            {
              name: "惠山区",
              code: "320206"
            },
            {
              name: "滨湖区",
              code: "320211"
            },
            {
              name: "江阴市",
              code: "320281"
            },
            {
              name: "宜兴市",
              code: "320282"
            }
          ]
        },
        {
          name: "徐州市",
          code: "320300",
          children: [
            {
              name: "市辖区",
              code: "320301"
            },
            {
              name: "鼓楼区",
              code: "320302"
            },
            {
              name: "云龙区",
              code: "320303"
            },
            {
              name: "贾汪区",
              code: "320305"
            },
            {
              name: "泉山区",
              code: "320311"
            },
            {
              name: "铜山区",
              code: "320312"
            },
            {
              name: "丰县",
              code: "320321"
            },
            {
              name: "沛县",
              code: "320322"
            },
            {
              name: "睢宁县",
              code: "320324"
            },
            {
              name: "新沂市",
              code: "320381"
            },
            {
              name: "邳州市",
              code: "320382"
            }
          ]
        },
        {
          name: "常州市",
          code: "320400",
          children: [
            {
              name: "市辖区",
              code: "320401"
            },
            {
              name: "天宁区",
              code: "320402"
            },
            {
              name: "钟楼区",
              code: "320404"
            },
            {
              name: "戚墅堰区",
              code: "320405"
            },
            {
              name: "新北区",
              code: "320411"
            },
            {
              name: "武进区",
              code: "320412"
            },
            {
              name: "溧阳市",
              code: "320481"
            },
            {
              name: "金坛市",
              code: "320482"
            }
          ]
        },
        {
          name: "苏州市",
          code: "320500",
          children: [
            {
              name: "市辖区",
              code: "320501"
            },
            {
              name: "虎丘区",
              code: "320505"
            },
            {
              name: "吴中区",
              code: "320506"
            },
            {
              name: "相城区",
              code: "320507"
            },
            {
              name: "姑苏区",
              code: "320508"
            },
            {
              name: "吴江区",
              code: "320509"
            },
            {
              name: "常熟市",
              code: "320581"
            },
            {
              name: "张家港市",
              code: "320582"
            },
            {
              name: "昆山市",
              code: "320583"
            },
            {
              name: "太仓市",
              code: "320585"
            }
          ]
        },
        {
          name: "南通市",
          code: "320600",
          children: [
            {
              name: "市辖区",
              code: "320601"
            },
            {
              name: "崇川区",
              code: "320602"
            },
            {
              name: "港闸区",
              code: "320611"
            },
            {
              name: "通州区",
              code: "320612"
            },
            {
              name: "海安县",
              code: "320621"
            },
            {
              name: "如东县",
              code: "320623"
            },
            {
              name: "启东市",
              code: "320681"
            },
            {
              name: "如皋市",
              code: "320682"
            },
            {
              name: "海门市",
              code: "320684"
            }
          ]
        },
        {
          name: "连云港市",
          code: "320700",
          children: [
            {
              name: "市辖区",
              code: "320701"
            },
            {
              name: "连云区",
              code: "320703"
            },
            {
              name: "新浦区",
              code: "320705"
            },
            {
              name: "海州区",
              code: "320706"
            },
            {
              name: "赣榆县",
              code: "320721"
            },
            {
              name: "东海县",
              code: "320722"
            },
            {
              name: "灌云县",
              code: "320723"
            },
            {
              name: "灌南县",
              code: "320724"
            }
          ]
        },
        {
          name: "淮安市",
          code: "320800",
          children: [
            {
              name: "市辖区",
              code: "320801"
            },
            {
              name: "清河区",
              code: "320802"
            },
            {
              name: "淮安区",
              code: "320803"
            },
            {
              name: "淮阴区",
              code: "320804"
            },
            {
              name: "清浦区",
              code: "320811"
            },
            {
              name: "涟水县",
              code: "320826"
            },
            {
              name: "洪泽县",
              code: "320829"
            },
            {
              name: "盱眙县",
              code: "320830"
            },
            {
              name: "金湖县",
              code: "320831"
            }
          ]
        },
        {
          name: "盐城市",
          code: "320900",
          children: [
            {
              name: "市辖区",
              code: "320901"
            },
            {
              name: "亭湖区",
              code: "320902"
            },
            {
              name: "盐都区",
              code: "320903"
            },
            {
              name: "响水县",
              code: "320921"
            },
            {
              name: "滨海县",
              code: "320922"
            },
            {
              name: "阜宁县",
              code: "320923"
            },
            {
              name: "射阳县",
              code: "320924"
            },
            {
              name: "建湖县",
              code: "320925"
            },
            {
              name: "东台市",
              code: "320981"
            },
            {
              name: "大丰市",
              code: "320982"
            }
          ]
        },
        {
          name: "扬州市",
          code: "321000",
          children: [
            {
              name: "市辖区",
              code: "321001"
            },
            {
              name: "广陵区",
              code: "321002"
            },
            {
              name: "邗江区",
              code: "321003"
            },
            {
              name: "江都区",
              code: "321012"
            },
            {
              name: "宝应县",
              code: "321023"
            },
            {
              name: "仪征市",
              code: "321081"
            },
            {
              name: "高邮市",
              code: "321084"
            }
          ]
        },
        {
          name: "镇江市",
          code: "321100",
          children: [
            {
              name: "市辖区",
              code: "321101"
            },
            {
              name: "京口区",
              code: "321102"
            },
            {
              name: "润州区",
              code: "321111"
            },
            {
              name: "丹徒区",
              code: "321112"
            },
            {
              name: "丹阳市",
              code: "321181"
            },
            {
              name: "扬中市",
              code: "321182"
            },
            {
              name: "句容市",
              code: "321183"
            }
          ]
        },
        {
          name: "泰州市",
          code: "321200",
          children: [
            {
              name: "市辖区",
              code: "321201"
            },
            {
              name: "海陵区",
              code: "321202"
            },
            {
              name: "高港区",
              code: "321203"
            },
            {
              name: "姜堰区",
              code: "321204"
            },
            {
              name: "兴化市",
              code: "321281"
            },
            {
              name: "靖江市",
              code: "321282"
            },
            {
              name: "泰兴市",
              code: "321283"
            }
          ]
        },
        {
          name: "宿迁市",
          code: "321300",
          children: [
            {
              name: "市辖区",
              code: "321301"
            },
            {
              name: "宿城区",
              code: "321302"
            },
            {
              name: "宿豫区",
              code: "321311"
            },
            {
              name: "沭阳县",
              code: "321322"
            },
            {
              name: "泗阳县",
              code: "321323"
            },
            {
              name: "泗洪县",
              code: "321324"
            }
          ]
        }
      ]
    },
    {
      name: "浙江省",
      code: "330000",
      children: [
        {
          name: "杭州市",
          code: "330100",
          children: [
            {
              name: "市辖区",
              code: "330101"
            },
            {
              name: "上城区",
              code: "330102"
            },
            {
              name: "下城区",
              code: "330103"
            },
            {
              name: "江干区",
              code: "330104"
            },
            {
              name: "拱墅区",
              code: "330105"
            },
            {
              name: "西湖区",
              code: "330106"
            },
            {
              name: "滨江区",
              code: "330108"
            },
            {
              name: "萧山区",
              code: "330109"
            },
            {
              name: "余杭区",
              code: "330110"
            },
            {
              name: "桐庐县",
              code: "330122"
            },
            {
              name: "淳安县",
              code: "330127"
            },
            {
              name: "建德市",
              code: "330182"
            },
            {
              name: "富阳市",
              code: "330183"
            },
            {
              name: "临安市",
              code: "330185"
            }
          ]
        },
        {
          name: "宁波市",
          code: "330200",
          children: [
            {
              name: "市辖区",
              code: "330201"
            },
            {
              name: "海曙区",
              code: "330203"
            },
            {
              name: "江东区",
              code: "330204"
            },
            {
              name: "江北区",
              code: "330205"
            },
            {
              name: "北仑区",
              code: "330206"
            },
            {
              name: "镇海区",
              code: "330211"
            },
            {
              name: "鄞州区",
              code: "330212"
            },
            {
              name: "象山县",
              code: "330225"
            },
            {
              name: "宁海县",
              code: "330226"
            },
            {
              name: "余姚市",
              code: "330281"
            },
            {
              name: "慈溪市",
              code: "330282"
            },
            {
              name: "奉化市",
              code: "330283"
            }
          ]
        },
        {
          name: "温州市",
          code: "330300",
          children: [
            {
              name: "市辖区",
              code: "330301"
            },
            {
              name: "鹿城区",
              code: "330302"
            },
            {
              name: "龙湾区",
              code: "330303"
            },
            {
              name: "瓯海区",
              code: "330304"
            },
            {
              name: "洞头县",
              code: "330322"
            },
            {
              name: "永嘉县",
              code: "330324"
            },
            {
              name: "平阳县",
              code: "330326"
            },
            {
              name: "苍南县",
              code: "330327"
            },
            {
              name: "文成县",
              code: "330328"
            },
            {
              name: "泰顺县",
              code: "330329"
            },
            {
              name: "瑞安市",
              code: "330381"
            },
            {
              name: "乐清市",
              code: "330382"
            }
          ]
        },
        {
          name: "嘉兴市",
          code: "330400",
          children: [
            {
              name: "市辖区",
              code: "330401"
            },
            {
              name: "南湖区",
              code: "330402"
            },
            {
              name: "秀洲区",
              code: "330411"
            },
            {
              name: "嘉善县",
              code: "330421"
            },
            {
              name: "海盐县",
              code: "330424"
            },
            {
              name: "海宁市",
              code: "330481"
            },
            {
              name: "平湖市",
              code: "330482"
            },
            {
              name: "桐乡市",
              code: "330483"
            }
          ]
        },
        {
          name: "湖州市",
          code: "330500",
          children: [
            {
              name: "市辖区",
              code: "330501"
            },
            {
              name: "吴兴区",
              code: "330502"
            },
            {
              name: "南浔区",
              code: "330503"
            },
            {
              name: "德清县",
              code: "330521"
            },
            {
              name: "长兴县",
              code: "330522"
            },
            {
              name: "安吉县",
              code: "330523"
            }
          ]
        },
        {
          name: "绍兴市",
          code: "330600",
          children: [
            {
              name: "市辖区",
              code: "330601"
            },
            {
              name: "越城区",
              code: "330602"
            },
            {
              name: "绍兴县",
              code: "330621"
            },
            {
              name: "新昌县",
              code: "330624"
            },
            {
              name: "诸暨市",
              code: "330681"
            },
            {
              name: "上虞市",
              code: "330682"
            },
            {
              name: "嵊州市",
              code: "330683"
            }
          ]
        },
        {
          name: "金华市",
          code: "330700",
          children: [
            {
              name: "市辖区",
              code: "330701"
            },
            {
              name: "婺城区",
              code: "330702"
            },
            {
              name: "金东区",
              code: "330703"
            },
            {
              name: "武义县",
              code: "330723"
            },
            {
              name: "浦江县",
              code: "330726"
            },
            {
              name: "磐安县",
              code: "330727"
            },
            {
              name: "兰溪市",
              code: "330781"
            },
            {
              name: "义乌市",
              code: "330782"
            },
            {
              name: "东阳市",
              code: "330783"
            },
            {
              name: "永康市",
              code: "330784"
            }
          ]
        },
        {
          name: "衢州市",
          code: "330800",
          children: [
            {
              name: "市辖区",
              code: "330801"
            },
            {
              name: "柯城区",
              code: "330802"
            },
            {
              name: "衢江区",
              code: "330803"
            },
            {
              name: "常山县",
              code: "330822"
            },
            {
              name: "开化县",
              code: "330824"
            },
            {
              name: "龙游县",
              code: "330825"
            },
            {
              name: "江山市",
              code: "330881"
            }
          ]
        },
        {
          name: "舟山市",
          code: "330900",
          children: [
            {
              name: "市辖区",
              code: "330901"
            },
            {
              name: "定海区",
              code: "330902"
            },
            {
              name: "普陀区",
              code: "330903"
            },
            {
              name: "岱山县",
              code: "330921"
            },
            {
              name: "嵊泗县",
              code: "330922"
            }
          ]
        },
        {
          name: "台州市",
          code: "331000",
          children: [
            {
              name: "市辖区",
              code: "331001"
            },
            {
              name: "椒江区",
              code: "331002"
            },
            {
              name: "黄岩区",
              code: "331003"
            },
            {
              name: "路桥区",
              code: "331004"
            },
            {
              name: "玉环县",
              code: "331021"
            },
            {
              name: "三门县",
              code: "331022"
            },
            {
              name: "天台县",
              code: "331023"
            },
            {
              name: "仙居县",
              code: "331024"
            },
            {
              name: "温岭市",
              code: "331081"
            },
            {
              name: "临海市",
              code: "331082"
            }
          ]
        },
        {
          name: "丽水市",
          code: "331100",
          children: [
            {
              name: "市辖区",
              code: "331101"
            },
            {
              name: "莲都区",
              code: "331102"
            },
            {
              name: "青田县",
              code: "331121"
            },
            {
              name: "缙云县",
              code: "331122"
            },
            {
              name: "遂昌县",
              code: "331123"
            },
            {
              name: "松阳县",
              code: "331124"
            },
            {
              name: "云和县",
              code: "331125"
            },
            {
              name: "庆元县",
              code: "331126"
            },
            {
              name: "景宁畲族自治县",
              code: "331127"
            },
            {
              name: "龙泉市",
              code: "331181"
            }
          ]
        }
      ]
    },
    {
      name: "安徽省",
      code: "340000",
      children: [
        {
          name: "合肥市",
          code: "340100",
          children: [
            {
              name: "市辖区",
              code: "340101"
            },
            {
              name: "瑶海区",
              code: "340102"
            },
            {
              name: "庐阳区",
              code: "340103"
            },
            {
              name: "蜀山区",
              code: "340104"
            },
            {
              name: "包河区",
              code: "340111"
            },
            {
              name: "长丰县",
              code: "340121"
            },
            {
              name: "肥东县",
              code: "340122"
            },
            {
              name: "肥西县",
              code: "340123"
            },
            {
              name: "庐江县",
              code: "340124"
            },
            {
              name: "巢湖市",
              code: "340181"
            }
          ]
        },
        {
          name: "芜湖市",
          code: "340200",
          children: [
            {
              name: "市辖区",
              code: "340201"
            },
            {
              name: "镜湖区",
              code: "340202"
            },
            {
              name: "弋江区",
              code: "340203"
            },
            {
              name: "鸠江区",
              code: "340207"
            },
            {
              name: "三山区",
              code: "340208"
            },
            {
              name: "芜湖县",
              code: "340221"
            },
            {
              name: "繁昌县",
              code: "340222"
            },
            {
              name: "南陵县",
              code: "340223"
            },
            {
              name: "无为县",
              code: "340225"
            }
          ]
        },
        {
          name: "蚌埠市",
          code: "340300",
          children: [
            {
              name: "市辖区",
              code: "340301"
            },
            {
              name: "龙子湖区",
              code: "340302"
            },
            {
              name: "蚌山区",
              code: "340303"
            },
            {
              name: "禹会区",
              code: "340304"
            },
            {
              name: "淮上区",
              code: "340311"
            },
            {
              name: "怀远县",
              code: "340321"
            },
            {
              name: "五河县",
              code: "340322"
            },
            {
              name: "固镇县",
              code: "340323"
            }
          ]
        },
        {
          name: "淮南市",
          code: "340400",
          children: [
            {
              name: "市辖区",
              code: "340401"
            },
            {
              name: "大通区",
              code: "340402"
            },
            {
              name: "田家庵区",
              code: "340403"
            },
            {
              name: "谢家集区",
              code: "340404"
            },
            {
              name: "八公山区",
              code: "340405"
            },
            {
              name: "潘集区",
              code: "340406"
            },
            {
              name: "凤台县",
              code: "340421"
            }
          ]
        },
        {
          name: "马鞍山市",
          code: "340500",
          children: [
            {
              name: "市辖区",
              code: "340501"
            },
            {
              name: "花山区",
              code: "340503"
            },
            {
              name: "雨山区",
              code: "340504"
            },
            {
              name: "博望区",
              code: "340506"
            },
            {
              name: "当涂县",
              code: "340521"
            },
            {
              name: "含山县",
              code: "340522"
            },
            {
              name: "和县",
              code: "340523"
            }
          ]
        },
        {
          name: "淮北市",
          code: "340600",
          children: [
            {
              name: "市辖区",
              code: "340601"
            },
            {
              name: "杜集区",
              code: "340602"
            },
            {
              name: "相山区",
              code: "340603"
            },
            {
              name: "烈山区",
              code: "340604"
            },
            {
              name: "濉溪县",
              code: "340621"
            }
          ]
        },
        {
          name: "铜陵市",
          code: "340700",
          children: [
            {
              name: "市辖区",
              code: "340701"
            },
            {
              name: "铜官山区",
              code: "340702"
            },
            {
              name: "狮子山区",
              code: "340703"
            },
            {
              name: "郊区",
              code: "340711"
            },
            {
              name: "铜陵县",
              code: "340721"
            }
          ]
        },
        {
          name: "安庆市",
          code: "340800",
          children: [
            {
              name: "市辖区",
              code: "340801"
            },
            {
              name: "迎江区",
              code: "340802"
            },
            {
              name: "大观区",
              code: "340803"
            },
            {
              name: "宜秀区",
              code: "340811"
            },
            {
              name: "怀宁县",
              code: "340822"
            },
            {
              name: "枞阳县",
              code: "340823"
            },
            {
              name: "潜山县",
              code: "340824"
            },
            {
              name: "太湖县",
              code: "340825"
            },
            {
              name: "宿松县",
              code: "340826"
            },
            {
              name: "望江县",
              code: "340827"
            },
            {
              name: "岳西县",
              code: "340828"
            },
            {
              name: "桐城市",
              code: "340881"
            }
          ]
        },
        {
          name: "黄山市",
          code: "341000",
          children: [
            {
              name: "市辖区",
              code: "341001"
            },
            {
              name: "屯溪区",
              code: "341002"
            },
            {
              name: "黄山区",
              code: "341003"
            },
            {
              name: "徽州区",
              code: "341004"
            },
            {
              name: "歙县",
              code: "341021"
            },
            {
              name: "休宁县",
              code: "341022"
            },
            {
              name: "黟县",
              code: "341023"
            },
            {
              name: "祁门县",
              code: "341024"
            }
          ]
        },
        {
          name: "滁州市",
          code: "341100",
          children: [
            {
              name: "市辖区",
              code: "341101"
            },
            {
              name: "琅琊区",
              code: "341102"
            },
            {
              name: "南谯区",
              code: "341103"
            },
            {
              name: "来安县",
              code: "341122"
            },
            {
              name: "全椒县",
              code: "341124"
            },
            {
              name: "定远县",
              code: "341125"
            },
            {
              name: "凤阳县",
              code: "341126"
            },
            {
              name: "天长市",
              code: "341181"
            },
            {
              name: "明光市",
              code: "341182"
            }
          ]
        },
        {
          name: "阜阳市",
          code: "341200",
          children: [
            {
              name: "市辖区",
              code: "341201"
            },
            {
              name: "颍州区",
              code: "341202"
            },
            {
              name: "颍东区",
              code: "341203"
            },
            {
              name: "颍泉区",
              code: "341204"
            },
            {
              name: "临泉县",
              code: "341221"
            },
            {
              name: "太和县",
              code: "341222"
            },
            {
              name: "阜南县",
              code: "341225"
            },
            {
              name: "颍上县",
              code: "341226"
            },
            {
              name: "界首市",
              code: "341282"
            }
          ]
        },
        {
          name: "宿州市",
          code: "341300",
          children: [
            {
              name: "市辖区",
              code: "341301"
            },
            {
              name: "埇桥区",
              code: "341302"
            },
            {
              name: "砀山县",
              code: "341321"
            },
            {
              name: "萧县",
              code: "341322"
            },
            {
              name: "灵璧县",
              code: "341323"
            },
            {
              name: "泗县",
              code: "341324"
            }
          ]
        },
        {
          name: "六安市",
          code: "341500",
          children: [
            {
              name: "市辖区",
              code: "341501"
            },
            {
              name: "金安区",
              code: "341502"
            },
            {
              name: "裕安区",
              code: "341503"
            },
            {
              name: "寿县",
              code: "341521"
            },
            {
              name: "霍邱县",
              code: "341522"
            },
            {
              name: "舒城县",
              code: "341523"
            },
            {
              name: "金寨县",
              code: "341524"
            },
            {
              name: "霍山县",
              code: "341525"
            }
          ]
        },
        {
          name: "亳州市",
          code: "341600",
          children: [
            {
              name: "市辖区",
              code: "341601"
            },
            {
              name: "谯城区",
              code: "341602"
            },
            {
              name: "涡阳县",
              code: "341621"
            },
            {
              name: "蒙城县",
              code: "341622"
            },
            {
              name: "利辛县",
              code: "341623"
            }
          ]
        },
        {
          name: "池州市",
          code: "341700",
          children: [
            {
              name: "市辖区",
              code: "341701"
            },
            {
              name: "贵池区",
              code: "341702"
            },
            {
              name: "东至县",
              code: "341721"
            },
            {
              name: "石台县",
              code: "341722"
            },
            {
              name: "青阳县",
              code: "341723"
            }
          ]
        },
        {
          name: "宣城市",
          code: "341800",
          children: [
            {
              name: "市辖区",
              code: "341801"
            },
            {
              name: "宣州区",
              code: "341802"
            },
            {
              name: "郎溪县",
              code: "341821"
            },
            {
              name: "广德县",
              code: "341822"
            },
            {
              name: "泾县",
              code: "341823"
            },
            {
              name: "绩溪县",
              code: "341824"
            },
            {
              name: "旌德县",
              code: "341825"
            },
            {
              name: "宁国市",
              code: "341881"
            }
          ]
        }
      ]
    },
    {
      name: "福建省",
      code: "350000",
      children: [
        {
          name: "福州市",
          code: "350100",
          children: [
            {
              name: "市辖区",
              code: "350101"
            },
            {
              name: "鼓楼区",
              code: "350102"
            },
            {
              name: "台江区",
              code: "350103"
            },
            {
              name: "仓山区",
              code: "350104"
            },
            {
              name: "马尾区",
              code: "350105"
            },
            {
              name: "晋安区",
              code: "350111"
            },
            {
              name: "闽侯县",
              code: "350121"
            },
            {
              name: "连江县",
              code: "350122"
            },
            {
              name: "罗源县",
              code: "350123"
            },
            {
              name: "闽清县",
              code: "350124"
            },
            {
              name: "永泰县",
              code: "350125"
            },
            {
              name: "平潭县",
              code: "350128"
            },
            {
              name: "福清市",
              code: "350181"
            },
            {
              name: "长乐市",
              code: "350182"
            }
          ]
        },
        {
          name: "厦门市",
          code: "350200",
          children: [
            {
              name: "市辖区",
              code: "350201"
            },
            {
              name: "思明区",
              code: "350203"
            },
            {
              name: "海沧区",
              code: "350205"
            },
            {
              name: "湖里区",
              code: "350206"
            },
            {
              name: "集美区",
              code: "350211"
            },
            {
              name: "同安区",
              code: "350212"
            },
            {
              name: "翔安区",
              code: "350213"
            }
          ]
        },
        {
          name: "莆田市",
          code: "350300",
          children: [
            {
              name: "市辖区",
              code: "350301"
            },
            {
              name: "城厢区",
              code: "350302"
            },
            {
              name: "涵江区",
              code: "350303"
            },
            {
              name: "荔城区",
              code: "350304"
            },
            {
              name: "秀屿区",
              code: "350305"
            },
            {
              name: "仙游县",
              code: "350322"
            }
          ]
        },
        {
          name: "三明市",
          code: "350400",
          children: [
            {
              name: "市辖区",
              code: "350401"
            },
            {
              name: "梅列区",
              code: "350402"
            },
            {
              name: "三元区",
              code: "350403"
            },
            {
              name: "明溪县",
              code: "350421"
            },
            {
              name: "清流县",
              code: "350423"
            },
            {
              name: "宁化县",
              code: "350424"
            },
            {
              name: "大田县",
              code: "350425"
            },
            {
              name: "尤溪县",
              code: "350426"
            },
            {
              name: "沙县",
              code: "350427"
            },
            {
              name: "将乐县",
              code: "350428"
            },
            {
              name: "泰宁县",
              code: "350429"
            },
            {
              name: "建宁县",
              code: "350430"
            },
            {
              name: "永安市",
              code: "350481"
            }
          ]
        },
        {
          name: "泉州市",
          code: "350500",
          children: [
            {
              name: "市辖区",
              code: "350501"
            },
            {
              name: "鲤城区",
              code: "350502"
            },
            {
              name: "丰泽区",
              code: "350503"
            },
            {
              name: "洛江区",
              code: "350504"
            },
            {
              name: "泉港区",
              code: "350505"
            },
            {
              name: "惠安县",
              code: "350521"
            },
            {
              name: "安溪县",
              code: "350524"
            },
            {
              name: "永春县",
              code: "350525"
            },
            {
              name: "德化县",
              code: "350526"
            },
            {
              name: "金门县",
              code: "350527"
            },
            {
              name: "石狮市",
              code: "350581"
            },
            {
              name: "晋江市",
              code: "350582"
            },
            {
              name: "南安市",
              code: "350583"
            }
          ]
        },
        {
          name: "漳州市",
          code: "350600",
          children: [
            {
              name: "市辖区",
              code: "350601"
            },
            {
              name: "芗城区",
              code: "350602"
            },
            {
              name: "龙文区",
              code: "350603"
            },
            {
              name: "云霄县",
              code: "350622"
            },
            {
              name: "漳浦县",
              code: "350623"
            },
            {
              name: "诏安县",
              code: "350624"
            },
            {
              name: "长泰县",
              code: "350625"
            },
            {
              name: "东山县",
              code: "350626"
            },
            {
              name: "南靖县",
              code: "350627"
            },
            {
              name: "平和县",
              code: "350628"
            },
            {
              name: "华安县",
              code: "350629"
            },
            {
              name: "龙海市",
              code: "350681"
            }
          ]
        },
        {
          name: "南平市",
          code: "350700",
          children: [
            {
              name: "市辖区",
              code: "350701"
            },
            {
              name: "延平区",
              code: "350702"
            },
            {
              name: "顺昌县",
              code: "350721"
            },
            {
              name: "浦城县",
              code: "350722"
            },
            {
              name: "光泽县",
              code: "350723"
            },
            {
              name: "松溪县",
              code: "350724"
            },
            {
              name: "政和县",
              code: "350725"
            },
            {
              name: "邵武市",
              code: "350781"
            },
            {
              name: "武夷山市",
              code: "350782"
            },
            {
              name: "建瓯市",
              code: "350783"
            },
            {
              name: "建阳市",
              code: "350784"
            }
          ]
        },
        {
          name: "龙岩市",
          code: "350800",
          children: [
            {
              name: "市辖区",
              code: "350801"
            },
            {
              name: "新罗区",
              code: "350802"
            },
            {
              name: "长汀县",
              code: "350821"
            },
            {
              name: "永定县",
              code: "350822"
            },
            {
              name: "上杭县",
              code: "350823"
            },
            {
              name: "武平县",
              code: "350824"
            },
            {
              name: "连城县",
              code: "350825"
            },
            {
              name: "漳平市",
              code: "350881"
            }
          ]
        },
        {
          name: "宁德市",
          code: "350900",
          children: [
            {
              name: "市辖区",
              code: "350901"
            },
            {
              name: "蕉城区",
              code: "350902"
            },
            {
              name: "霞浦县",
              code: "350921"
            },
            {
              name: "古田县",
              code: "350922"
            },
            {
              name: "屏南县",
              code: "350923"
            },
            {
              name: "寿宁县",
              code: "350924"
            },
            {
              name: "周宁县",
              code: "350925"
            },
            {
              name: "柘荣县",
              code: "350926"
            },
            {
              name: "福安市",
              code: "350981"
            },
            {
              name: "福鼎市",
              code: "350982"
            }
          ]
        }
      ]
    },
    {
      name: "江西省",
      code: "360000",
      children: [
        {
          name: "南昌市",
          code: "360100",
          children: [
            {
              name: "市辖区",
              code: "360101"
            },
            {
              name: "东湖区",
              code: "360102"
            },
            {
              name: "西湖区",
              code: "360103"
            },
            {
              name: "青云谱区",
              code: "360104"
            },
            {
              name: "湾里区",
              code: "360105"
            },
            {
              name: "青山湖区",
              code: "360111"
            },
            {
              name: "南昌县",
              code: "360121"
            },
            {
              name: "新建县",
              code: "360122"
            },
            {
              name: "安义县",
              code: "360123"
            },
            {
              name: "进贤县",
              code: "360124"
            }
          ]
        },
        {
          name: "景德镇市",
          code: "360200",
          children: [
            {
              name: "市辖区",
              code: "360201"
            },
            {
              name: "昌江区",
              code: "360202"
            },
            {
              name: "珠山区",
              code: "360203"
            },
            {
              name: "浮梁县",
              code: "360222"
            },
            {
              name: "乐平市",
              code: "360281"
            }
          ]
        },
        {
          name: "萍乡市",
          code: "360300",
          children: [
            {
              name: "市辖区",
              code: "360301"
            },
            {
              name: "安源区",
              code: "360302"
            },
            {
              name: "湘东区",
              code: "360313"
            },
            {
              name: "莲花县",
              code: "360321"
            },
            {
              name: "上栗县",
              code: "360322"
            },
            {
              name: "芦溪县",
              code: "360323"
            }
          ]
        },
        {
          name: "九江市",
          code: "360400",
          children: [
            {
              name: "市辖区",
              code: "360401"
            },
            {
              name: "庐山区",
              code: "360402"
            },
            {
              name: "浔阳区",
              code: "360403"
            },
            {
              name: "九江县",
              code: "360421"
            },
            {
              name: "武宁县",
              code: "360423"
            },
            {
              name: "修水县",
              code: "360424"
            },
            {
              name: "永修县",
              code: "360425"
            },
            {
              name: "德安县",
              code: "360426"
            },
            {
              name: "星子县",
              code: "360427"
            },
            {
              name: "都昌县",
              code: "360428"
            },
            {
              name: "湖口县",
              code: "360429"
            },
            {
              name: "彭泽县",
              code: "360430"
            },
            {
              name: "瑞昌市",
              code: "360481"
            },
            {
              name: "共青城市",
              code: "360482"
            }
          ]
        },
        {
          name: "新余市",
          code: "360500",
          children: [
            {
              name: "市辖区",
              code: "360501"
            },
            {
              name: "渝水区",
              code: "360502"
            },
            {
              name: "分宜县",
              code: "360521"
            }
          ]
        },
        {
          name: "鹰潭市",
          code: "360600",
          children: [
            {
              name: "市辖区",
              code: "360601"
            },
            {
              name: "月湖区",
              code: "360602"
            },
            {
              name: "余江县",
              code: "360622"
            },
            {
              name: "贵溪市",
              code: "360681"
            }
          ]
        },
        {
          name: "赣州市",
          code: "360700",
          children: [
            {
              name: "市辖区",
              code: "360701"
            },
            {
              name: "章贡区",
              code: "360702"
            },
            {
              name: "赣县",
              code: "360721"
            },
            {
              name: "信丰县",
              code: "360722"
            },
            {
              name: "大余县",
              code: "360723"
            },
            {
              name: "上犹县",
              code: "360724"
            },
            {
              name: "崇义县",
              code: "360725"
            },
            {
              name: "安远县",
              code: "360726"
            },
            {
              name: "龙南县",
              code: "360727"
            },
            {
              name: "定南县",
              code: "360728"
            },
            {
              name: "全南县",
              code: "360729"
            },
            {
              name: "宁都县",
              code: "360730"
            },
            {
              name: "于都县",
              code: "360731"
            },
            {
              name: "兴国县",
              code: "360732"
            },
            {
              name: "会昌县",
              code: "360733"
            },
            {
              name: "寻乌县",
              code: "360734"
            },
            {
              name: "石城县",
              code: "360735"
            },
            {
              name: "瑞金市",
              code: "360781"
            },
            {
              name: "南康市",
              code: "360782"
            }
          ]
        },
        {
          name: "吉安市",
          code: "360800",
          children: [
            {
              name: "市辖区",
              code: "360801"
            },
            {
              name: "吉州区",
              code: "360802"
            },
            {
              name: "青原区",
              code: "360803"
            },
            {
              name: "吉安县",
              code: "360821"
            },
            {
              name: "吉水县",
              code: "360822"
            },
            {
              name: "峡江县",
              code: "360823"
            },
            {
              name: "新干县",
              code: "360824"
            },
            {
              name: "永丰县",
              code: "360825"
            },
            {
              name: "泰和县",
              code: "360826"
            },
            {
              name: "遂川县",
              code: "360827"
            },
            {
              name: "万安县",
              code: "360828"
            },
            {
              name: "安福县",
              code: "360829"
            },
            {
              name: "永新县",
              code: "360830"
            },
            {
              name: "井冈山市",
              code: "360881"
            }
          ]
        },
        {
          name: "宜春市",
          code: "360900",
          children: [
            {
              name: "市辖区",
              code: "360901"
            },
            {
              name: "袁州区",
              code: "360902"
            },
            {
              name: "奉新县",
              code: "360921"
            },
            {
              name: "万载县",
              code: "360922"
            },
            {
              name: "上高县",
              code: "360923"
            },
            {
              name: "宜丰县",
              code: "360924"
            },
            {
              name: "靖安县",
              code: "360925"
            },
            {
              name: "铜鼓县",
              code: "360926"
            },
            {
              name: "丰城市",
              code: "360981"
            },
            {
              name: "樟树市",
              code: "360982"
            },
            {
              name: "高安市",
              code: "360983"
            }
          ]
        },
        {
          name: "抚州市",
          code: "361000",
          children: [
            {
              name: "市辖区",
              code: "361001"
            },
            {
              name: "临川区",
              code: "361002"
            },
            {
              name: "南城县",
              code: "361021"
            },
            {
              name: "黎川县",
              code: "361022"
            },
            {
              name: "南丰县",
              code: "361023"
            },
            {
              name: "崇仁县",
              code: "361024"
            },
            {
              name: "乐安县",
              code: "361025"
            },
            {
              name: "宜黄县",
              code: "361026"
            },
            {
              name: "金溪县",
              code: "361027"
            },
            {
              name: "资溪县",
              code: "361028"
            },
            {
              name: "东乡县",
              code: "361029"
            },
            {
              name: "广昌县",
              code: "361030"
            }
          ]
        },
        {
          name: "上饶市",
          code: "361100",
          children: [
            {
              name: "市辖区",
              code: "361101"
            },
            {
              name: "信州区",
              code: "361102"
            },
            {
              name: "上饶县",
              code: "361121"
            },
            {
              name: "广丰县",
              code: "361122"
            },
            {
              name: "玉山县",
              code: "361123"
            },
            {
              name: "铅山县",
              code: "361124"
            },
            {
              name: "横峰县",
              code: "361125"
            },
            {
              name: "弋阳县",
              code: "361126"
            },
            {
              name: "余干县",
              code: "361127"
            },
            {
              name: "鄱阳县",
              code: "361128"
            },
            {
              name: "万年县",
              code: "361129"
            },
            {
              name: "婺源县",
              code: "361130"
            },
            {
              name: "德兴市",
              code: "361181"
            }
          ]
        }
      ]
    },
    {
      name: "山东省",
      code: "370000",
      children: [
        {
          name: "济南市",
          code: "370100",
          children: [
            {
              name: "市辖区",
              code: "370101"
            },
            {
              name: "历下区",
              code: "370102"
            },
            {
              name: "市中区",
              code: "370103"
            },
            {
              name: "槐荫区",
              code: "370104"
            },
            {
              name: "天桥区",
              code: "370105"
            },
            {
              name: "历城区",
              code: "370112"
            },
            {
              name: "长清区",
              code: "370113"
            },
            {
              name: "平阴县",
              code: "370124"
            },
            {
              name: "济阳县",
              code: "370125"
            },
            {
              name: "商河县",
              code: "370126"
            },
            {
              name: "章丘市",
              code: "370181"
            }
          ]
        },
        {
          name: "青岛市",
          code: "370200",
          children: [
            {
              name: "市辖区",
              code: "370201"
            },
            {
              name: "市南区",
              code: "370202"
            },
            {
              name: "市北区",
              code: "370203"
            },
            {
              name: "黄岛区",
              code: "370211"
            },
            {
              name: "崂山区",
              code: "370212"
            },
            {
              name: "李沧区",
              code: "370213"
            },
            {
              name: "城阳区",
              code: "370214"
            },
            {
              name: "胶州市",
              code: "370281"
            },
            {
              name: "即墨市",
              code: "370282"
            },
            {
              name: "平度市",
              code: "370283"
            },
            {
              name: "莱西市",
              code: "370285"
            }
          ]
        },
        {
          name: "淄博市",
          code: "370300",
          children: [
            {
              name: "市辖区",
              code: "370301"
            },
            {
              name: "淄川区",
              code: "370302"
            },
            {
              name: "张店区",
              code: "370303"
            },
            {
              name: "博山区",
              code: "370304"
            },
            {
              name: "临淄区",
              code: "370305"
            },
            {
              name: "周村区",
              code: "370306"
            },
            {
              name: "桓台县",
              code: "370321"
            },
            {
              name: "高青县",
              code: "370322"
            },
            {
              name: "沂源县",
              code: "370323"
            }
          ]
        },
        {
          name: "枣庄市",
          code: "370400",
          children: [
            {
              name: "市辖区",
              code: "370401"
            },
            {
              name: "市中区",
              code: "370402"
            },
            {
              name: "薛城区",
              code: "370403"
            },
            {
              name: "峄城区",
              code: "370404"
            },
            {
              name: "台儿庄区",
              code: "370405"
            },
            {
              name: "山亭区",
              code: "370406"
            },
            {
              name: "滕州市",
              code: "370481"
            }
          ]
        },
        {
          name: "东营市",
          code: "370500",
          children: [
            {
              name: "市辖区",
              code: "370501"
            },
            {
              name: "东营区",
              code: "370502"
            },
            {
              name: "河口区",
              code: "370503"
            },
            {
              name: "垦利县",
              code: "370521"
            },
            {
              name: "利津县",
              code: "370522"
            },
            {
              name: "广饶县",
              code: "370523"
            }
          ]
        },
        {
          name: "烟台市",
          code: "370600",
          children: [
            {
              name: "市辖区",
              code: "370601"
            },
            {
              name: "芝罘区",
              code: "370602"
            },
            {
              name: "福山区",
              code: "370611"
            },
            {
              name: "牟平区",
              code: "370612"
            },
            {
              name: "莱山区",
              code: "370613"
            },
            {
              name: "长岛县",
              code: "370634"
            },
            {
              name: "龙口市",
              code: "370681"
            },
            {
              name: "莱阳市",
              code: "370682"
            },
            {
              name: "莱州市",
              code: "370683"
            },
            {
              name: "蓬莱市",
              code: "370684"
            },
            {
              name: "招远市",
              code: "370685"
            },
            {
              name: "栖霞市",
              code: "370686"
            },
            {
              name: "海阳市",
              code: "370687"
            }
          ]
        },
        {
          name: "潍坊市",
          code: "370700",
          children: [
            {
              name: "市辖区",
              code: "370701"
            },
            {
              name: "潍城区",
              code: "370702"
            },
            {
              name: "寒亭区",
              code: "370703"
            },
            {
              name: "坊子区",
              code: "370704"
            },
            {
              name: "奎文区",
              code: "370705"
            },
            {
              name: "临朐县",
              code: "370724"
            },
            {
              name: "昌乐县",
              code: "370725"
            },
            {
              name: "青州市",
              code: "370781"
            },
            {
              name: "诸城市",
              code: "370782"
            },
            {
              name: "寿光市",
              code: "370783"
            },
            {
              name: "安丘市",
              code: "370784"
            },
            {
              name: "高密市",
              code: "370785"
            },
            {
              name: "昌邑市",
              code: "370786"
            }
          ]
        },
        {
          name: "济宁市",
          code: "370800",
          children: [
            {
              name: "市辖区",
              code: "370801"
            },
            {
              name: "市中区",
              code: "370802"
            },
            {
              name: "任城区",
              code: "370811"
            },
            {
              name: "微山县",
              code: "370826"
            },
            {
              name: "鱼台县",
              code: "370827"
            },
            {
              name: "金乡县",
              code: "370828"
            },
            {
              name: "嘉祥县",
              code: "370829"
            },
            {
              name: "汶上县",
              code: "370830"
            },
            {
              name: "泗水县",
              code: "370831"
            },
            {
              name: "梁山县",
              code: "370832"
            },
            {
              name: "曲阜市",
              code: "370881"
            },
            {
              name: "兖州市",
              code: "370882"
            },
            {
              name: "邹城市",
              code: "370883"
            }
          ]
        },
        {
          name: "泰安市",
          code: "370900",
          children: [
            {
              name: "市辖区",
              code: "370901"
            },
            {
              name: "泰山区",
              code: "370902"
            },
            {
              name: "岱岳区",
              code: "370911"
            },
            {
              name: "宁阳县",
              code: "370921"
            },
            {
              name: "东平县",
              code: "370923"
            },
            {
              name: "新泰市",
              code: "370982"
            },
            {
              name: "肥城市",
              code: "370983"
            }
          ]
        },
        {
          name: "威海市",
          code: "371000",
          children: [
            {
              name: "市辖区",
              code: "371001"
            },
            {
              name: "环翠区",
              code: "371002"
            },
            {
              name: "文登市",
              code: "371081"
            },
            {
              name: "荣成市",
              code: "371082"
            },
            {
              name: "乳山市",
              code: "371083"
            }
          ]
        },
        {
          name: "日照市",
          code: "371100",
          children: [
            {
              name: "市辖区",
              code: "371101"
            },
            {
              name: "东港区",
              code: "371102"
            },
            {
              name: "岚山区",
              code: "371103"
            },
            {
              name: "五莲县",
              code: "371121"
            },
            {
              name: "莒县",
              code: "371122"
            }
          ]
        },
        {
          name: "莱芜市",
          code: "371200",
          children: [
            {
              name: "市辖区",
              code: "371201"
            },
            {
              name: "莱城区",
              code: "371202"
            },
            {
              name: "钢城区",
              code: "371203"
            }
          ]
        },
        {
          name: "临沂市",
          code: "371300",
          children: [
            {
              name: "市辖区",
              code: "371301"
            },
            {
              name: "兰山区",
              code: "371302"
            },
            {
              name: "罗庄区",
              code: "371311"
            },
            {
              name: "河东区",
              code: "371312"
            },
            {
              name: "沂南县",
              code: "371321"
            },
            {
              name: "郯城县",
              code: "371322"
            },
            {
              name: "沂水县",
              code: "371323"
            },
            {
              name: "苍山县",
              code: "371324"
            },
            {
              name: "费县",
              code: "371325"
            },
            {
              name: "平邑县",
              code: "371326"
            },
            {
              name: "莒南县",
              code: "371327"
            },
            {
              name: "蒙阴县",
              code: "371328"
            },
            {
              name: "临沭县",
              code: "371329"
            }
          ]
        },
        {
          name: "德州市",
          code: "371400",
          children: [
            {
              name: "市辖区",
              code: "371401"
            },
            {
              name: "德城区",
              code: "371402"
            },
            {
              name: "陵县",
              code: "371421"
            },
            {
              name: "宁津县",
              code: "371422"
            },
            {
              name: "庆云县",
              code: "371423"
            },
            {
              name: "临邑县",
              code: "371424"
            },
            {
              name: "齐河县",
              code: "371425"
            },
            {
              name: "平原县",
              code: "371426"
            },
            {
              name: "夏津县",
              code: "371427"
            },
            {
              name: "武城县",
              code: "371428"
            },
            {
              name: "乐陵市",
              code: "371481"
            },
            {
              name: "禹城市",
              code: "371482"
            }
          ]
        },
        {
          name: "聊城市",
          code: "371500",
          children: [
            {
              name: "市辖区",
              code: "371501"
            },
            {
              name: "东昌府区",
              code: "371502"
            },
            {
              name: "阳谷县",
              code: "371521"
            },
            {
              name: "莘县",
              code: "371522"
            },
            {
              name: "茌平县",
              code: "371523"
            },
            {
              name: "东阿县",
              code: "371524"
            },
            {
              name: "冠县",
              code: "371525"
            },
            {
              name: "高唐县",
              code: "371526"
            },
            {
              name: "临清市",
              code: "371581"
            }
          ]
        },
        {
          name: "滨州市",
          code: "371600",
          children: [
            {
              name: "市辖区",
              code: "371601"
            },
            {
              name: "滨城区",
              code: "371602"
            },
            {
              name: "惠民县",
              code: "371621"
            },
            {
              name: "阳信县",
              code: "371622"
            },
            {
              name: "无棣县",
              code: "371623"
            },
            {
              name: "沾化县",
              code: "371624"
            },
            {
              name: "博兴县",
              code: "371625"
            },
            {
              name: "邹平县",
              code: "371626"
            }
          ]
        },
        {
          name: "菏泽市",
          code: "371700",
          children: [
            {
              name: "市辖区",
              code: "371701"
            },
            {
              name: "牡丹区",
              code: "371702"
            },
            {
              name: "曹县",
              code: "371721"
            },
            {
              name: "单县",
              code: "371722"
            },
            {
              name: "成武县",
              code: "371723"
            },
            {
              name: "巨野县",
              code: "371724"
            },
            {
              name: "郓城县",
              code: "371725"
            },
            {
              name: "鄄城县",
              code: "371726"
            },
            {
              name: "定陶县",
              code: "371727"
            },
            {
              name: "东明县",
              code: "371728"
            }
          ]
        }
      ]
    },
    {
      name: "河南省",
      code: "410000",
      children: [
        {
          name: "郑州市",
          code: "410100",
          children: [
            {
              name: "市辖区",
              code: "410101"
            },
            {
              name: "中原区",
              code: "410102"
            },
            {
              name: "二七区",
              code: "410103"
            },
            {
              name: "管城回族区",
              code: "410104"
            },
            {
              name: "金水区",
              code: "410105"
            },
            {
              name: "上街区",
              code: "410106"
            },
            {
              name: "惠济区",
              code: "410108"
            },
            {
              name: "中牟县",
              code: "410122"
            },
            {
              name: "巩义市",
              code: "410181"
            },
            {
              name: "荥阳市",
              code: "410182"
            },
            {
              name: "新密市",
              code: "410183"
            },
            {
              name: "新郑市",
              code: "410184"
            },
            {
              name: "登封市",
              code: "410185"
            }
          ]
        },
        {
          name: "开封市",
          code: "410200",
          children: [
            {
              name: "市辖区",
              code: "410201"
            },
            {
              name: "龙亭区",
              code: "410202"
            },
            {
              name: "顺河回族区",
              code: "410203"
            },
            {
              name: "鼓楼区",
              code: "410204"
            },
            {
              name: "禹王台区",
              code: "410205"
            },
            {
              name: "金明区",
              code: "410211"
            },
            {
              name: "杞县",
              code: "410221"
            },
            {
              name: "通许县",
              code: "410222"
            },
            {
              name: "尉氏县",
              code: "410223"
            },
            {
              name: "开封县",
              code: "410224"
            },
            {
              name: "兰考县",
              code: "410225"
            }
          ]
        },
        {
          name: "洛阳市",
          code: "410300",
          children: [
            {
              name: "市辖区",
              code: "410301"
            },
            {
              name: "老城区",
              code: "410302"
            },
            {
              name: "西工区",
              code: "410303"
            },
            {
              name: "瀍河回族区",
              code: "410304"
            },
            {
              name: "涧西区",
              code: "410305"
            },
            {
              name: "吉利区",
              code: "410306"
            },
            {
              name: "洛龙区",
              code: "410311"
            },
            {
              name: "孟津县",
              code: "410322"
            },
            {
              name: "新安县",
              code: "410323"
            },
            {
              name: "栾川县",
              code: "410324"
            },
            {
              name: "嵩县",
              code: "410325"
            },
            {
              name: "汝阳县",
              code: "410326"
            },
            {
              name: "宜阳县",
              code: "410327"
            },
            {
              name: "洛宁县",
              code: "410328"
            },
            {
              name: "伊川县",
              code: "410329"
            },
            {
              name: "偃师市",
              code: "410381"
            }
          ]
        },
        {
          name: "平顶山市",
          code: "410400",
          children: [
            {
              name: "市辖区",
              code: "410401"
            },
            {
              name: "新华区",
              code: "410402"
            },
            {
              name: "卫东区",
              code: "410403"
            },
            {
              name: "石龙区",
              code: "410404"
            },
            {
              name: "湛河区",
              code: "410411"
            },
            {
              name: "宝丰县",
              code: "410421"
            },
            {
              name: "叶县",
              code: "410422"
            },
            {
              name: "鲁山县",
              code: "410423"
            },
            {
              name: "郏县",
              code: "410425"
            },
            {
              name: "舞钢市",
              code: "410481"
            },
            {
              name: "汝州市",
              code: "410482"
            }
          ]
        },
        {
          name: "安阳市",
          code: "410500",
          children: [
            {
              name: "市辖区",
              code: "410501"
            },
            {
              name: "文峰区",
              code: "410502"
            },
            {
              name: "北关区",
              code: "410503"
            },
            {
              name: "殷都区",
              code: "410505"
            },
            {
              name: "龙安区",
              code: "410506"
            },
            {
              name: "安阳县",
              code: "410522"
            },
            {
              name: "汤阴县",
              code: "410523"
            },
            {
              name: "滑县",
              code: "410526"
            },
            {
              name: "内黄县",
              code: "410527"
            },
            {
              name: "林州市",
              code: "410581"
            }
          ]
        },
        {
          name: "鹤壁市",
          code: "410600",
          children: [
            {
              name: "市辖区",
              code: "410601"
            },
            {
              name: "鹤山区",
              code: "410602"
            },
            {
              name: "山城区",
              code: "410603"
            },
            {
              name: "淇滨区",
              code: "410611"
            },
            {
              name: "浚县",
              code: "410621"
            },
            {
              name: "淇县",
              code: "410622"
            }
          ]
        },
        {
          name: "新乡市",
          code: "410700",
          children: [
            {
              name: "市辖区",
              code: "410701"
            },
            {
              name: "红旗区",
              code: "410702"
            },
            {
              name: "卫滨区",
              code: "410703"
            },
            {
              name: "凤泉区",
              code: "410704"
            },
            {
              name: "牧野区",
              code: "410711"
            },
            {
              name: "新乡县",
              code: "410721"
            },
            {
              name: "获嘉县",
              code: "410724"
            },
            {
              name: "原阳县",
              code: "410725"
            },
            {
              name: "延津县",
              code: "410726"
            },
            {
              name: "封丘县",
              code: "410727"
            },
            {
              name: "长垣县",
              code: "410728"
            },
            {
              name: "卫辉市",
              code: "410781"
            },
            {
              name: "辉县市",
              code: "410782"
            }
          ]
        },
        {
          name: "焦作市",
          code: "410800",
          children: [
            {
              name: "市辖区",
              code: "410801"
            },
            {
              name: "解放区",
              code: "410802"
            },
            {
              name: "中站区",
              code: "410803"
            },
            {
              name: "马村区",
              code: "410804"
            },
            {
              name: "山阳区",
              code: "410811"
            },
            {
              name: "修武县",
              code: "410821"
            },
            {
              name: "博爱县",
              code: "410822"
            },
            {
              name: "武陟县",
              code: "410823"
            },
            {
              name: "温县",
              code: "410825"
            },
            {
              name: "沁阳市",
              code: "410882"
            },
            {
              name: "孟州市",
              code: "410883"
            }
          ]
        },
        {
          name: "濮阳市",
          code: "410900",
          children: [
            {
              name: "市辖区",
              code: "410901"
            },
            {
              name: "华龙区",
              code: "410902"
            },
            {
              name: "清丰县",
              code: "410922"
            },
            {
              name: "南乐县",
              code: "410923"
            },
            {
              name: "范县",
              code: "410926"
            },
            {
              name: "台前县",
              code: "410927"
            },
            {
              name: "濮阳县",
              code: "410928"
            }
          ]
        },
        {
          name: "许昌市",
          code: "411000",
          children: [
            {
              name: "市辖区",
              code: "411001"
            },
            {
              name: "魏都区",
              code: "411002"
            },
            {
              name: "许昌县",
              code: "411023"
            },
            {
              name: "鄢陵县",
              code: "411024"
            },
            {
              name: "襄城县",
              code: "411025"
            },
            {
              name: "禹州市",
              code: "411081"
            },
            {
              name: "长葛市",
              code: "411082"
            }
          ]
        },
        {
          name: "漯河市",
          code: "411100",
          children: [
            {
              name: "市辖区",
              code: "411101"
            },
            {
              name: "源汇区",
              code: "411102"
            },
            {
              name: "郾城区",
              code: "411103"
            },
            {
              name: "召陵区",
              code: "411104"
            },
            {
              name: "舞阳县",
              code: "411121"
            },
            {
              name: "临颍县",
              code: "411122"
            }
          ]
        },
        {
          name: "三门峡市",
          code: "411200",
          children: [
            {
              name: "市辖区",
              code: "411201"
            },
            {
              name: "湖滨区",
              code: "411202"
            },
            {
              name: "渑池县",
              code: "411221"
            },
            {
              name: "陕县",
              code: "411222"
            },
            {
              name: "卢氏县",
              code: "411224"
            },
            {
              name: "义马市",
              code: "411281"
            },
            {
              name: "灵宝市",
              code: "411282"
            }
          ]
        },
        {
          name: "南阳市",
          code: "411300",
          children: [
            {
              name: "市辖区",
              code: "411301"
            },
            {
              name: "宛城区",
              code: "411302"
            },
            {
              name: "卧龙区",
              code: "411303"
            },
            {
              name: "南召县",
              code: "411321"
            },
            {
              name: "方城县",
              code: "411322"
            },
            {
              name: "西峡县",
              code: "411323"
            },
            {
              name: "镇平县",
              code: "411324"
            },
            {
              name: "内乡县",
              code: "411325"
            },
            {
              name: "淅川县",
              code: "411326"
            },
            {
              name: "社旗县",
              code: "411327"
            },
            {
              name: "唐河县",
              code: "411328"
            },
            {
              name: "新野县",
              code: "411329"
            },
            {
              name: "桐柏县",
              code: "411330"
            },
            {
              name: "邓州市",
              code: "411381"
            }
          ]
        },
        {
          name: "商丘市",
          code: "411400",
          children: [
            {
              name: "市辖区",
              code: "411401"
            },
            {
              name: "梁园区",
              code: "411402"
            },
            {
              name: "睢阳区",
              code: "411403"
            },
            {
              name: "民权县",
              code: "411421"
            },
            {
              name: "睢县",
              code: "411422"
            },
            {
              name: "宁陵县",
              code: "411423"
            },
            {
              name: "柘城县",
              code: "411424"
            },
            {
              name: "虞城县",
              code: "411425"
            },
            {
              name: "夏邑县",
              code: "411426"
            },
            {
              name: "永城市",
              code: "411481"
            }
          ]
        },
        {
          name: "信阳市",
          code: "411500",
          children: [
            {
              name: "市辖区",
              code: "411501"
            },
            {
              name: "浉河区",
              code: "411502"
            },
            {
              name: "平桥区",
              code: "411503"
            },
            {
              name: "罗山县",
              code: "411521"
            },
            {
              name: "光山县",
              code: "411522"
            },
            {
              name: "新县",
              code: "411523"
            },
            {
              name: "商城县",
              code: "411524"
            },
            {
              name: "固始县",
              code: "411525"
            },
            {
              name: "潢川县",
              code: "411526"
            },
            {
              name: "淮滨县",
              code: "411527"
            },
            {
              name: "息县",
              code: "411528"
            }
          ]
        },
        {
          name: "周口市",
          code: "411600",
          children: [
            {
              name: "市辖区",
              code: "411601"
            },
            {
              name: "川汇区",
              code: "411602"
            },
            {
              name: "扶沟县",
              code: "411621"
            },
            {
              name: "西华县",
              code: "411622"
            },
            {
              name: "商水县",
              code: "411623"
            },
            {
              name: "沈丘县",
              code: "411624"
            },
            {
              name: "郸城县",
              code: "411625"
            },
            {
              name: "淮阳县",
              code: "411626"
            },
            {
              name: "太康县",
              code: "411627"
            },
            {
              name: "鹿邑县",
              code: "411628"
            },
            {
              name: "项城市",
              code: "411681"
            }
          ]
        },
        {
          name: "驻马店市",
          code: "411700",
          children: [
            {
              name: "市辖区",
              code: "411701"
            },
            {
              name: "驿城区",
              code: "411702"
            },
            {
              name: "西平县",
              code: "411721"
            },
            {
              name: "上蔡县",
              code: "411722"
            },
            {
              name: "平舆县",
              code: "411723"
            },
            {
              name: "正阳县",
              code: "411724"
            },
            {
              name: "确山县",
              code: "411725"
            },
            {
              name: "泌阳县",
              code: "411726"
            },
            {
              name: "汝南县",
              code: "411727"
            },
            {
              name: "遂平县",
              code: "411728"
            },
            {
              name: "新蔡县",
              code: "411729"
            }
          ]
        },
        {
          name: "省直辖县级行政区划",
          code: "419000",
          children: [
            {
              name: "济源市",
              code: "419001"
            }
          ]
        }
      ]
    },
    {
      name: "湖北省",
      code: "420000",
      children: [
        {
          name: "武汉市",
          code: "420100",
          children: [
            {
              name: "市辖区",
              code: "420101"
            },
            {
              name: "江岸区",
              code: "420102"
            },
            {
              name: "江汉区",
              code: "420103"
            },
            {
              name: "硚口区",
              code: "420104"
            },
            {
              name: "汉阳区",
              code: "420105"
            },
            {
              name: "武昌区",
              code: "420106"
            },
            {
              name: "青山区",
              code: "420107"
            },
            {
              name: "洪山区",
              code: "420111"
            },
            {
              name: "东西湖区",
              code: "420112"
            },
            {
              name: "汉南区",
              code: "420113"
            },
            {
              name: "蔡甸区",
              code: "420114"
            },
            {
              name: "江夏区",
              code: "420115"
            },
            {
              name: "黄陂区",
              code: "420116"
            },
            {
              name: "新洲区",
              code: "420117"
            }
          ]
        },
        {
          name: "黄石市",
          code: "420200",
          children: [
            {
              name: "市辖区",
              code: "420201"
            },
            {
              name: "黄石港区",
              code: "420202"
            },
            {
              name: "西塞山区",
              code: "420203"
            },
            {
              name: "下陆区",
              code: "420204"
            },
            {
              name: "铁山区",
              code: "420205"
            },
            {
              name: "阳新县",
              code: "420222"
            },
            {
              name: "大冶市",
              code: "420281"
            }
          ]
        },
        {
          name: "十堰市",
          code: "420300",
          children: [
            {
              name: "市辖区",
              code: "420301"
            },
            {
              name: "茅箭区",
              code: "420302"
            },
            {
              name: "张湾区",
              code: "420303"
            },
            {
              name: "郧县",
              code: "420321"
            },
            {
              name: "郧西县",
              code: "420322"
            },
            {
              name: "竹山县",
              code: "420323"
            },
            {
              name: "竹溪县",
              code: "420324"
            },
            {
              name: "房县",
              code: "420325"
            },
            {
              name: "丹江口市",
              code: "420381"
            }
          ]
        },
        {
          name: "宜昌市",
          code: "420500",
          children: [
            {
              name: "市辖区",
              code: "420501"
            },
            {
              name: "西陵区",
              code: "420502"
            },
            {
              name: "伍家岗区",
              code: "420503"
            },
            {
              name: "点军区",
              code: "420504"
            },
            {
              name: "猇亭区",
              code: "420505"
            },
            {
              name: "夷陵区",
              code: "420506"
            },
            {
              name: "远安县",
              code: "420525"
            },
            {
              name: "兴山县",
              code: "420526"
            },
            {
              name: "秭归县",
              code: "420527"
            },
            {
              name: "长阳土家族自治县",
              code: "420528"
            },
            {
              name: "五峰土家族自治县",
              code: "420529"
            },
            {
              name: "宜都市",
              code: "420581"
            },
            {
              name: "当阳市",
              code: "420582"
            },
            {
              name: "枝江市",
              code: "420583"
            }
          ]
        },
        {
          name: "襄阳市",
          code: "420600",
          children: [
            {
              name: "市辖区",
              code: "420601"
            },
            {
              name: "襄城区",
              code: "420602"
            },
            {
              name: "樊城区",
              code: "420606"
            },
            {
              name: "襄州区",
              code: "420607"
            },
            {
              name: "南漳县",
              code: "420624"
            },
            {
              name: "谷城县",
              code: "420625"
            },
            {
              name: "保康县",
              code: "420626"
            },
            {
              name: "老河口市",
              code: "420682"
            },
            {
              name: "枣阳市",
              code: "420683"
            },
            {
              name: "宜城市",
              code: "420684"
            }
          ]
        },
        {
          name: "鄂州市",
          code: "420700",
          children: [
            {
              name: "市辖区",
              code: "420701"
            },
            {
              name: "梁子湖区",
              code: "420702"
            },
            {
              name: "华容区",
              code: "420703"
            },
            {
              name: "鄂城区",
              code: "420704"
            }
          ]
        },
        {
          name: "荆门市",
          code: "420800",
          children: [
            {
              name: "市辖区",
              code: "420801"
            },
            {
              name: "东宝区",
              code: "420802"
            },
            {
              name: "掇刀区",
              code: "420804"
            },
            {
              name: "京山县",
              code: "420821"
            },
            {
              name: "沙洋县",
              code: "420822"
            },
            {
              name: "钟祥市",
              code: "420881"
            }
          ]
        },
        {
          name: "孝感市",
          code: "420900",
          children: [
            {
              name: "市辖区",
              code: "420901"
            },
            {
              name: "孝南区",
              code: "420902"
            },
            {
              name: "孝昌县",
              code: "420921"
            },
            {
              name: "大悟县",
              code: "420922"
            },
            {
              name: "云梦县",
              code: "420923"
            },
            {
              name: "应城市",
              code: "420981"
            },
            {
              name: "安陆市",
              code: "420982"
            },
            {
              name: "汉川市",
              code: "420984"
            }
          ]
        },
        {
          name: "荆州市",
          code: "421000",
          children: [
            {
              name: "市辖区",
              code: "421001"
            },
            {
              name: "沙市区",
              code: "421002"
            },
            {
              name: "荆州区",
              code: "421003"
            },
            {
              name: "公安县",
              code: "421022"
            },
            {
              name: "监利县",
              code: "421023"
            },
            {
              name: "江陵县",
              code: "421024"
            },
            {
              name: "石首市",
              code: "421081"
            },
            {
              name: "洪湖市",
              code: "421083"
            },
            {
              name: "松滋市",
              code: "421087"
            }
          ]
        },
        {
          name: "黄冈市",
          code: "421100",
          children: [
            {
              name: "市辖区",
              code: "421101"
            },
            {
              name: "黄州区",
              code: "421102"
            },
            {
              name: "团风县",
              code: "421121"
            },
            {
              name: "红安县",
              code: "421122"
            },
            {
              name: "罗田县",
              code: "421123"
            },
            {
              name: "英山县",
              code: "421124"
            },
            {
              name: "浠水县",
              code: "421125"
            },
            {
              name: "蕲春县",
              code: "421126"
            },
            {
              name: "黄梅县",
              code: "421127"
            },
            {
              name: "麻城市",
              code: "421181"
            },
            {
              name: "武穴市",
              code: "421182"
            }
          ]
        },
        {
          name: "咸宁市",
          code: "421200",
          children: [
            {
              name: "市辖区",
              code: "421201"
            },
            {
              name: "咸安区",
              code: "421202"
            },
            {
              name: "嘉鱼县",
              code: "421221"
            },
            {
              name: "通城县",
              code: "421222"
            },
            {
              name: "崇阳县",
              code: "421223"
            },
            {
              name: "通山县",
              code: "421224"
            },
            {
              name: "赤壁市",
              code: "421281"
            }
          ]
        },
        {
          name: "随州市",
          code: "421300",
          children: [
            {
              name: "市辖区",
              code: "421301"
            },
            {
              name: "曾都区",
              code: "421303"
            },
            {
              name: "随县",
              code: "421321"
            },
            {
              name: "广水市",
              code: "421381"
            }
          ]
        },
        {
          name: "恩施土家族苗族自治州",
          code: "422800",
          children: [
            {
              name: "恩施市",
              code: "422801"
            },
            {
              name: "利川市",
              code: "422802"
            },
            {
              name: "建始县",
              code: "422822"
            },
            {
              name: "巴东县",
              code: "422823"
            },
            {
              name: "宣恩县",
              code: "422825"
            },
            {
              name: "咸丰县",
              code: "422826"
            },
            {
              name: "来凤县",
              code: "422827"
            },
            {
              name: "鹤峰县",
              code: "422828"
            }
          ]
        },
        {
          name: "省直辖县级行政区划",
          code: "429000",
          children: [
            {
              name: "仙桃市",
              code: "429004"
            },
            {
              name: "潜江市",
              code: "429005"
            },
            {
              name: "天门市",
              code: "429006"
            },
            {
              name: "神农架林区",
              code: "429021"
            }
          ]
        }
      ]
    },
    {
      name: "湖南省",
      code: "430000",
      children: [
        {
          name: "长沙市",
          code: "430100",
          children: [
            {
              name: "市辖区",
              code: "430101"
            },
            {
              name: "芙蓉区",
              code: "430102"
            },
            {
              name: "天心区",
              code: "430103"
            },
            {
              name: "岳麓区",
              code: "430104"
            },
            {
              name: "开福区",
              code: "430105"
            },
            {
              name: "雨花区",
              code: "430111"
            },
            {
              name: "望城区",
              code: "430112"
            },
            {
              name: "长沙县",
              code: "430121"
            },
            {
              name: "宁乡县",
              code: "430124"
            },
            {
              name: "浏阳市",
              code: "430181"
            }
          ]
        },
        {
          name: "株洲市",
          code: "430200",
          children: [
            {
              name: "市辖区",
              code: "430201"
            },
            {
              name: "荷塘区",
              code: "430202"
            },
            {
              name: "芦淞区",
              code: "430203"
            },
            {
              name: "石峰区",
              code: "430204"
            },
            {
              name: "天元区",
              code: "430211"
            },
            {
              name: "株洲县",
              code: "430221"
            },
            {
              name: "攸县",
              code: "430223"
            },
            {
              name: "茶陵县",
              code: "430224"
            },
            {
              name: "炎陵县",
              code: "430225"
            },
            {
              name: "醴陵市",
              code: "430281"
            }
          ]
        },
        {
          name: "湘潭市",
          code: "430300",
          children: [
            {
              name: "市辖区",
              code: "430301"
            },
            {
              name: "雨湖区",
              code: "430302"
            },
            {
              name: "岳塘区",
              code: "430304"
            },
            {
              name: "湘潭县",
              code: "430321"
            },
            {
              name: "湘乡市",
              code: "430381"
            },
            {
              name: "韶山市",
              code: "430382"
            }
          ]
        },
        {
          name: "衡阳市",
          code: "430400",
          children: [
            {
              name: "市辖区",
              code: "430401"
            },
            {
              name: "珠晖区",
              code: "430405"
            },
            {
              name: "雁峰区",
              code: "430406"
            },
            {
              name: "石鼓区",
              code: "430407"
            },
            {
              name: "蒸湘区",
              code: "430408"
            },
            {
              name: "南岳区",
              code: "430412"
            },
            {
              name: "衡阳县",
              code: "430421"
            },
            {
              name: "衡南县",
              code: "430422"
            },
            {
              name: "衡山县",
              code: "430423"
            },
            {
              name: "衡东县",
              code: "430424"
            },
            {
              name: "祁东县",
              code: "430426"
            },
            {
              name: "耒阳市",
              code: "430481"
            },
            {
              name: "常宁市",
              code: "430482"
            }
          ]
        },
        {
          name: "邵阳市",
          code: "430500",
          children: [
            {
              name: "市辖区",
              code: "430501"
            },
            {
              name: "双清区",
              code: "430502"
            },
            {
              name: "大祥区",
              code: "430503"
            },
            {
              name: "北塔区",
              code: "430511"
            },
            {
              name: "邵东县",
              code: "430521"
            },
            {
              name: "新邵县",
              code: "430522"
            },
            {
              name: "邵阳县",
              code: "430523"
            },
            {
              name: "隆回县",
              code: "430524"
            },
            {
              name: "洞口县",
              code: "430525"
            },
            {
              name: "绥宁县",
              code: "430527"
            },
            {
              name: "新宁县",
              code: "430528"
            },
            {
              name: "城步苗族自治县",
              code: "430529"
            },
            {
              name: "武冈市",
              code: "430581"
            }
          ]
        },
        {
          name: "岳阳市",
          code: "430600",
          children: [
            {
              name: "市辖区",
              code: "430601"
            },
            {
              name: "岳阳楼区",
              code: "430602"
            },
            {
              name: "云溪区",
              code: "430603"
            },
            {
              name: "君山区",
              code: "430611"
            },
            {
              name: "岳阳县",
              code: "430621"
            },
            {
              name: "华容县",
              code: "430623"
            },
            {
              name: "湘阴县",
              code: "430624"
            },
            {
              name: "平江县",
              code: "430626"
            },
            {
              name: "汨罗市",
              code: "430681"
            },
            {
              name: "临湘市",
              code: "430682"
            }
          ]
        },
        {
          name: "常德市",
          code: "430700",
          children: [
            {
              name: "市辖区",
              code: "430701"
            },
            {
              name: "武陵区",
              code: "430702"
            },
            {
              name: "鼎城区",
              code: "430703"
            },
            {
              name: "安乡县",
              code: "430721"
            },
            {
              name: "汉寿县",
              code: "430722"
            },
            {
              name: "澧县",
              code: "430723"
            },
            {
              name: "临澧县",
              code: "430724"
            },
            {
              name: "桃源县",
              code: "430725"
            },
            {
              name: "石门县",
              code: "430726"
            },
            {
              name: "津市市",
              code: "430781"
            }
          ]
        },
        {
          name: "张家界市",
          code: "430800",
          children: [
            {
              name: "市辖区",
              code: "430801"
            },
            {
              name: "永定区",
              code: "430802"
            },
            {
              name: "武陵源区",
              code: "430811"
            },
            {
              name: "慈利县",
              code: "430821"
            },
            {
              name: "桑植县",
              code: "430822"
            }
          ]
        },
        {
          name: "益阳市",
          code: "430900",
          children: [
            {
              name: "市辖区",
              code: "430901"
            },
            {
              name: "资阳区",
              code: "430902"
            },
            {
              name: "赫山区",
              code: "430903"
            },
            {
              name: "南县",
              code: "430921"
            },
            {
              name: "桃江县",
              code: "430922"
            },
            {
              name: "安化县",
              code: "430923"
            },
            {
              name: "沅江市",
              code: "430981"
            }
          ]
        },
        {
          name: "郴州市",
          code: "431000",
          children: [
            {
              name: "市辖区",
              code: "431001"
            },
            {
              name: "北湖区",
              code: "431002"
            },
            {
              name: "苏仙区",
              code: "431003"
            },
            {
              name: "桂阳县",
              code: "431021"
            },
            {
              name: "宜章县",
              code: "431022"
            },
            {
              name: "永兴县",
              code: "431023"
            },
            {
              name: "嘉禾县",
              code: "431024"
            },
            {
              name: "临武县",
              code: "431025"
            },
            {
              name: "汝城县",
              code: "431026"
            },
            {
              name: "桂东县",
              code: "431027"
            },
            {
              name: "安仁县",
              code: "431028"
            },
            {
              name: "资兴市",
              code: "431081"
            }
          ]
        },
        {
          name: "永州市",
          code: "431100",
          children: [
            {
              name: "市辖区",
              code: "431101"
            },
            {
              name: "零陵区",
              code: "431102"
            },
            {
              name: "冷水滩区",
              code: "431103"
            },
            {
              name: "祁阳县",
              code: "431121"
            },
            {
              name: "东安县",
              code: "431122"
            },
            {
              name: "双牌县",
              code: "431123"
            },
            {
              name: "道县",
              code: "431124"
            },
            {
              name: "江永县",
              code: "431125"
            },
            {
              name: "宁远县",
              code: "431126"
            },
            {
              name: "蓝山县",
              code: "431127"
            },
            {
              name: "新田县",
              code: "431128"
            },
            {
              name: "江华瑶族自治县",
              code: "431129"
            }
          ]
        },
        {
          name: "怀化市",
          code: "431200",
          children: [
            {
              name: "市辖区",
              code: "431201"
            },
            {
              name: "鹤城区",
              code: "431202"
            },
            {
              name: "中方县",
              code: "431221"
            },
            {
              name: "沅陵县",
              code: "431222"
            },
            {
              name: "辰溪县",
              code: "431223"
            },
            {
              name: "溆浦县",
              code: "431224"
            },
            {
              name: "会同县",
              code: "431225"
            },
            {
              name: "麻阳苗族自治县",
              code: "431226"
            },
            {
              name: "新晃侗族自治县",
              code: "431227"
            },
            {
              name: "芷江侗族自治县",
              code: "431228"
            },
            {
              name: "靖州苗族侗族自治县",
              code: "431229"
            },
            {
              name: "通道侗族自治县",
              code: "431230"
            },
            {
              name: "洪江市",
              code: "431281"
            }
          ]
        },
        {
          name: "娄底市",
          code: "431300",
          children: [
            {
              name: "市辖区",
              code: "431301"
            },
            {
              name: "娄星区",
              code: "431302"
            },
            {
              name: "双峰县",
              code: "431321"
            },
            {
              name: "新化县",
              code: "431322"
            },
            {
              name: "冷水江市",
              code: "431381"
            },
            {
              name: "涟源市",
              code: "431382"
            }
          ]
        },
        {
          name: "湘西土家族苗族自治州",
          code: "433100",
          children: [
            {
              name: "吉首市",
              code: "433101"
            },
            {
              name: "泸溪县",
              code: "433122"
            },
            {
              name: "凤凰县",
              code: "433123"
            },
            {
              name: "花垣县",
              code: "433124"
            },
            {
              name: "保靖县",
              code: "433125"
            },
            {
              name: "古丈县",
              code: "433126"
            },
            {
              name: "永顺县",
              code: "433127"
            },
            {
              name: "龙山县",
              code: "433130"
            }
          ]
        }
      ]
    },
    {
      name: "广东省",
      code: "440000",
      children: [
        {
          name: "广州市",
          code: "440100",
          children: [
            {
              name: "市辖区",
              code: "440101"
            },
            {
              name: "荔湾区",
              code: "440103"
            },
            {
              name: "越秀区",
              code: "440104"
            },
            {
              name: "海珠区",
              code: "440105"
            },
            {
              name: "天河区",
              code: "440106"
            },
            {
              name: "白云区",
              code: "440111"
            },
            {
              name: "黄埔区",
              code: "440112"
            },
            {
              name: "番禺区",
              code: "440113"
            },
            {
              name: "花都区",
              code: "440114"
            },
            {
              name: "南沙区",
              code: "440115"
            },
            {
              name: "萝岗区",
              code: "440116"
            },
            {
              name: "增城市",
              code: "440183"
            },
            {
              name: "从化市",
              code: "440184"
            }
          ]
        },
        {
          name: "韶关市",
          code: "440200",
          children: [
            {
              name: "市辖区",
              code: "440201"
            },
            {
              name: "武江区",
              code: "440203"
            },
            {
              name: "浈江区",
              code: "440204"
            },
            {
              name: "曲江区",
              code: "440205"
            },
            {
              name: "始兴县",
              code: "440222"
            },
            {
              name: "仁化县",
              code: "440224"
            },
            {
              name: "翁源县",
              code: "440229"
            },
            {
              name: "乳源瑶族自治县",
              code: "440232"
            },
            {
              name: "新丰县",
              code: "440233"
            },
            {
              name: "乐昌市",
              code: "440281"
            },
            {
              name: "南雄市",
              code: "440282"
            }
          ]
        },
        {
          name: "深圳市",
          code: "440300",
          children: [
            {
              name: "市辖区",
              code: "440301"
            },
            {
              name: "罗湖区",
              code: "440303"
            },
            {
              name: "福田区",
              code: "440304"
            },
            {
              name: "南山区",
              code: "440305"
            },
            {
              name: "宝安区",
              code: "440306"
            },
            {
              name: "龙岗区",
              code: "440307"
            },
            {
              name: "盐田区",
              code: "440308"
            }
          ]
        },
        {
          name: "珠海市",
          code: "440400",
          children: [
            {
              name: "市辖区",
              code: "440401"
            },
            {
              name: "香洲区",
              code: "440402"
            },
            {
              name: "斗门区",
              code: "440403"
            },
            {
              name: "金湾区",
              code: "440404"
            }
          ]
        },
        {
          name: "汕头市",
          code: "440500",
          children: [
            {
              name: "市辖区",
              code: "440501"
            },
            {
              name: "龙湖区",
              code: "440507"
            },
            {
              name: "金平区",
              code: "440511"
            },
            {
              name: "濠江区",
              code: "440512"
            },
            {
              name: "潮阳区",
              code: "440513"
            },
            {
              name: "潮南区",
              code: "440514"
            },
            {
              name: "澄海区",
              code: "440515"
            },
            {
              name: "南澳县",
              code: "440523"
            }
          ]
        },
        {
          name: "佛山市",
          code: "440600",
          children: [
            {
              name: "市辖区",
              code: "440601"
            },
            {
              name: "禅城区",
              code: "440604"
            },
            {
              name: "南海区",
              code: "440605"
            },
            {
              name: "顺德区",
              code: "440606"
            },
            {
              name: "三水区",
              code: "440607"
            },
            {
              name: "高明区",
              code: "440608"
            }
          ]
        },
        {
          name: "江门市",
          code: "440700",
          children: [
            {
              name: "市辖区",
              code: "440701"
            },
            {
              name: "蓬江区",
              code: "440703"
            },
            {
              name: "江海区",
              code: "440704"
            },
            {
              name: "新会区",
              code: "440705"
            },
            {
              name: "台山市",
              code: "440781"
            },
            {
              name: "开平市",
              code: "440783"
            },
            {
              name: "鹤山市",
              code: "440784"
            },
            {
              name: "恩平市",
              code: "440785"
            }
          ]
        },
        {
          name: "湛江市",
          code: "440800",
          children: [
            {
              name: "市辖区",
              code: "440801"
            },
            {
              name: "赤坎区",
              code: "440802"
            },
            {
              name: "霞山区",
              code: "440803"
            },
            {
              name: "坡头区",
              code: "440804"
            },
            {
              name: "麻章区",
              code: "440811"
            },
            {
              name: "遂溪县",
              code: "440823"
            },
            {
              name: "徐闻县",
              code: "440825"
            },
            {
              name: "廉江市",
              code: "440881"
            },
            {
              name: "雷州市",
              code: "440882"
            },
            {
              name: "吴川市",
              code: "440883"
            }
          ]
        },
        {
          name: "茂名市",
          code: "440900",
          children: [
            {
              name: "市辖区",
              code: "440901"
            },
            {
              name: "茂南区",
              code: "440902"
            },
            {
              name: "茂港区",
              code: "440903"
            },
            {
              name: "电白县",
              code: "440923"
            },
            {
              name: "高州市",
              code: "440981"
            },
            {
              name: "化州市",
              code: "440982"
            },
            {
              name: "信宜市",
              code: "440983"
            }
          ]
        },
        {
          name: "肇庆市",
          code: "441200",
          children: [
            {
              name: "市辖区",
              code: "441201"
            },
            {
              name: "端州区",
              code: "441202"
            },
            {
              name: "鼎湖区",
              code: "441203"
            },
            {
              name: "广宁县",
              code: "441223"
            },
            {
              name: "怀集县",
              code: "441224"
            },
            {
              name: "封开县",
              code: "441225"
            },
            {
              name: "德庆县",
              code: "441226"
            },
            {
              name: "高要市",
              code: "441283"
            },
            {
              name: "四会市",
              code: "441284"
            }
          ]
        },
        {
          name: "惠州市",
          code: "441300",
          children: [
            {
              name: "市辖区",
              code: "441301"
            },
            {
              name: "惠城区",
              code: "441302"
            },
            {
              name: "惠阳区",
              code: "441303"
            },
            {
              name: "博罗县",
              code: "441322"
            },
            {
              name: "惠东县",
              code: "441323"
            },
            {
              name: "龙门县",
              code: "441324"
            }
          ]
        },
        {
          name: "梅州市",
          code: "441400",
          children: [
            {
              name: "市辖区",
              code: "441401"
            },
            {
              name: "梅江区",
              code: "441402"
            },
            {
              name: "梅县",
              code: "441421"
            },
            {
              name: "大埔县",
              code: "441422"
            },
            {
              name: "丰顺县",
              code: "441423"
            },
            {
              name: "五华县",
              code: "441424"
            },
            {
              name: "平远县",
              code: "441426"
            },
            {
              name: "蕉岭县",
              code: "441427"
            },
            {
              name: "兴宁市",
              code: "441481"
            }
          ]
        },
        {
          name: "汕尾市",
          code: "441500",
          children: [
            {
              name: "市辖区",
              code: "441501"
            },
            {
              name: "城区",
              code: "441502"
            },
            {
              name: "海丰县",
              code: "441521"
            },
            {
              name: "陆河县",
              code: "441523"
            },
            {
              name: "陆丰市",
              code: "441581"
            }
          ]
        },
        {
          name: "河源市",
          code: "441600",
          children: [
            {
              name: "市辖区",
              code: "441601"
            },
            {
              name: "源城区",
              code: "441602"
            },
            {
              name: "紫金县",
              code: "441621"
            },
            {
              name: "龙川县",
              code: "441622"
            },
            {
              name: "连平县",
              code: "441623"
            },
            {
              name: "和平县",
              code: "441624"
            },
            {
              name: "东源县",
              code: "441625"
            }
          ]
        },
        {
          name: "阳江市",
          code: "441700",
          children: [
            {
              name: "市辖区",
              code: "441701"
            },
            {
              name: "江城区",
              code: "441702"
            },
            {
              name: "阳西县",
              code: "441721"
            },
            {
              name: "阳东县",
              code: "441723"
            },
            {
              name: "阳春市",
              code: "441781"
            }
          ]
        },
        {
          name: "清远市",
          code: "441800",
          children: [
            {
              name: "市辖区",
              code: "441801"
            },
            {
              name: "清城区",
              code: "441802"
            },
            {
              name: "清新区",
              code: "441803"
            },
            {
              name: "佛冈县",
              code: "441821"
            },
            {
              name: "阳山县",
              code: "441823"
            },
            {
              name: "连山壮族瑶族自治县",
              code: "441825"
            },
            {
              name: "连南瑶族自治县",
              code: "441826"
            },
            {
              name: "英德市",
              code: "441881"
            },
            {
              name: "连州市",
              code: "441882"
            }
          ]
        },
        {
          name: "东莞市",
          code: "441900",
          children: [
            {
              name: "市辖区",
              code: "441900"
            }
          ]
        },
        {
          name: "中山市",
          code: "442000",
          children: [
            {
              name: "市辖区",
              code: "442000"
            }
          ]
        },
        {
          name: "潮州市",
          code: "445100",
          children: [
            {
              name: "市辖区",
              code: "445101"
            },
            {
              name: "湘桥区",
              code: "445102"
            },
            {
              name: "潮安区",
              code: "445103"
            },
            {
              name: "饶平县",
              code: "445122"
            }
          ]
        },
        {
          name: "揭阳市",
          code: "445200",
          children: [
            {
              name: "市辖区",
              code: "445201"
            },
            {
              name: "榕城区",
              code: "445202"
            },
            {
              name: "揭东区",
              code: "445203"
            },
            {
              name: "揭西县",
              code: "445222"
            },
            {
              name: "惠来县",
              code: "445224"
            },
            {
              name: "普宁市",
              code: "445281"
            }
          ]
        },
        {
          name: "云浮市",
          code: "445300",
          children: [
            {
              name: "市辖区",
              code: "445301"
            },
            {
              name: "云城区",
              code: "445302"
            },
            {
              name: "新兴县",
              code: "445321"
            },
            {
              name: "郁南县",
              code: "445322"
            },
            {
              name: "云安县",
              code: "445323"
            },
            {
              name: "罗定市",
              code: "445381"
            }
          ]
        }
      ]
    },
    {
      name: "广西壮族自治区",
      code: "450000",
      children: [
        {
          name: "南宁市",
          code: "450100",
          children: [
            {
              name: "市辖区",
              code: "450101"
            },
            {
              name: "兴宁区",
              code: "450102"
            },
            {
              name: "青秀区",
              code: "450103"
            },
            {
              name: "江南区",
              code: "450105"
            },
            {
              name: "西乡塘区",
              code: "450107"
            },
            {
              name: "良庆区",
              code: "450108"
            },
            {
              name: "邕宁区",
              code: "450109"
            },
            {
              name: "武鸣县",
              code: "450122"
            },
            {
              name: "隆安县",
              code: "450123"
            },
            {
              name: "马山县",
              code: "450124"
            },
            {
              name: "上林县",
              code: "450125"
            },
            {
              name: "宾阳县",
              code: "450126"
            },
            {
              name: "横县",
              code: "450127"
            }
          ]
        },
        {
          name: "柳州市",
          code: "450200",
          children: [
            {
              name: "市辖区",
              code: "450201"
            },
            {
              name: "城中区",
              code: "450202"
            },
            {
              name: "鱼峰区",
              code: "450203"
            },
            {
              name: "柳南区",
              code: "450204"
            },
            {
              name: "柳北区",
              code: "450205"
            },
            {
              name: "柳江县",
              code: "450221"
            },
            {
              name: "柳城县",
              code: "450222"
            },
            {
              name: "鹿寨县",
              code: "450223"
            },
            {
              name: "融安县",
              code: "450224"
            },
            {
              name: "融水苗族自治县",
              code: "450225"
            },
            {
              name: "三江侗族自治县",
              code: "450226"
            }
          ]
        },
        {
          name: "桂林市",
          code: "450300",
          children: [
            {
              name: "市辖区",
              code: "450301"
            },
            {
              name: "秀峰区",
              code: "450302"
            },
            {
              name: "叠彩区",
              code: "450303"
            },
            {
              name: "象山区",
              code: "450304"
            },
            {
              name: "七星区",
              code: "450305"
            },
            {
              name: "雁山区",
              code: "450311"
            },
            {
              name: "临桂区",
              code: "450312"
            },
            {
              name: "阳朔县",
              code: "450321"
            },
            {
              name: "灵川县",
              code: "450323"
            },
            {
              name: "全州县",
              code: "450324"
            },
            {
              name: "兴安县",
              code: "450325"
            },
            {
              name: "永福县",
              code: "450326"
            },
            {
              name: "灌阳县",
              code: "450327"
            },
            {
              name: "龙胜各族自治县",
              code: "450328"
            },
            {
              name: "资源县",
              code: "450329"
            },
            {
              name: "平乐县",
              code: "450330"
            },
            {
              name: "荔浦县",
              code: "450331"
            },
            {
              name: "恭城瑶族自治县",
              code: "450332"
            }
          ]
        },
        {
          name: "梧州市",
          code: "450400",
          children: [
            {
              name: "市辖区",
              code: "450401"
            },
            {
              name: "万秀区",
              code: "450403"
            },
            {
              name: "长洲区",
              code: "450405"
            },
            {
              name: "龙圩区",
              code: "450406"
            },
            {
              name: "苍梧县",
              code: "450421"
            },
            {
              name: "藤县",
              code: "450422"
            },
            {
              name: "蒙山县",
              code: "450423"
            },
            {
              name: "岑溪市",
              code: "450481"
            }
          ]
        },
        {
          name: "北海市",
          code: "450500",
          children: [
            {
              name: "市辖区",
              code: "450501"
            },
            {
              name: "海城区",
              code: "450502"
            },
            {
              name: "银海区",
              code: "450503"
            },
            {
              name: "铁山港区",
              code: "450512"
            },
            {
              name: "合浦县",
              code: "450521"
            }
          ]
        },
        {
          name: "防城港市",
          code: "450600",
          children: [
            {
              name: "市辖区",
              code: "450601"
            },
            {
              name: "港口区",
              code: "450602"
            },
            {
              name: "防城区",
              code: "450603"
            },
            {
              name: "上思县",
              code: "450621"
            },
            {
              name: "东兴市",
              code: "450681"
            }
          ]
        },
        {
          name: "钦州市",
          code: "450700",
          children: [
            {
              name: "市辖区",
              code: "450701"
            },
            {
              name: "钦南区",
              code: "450702"
            },
            {
              name: "钦北区",
              code: "450703"
            },
            {
              name: "灵山县",
              code: "450721"
            },
            {
              name: "浦北县",
              code: "450722"
            }
          ]
        },
        {
          name: "贵港市",
          code: "450800",
          children: [
            {
              name: "市辖区",
              code: "450801"
            },
            {
              name: "港北区",
              code: "450802"
            },
            {
              name: "港南区",
              code: "450803"
            },
            {
              name: "覃塘区",
              code: "450804"
            },
            {
              name: "平南县",
              code: "450821"
            },
            {
              name: "桂平市",
              code: "450881"
            }
          ]
        },
        {
          name: "玉林市",
          code: "450900",
          children: [
            {
              name: "市辖区",
              code: "450901"
            },
            {
              name: "玉州区",
              code: "450902"
            },
            {
              name: "福绵区",
              code: "450903"
            },
            {
              name: "容县",
              code: "450921"
            },
            {
              name: "陆川县",
              code: "450922"
            },
            {
              name: "博白县",
              code: "450923"
            },
            {
              name: "兴业县",
              code: "450924"
            },
            {
              name: "北流市",
              code: "450981"
            }
          ]
        },
        {
          name: "百色市",
          code: "451000",
          children: [
            {
              name: "市辖区",
              code: "451001"
            },
            {
              name: "右江区",
              code: "451002"
            },
            {
              name: "田阳县",
              code: "451021"
            },
            {
              name: "田东县",
              code: "451022"
            },
            {
              name: "平果县",
              code: "451023"
            },
            {
              name: "德保县",
              code: "451024"
            },
            {
              name: "靖西县",
              code: "451025"
            },
            {
              name: "那坡县",
              code: "451026"
            },
            {
              name: "凌云县",
              code: "451027"
            },
            {
              name: "乐业县",
              code: "451028"
            },
            {
              name: "田林县",
              code: "451029"
            },
            {
              name: "西林县",
              code: "451030"
            },
            {
              name: "隆林各族自治县",
              code: "451031"
            }
          ]
        },
        {
          name: "贺州市",
          code: "451100",
          children: [
            {
              name: "市辖区",
              code: "451101"
            },
            {
              name: "八步区",
              code: "451102"
            },
            {
              name: "昭平县",
              code: "451121"
            },
            {
              name: "钟山县",
              code: "451122"
            },
            {
              name: "富川瑶族自治县",
              code: "451123"
            }
          ]
        },
        {
          name: "河池市",
          code: "451200",
          children: [
            {
              name: "市辖区",
              code: "451201"
            },
            {
              name: "金城江区",
              code: "451202"
            },
            {
              name: "南丹县",
              code: "451221"
            },
            {
              name: "天峨县",
              code: "451222"
            },
            {
              name: "凤山县",
              code: "451223"
            },
            {
              name: "东兰县",
              code: "451224"
            },
            {
              name: "罗城仫佬族自治县",
              code: "451225"
            },
            {
              name: "环江毛南族自治县",
              code: "451226"
            },
            {
              name: "巴马瑶族自治县",
              code: "451227"
            },
            {
              name: "都安瑶族自治县",
              code: "451228"
            },
            {
              name: "大化瑶族自治县",
              code: "451229"
            },
            {
              name: "宜州市",
              code: "451281"
            }
          ]
        },
        {
          name: "来宾市",
          code: "451300",
          children: [
            {
              name: "市辖区",
              code: "451301"
            },
            {
              name: "兴宾区",
              code: "451302"
            },
            {
              name: "忻城县",
              code: "451321"
            },
            {
              name: "象州县",
              code: "451322"
            },
            {
              name: "武宣县",
              code: "451323"
            },
            {
              name: "金秀瑶族自治县",
              code: "451324"
            },
            {
              name: "合山市",
              code: "451381"
            }
          ]
        },
        {
          name: "崇左市",
          code: "451400",
          children: [
            {
              name: "市辖区",
              code: "451401"
            },
            {
              name: "江州区",
              code: "451402"
            },
            {
              name: "扶绥县",
              code: "451421"
            },
            {
              name: "宁明县",
              code: "451422"
            },
            {
              name: "龙州县",
              code: "451423"
            },
            {
              name: "大新县",
              code: "451424"
            },
            {
              name: "天等县",
              code: "451425"
            },
            {
              name: "凭祥市",
              code: "451481"
            }
          ]
        }
      ]
    },
    {
      name: "海南省",
      code: "460000",
      children: [
        {
          name: "海口市",
          code: "460100",
          children: [
            {
              name: "市辖区",
              code: "460101"
            },
            {
              name: "秀英区",
              code: "460105"
            },
            {
              name: "龙华区",
              code: "460106"
            },
            {
              name: "琼山区",
              code: "460107"
            },
            {
              name: "美兰区",
              code: "460108"
            }
          ]
        },
        {
          name: "三亚市",
          code: "460200",
          children: [
            {
              name: "市辖区",
              code: "460201"
            }
          ]
        },
        {
          name: "三沙市",
          code: "460300",
          children: [
            {
              name: "西沙群岛",
              code: "460321"
            },
            {
              name: "南沙群岛",
              code: "460322"
            },
            {
              name: "中沙群岛的岛礁及其海域",
              code: "460323"
            }
          ]
        },
        {
          name: "省直辖县级行政区划",
          code: "469000",
          children: [
            {
              name: "五指山市",
              code: "469001"
            },
            {
              name: "琼海市",
              code: "469002"
            },
            {
              name: "儋州市",
              code: "469003"
            },
            {
              name: "文昌市",
              code: "469005"
            },
            {
              name: "万宁市",
              code: "469006"
            },
            {
              name: "东方市",
              code: "469007"
            },
            {
              name: "定安县",
              code: "469021"
            },
            {
              name: "屯昌县",
              code: "469022"
            },
            {
              name: "澄迈县",
              code: "469023"
            },
            {
              name: "临高县",
              code: "469024"
            },
            {
              name: "白沙黎族自治县",
              code: "469025"
            },
            {
              name: "昌江黎族自治县",
              code: "469026"
            },
            {
              name: "乐东黎族自治县",
              code: "469027"
            },
            {
              name: "陵水黎族自治县",
              code: "469028"
            },
            {
              name: "保亭黎族苗族自治县",
              code: "469029"
            },
            {
              name: "琼中黎族苗族自治县",
              code: "469030"
            }
          ]
        }
      ]
    },
    {
      name: "重庆市",
      code: "500000",
      children: [
        {
          name: "重庆市",
          code: "500000",
          children: [
            {
              name: "万州区",
              code: "500101"
            },
            {
              name: "涪陵区",
              code: "500102"
            },
            {
              name: "渝中区",
              code: "500103"
            },
            {
              name: "大渡口区",
              code: "500104"
            },
            {
              name: "江北区",
              code: "500105"
            },
            {
              name: "沙坪坝区",
              code: "500106"
            },
            {
              name: "九龙坡区",
              code: "500107"
            },
            {
              name: "南岸区",
              code: "500108"
            },
            {
              name: "北碚区",
              code: "500109"
            },
            {
              name: "綦江区",
              code: "500110"
            },
            {
              name: "大足区",
              code: "500111"
            },
            {
              name: "渝北区",
              code: "500112"
            },
            {
              name: "巴南区",
              code: "500113"
            },
            {
              name: "黔江区",
              code: "500114"
            },
            {
              name: "长寿区",
              code: "500115"
            },
            {
              name: "江津区",
              code: "500116"
            },
            {
              name: "合川区",
              code: "500117"
            },
            {
              name: "永川区",
              code: "500118"
            },
            {
              name: "南川区",
              code: "500119"
            },
            {
              name: "潼南县",
              code: "500223"
            },
            {
              name: "铜梁县",
              code: "500224"
            },
            {
              name: "荣昌县",
              code: "500226"
            },
            {
              name: "璧山县",
              code: "500227"
            },
            {
              name: "梁平县",
              code: "500228"
            },
            {
              name: "城口县",
              code: "500229"
            },
            {
              name: "丰都县",
              code: "500230"
            },
            {
              name: "垫江县",
              code: "500231"
            },
            {
              name: "武隆县",
              code: "500232"
            },
            {
              name: "忠县",
              code: "500233"
            },
            {
              name: "开县",
              code: "500234"
            },
            {
              name: "云阳县",
              code: "500235"
            },
            {
              name: "奉节县",
              code: "500236"
            },
            {
              name: "巫山县",
              code: "500237"
            },
            {
              name: "巫溪县",
              code: "500238"
            },
            {
              name: "石柱土家族自治县",
              code: "500240"
            },
            {
              name: "秀山土家族苗族自治县",
              code: "500241"
            },
            {
              name: "酉阳土家族苗族自治县",
              code: "500242"
            },
            {
              name: "彭水苗族土家族自治县",
              code: "500243"
            }
          ]
        }
      ]
    },
    {
      name: "四川省",
      code: "510000",
      children: [
        {
          name: "成都市",
          code: "510100",
          children: [
            {
              name: "市辖区",
              code: "510101"
            },
            {
              name: "锦江区",
              code: "510104"
            },
            {
              name: "青羊区",
              code: "510105"
            },
            {
              name: "金牛区",
              code: "510106"
            },
            {
              name: "武侯区",
              code: "510107"
            },
            {
              name: "成华区",
              code: "510108"
            },
            {
              name: "龙泉驿区",
              code: "510112"
            },
            {
              name: "青白江区",
              code: "510113"
            },
            {
              name: "新都区",
              code: "510114"
            },
            {
              name: "温江区",
              code: "510115"
            },
            {
              name: "金堂县",
              code: "510121"
            },
            {
              name: "双流县",
              code: "510122"
            },
            {
              name: "郫县",
              code: "510124"
            },
            {
              name: "大邑县",
              code: "510129"
            },
            {
              name: "蒲江县",
              code: "510131"
            },
            {
              name: "新津县",
              code: "510132"
            },
            {
              name: "都江堰市",
              code: "510181"
            },
            {
              name: "彭州市",
              code: "510182"
            },
            {
              name: "邛崃市",
              code: "510183"
            },
            {
              name: "崇州市",
              code: "510184"
            }
          ]
        },
        {
          name: "自贡市",
          code: "510300",
          children: [
            {
              name: "市辖区",
              code: "510301"
            },
            {
              name: "自流井区",
              code: "510302"
            },
            {
              name: "贡井区",
              code: "510303"
            },
            {
              name: "大安区",
              code: "510304"
            },
            {
              name: "沿滩区",
              code: "510311"
            },
            {
              name: "荣县",
              code: "510321"
            },
            {
              name: "富顺县",
              code: "510322"
            }
          ]
        },
        {
          name: "攀枝花市",
          code: "510400",
          children: [
            {
              name: "市辖区",
              code: "510401"
            },
            {
              name: "东区",
              code: "510402"
            },
            {
              name: "西区",
              code: "510403"
            },
            {
              name: "仁和区",
              code: "510411"
            },
            {
              name: "米易县",
              code: "510421"
            },
            {
              name: "盐边县",
              code: "510422"
            }
          ]
        },
        {
          name: "泸州市",
          code: "510500",
          children: [
            {
              name: "市辖区",
              code: "510501"
            },
            {
              name: "江阳区",
              code: "510502"
            },
            {
              name: "纳溪区",
              code: "510503"
            },
            {
              name: "龙马潭区",
              code: "510504"
            },
            {
              name: "泸县",
              code: "510521"
            },
            {
              name: "合江县",
              code: "510522"
            },
            {
              name: "叙永县",
              code: "510524"
            },
            {
              name: "古蔺县",
              code: "510525"
            }
          ]
        },
        {
          name: "德阳市",
          code: "510600",
          children: [
            {
              name: "市辖区",
              code: "510601"
            },
            {
              name: "旌阳区",
              code: "510603"
            },
            {
              name: "中江县",
              code: "510623"
            },
            {
              name: "罗江县",
              code: "510626"
            },
            {
              name: "广汉市",
              code: "510681"
            },
            {
              name: "什邡市",
              code: "510682"
            },
            {
              name: "绵竹市",
              code: "510683"
            }
          ]
        },
        {
          name: "绵阳市",
          code: "510700",
          children: [
            {
              name: "市辖区",
              code: "510701"
            },
            {
              name: "涪城区",
              code: "510703"
            },
            {
              name: "游仙区",
              code: "510704"
            },
            {
              name: "三台县",
              code: "510722"
            },
            {
              name: "盐亭县",
              code: "510723"
            },
            {
              name: "安县",
              code: "510724"
            },
            {
              name: "梓潼县",
              code: "510725"
            },
            {
              name: "北川羌族自治县",
              code: "510726"
            },
            {
              name: "平武县",
              code: "510727"
            },
            {
              name: "江油市",
              code: "510781"
            }
          ]
        },
        {
          name: "广元市",
          code: "510800",
          children: [
            {
              name: "市辖区",
              code: "510801"
            },
            {
              name: "利州区",
              code: "510802"
            },
            {
              name: "元坝区",
              code: "510811"
            },
            {
              name: "朝天区",
              code: "510812"
            },
            {
              name: "旺苍县",
              code: "510821"
            },
            {
              name: "青川县",
              code: "510822"
            },
            {
              name: "剑阁县",
              code: "510823"
            },
            {
              name: "苍溪县",
              code: "510824"
            }
          ]
        },
        {
          name: "遂宁市",
          code: "510900",
          children: [
            {
              name: "市辖区",
              code: "510901"
            },
            {
              name: "船山区",
              code: "510903"
            },
            {
              name: "安居区",
              code: "510904"
            },
            {
              name: "蓬溪县",
              code: "510921"
            },
            {
              name: "射洪县",
              code: "510922"
            },
            {
              name: "大英县",
              code: "510923"
            }
          ]
        },
        {
          name: "内江市",
          code: "511000",
          children: [
            {
              name: "市辖区",
              code: "511001"
            },
            {
              name: "市中区",
              code: "511002"
            },
            {
              name: "东兴区",
              code: "511011"
            },
            {
              name: "威远县",
              code: "511024"
            },
            {
              name: "资中县",
              code: "511025"
            },
            {
              name: "隆昌县",
              code: "511028"
            }
          ]
        },
        {
          name: "乐山市",
          code: "511100",
          children: [
            {
              name: "市辖区",
              code: "511101"
            },
            {
              name: "市中区",
              code: "511102"
            },
            {
              name: "沙湾区",
              code: "511111"
            },
            {
              name: "五通桥区",
              code: "511112"
            },
            {
              name: "金口河区",
              code: "511113"
            },
            {
              name: "犍为县",
              code: "511123"
            },
            {
              name: "井研县",
              code: "511124"
            },
            {
              name: "夹江县",
              code: "511126"
            },
            {
              name: "沐川县",
              code: "511129"
            },
            {
              name: "峨边彝族自治县",
              code: "511132"
            },
            {
              name: "马边彝族自治县",
              code: "511133"
            },
            {
              name: "峨眉山市",
              code: "511181"
            }
          ]
        },
        {
          name: "南充市",
          code: "511300",
          children: [
            {
              name: "市辖区",
              code: "511301"
            },
            {
              name: "顺庆区",
              code: "511302"
            },
            {
              name: "高坪区",
              code: "511303"
            },
            {
              name: "嘉陵区",
              code: "511304"
            },
            {
              name: "南部县",
              code: "511321"
            },
            {
              name: "营山县",
              code: "511322"
            },
            {
              name: "蓬安县",
              code: "511323"
            },
            {
              name: "仪陇县",
              code: "511324"
            },
            {
              name: "西充县",
              code: "511325"
            },
            {
              name: "阆中市",
              code: "511381"
            }
          ]
        },
        {
          name: "眉山市",
          code: "511400",
          children: [
            {
              name: "市辖区",
              code: "511401"
            },
            {
              name: "东坡区",
              code: "511402"
            },
            {
              name: "仁寿县",
              code: "511421"
            },
            {
              name: "彭山县",
              code: "511422"
            },
            {
              name: "洪雅县",
              code: "511423"
            },
            {
              name: "丹棱县",
              code: "511424"
            },
            {
              name: "青神县",
              code: "511425"
            }
          ]
        },
        {
          name: "宜宾市",
          code: "511500",
          children: [
            {
              name: "市辖区",
              code: "511501"
            },
            {
              name: "翠屏区",
              code: "511502"
            },
            {
              name: "南溪区",
              code: "511503"
            },
            {
              name: "宜宾县",
              code: "511521"
            },
            {
              name: "江安县",
              code: "511523"
            },
            {
              name: "长宁县",
              code: "511524"
            },
            {
              name: "高县",
              code: "511525"
            },
            {
              name: "珙县",
              code: "511526"
            },
            {
              name: "筠连县",
              code: "511527"
            },
            {
              name: "兴文县",
              code: "511528"
            },
            {
              name: "屏山县",
              code: "511529"
            }
          ]
        },
        {
          name: "广安市",
          code: "511600",
          children: [
            {
              name: "市辖区",
              code: "511601"
            },
            {
              name: "广安区",
              code: "511602"
            },
            {
              name: "前锋区",
              code: "511603"
            },
            {
              name: "岳池县",
              code: "511621"
            },
            {
              name: "武胜县",
              code: "511622"
            },
            {
              name: "邻水县",
              code: "511623"
            },
            {
              name: "华蓥市",
              code: "511681"
            }
          ]
        },
        {
          name: "达州市",
          code: "511700",
          children: [
            {
              name: "市辖区",
              code: "511701"
            },
            {
              name: "通川区",
              code: "511702"
            },
            {
              name: "达川区",
              code: "511703"
            },
            {
              name: "宣汉县",
              code: "511722"
            },
            {
              name: "开江县",
              code: "511723"
            },
            {
              name: "大竹县",
              code: "511724"
            },
            {
              name: "渠县",
              code: "511725"
            },
            {
              name: "万源市",
              code: "511781"
            }
          ]
        },
        {
          name: "雅安市",
          code: "511800",
          children: [
            {
              name: "市辖区",
              code: "511801"
            },
            {
              name: "雨城区",
              code: "511802"
            },
            {
              name: "名山区",
              code: "511803"
            },
            {
              name: "荥经县",
              code: "511822"
            },
            {
              name: "汉源县",
              code: "511823"
            },
            {
              name: "石棉县",
              code: "511824"
            },
            {
              name: "天全县",
              code: "511825"
            },
            {
              name: "芦山县",
              code: "511826"
            },
            {
              name: "宝兴县",
              code: "511827"
            }
          ]
        },
        {
          name: "巴中市",
          code: "511900",
          children: [
            {
              name: "市辖区",
              code: "511901"
            },
            {
              name: "巴州区",
              code: "511902"
            },
            {
              name: "恩阳区",
              code: "511903"
            },
            {
              name: "通江县",
              code: "511921"
            },
            {
              name: "南江县",
              code: "511922"
            },
            {
              name: "平昌县",
              code: "511923"
            }
          ]
        },
        {
          name: "资阳市",
          code: "512000",
          children: [
            {
              name: "市辖区",
              code: "512001"
            },
            {
              name: "雁江区",
              code: "512002"
            },
            {
              name: "安岳县",
              code: "512021"
            },
            {
              name: "乐至县",
              code: "512022"
            },
            {
              name: "简阳市",
              code: "512081"
            }
          ]
        },
        {
          name: "阿坝藏族羌族自治州",
          code: "513200",
          children: [
            {
              name: "汶川县",
              code: "513221"
            },
            {
              name: "理县",
              code: "513222"
            },
            {
              name: "茂县",
              code: "513223"
            },
            {
              name: "松潘县",
              code: "513224"
            },
            {
              name: "九寨沟县",
              code: "513225"
            },
            {
              name: "金川县",
              code: "513226"
            },
            {
              name: "小金县",
              code: "513227"
            },
            {
              name: "黑水县",
              code: "513228"
            },
            {
              name: "马尔康县",
              code: "513229"
            },
            {
              name: "壤塘县",
              code: "513230"
            },
            {
              name: "阿坝县",
              code: "513231"
            },
            {
              name: "若尔盖县",
              code: "513232"
            },
            {
              name: "红原县",
              code: "513233"
            }
          ]
        },
        {
          name: "甘孜藏族自治州",
          code: "513300",
          children: [
            {
              name: "康定县",
              code: "513321"
            },
            {
              name: "泸定县",
              code: "513322"
            },
            {
              name: "丹巴县",
              code: "513323"
            },
            {
              name: "九龙县",
              code: "513324"
            },
            {
              name: "雅江县",
              code: "513325"
            },
            {
              name: "道孚县",
              code: "513326"
            },
            {
              name: "炉霍县",
              code: "513327"
            },
            {
              name: "甘孜县",
              code: "513328"
            },
            {
              name: "新龙县",
              code: "513329"
            },
            {
              name: "德格县",
              code: "513330"
            },
            {
              name: "白玉县",
              code: "513331"
            },
            {
              name: "石渠县",
              code: "513332"
            },
            {
              name: "色达县",
              code: "513333"
            },
            {
              name: "理塘县",
              code: "513334"
            },
            {
              name: "巴塘县",
              code: "513335"
            },
            {
              name: "乡城县",
              code: "513336"
            },
            {
              name: "稻城县",
              code: "513337"
            },
            {
              name: "得荣县",
              code: "513338"
            }
          ]
        },
        {
          name: "凉山彝族自治州",
          code: "513400",
          children: [
            {
              name: "西昌市",
              code: "513401"
            },
            {
              name: "木里藏族自治县",
              code: "513422"
            },
            {
              name: "盐源县",
              code: "513423"
            },
            {
              name: "德昌县",
              code: "513424"
            },
            {
              name: "会理县",
              code: "513425"
            },
            {
              name: "会东县",
              code: "513426"
            },
            {
              name: "宁南县",
              code: "513427"
            },
            {
              name: "普格县",
              code: "513428"
            },
            {
              name: "布拖县",
              code: "513429"
            },
            {
              name: "金阳县",
              code: "513430"
            },
            {
              name: "昭觉县",
              code: "513431"
            },
            {
              name: "喜德县",
              code: "513432"
            },
            {
              name: "冕宁县",
              code: "513433"
            },
            {
              name: "越西县",
              code: "513434"
            },
            {
              name: "甘洛县",
              code: "513435"
            },
            {
              name: "美姑县",
              code: "513436"
            },
            {
              name: "雷波县",
              code: "513437"
            }
          ]
        }
      ]
    },
    {
      name: "贵州省",
      code: "520000",
      children: [
        {
          name: "贵阳市",
          code: "520100",
          children: [
            {
              name: "市辖区",
              code: "520101"
            },
            {
              name: "南明区",
              code: "520102"
            },
            {
              name: "云岩区",
              code: "520103"
            },
            {
              name: "花溪区",
              code: "520111"
            },
            {
              name: "乌当区",
              code: "520112"
            },
            {
              name: "白云区",
              code: "520113"
            },
            {
              name: "观山湖区",
              code: "520115"
            },
            {
              name: "开阳县",
              code: "520121"
            },
            {
              name: "息烽县",
              code: "520122"
            },
            {
              name: "修文县",
              code: "520123"
            },
            {
              name: "清镇市",
              code: "520181"
            }
          ]
        },
        {
          name: "六盘水市",
          code: "520200",
          children: [
            {
              name: "钟山区",
              code: "520201"
            },
            {
              name: "六枝特区",
              code: "520203"
            },
            {
              name: "水城县",
              code: "520221"
            },
            {
              name: "盘县",
              code: "520222"
            }
          ]
        },
        {
          name: "遵义市",
          code: "520300",
          children: [
            {
              name: "市辖区",
              code: "520301"
            },
            {
              name: "红花岗区",
              code: "520302"
            },
            {
              name: "汇川区",
              code: "520303"
            },
            {
              name: "遵义县",
              code: "520321"
            },
            {
              name: "桐梓县",
              code: "520322"
            },
            {
              name: "绥阳县",
              code: "520323"
            },
            {
              name: "正安县",
              code: "520324"
            },
            {
              name: "道真仡佬族苗族自治县",
              code: "520325"
            },
            {
              name: "务川仡佬族苗族自治县",
              code: "520326"
            },
            {
              name: "凤冈县",
              code: "520327"
            },
            {
              name: "湄潭县",
              code: "520328"
            },
            {
              name: "余庆县",
              code: "520329"
            },
            {
              name: "习水县",
              code: "520330"
            },
            {
              name: "赤水市",
              code: "520381"
            },
            {
              name: "仁怀市",
              code: "520382"
            }
          ]
        },
        {
          name: "安顺市",
          code: "520400",
          children: [
            {
              name: "市辖区",
              code: "520401"
            },
            {
              name: "西秀区",
              code: "520402"
            },
            {
              name: "平坝县",
              code: "520421"
            },
            {
              name: "普定县",
              code: "520422"
            },
            {
              name: "镇宁布依族苗族自治县",
              code: "520423"
            },
            {
              name: "关岭布依族苗族自治县",
              code: "520424"
            },
            {
              name: "紫云苗族布依族自治县",
              code: "520425"
            }
          ]
        },
        {
          name: "毕节市",
          code: "520500",
          children: [
            {
              name: "市辖区",
              code: "520501"
            },
            {
              name: "七星关区",
              code: "520502"
            },
            {
              name: "大方县",
              code: "520521"
            },
            {
              name: "黔西县",
              code: "520522"
            },
            {
              name: "金沙县",
              code: "520523"
            },
            {
              name: "织金县",
              code: "520524"
            },
            {
              name: "纳雍县",
              code: "520525"
            },
            {
              name: "威宁彝族回族苗族自治县",
              code: "520526"
            },
            {
              name: "赫章县",
              code: "520527"
            }
          ]
        },
        {
          name: "铜仁市",
          code: "520600",
          children: [
            {
              name: "市辖区",
              code: "520601"
            },
            {
              name: "碧江区",
              code: "520602"
            },
            {
              name: "万山区",
              code: "520603"
            },
            {
              name: "江口县",
              code: "520621"
            },
            {
              name: "玉屏侗族自治县",
              code: "520622"
            },
            {
              name: "石阡县",
              code: "520623"
            },
            {
              name: "思南县",
              code: "520624"
            },
            {
              name: "印江土家族苗族自治县",
              code: "520625"
            },
            {
              name: "德江县",
              code: "520626"
            },
            {
              name: "沿河土家族自治县",
              code: "520627"
            },
            {
              name: "松桃苗族自治县",
              code: "520628"
            }
          ]
        },
        {
          name: "黔西南布依族苗族自治州",
          code: "522300",
          children: [
            {
              name: "兴义市",
              code: "522301"
            },
            {
              name: "兴仁县",
              code: "522322"
            },
            {
              name: "普安县",
              code: "522323"
            },
            {
              name: "晴隆县",
              code: "522324"
            },
            {
              name: "贞丰县",
              code: "522325"
            },
            {
              name: "望谟县",
              code: "522326"
            },
            {
              name: "册亨县",
              code: "522327"
            },
            {
              name: "安龙县",
              code: "522328"
            }
          ]
        },
        {
          name: "黔东南苗族侗族自治州",
          code: "522600",
          children: [
            {
              name: "凯里市",
              code: "522601"
            },
            {
              name: "黄平县",
              code: "522622"
            },
            {
              name: "施秉县",
              code: "522623"
            },
            {
              name: "三穗县",
              code: "522624"
            },
            {
              name: "镇远县",
              code: "522625"
            },
            {
              name: "岑巩县",
              code: "522626"
            },
            {
              name: "天柱县",
              code: "522627"
            },
            {
              name: "锦屏县",
              code: "522628"
            },
            {
              name: "剑河县",
              code: "522629"
            },
            {
              name: "台江县",
              code: "522630"
            },
            {
              name: "黎平县",
              code: "522631"
            },
            {
              name: "榕江县",
              code: "522632"
            },
            {
              name: "从江县",
              code: "522633"
            },
            {
              name: "雷山县",
              code: "522634"
            },
            {
              name: "麻江县",
              code: "522635"
            },
            {
              name: "丹寨县",
              code: "522636"
            }
          ]
        },
        {
          name: "黔南布依族苗族自治州",
          code: "522700",
          children: [
            {
              name: "都匀市",
              code: "522701"
            },
            {
              name: "福泉市",
              code: "522702"
            },
            {
              name: "荔波县",
              code: "522722"
            },
            {
              name: "贵定县",
              code: "522723"
            },
            {
              name: "瓮安县",
              code: "522725"
            },
            {
              name: "独山县",
              code: "522726"
            },
            {
              name: "平塘县",
              code: "522727"
            },
            {
              name: "罗甸县",
              code: "522728"
            },
            {
              name: "长顺县",
              code: "522729"
            },
            {
              name: "龙里县",
              code: "522730"
            },
            {
              name: "惠水县",
              code: "522731"
            },
            {
              name: "三都水族自治县",
              code: "522732"
            }
          ]
        }
      ]
    },
    {
      name: "云南省",
      code: "530000",
      children: [
        {
          name: "昆明市",
          code: "530100",
          children: [
            {
              name: "市辖区",
              code: "530101"
            },
            {
              name: "五华区",
              code: "530102"
            },
            {
              name: "盘龙区",
              code: "530103"
            },
            {
              name: "官渡区",
              code: "530111"
            },
            {
              name: "西山区",
              code: "530112"
            },
            {
              name: "东川区",
              code: "530113"
            },
            {
              name: "呈贡区",
              code: "530114"
            },
            {
              name: "晋宁县",
              code: "530122"
            },
            {
              name: "富民县",
              code: "530124"
            },
            {
              name: "宜良县",
              code: "530125"
            },
            {
              name: "石林彝族自治县",
              code: "530126"
            },
            {
              name: "嵩明县",
              code: "530127"
            },
            {
              name: "禄劝彝族苗族自治县",
              code: "530128"
            },
            {
              name: "寻甸回族彝族自治县",
              code: "530129"
            },
            {
              name: "安宁市",
              code: "530181"
            }
          ]
        },
        {
          name: "曲靖市",
          code: "530300",
          children: [
            {
              name: "市辖区",
              code: "530301"
            },
            {
              name: "麒麟区",
              code: "530302"
            },
            {
              name: "马龙县",
              code: "530321"
            },
            {
              name: "陆良县",
              code: "530322"
            },
            {
              name: "师宗县",
              code: "530323"
            },
            {
              name: "罗平县",
              code: "530324"
            },
            {
              name: "富源县",
              code: "530325"
            },
            {
              name: "会泽县",
              code: "530326"
            },
            {
              name: "沾益县",
              code: "530328"
            },
            {
              name: "宣威市",
              code: "530381"
            }
          ]
        },
        {
          name: "玉溪市",
          code: "530400",
          children: [
            {
              name: "市辖区",
              code: "530401"
            },
            {
              name: "红塔区",
              code: "530402"
            },
            {
              name: "江川县",
              code: "530421"
            },
            {
              name: "澄江县",
              code: "530422"
            },
            {
              name: "通海县",
              code: "530423"
            },
            {
              name: "华宁县",
              code: "530424"
            },
            {
              name: "易门县",
              code: "530425"
            },
            {
              name: "峨山彝族自治县",
              code: "530426"
            },
            {
              name: "新平彝族傣族自治县",
              code: "530427"
            },
            {
              name: "元江哈尼族彝族傣族自治县",
              code: "530428"
            }
          ]
        },
        {
          name: "保山市",
          code: "530500",
          children: [
            {
              name: "市辖区",
              code: "530501"
            },
            {
              name: "隆阳区",
              code: "530502"
            },
            {
              name: "施甸县",
              code: "530521"
            },
            {
              name: "腾冲县",
              code: "530522"
            },
            {
              name: "龙陵县",
              code: "530523"
            },
            {
              name: "昌宁县",
              code: "530524"
            }
          ]
        },
        {
          name: "昭通市",
          code: "530600",
          children: [
            {
              name: "市辖区",
              code: "530601"
            },
            {
              name: "昭阳区",
              code: "530602"
            },
            {
              name: "鲁甸县",
              code: "530621"
            },
            {
              name: "巧家县",
              code: "530622"
            },
            {
              name: "盐津县",
              code: "530623"
            },
            {
              name: "大关县",
              code: "530624"
            },
            {
              name: "永善县",
              code: "530625"
            },
            {
              name: "绥江县",
              code: "530626"
            },
            {
              name: "镇雄县",
              code: "530627"
            },
            {
              name: "彝良县",
              code: "530628"
            },
            {
              name: "威信县",
              code: "530629"
            },
            {
              name: "水富县",
              code: "530630"
            }
          ]
        },
        {
          name: "丽江市",
          code: "530700",
          children: [
            {
              name: "市辖区",
              code: "530701"
            },
            {
              name: "古城区",
              code: "530702"
            },
            {
              name: "玉龙纳西族自治县",
              code: "530721"
            },
            {
              name: "永胜县",
              code: "530722"
            },
            {
              name: "华坪县",
              code: "530723"
            },
            {
              name: "宁蒗彝族自治县",
              code: "530724"
            }
          ]
        },
        {
          name: "普洱市",
          code: "530800",
          children: [
            {
              name: "市辖区",
              code: "530801"
            },
            {
              name: "思茅区",
              code: "530802"
            },
            {
              name: "宁洱哈尼族彝族自治县",
              code: "530821"
            },
            {
              name: "墨江哈尼族自治县",
              code: "530822"
            },
            {
              name: "景东彝族自治县",
              code: "530823"
            },
            {
              name: "景谷傣族彝族自治县",
              code: "530824"
            },
            {
              name: "镇沅彝族哈尼族拉祜族自治县",
              code: "530825"
            },
            {
              name: "江城哈尼族彝族自治县",
              code: "530826"
            },
            {
              name: "孟连傣族拉祜族佤族自治县",
              code: "530827"
            },
            {
              name: "澜沧拉祜族自治县",
              code: "530828"
            },
            {
              name: "西盟佤族自治县",
              code: "530829"
            }
          ]
        },
        {
          name: "临沧市",
          code: "530900",
          children: [
            {
              name: "市辖区",
              code: "530901"
            },
            {
              name: "临翔区",
              code: "530902"
            },
            {
              name: "凤庆县",
              code: "530921"
            },
            {
              name: "云县",
              code: "530922"
            },
            {
              name: "永德县",
              code: "530923"
            },
            {
              name: "镇康县",
              code: "530924"
            },
            {
              name: "双江拉祜族佤族布朗族傣族自治县",
              code: "530925"
            },
            {
              name: "耿马傣族佤族自治县",
              code: "530926"
            },
            {
              name: "沧源佤族自治县",
              code: "530927"
            }
          ]
        },
        {
          name: "楚雄彝族自治州",
          code: "532300",
          children: [
            {
              name: "楚雄市",
              code: "532301"
            },
            {
              name: "双柏县",
              code: "532322"
            },
            {
              name: "牟定县",
              code: "532323"
            },
            {
              name: "南华县",
              code: "532324"
            },
            {
              name: "姚安县",
              code: "532325"
            },
            {
              name: "大姚县",
              code: "532326"
            },
            {
              name: "永仁县",
              code: "532327"
            },
            {
              name: "元谋县",
              code: "532328"
            },
            {
              name: "武定县",
              code: "532329"
            },
            {
              name: "禄丰县",
              code: "532331"
            }
          ]
        },
        {
          name: "红河哈尼族彝族自治州",
          code: "532500",
          children: [
            {
              name: "个旧市",
              code: "532501"
            },
            {
              name: "开远市",
              code: "532502"
            },
            {
              name: "蒙自市",
              code: "532503"
            },
            {
              name: "弥勒市",
              code: "532504"
            },
            {
              name: "屏边苗族自治县",
              code: "532523"
            },
            {
              name: "建水县",
              code: "532524"
            },
            {
              name: "石屏县",
              code: "532525"
            },
            {
              name: "泸西县",
              code: "532527"
            },
            {
              name: "元阳县",
              code: "532528"
            },
            {
              name: "红河县",
              code: "532529"
            },
            {
              name: "金平苗族瑶族傣族自治县",
              code: "532530"
            },
            {
              name: "绿春县",
              code: "532531"
            },
            {
              name: "河口瑶族自治县",
              code: "532532"
            }
          ]
        },
        {
          name: "文山壮族苗族自治州",
          code: "532600",
          children: [
            {
              name: "文山市",
              code: "532601"
            },
            {
              name: "砚山县",
              code: "532622"
            },
            {
              name: "西畴县",
              code: "532623"
            },
            {
              name: "麻栗坡县",
              code: "532624"
            },
            {
              name: "马关县",
              code: "532625"
            },
            {
              name: "丘北县",
              code: "532626"
            },
            {
              name: "广南县",
              code: "532627"
            },
            {
              name: "富宁县",
              code: "532628"
            }
          ]
        },
        {
          name: "西双版纳傣族自治州",
          code: "532800",
          children: [
            {
              name: "景洪市",
              code: "532801"
            },
            {
              name: "勐海县",
              code: "532822"
            },
            {
              name: "勐腊县",
              code: "532823"
            }
          ]
        },
        {
          name: "大理白族自治州",
          code: "532900",
          children: [
            {
              name: "大理市",
              code: "532901"
            },
            {
              name: "漾濞彝族自治县",
              code: "532922"
            },
            {
              name: "祥云县",
              code: "532923"
            },
            {
              name: "宾川县",
              code: "532924"
            },
            {
              name: "弥渡县",
              code: "532925"
            },
            {
              name: "南涧彝族自治县",
              code: "532926"
            },
            {
              name: "巍山彝族回族自治县",
              code: "532927"
            },
            {
              name: "永平县",
              code: "532928"
            },
            {
              name: "云龙县",
              code: "532929"
            },
            {
              name: "洱源县",
              code: "532930"
            },
            {
              name: "剑川县",
              code: "532931"
            },
            {
              name: "鹤庆县",
              code: "532932"
            }
          ]
        },
        {
          name: "德宏傣族景颇族自治州",
          code: "533100",
          children: [
            {
              name: "瑞丽市",
              code: "533102"
            },
            {
              name: "芒市",
              code: "533103"
            },
            {
              name: "梁河县",
              code: "533122"
            },
            {
              name: "盈江县",
              code: "533123"
            },
            {
              name: "陇川县",
              code: "533124"
            }
          ]
        },
        {
          name: "怒江傈僳族自治州",
          code: "533300",
          children: [
            {
              name: "泸水县",
              code: "533321"
            },
            {
              name: "福贡县",
              code: "533323"
            },
            {
              name: "贡山独龙族怒族自治县",
              code: "533324"
            },
            {
              name: "兰坪白族普米族自治县",
              code: "533325"
            }
          ]
        },
        {
          name: "迪庆藏族自治州",
          code: "533400",
          children: [
            {
              name: "香格里拉县",
              code: "533421"
            },
            {
              name: "德钦县",
              code: "533422"
            },
            {
              name: "维西傈僳族自治县",
              code: "533423"
            }
          ]
        }
      ]
    },
    {
      name: "西藏自治区",
      code: "540000",
      children: [
        {
          name: "拉萨市",
          code: "540100",
          children: [
            {
              name: "市辖区",
              code: "540101"
            },
            {
              name: "城关区",
              code: "540102"
            },
            {
              name: "林周县",
              code: "540121"
            },
            {
              name: "当雄县",
              code: "540122"
            },
            {
              name: "尼木县",
              code: "540123"
            },
            {
              name: "曲水县",
              code: "540124"
            },
            {
              name: "堆龙德庆县",
              code: "540125"
            },
            {
              name: "达孜县",
              code: "540126"
            },
            {
              name: "墨竹工卡县",
              code: "540127"
            }
          ]
        },
        {
          name: "昌都地区",
          code: "542100",
          children: [
            {
              name: "昌都县",
              code: "542121"
            },
            {
              name: "江达县",
              code: "542122"
            },
            {
              name: "贡觉县",
              code: "542123"
            },
            {
              name: "类乌齐县",
              code: "542124"
            },
            {
              name: "丁青县",
              code: "542125"
            },
            {
              name: "察雅县",
              code: "542126"
            },
            {
              name: "八宿县",
              code: "542127"
            },
            {
              name: "左贡县",
              code: "542128"
            },
            {
              name: "芒康县",
              code: "542129"
            },
            {
              name: "洛隆县",
              code: "542132"
            },
            {
              name: "边坝县",
              code: "542133"
            }
          ]
        },
        {
          name: "山南地区",
          code: "542200",
          children: [
            {
              name: "乃东县",
              code: "542221"
            },
            {
              name: "扎囊县",
              code: "542222"
            },
            {
              name: "贡嘎县",
              code: "542223"
            },
            {
              name: "桑日县",
              code: "542224"
            },
            {
              name: "琼结县",
              code: "542225"
            },
            {
              name: "曲松县",
              code: "542226"
            },
            {
              name: "措美县",
              code: "542227"
            },
            {
              name: "洛扎县",
              code: "542228"
            },
            {
              name: "加查县",
              code: "542229"
            },
            {
              name: "隆子县",
              code: "542231"
            },
            {
              name: "错那县",
              code: "542232"
            },
            {
              name: "浪卡子县",
              code: "542233"
            }
          ]
        },
        {
          name: "日喀则地区",
          code: "542300",
          children: [
            {
              name: "日喀则市",
              code: "542301"
            },
            {
              name: "南木林县",
              code: "542322"
            },
            {
              name: "江孜县",
              code: "542323"
            },
            {
              name: "定日县",
              code: "542324"
            },
            {
              name: "萨迦县",
              code: "542325"
            },
            {
              name: "拉孜县",
              code: "542326"
            },
            {
              name: "昂仁县",
              code: "542327"
            },
            {
              name: "谢通门县",
              code: "542328"
            },
            {
              name: "白朗县",
              code: "542329"
            },
            {
              name: "仁布县",
              code: "542330"
            },
            {
              name: "康马县",
              code: "542331"
            },
            {
              name: "定结县",
              code: "542332"
            },
            {
              name: "仲巴县",
              code: "542333"
            },
            {
              name: "亚东县",
              code: "542334"
            },
            {
              name: "吉隆县",
              code: "542335"
            },
            {
              name: "聂拉木县",
              code: "542336"
            },
            {
              name: "萨嘎县",
              code: "542337"
            },
            {
              name: "岗巴县",
              code: "542338"
            }
          ]
        },
        {
          name: "那曲地区",
          code: "542400",
          children: [
            {
              name: "那曲县",
              code: "542421"
            },
            {
              name: "嘉黎县",
              code: "542422"
            },
            {
              name: "比如县",
              code: "542423"
            },
            {
              name: "聂荣县",
              code: "542424"
            },
            {
              name: "安多县",
              code: "542425"
            },
            {
              name: "申扎县",
              code: "542426"
            },
            {
              name: "索县",
              code: "542427"
            },
            {
              name: "班戈县",
              code: "542428"
            },
            {
              name: "巴青县",
              code: "542429"
            },
            {
              name: "尼玛县",
              code: "542430"
            },
            {
              name: "双湖县",
              code: "542431"
            }
          ]
        },
        {
          name: "阿里地区",
          code: "542500",
          children: [
            {
              name: "普兰县",
              code: "542521"
            },
            {
              name: "札达县",
              code: "542522"
            },
            {
              name: "噶尔县",
              code: "542523"
            },
            {
              name: "日土县",
              code: "542524"
            },
            {
              name: "革吉县",
              code: "542525"
            },
            {
              name: "改则县",
              code: "542526"
            },
            {
              name: "措勤县",
              code: "542527"
            }
          ]
        },
        {
          name: "林芝地区",
          code: "542600",
          children: [
            {
              name: "林芝县",
              code: "542621"
            },
            {
              name: "工布江达县",
              code: "542622"
            },
            {
              name: "米林县",
              code: "542623"
            },
            {
              name: "墨脱县",
              code: "542624"
            },
            {
              name: "波密县",
              code: "542625"
            },
            {
              name: "察隅县",
              code: "542626"
            },
            {
              name: "朗县",
              code: "542627"
            }
          ]
        }
      ]
    },
    {
      name: "陕西省",
      code: "610000",
      children: [
        {
          name: "西安市",
          code: "610100",
          children: [
            {
              name: "市辖区",
              code: "610101"
            },
            {
              name: "新城区",
              code: "610102"
            },
            {
              name: "碑林区",
              code: "610103"
            },
            {
              name: "莲湖区",
              code: "610104"
            },
            {
              name: "灞桥区",
              code: "610111"
            },
            {
              name: "未央区",
              code: "610112"
            },
            {
              name: "雁塔区",
              code: "610113"
            },
            {
              name: "阎良区",
              code: "610114"
            },
            {
              name: "临潼区",
              code: "610115"
            },
            {
              name: "长安区",
              code: "610116"
            },
            {
              name: "蓝田县",
              code: "610122"
            },
            {
              name: "周至县",
              code: "610124"
            },
            {
              name: "户县",
              code: "610125"
            },
            {
              name: "高陵县",
              code: "610126"
            }
          ]
        },
        {
          name: "铜川市",
          code: "610200",
          children: [
            {
              name: "市辖区",
              code: "610201"
            },
            {
              name: "王益区",
              code: "610202"
            },
            {
              name: "印台区",
              code: "610203"
            },
            {
              name: "耀州区",
              code: "610204"
            },
            {
              name: "宜君县",
              code: "610222"
            }
          ]
        },
        {
          name: "宝鸡市",
          code: "610300",
          children: [
            {
              name: "市辖区",
              code: "610301"
            },
            {
              name: "渭滨区",
              code: "610302"
            },
            {
              name: "金台区",
              code: "610303"
            },
            {
              name: "陈仓区",
              code: "610304"
            },
            {
              name: "凤翔县",
              code: "610322"
            },
            {
              name: "岐山县",
              code: "610323"
            },
            {
              name: "扶风县",
              code: "610324"
            },
            {
              name: "眉县",
              code: "610326"
            },
            {
              name: "陇县",
              code: "610327"
            },
            {
              name: "千阳县",
              code: "610328"
            },
            {
              name: "麟游县",
              code: "610329"
            },
            {
              name: "凤县",
              code: "610330"
            },
            {
              name: "太白县",
              code: "610331"
            }
          ]
        },
        {
          name: "咸阳市",
          code: "610400",
          children: [
            {
              name: "市辖区",
              code: "610401"
            },
            {
              name: "秦都区",
              code: "610402"
            },
            {
              name: "杨陵区",
              code: "610403"
            },
            {
              name: "渭城区",
              code: "610404"
            },
            {
              name: "三原县",
              code: "610422"
            },
            {
              name: "泾阳县",
              code: "610423"
            },
            {
              name: "乾县",
              code: "610424"
            },
            {
              name: "礼泉县",
              code: "610425"
            },
            {
              name: "永寿县",
              code: "610426"
            },
            {
              name: "彬县",
              code: "610427"
            },
            {
              name: "长武县",
              code: "610428"
            },
            {
              name: "旬邑县",
              code: "610429"
            },
            {
              name: "淳化县",
              code: "610430"
            },
            {
              name: "武功县",
              code: "610431"
            },
            {
              name: "兴平市",
              code: "610481"
            }
          ]
        },
        {
          name: "渭南市",
          code: "610500",
          children: [
            {
              name: "市辖区",
              code: "610501"
            },
            {
              name: "临渭区",
              code: "610502"
            },
            {
              name: "华县",
              code: "610521"
            },
            {
              name: "潼关县",
              code: "610522"
            },
            {
              name: "大荔县",
              code: "610523"
            },
            {
              name: "合阳县",
              code: "610524"
            },
            {
              name: "澄城县",
              code: "610525"
            },
            {
              name: "蒲城县",
              code: "610526"
            },
            {
              name: "白水县",
              code: "610527"
            },
            {
              name: "富平县",
              code: "610528"
            },
            {
              name: "韩城市",
              code: "610581"
            },
            {
              name: "华阴市",
              code: "610582"
            }
          ]
        },
        {
          name: "延安市",
          code: "610600",
          children: [
            {
              name: "市辖区",
              code: "610601"
            },
            {
              name: "宝塔区",
              code: "610602"
            },
            {
              name: "延长县",
              code: "610621"
            },
            {
              name: "延川县",
              code: "610622"
            },
            {
              name: "子长县",
              code: "610623"
            },
            {
              name: "安塞县",
              code: "610624"
            },
            {
              name: "志丹县",
              code: "610625"
            },
            {
              name: "吴起县",
              code: "610626"
            },
            {
              name: "甘泉县",
              code: "610627"
            },
            {
              name: "富县",
              code: "610628"
            },
            {
              name: "洛川县",
              code: "610629"
            },
            {
              name: "宜川县",
              code: "610630"
            },
            {
              name: "黄龙县",
              code: "610631"
            },
            {
              name: "黄陵县",
              code: "610632"
            }
          ]
        },
        {
          name: "汉中市",
          code: "610700",
          children: [
            {
              name: "市辖区",
              code: "610701"
            },
            {
              name: "汉台区",
              code: "610702"
            },
            {
              name: "南郑县",
              code: "610721"
            },
            {
              name: "城固县",
              code: "610722"
            },
            {
              name: "洋县",
              code: "610723"
            },
            {
              name: "西乡县",
              code: "610724"
            },
            {
              name: "勉县",
              code: "610725"
            },
            {
              name: "宁强县",
              code: "610726"
            },
            {
              name: "略阳县",
              code: "610727"
            },
            {
              name: "镇巴县",
              code: "610728"
            },
            {
              name: "留坝县",
              code: "610729"
            },
            {
              name: "佛坪县",
              code: "610730"
            }
          ]
        },
        {
          name: "榆林市",
          code: "610800",
          children: [
            {
              name: "市辖区",
              code: "610801"
            },
            {
              name: "榆阳区",
              code: "610802"
            },
            {
              name: "神木县",
              code: "610821"
            },
            {
              name: "府谷县",
              code: "610822"
            },
            {
              name: "横山县",
              code: "610823"
            },
            {
              name: "靖边县",
              code: "610824"
            },
            {
              name: "定边县",
              code: "610825"
            },
            {
              name: "绥德县",
              code: "610826"
            },
            {
              name: "米脂县",
              code: "610827"
            },
            {
              name: "佳县",
              code: "610828"
            },
            {
              name: "吴堡县",
              code: "610829"
            },
            {
              name: "清涧县",
              code: "610830"
            },
            {
              name: "子洲县",
              code: "610831"
            }
          ]
        },
        {
          name: "安康市",
          code: "610900",
          children: [
            {
              name: "市辖区",
              code: "610901"
            },
            {
              name: "汉滨区",
              code: "610902"
            },
            {
              name: "汉阴县",
              code: "610921"
            },
            {
              name: "石泉县",
              code: "610922"
            },
            {
              name: "宁陕县",
              code: "610923"
            },
            {
              name: "紫阳县",
              code: "610924"
            },
            {
              name: "岚皋县",
              code: "610925"
            },
            {
              name: "平利县",
              code: "610926"
            },
            {
              name: "镇坪县",
              code: "610927"
            },
            {
              name: "旬阳县",
              code: "610928"
            },
            {
              name: "白河县",
              code: "610929"
            }
          ]
        },
        {
          name: "商洛市",
          code: "611000",
          children: [
            {
              name: "市辖区",
              code: "611001"
            },
            {
              name: "商州区",
              code: "611002"
            },
            {
              name: "洛南县",
              code: "611021"
            },
            {
              name: "丹凤县",
              code: "611022"
            },
            {
              name: "商南县",
              code: "611023"
            },
            {
              name: "山阳县",
              code: "611024"
            },
            {
              name: "镇安县",
              code: "611025"
            },
            {
              name: "柞水县",
              code: "611026"
            }
          ]
        }
      ]
    },
    {
      name: "甘肃省",
      code: "620000",
      children: [
        {
          name: "兰州市",
          code: "620100",
          children: [
            {
              name: "市辖区",
              code: "620101"
            },
            {
              name: "城关区",
              code: "620102"
            },
            {
              name: "七里河区",
              code: "620103"
            },
            {
              name: "西固区",
              code: "620104"
            },
            {
              name: "安宁区",
              code: "620105"
            },
            {
              name: "红古区",
              code: "620111"
            },
            {
              name: "永登县",
              code: "620121"
            },
            {
              name: "皋兰县",
              code: "620122"
            },
            {
              name: "榆中县",
              code: "620123"
            }
          ]
        },
        {
          name: "嘉峪关市",
          code: "620200",
          children: [
            {
              name: "市辖区",
              code: "620201"
            }
          ]
        },
        {
          name: "金昌市",
          code: "620300",
          children: [
            {
              name: "市辖区",
              code: "620301"
            },
            {
              name: "金川区",
              code: "620302"
            },
            {
              name: "永昌县",
              code: "620321"
            }
          ]
        },
        {
          name: "白银市",
          code: "620400",
          children: [
            {
              name: "市辖区",
              code: "620401"
            },
            {
              name: "白银区",
              code: "620402"
            },
            {
              name: "平川区",
              code: "620403"
            },
            {
              name: "靖远县",
              code: "620421"
            },
            {
              name: "会宁县",
              code: "620422"
            },
            {
              name: "景泰县",
              code: "620423"
            }
          ]
        },
        {
          name: "天水市",
          code: "620500",
          children: [
            {
              name: "市辖区",
              code: "620501"
            },
            {
              name: "秦州区",
              code: "620502"
            },
            {
              name: "麦积区",
              code: "620503"
            },
            {
              name: "清水县",
              code: "620521"
            },
            {
              name: "秦安县",
              code: "620522"
            },
            {
              name: "甘谷县",
              code: "620523"
            },
            {
              name: "武山县",
              code: "620524"
            },
            {
              name: "张家川回族自治县",
              code: "620525"
            }
          ]
        },
        {
          name: "武威市",
          code: "620600",
          children: [
            {
              name: "市辖区",
              code: "620601"
            },
            {
              name: "凉州区",
              code: "620602"
            },
            {
              name: "民勤县",
              code: "620621"
            },
            {
              name: "古浪县",
              code: "620622"
            },
            {
              name: "天祝藏族自治县",
              code: "620623"
            }
          ]
        },
        {
          name: "张掖市",
          code: "620700",
          children: [
            {
              name: "市辖区",
              code: "620701"
            },
            {
              name: "甘州区",
              code: "620702"
            },
            {
              name: "肃南裕固族自治县",
              code: "620721"
            },
            {
              name: "民乐县",
              code: "620722"
            },
            {
              name: "临泽县",
              code: "620723"
            },
            {
              name: "高台县",
              code: "620724"
            },
            {
              name: "山丹县",
              code: "620725"
            }
          ]
        },
        {
          name: "平凉市",
          code: "620800",
          children: [
            {
              name: "市辖区",
              code: "620801"
            },
            {
              name: "崆峒区",
              code: "620802"
            },
            {
              name: "泾川县",
              code: "620821"
            },
            {
              name: "灵台县",
              code: "620822"
            },
            {
              name: "崇信县",
              code: "620823"
            },
            {
              name: "华亭县",
              code: "620824"
            },
            {
              name: "庄浪县",
              code: "620825"
            },
            {
              name: "静宁县",
              code: "620826"
            }
          ]
        },
        {
          name: "酒泉市",
          code: "620900",
          children: [
            {
              name: "市辖区",
              code: "620901"
            },
            {
              name: "肃州区",
              code: "620902"
            },
            {
              name: "金塔县",
              code: "620921"
            },
            {
              name: "瓜州县",
              code: "620922"
            },
            {
              name: "肃北蒙古族自治县",
              code: "620923"
            },
            {
              name: "阿克塞哈萨克族自治县",
              code: "620924"
            },
            {
              name: "玉门市",
              code: "620981"
            },
            {
              name: "敦煌市",
              code: "620982"
            }
          ]
        },
        {
          name: "庆阳市",
          code: "621000",
          children: [
            {
              name: "市辖区",
              code: "621001"
            },
            {
              name: "西峰区",
              code: "621002"
            },
            {
              name: "庆城县",
              code: "621021"
            },
            {
              name: "环县",
              code: "621022"
            },
            {
              name: "华池县",
              code: "621023"
            },
            {
              name: "合水县",
              code: "621024"
            },
            {
              name: "正宁县",
              code: "621025"
            },
            {
              name: "宁县",
              code: "621026"
            },
            {
              name: "镇原县",
              code: "621027"
            }
          ]
        },
        {
          name: "定西市",
          code: "621100",
          children: [
            {
              name: "市辖区",
              code: "621101"
            },
            {
              name: "安定区",
              code: "621102"
            },
            {
              name: "通渭县",
              code: "621121"
            },
            {
              name: "陇西县",
              code: "621122"
            },
            {
              name: "渭源县",
              code: "621123"
            },
            {
              name: "临洮县",
              code: "621124"
            },
            {
              name: "漳县",
              code: "621125"
            },
            {
              name: "岷县",
              code: "621126"
            }
          ]
        },
        {
          name: "陇南市",
          code: "621200",
          children: [
            {
              name: "市辖区",
              code: "621201"
            },
            {
              name: "武都区",
              code: "621202"
            },
            {
              name: "成县",
              code: "621221"
            },
            {
              name: "文县",
              code: "621222"
            },
            {
              name: "宕昌县",
              code: "621223"
            },
            {
              name: "康县",
              code: "621224"
            },
            {
              name: "西和县",
              code: "621225"
            },
            {
              name: "礼县",
              code: "621226"
            },
            {
              name: "徽县",
              code: "621227"
            },
            {
              name: "两当县",
              code: "621228"
            }
          ]
        },
        {
          name: "临夏回族自治州",
          code: "622900",
          children: [
            {
              name: "临夏市",
              code: "622901"
            },
            {
              name: "临夏县",
              code: "622921"
            },
            {
              name: "康乐县",
              code: "622922"
            },
            {
              name: "永靖县",
              code: "622923"
            },
            {
              name: "广河县",
              code: "622924"
            },
            {
              name: "和政县",
              code: "622925"
            },
            {
              name: "东乡族自治县",
              code: "622926"
            },
            {
              name: "积石山保安族东乡族撒拉族自治县",
              code: "622927"
            }
          ]
        },
        {
          name: "甘南藏族自治州",
          code: "623000",
          children: [
            {
              name: "合作市",
              code: "623001"
            },
            {
              name: "临潭县",
              code: "623021"
            },
            {
              name: "卓尼县",
              code: "623022"
            },
            {
              name: "舟曲县",
              code: "623023"
            },
            {
              name: "迭部县",
              code: "623024"
            },
            {
              name: "玛曲县",
              code: "623025"
            },
            {
              name: "碌曲县",
              code: "623026"
            },
            {
              name: "夏河县",
              code: "623027"
            }
          ]
        }
      ]
    },
    {
      name: "青海省",
      code: "630000",
      children: [
        {
          name: "西宁市",
          code: "630100",
          children: [
            {
              name: "市辖区",
              code: "630101"
            },
            {
              name: "城东区",
              code: "630102"
            },
            {
              name: "城中区",
              code: "630103"
            },
            {
              name: "城西区",
              code: "630104"
            },
            {
              name: "城北区",
              code: "630105"
            },
            {
              name: "大通回族土族自治县",
              code: "630121"
            },
            {
              name: "湟中县",
              code: "630122"
            },
            {
              name: "湟源县",
              code: "630123"
            }
          ]
        },
        {
          name: "海东市",
          code: "630200",
          children: [
            {
              name: "乐都区",
              code: "630202"
            },
            {
              name: "平安县",
              code: "630221"
            },
            {
              name: "民和回族土族自治县",
              code: "630222"
            },
            {
              name: "互助土族自治县",
              code: "630223"
            },
            {
              name: "化隆回族自治县",
              code: "630224"
            },
            {
              name: "循化撒拉族自治县",
              code: "630225"
            }
          ]
        },
        {
          name: "海北藏族自治州",
          code: "632200",
          children: [
            {
              name: "门源回族自治县",
              code: "632221"
            },
            {
              name: "祁连县",
              code: "632222"
            },
            {
              name: "海晏县",
              code: "632223"
            },
            {
              name: "刚察县",
              code: "632224"
            }
          ]
        },
        {
          name: "黄南藏族自治州",
          code: "632300",
          children: [
            {
              name: "同仁县",
              code: "632321"
            },
            {
              name: "尖扎县",
              code: "632322"
            },
            {
              name: "泽库县",
              code: "632323"
            },
            {
              name: "河南蒙古族自治县",
              code: "632324"
            }
          ]
        },
        {
          name: "海南藏族自治州",
          code: "632500",
          children: [
            {
              name: "共和县",
              code: "632521"
            },
            {
              name: "同德县",
              code: "632522"
            },
            {
              name: "贵德县",
              code: "632523"
            },
            {
              name: "兴海县",
              code: "632524"
            },
            {
              name: "贵南县",
              code: "632525"
            }
          ]
        },
        {
          name: "果洛藏族自治州",
          code: "632600",
          children: [
            {
              name: "玛沁县",
              code: "632621"
            },
            {
              name: "班玛县",
              code: "632622"
            },
            {
              name: "甘德县",
              code: "632623"
            },
            {
              name: "达日县",
              code: "632624"
            },
            {
              name: "久治县",
              code: "632625"
            },
            {
              name: "玛多县",
              code: "632626"
            }
          ]
        },
        {
          name: "玉树藏族自治州",
          code: "632700",
          children: [
            {
              name: "玉树市",
              code: "632701"
            },
            {
              name: "杂多县",
              code: "632722"
            },
            {
              name: "称多县",
              code: "632723"
            },
            {
              name: "治多县",
              code: "632724"
            },
            {
              name: "囊谦县",
              code: "632725"
            },
            {
              name: "曲麻莱县",
              code: "632726"
            }
          ]
        },
        {
          name: "海西蒙古族藏族自治州",
          code: "632800",
          children: [
            {
              name: "格尔木市",
              code: "632801"
            },
            {
              name: "德令哈市",
              code: "632802"
            },
            {
              name: "乌兰县",
              code: "632821"
            },
            {
              name: "都兰县",
              code: "632822"
            },
            {
              name: "天峻县",
              code: "632823"
            }
          ]
        }
      ]
    },
    {
      name: "宁夏回族自治区",
      code: "640000",
      children: [
        {
          name: "银川市",
          code: "640100",
          children: [
            {
              name: "市辖区",
              code: "640101"
            },
            {
              name: "兴庆区",
              code: "640104"
            },
            {
              name: "西夏区",
              code: "640105"
            },
            {
              name: "金凤区",
              code: "640106"
            },
            {
              name: "永宁县",
              code: "640121"
            },
            {
              name: "贺兰县",
              code: "640122"
            },
            {
              name: "灵武市",
              code: "640181"
            }
          ]
        },
        {
          name: "石嘴山市",
          code: "640200",
          children: [
            {
              name: "市辖区",
              code: "640201"
            },
            {
              name: "大武口区",
              code: "640202"
            },
            {
              name: "惠农区",
              code: "640205"
            },
            {
              name: "平罗县",
              code: "640221"
            }
          ]
        },
        {
          name: "吴忠市",
          code: "640300",
          children: [
            {
              name: "市辖区",
              code: "640301"
            },
            {
              name: "利通区",
              code: "640302"
            },
            {
              name: "红寺堡区",
              code: "640303"
            },
            {
              name: "盐池县",
              code: "640323"
            },
            {
              name: "同心县",
              code: "640324"
            },
            {
              name: "青铜峡市",
              code: "640381"
            }
          ]
        },
        {
          name: "固原市",
          code: "640400",
          children: [
            {
              name: "市辖区",
              code: "640401"
            },
            {
              name: "原州区",
              code: "640402"
            },
            {
              name: "西吉县",
              code: "640422"
            },
            {
              name: "隆德县",
              code: "640423"
            },
            {
              name: "泾源县",
              code: "640424"
            },
            {
              name: "彭阳县",
              code: "640425"
            }
          ]
        },
        {
          name: "中卫市",
          code: "640500",
          children: [
            {
              name: "市辖区",
              code: "640501"
            },
            {
              name: "沙坡头区",
              code: "640502"
            },
            {
              name: "中宁县",
              code: "640521"
            },
            {
              name: "海原县",
              code: "640522"
            }
          ]
        }
      ]
    },
    {
      name: "新疆维吾尔自治区",
      code: "650000",
      children: [
        {
          name: "乌鲁木齐市",
          code: "650100",
          children: [
            {
              name: "市辖区",
              code: "650101"
            },
            {
              name: "天山区",
              code: "650102"
            },
            {
              name: "沙依巴克区",
              code: "650103"
            },
            {
              name: "新市区",
              code: "650104"
            },
            {
              name: "水磨沟区",
              code: "650105"
            },
            {
              name: "头屯河区",
              code: "650106"
            },
            {
              name: "达坂城区",
              code: "650107"
            },
            {
              name: "米东区",
              code: "650109"
            },
            {
              name: "乌鲁木齐县",
              code: "650121"
            }
          ]
        },
        {
          name: "克拉玛依市",
          code: "650200",
          children: [
            {
              name: "市辖区",
              code: "650201"
            },
            {
              name: "独山子区",
              code: "650202"
            },
            {
              name: "克拉玛依区",
              code: "650203"
            },
            {
              name: "白碱滩区",
              code: "650204"
            },
            {
              name: "乌尔禾区",
              code: "650205"
            }
          ]
        },
        {
          name: "吐鲁番地区",
          code: "652100",
          children: [
            {
              name: "吐鲁番市",
              code: "652101"
            },
            {
              name: "鄯善县",
              code: "652122"
            },
            {
              name: "托克逊县",
              code: "652123"
            }
          ]
        },
        {
          name: "哈密地区",
          code: "652200",
          children: [
            {
              name: "哈密市",
              code: "652201"
            },
            {
              name: "巴里坤哈萨克自治县",
              code: "652222"
            },
            {
              name: "伊吾县",
              code: "652223"
            }
          ]
        },
        {
          name: "昌吉回族自治州",
          code: "652300",
          children: [
            {
              name: "昌吉市",
              code: "652301"
            },
            {
              name: "阜康市",
              code: "652302"
            },
            {
              name: "呼图壁县",
              code: "652323"
            },
            {
              name: "玛纳斯县",
              code: "652324"
            },
            {
              name: "奇台县",
              code: "652325"
            },
            {
              name: "吉木萨尔县",
              code: "652327"
            },
            {
              name: "木垒哈萨克自治县",
              code: "652328"
            }
          ]
        },
        {
          name: "博尔塔拉蒙古自治州",
          code: "652700",
          children: [
            {
              name: "博乐市",
              code: "652701"
            },
            {
              name: "阿拉山口市",
              code: "652702"
            },
            {
              name: "精河县",
              code: "652722"
            },
            {
              name: "温泉县",
              code: "652723"
            }
          ]
        },
        {
          name: "巴音郭楞蒙古自治州",
          code: "652800",
          children: [
            {
              name: "库尔勒市",
              code: "652801"
            },
            {
              name: "轮台县",
              code: "652822"
            },
            {
              name: "尉犁县",
              code: "652823"
            },
            {
              name: "若羌县",
              code: "652824"
            },
            {
              name: "且末县",
              code: "652825"
            },
            {
              name: "焉耆回族自治县",
              code: "652826"
            },
            {
              name: "和静县",
              code: "652827"
            },
            {
              name: "和硕县",
              code: "652828"
            },
            {
              name: "博湖县",
              code: "652829"
            }
          ]
        },
        {
          name: "阿克苏地区",
          code: "652900",
          children: [
            {
              name: "阿克苏市",
              code: "652901"
            },
            {
              name: "温宿县",
              code: "652922"
            },
            {
              name: "库车县",
              code: "652923"
            },
            {
              name: "沙雅县",
              code: "652924"
            },
            {
              name: "新和县",
              code: "652925"
            },
            {
              name: "拜城县",
              code: "652926"
            },
            {
              name: "乌什县",
              code: "652927"
            },
            {
              name: "阿瓦提县",
              code: "652928"
            },
            {
              name: "柯坪县",
              code: "652929"
            }
          ]
        },
        {
          name: "克孜勒苏柯尔克孜自治州",
          code: "653000",
          children: [
            {
              name: "阿图什市",
              code: "653001"
            },
            {
              name: "阿克陶县",
              code: "653022"
            },
            {
              name: "阿合奇县",
              code: "653023"
            },
            {
              name: "乌恰县",
              code: "653024"
            }
          ]
        },
        {
          name: "喀什地区",
          code: "653100",
          children: [
            {
              name: "喀什市",
              code: "653101"
            },
            {
              name: "疏附县",
              code: "653121"
            },
            {
              name: "疏勒县",
              code: "653122"
            },
            {
              name: "英吉沙县",
              code: "653123"
            },
            {
              name: "泽普县",
              code: "653124"
            },
            {
              name: "莎车县",
              code: "653125"
            },
            {
              name: "叶城县",
              code: "653126"
            },
            {
              name: "麦盖提县",
              code: "653127"
            },
            {
              name: "岳普湖县",
              code: "653128"
            },
            {
              name: "伽师县",
              code: "653129"
            },
            {
              name: "巴楚县",
              code: "653130"
            },
            {
              name: "塔什库尔干塔吉克自治县",
              code: "653131"
            }
          ]
        },
        {
          name: "和田地区",
          code: "653200",
          children: [
            {
              name: "和田市",
              code: "653201"
            },
            {
              name: "和田县",
              code: "653221"
            },
            {
              name: "墨玉县",
              code: "653222"
            },
            {
              name: "皮山县",
              code: "653223"
            },
            {
              name: "洛浦县",
              code: "653224"
            },
            {
              name: "策勒县",
              code: "653225"
            },
            {
              name: "于田县",
              code: "653226"
            },
            {
              name: "民丰县",
              code: "653227"
            }
          ]
        },
        {
          name: "伊犁哈萨克自治州",
          code: "654000",
          children: [
            {
              name: "伊宁市",
              code: "654002"
            },
            {
              name: "奎屯市",
              code: "654003"
            },
            {
              name: "伊宁县",
              code: "654021"
            },
            {
              name: "察布查尔锡伯自治县",
              code: "654022"
            },
            {
              name: "霍城县",
              code: "654023"
            },
            {
              name: "巩留县",
              code: "654024"
            },
            {
              name: "新源县",
              code: "654025"
            },
            {
              name: "昭苏县",
              code: "654026"
            },
            {
              name: "特克斯县",
              code: "654027"
            },
            {
              name: "尼勒克县",
              code: "654028"
            }
          ]
        },
        {
          name: "塔城地区",
          code: "654200",
          children: [
            {
              name: "塔城市",
              code: "654201"
            },
            {
              name: "乌苏市",
              code: "654202"
            },
            {
              name: "额敏县",
              code: "654221"
            },
            {
              name: "沙湾县",
              code: "654223"
            },
            {
              name: "托里县",
              code: "654224"
            },
            {
              name: "裕民县",
              code: "654225"
            },
            {
              name: "和布克赛尔蒙古自治县",
              code: "654226"
            }
          ]
        },
        {
          name: "阿勒泰地区",
          code: "654300",
          children: [
            {
              name: "阿勒泰市",
              code: "654301"
            },
            {
              name: "布尔津县",
              code: "654321"
            },
            {
              name: "富蕴县",
              code: "654322"
            },
            {
              name: "福海县",
              code: "654323"
            },
            {
              name: "哈巴河县",
              code: "654324"
            },
            {
              name: "青河县",
              code: "654325"
            },
            {
              name: "吉木乃县",
              code: "654326"
            }
          ]
        },
        {
          name: "自治区直辖县级行政区划",
          code: "659000",
          children: [
            {
              name: "石河子市",
              code: "659001"
            },
            {
              name: "阿拉尔市",
              code: "659002"
            },
            {
              name: "图木舒克市",
              code: "659003"
            },
            {
              name: "五家渠市",
              code: "659004"
            }
          ]
        }
      ]
    },
    {
      name: "台湾省",
      code: "710000",
      children: [
        {
          name: "台湾市",
          code: "710000",
          children: [
            {
              name: "台湾市",
              code: "710000"
            }
          ]
        }
      ]
    },
    {
      name: "香港特别行政区",
      code: "810000",
      children: [
        {
          name: "香港特别行政区",
          code: "810000",
          children: [
            {
              name: "香港特别行政区",
              code: "810000"
            }
          ]
        }
      ]
    },
    {
      name: "澳门特别行政区",
      code: "820000",
      children: [
        {
          name: "澳门特别行政区",
          code: "820000",
          children: [
            {
              name: "澳门特别行政区",
              code: "820000"
            }
          ]
        }
      ]
    }
  ];
  const _sfc_main$f = {
    name: "CityPicker",
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      defaultValue: {
        type: Object,
        default: () => ({
          province: {},
          city: {},
          district: {}
        })
      }
    },
    data() {
      return {
        provinces: cityData,
        cities: [],
        districts: [],
        currentTab: 0,
        selectedProvince: {},
        selectedCity: {},
        selectedDistrict: {}
      };
    },
    watch: {
      visible(newVal) {
        if (newVal) {
          this.initData();
        }
      },
      defaultValue: {
        handler(newVal) {
          if (newVal) {
            this.selectedProvince = newVal.province || {};
            this.selectedCity = newVal.city || {};
            this.selectedDistrict = newVal.district || {};
            this.loadCitiesAndDistricts();
          }
        },
        immediate: true,
        deep: true
      }
    },
    methods: {
      initData() {
        if (this.selectedProvince.code) {
          this.loadCities();
          if (this.selectedCity.code) {
            this.loadDistricts();
          }
        }
      },
      loadCitiesAndDistricts() {
        if (this.selectedProvince.code) {
          this.loadCities();
          if (this.selectedCity.code) {
            this.loadDistricts();
          }
        }
      },
      switchTab(tabIndex) {
        if (tabIndex === 1 && !this.selectedProvince.name)
          return;
        if (tabIndex === 2 && !this.selectedCity.name)
          return;
        this.currentTab = tabIndex;
      },
      selectProvince(province) {
        this.selectedProvince = province;
        this.selectedCity = {};
        this.selectedDistrict = {};
        this.loadCities();
        this.currentTab = 1;
      },
      selectCity(city) {
        this.selectedCity = city;
        this.selectedDistrict = {};
        this.loadDistricts();
        this.currentTab = 2;
      },
      selectDistrict(district) {
        this.selectedDistrict = district;
      },
      loadCities() {
        if (this.selectedProvince.children && this.selectedProvince.children.length > 0) {
          this.cities = this.selectedProvince.children;
        } else {
          this.cities = [];
        }
        this.districts = [];
      },
      loadDistricts() {
        if (this.selectedCity.children && this.selectedCity.children.length > 0) {
          this.districts = this.selectedCity.children;
        } else {
          this.districts = [];
        }
      },
      handleConfirm() {
        if (!this.selectedProvince.name) {
          uni.showToast({
            title: "请选择省份",
            icon: "none"
          });
          return;
        }
        if (!this.selectedCity.name) {
          uni.showToast({
            title: "请选择城市",
            icon: "none"
          });
          return;
        }
        if (!this.selectedDistrict.name) {
          uni.showToast({
            title: "请选择区县",
            icon: "none"
          });
          return;
        }
        const result = {
          province: this.selectedProvince,
          city: this.selectedCity,
          district: this.selectedDistrict,
          fullAddress: `${this.selectedProvince.name}${this.selectedCity.name}${this.selectedDistrict.name}`
        };
        this.$emit("confirm", result);
        this.handleClose();
      },
      handleClose() {
        this.$emit("close");
      },
      reset() {
        this.selectedProvince = {};
        this.selectedCity = {};
        this.selectedDistrict = {};
        this.cities = [];
        this.districts = [];
        this.currentTab = 0;
      }
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    return $props.visible ? (vue.openBlock(), vue.createElementBlock("view", {
      key: 0,
      class: "city-picker-overlay",
      onClick: _cache[6] || (_cache[6] = (...args) => $options.handleClose && $options.handleClose(...args))
    }, [
      vue.createElementVNode("view", {
        class: "city-picker-container",
        onClick: _cache[5] || (_cache[5] = vue.withModifiers(() => {
        }, ["stop"]))
      }, [
        vue.createCommentVNode(" 头部 "),
        vue.createElementVNode("view", { class: "picker-header" }, [
          vue.createElementVNode("text", {
            class: "header-btn cancel",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.handleClose && $options.handleClose(...args))
          }, "取消"),
          vue.createElementVNode("text", { class: "header-title" }, "选择地区"),
          vue.createElementVNode("text", {
            class: "header-btn confirm",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.handleConfirm && $options.handleConfirm(...args))
          }, "确定")
        ]),
        vue.createCommentVNode(" 选项卡 "),
        vue.createElementVNode("view", { class: "picker-tabs" }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["tab-item", { active: $data.currentTab === 0 }]),
              onClick: _cache[2] || (_cache[2] = ($event) => $options.switchTab(0))
            },
            [
              vue.createElementVNode(
                "text",
                { class: "tab-text" },
                vue.toDisplayString($data.selectedProvince.name || "请选择"),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          ),
          $data.selectedProvince.name ? (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 0,
              class: vue.normalizeClass(["tab-item", { active: $data.currentTab === 1, disabled: !$data.selectedProvince.name }]),
              onClick: _cache[3] || (_cache[3] = ($event) => $options.switchTab(1))
            },
            [
              vue.createElementVNode(
                "text",
                { class: "tab-text" },
                vue.toDisplayString($data.selectedCity.name || "请选择"),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          )) : vue.createCommentVNode("v-if", true),
          $data.selectedCity.name ? (vue.openBlock(), vue.createElementBlock(
            "view",
            {
              key: 1,
              class: vue.normalizeClass(["tab-item", { active: $data.currentTab === 2, disabled: !$data.selectedCity.name }]),
              onClick: _cache[4] || (_cache[4] = ($event) => $options.switchTab(2))
            },
            [
              vue.createElementVNode(
                "text",
                { class: "tab-text" },
                vue.toDisplayString($data.selectedDistrict.name || "请选择"),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 列表内容 "),
        vue.createElementVNode("view", { class: "picker-content" }, [
          vue.createCommentVNode(" 省份列表 "),
          $data.currentTab === 0 ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
            key: 0,
            class: "option-list",
            "scroll-y": "true"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.provinces, (province, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: vue.normalizeClass(["option-item", { selected: $data.selectedProvince.code === province.code }]),
                  key: province.code,
                  onClick: ($event) => $options.selectProvince(province)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "option-text" },
                    vue.toDisplayString(province.name),
                    1
                    /* TEXT */
                  ),
                  $data.selectedProvince.code === province.code ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "check-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 城市列表 "),
          $data.currentTab === 1 ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
            key: 1,
            class: "option-list",
            "scroll-y": "true"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.cities, (city, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: vue.normalizeClass(["option-item", { selected: $data.selectedCity.code === city.code }]),
                  key: city.code,
                  onClick: ($event) => $options.selectCity(city)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "option-text" },
                    vue.toDisplayString(city.name),
                    1
                    /* TEXT */
                  ),
                  $data.selectedCity.code === city.code ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "check-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 区县列表 "),
          $data.currentTab === 2 ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
            key: 2,
            class: "option-list",
            "scroll-y": "true"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.districts, (district, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: vue.normalizeClass(["option-item", { selected: $data.selectedDistrict.code === district.code }]),
                  key: district.code,
                  onClick: ($event) => $options.selectDistrict(district)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "option-text" },
                    vue.toDisplayString(district.name),
                    1
                    /* TEXT */
                  ),
                  $data.selectedDistrict.code === district.code ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "check-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ])
    ])) : vue.createCommentVNode("v-if", true);
  }
  const CityPicker = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$f], ["__scopeId", "data-v-94297b6b"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/components/CityPicker.vue"]]);
  const _sfc_main$e = {
    components: {
      SlideMenu,
      CustomTabBar,
      CityPicker
    },
    data() {
      return {
        slideMenuVisible: false,
        searchKeyword: "",
        selectedLocation: "全部地区",
        selectedType: "客户类型",
        cityPickerVisible: false,
        selectedLocationData: {
          province: {},
          city: {},
          district: {}
        },
        customerList: [
          {
            id: 1,
            name: "Z",
            phone: "17711111111",
            address: "北京市北京市东城区11111"
          },
          {
            id: 2,
            name: "赵",
            phone: "17711111112",
            address: "北京市北京市朝阳区22222"
          },
          {
            id: 3,
            name: "王明",
            phone: "17711111113",
            address: "上海市上海市浦东新区33333"
          },
          {
            id: 4,
            name: "李华",
            phone: "17711111114",
            address: "广东省广州市天河区44444"
          },
          {
            id: 5,
            name: "张三",
            phone: "17711111115",
            address: "江苏省南京市鼓楼区55555"
          },
          {
            id: 6,
            name: "刘强",
            phone: "17711111116",
            address: "浙江省杭州市西湖区66666"
          }
        ]
      };
    },
    computed: {
      filteredCustomers() {
        let filtered = this.customerList;
        if (this.searchKeyword) {
          filtered = filtered.filter(
            (customer) => customer.name.includes(this.searchKeyword) || customer.phone.includes(this.searchKeyword)
          );
        }
        if (this.selectedLocation !== "全部地区" && this.selectedLocationData.province.name) {
          filtered = filtered.filter((customer) => {
            const address = customer.address || "";
            if (this.selectedLocationData.province.name && !address.includes(this.selectedLocationData.province.name)) {
              return false;
            }
            if (this.selectedLocationData.city.name && !address.includes(this.selectedLocationData.city.name)) {
              return false;
            }
            if (this.selectedLocationData.district.name && !address.includes(this.selectedLocationData.district.name)) {
              return false;
            }
            return true;
          });
        }
        return filtered;
      }
    },
    methods: {
      viewCustomerDetail(customerId) {
        uni.navigateTo({
          url: `/pages/customer/detail?id=${customerId}`
        });
      },
      addCustomer() {
        uni.navigateTo({
          url: "/pages/customer/add"
        });
      },
      showLocationPicker() {
        this.cityPickerVisible = true;
      },
      onLocationConfirm(result) {
        this.selectedLocationData = result;
        this.selectedLocation = result.fullAddress;
        this.cityPickerVisible = false;
      },
      onLocationClose() {
        this.cityPickerVisible = false;
      },
      resetLocation() {
        this.selectedLocation = "全部地区";
        this.selectedLocationData = {
          province: {},
          city: {},
          district: {}
        };
      },
      showTypePicker() {
        uni.showActionSheet({
          itemList: ["全部类型", "VIP客户", "普通客户", "新客户"],
          success: (res) => {
            const types = ["全部类型", "VIP客户", "普通客户", "新客户"];
            this.selectedType = types[res.tapIndex];
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
    const _component_CityPicker = vue.resolveComponent("CityPicker");
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
          vue.createElementVNode("text", { class: "header-title" }, "客户列表")
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
      vue.createCommentVNode(" 筛选条件区域 "),
      vue.createElementVNode("view", { class: "filter-section" }, [
        vue.createElementVNode("view", { class: "filter-row" }, [
          vue.createElementVNode("view", {
            class: "filter-item",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.showLocationPicker && $options.showLocationPicker(...args))
          }, [
            vue.createElementVNode(
              "text",
              { class: "filter-text" },
              vue.toDisplayString($data.selectedLocation),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "filter-arrow" }, "▼")
          ]),
          vue.createElementVNode("view", {
            class: "filter-item",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.showTypePicker && $options.showTypePicker(...args))
          }, [
            vue.createElementVNode(
              "text",
              { class: "filter-text" },
              vue.toDisplayString($data.selectedType),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "filter-arrow" }, "▼")
          ]),
          $data.selectedLocation !== "全部地区" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "filter-reset",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.resetLocation && $options.resetLocation(...args))
          }, [
            vue.createElementVNode("text", { class: "reset-text" }, "重置")
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 搜索框 "),
        vue.createElementVNode("view", { class: "search-box" }, [
          vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "search-input",
              placeholder: "客户姓名或电话",
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.searchKeyword = $event)
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.searchKeyword]
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
              vue.createElementVNode("view", { class: "customer-content" }, [
                vue.createElementVNode(
                  "view",
                  { class: "customer-name" },
                  vue.toDisplayString(customer.name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "view",
                  { class: "customer-address" },
                  "地址：" + vue.toDisplayString(customer.address),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode(
                "view",
                { class: "customer-phone" },
                vue.toDisplayString(customer.phone),
                1
                /* TEXT */
              )
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
      vue.createVNode(_component_CustomTabBar),
      vue.createCommentVNode(" 城市选择器 "),
      vue.createVNode(_component_CityPicker, {
        visible: $data.cityPickerVisible,
        defaultValue: $data.selectedLocationData,
        onConfirm: $options.onLocationConfirm,
        onClose: $options.onLocationClose
      }, null, 8, ["visible", "defaultValue", "onConfirm", "onClose"])
    ]);
  }
  const PagesCustomerCustomer = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$e], ["__scopeId", "data-v-02222c4a"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/customer/customer.vue"]]);
  const _sfc_main$d = {
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
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesProfileProfile = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$d], ["__scopeId", "data-v-dd383ca2"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/profile/profile.vue"]]);
  const _sfc_main$c = {
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
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesStatisticsStatistics = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$c], ["__scopeId", "data-v-fc23ec97"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/statistics/statistics.vue"]]);
  const _sfc_main$b = {
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
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesSearchSearch = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$b], ["__scopeId", "data-v-c10c040c"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/search/search.vue"]]);
  const _sfc_main$a = {
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
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesOrderDetail = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$a], ["__scopeId", "data-v-6b23c96c"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/order/detail.vue"]]);
  const _sfc_main$9 = {
    data() {
      return {
        orderForm: {
          customerName: "",
          customerPhone: "",
          address: "",
          selectedColor: "",
          products: [],
          paymentStatus: "未支付",
          logisticsInfo: "无快递单号",
          remark: "",
          shippingFee: "0.00",
          discount: "0.00"
        },
        showModal: false,
        modalTitle: "",
        modalOptions: [],
        currentModalType: "",
        touchStartX: 0,
        touchStartY: 0,
        isMoving: false
      };
    },
    computed: {
      totalProducts() {
        return this.orderForm.products.length;
      },
      totalQuantity() {
        return this.orderForm.products.reduce((sum, product) => sum + product.quantity, 0);
      },
      totalAmount() {
        const productTotal = this.orderForm.products.reduce((sum, product) => {
          return sum + product.price * product.quantity;
        }, 0);
        const shipping = parseFloat(this.orderForm.shippingFee) || 0;
        const discount = parseFloat(this.orderForm.discount) || 0;
        return (productTotal + shipping - discount).toFixed(2);
      },
      currentTime() {
        const now = /* @__PURE__ */ new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      }
    },
    onLoad() {
      this.initOrderForm();
    },
    onShow() {
      this.checkSelectedProduct();
    },
    methods: {
      initOrderForm() {
        formatAppLog("log", "at pages/order/add.vue:241", "初始化新订单表单");
      },
      goBack() {
        uni.showModal({
          title: "提示",
          content: "确定要放弃当前编辑的订单吗？",
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack();
            }
          }
        });
      },
      async saveOrder() {
        if (!this.validateForm()) {
          return;
        }
        uni.showLoading({
          title: "保存中..."
        });
        try {
          setTimeout(() => {
            uni.hideLoading();
            uni.showToast({
              title: "订单保存成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          }, 1e3);
        } catch (error) {
          uni.hideLoading();
          uni.showToast({
            title: "保存失败",
            icon: "none"
          });
        }
      },
      validateForm() {
        if (!this.orderForm.customerName.trim()) {
          uni.showToast({
            title: "请输入客户姓名",
            icon: "none"
          });
          return false;
        }
        if (!this.orderForm.customerPhone.trim()) {
          uni.showToast({
            title: "请输入联系电话",
            icon: "none"
          });
          return false;
        }
        return true;
      },
      validateCustomerName() {
      },
      validatePhone() {
      },
      selectCustomer() {
        uni.navigateTo({
          url: "/pages/customer/customer-select?from=order"
        });
      },
      addProduct() {
        uni.navigateTo({
          url: "/pages/product/product-category?from=order"
        });
      },
      selectPaymentMethod() {
        this.modalTitle = "支付方式";
        this.modalOptions = [
          { label: "未支付", value: "unpaid" },
          { label: "已支付", value: "paid" },
          { label: "部分支付", value: "partial" }
        ];
        this.currentModalType = "payment";
        this.showModal = true;
      },
      selectLogistics() {
        this.modalTitle = "物流信息";
        this.modalOptions = [
          { label: "无快递单号", value: "none" },
          { label: "顺丰快递", value: "sf" },
          { label: "圆通快递", value: "yt" },
          { label: "中通快递", value: "zt" }
        ];
        this.currentModalType = "logistics";
        this.showModal = true;
      },
      selectColor() {
        this.modalTitle = "选择颜色";
        this.modalOptions = [
          { label: "默认", value: "default" },
          { label: "红色", value: "red" },
          { label: "粉色", value: "pink" },
          { label: "橙色", value: "orange" },
          { label: "黄色", value: "yellow" },
          { label: "绿色", value: "green" },
          { label: "蓝色", value: "blue" }
        ];
        this.currentModalType = "color";
        this.showModal = true;
      },
      selectOption(option) {
        this.selectedOption = option;
      },
      confirmSelection() {
        if (!this.selectedOption) {
          this.closeModal();
          return;
        }
        switch (this.currentModalType) {
          case "address":
            this.orderForm.address = this.selectedOption.label;
            break;
          case "payment":
            this.orderForm.paymentStatus = this.selectedOption.label;
            break;
          case "logistics":
            this.orderForm.logisticsInfo = this.selectedOption.label;
            break;
          case "color":
            this.orderForm.selectedColor = this.selectedOption.label;
            break;
        }
        this.closeModal();
      },
      closeModal() {
        this.showModal = false;
        this.selectedOption = null;
        this.currentModalType = "";
      },
      // 触摸事件处理（用于滑动删除商品）
      onTouchStart(event, index) {
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
        this.isMoving = false;
      },
      onTouchMove(event, index) {
        if (!this.isMoving) {
          const deltaX = Math.abs(event.touches[0].clientX - this.touchStartX);
          const deltaY = Math.abs(event.touches[0].clientY - this.touchStartY);
          if (deltaX > deltaY && deltaX > 10) {
            this.isMoving = true;
          }
        }
      },
      onTouchEnd(event, index) {
        if (this.isMoving) {
          const deltaX = event.changedTouches[0].clientX - this.touchStartX;
          if (deltaX < -50) {
            uni.showModal({
              title: "确认删除",
              content: "确定要移除这个商品吗？",
              success: (res) => {
                if (res.confirm) {
                  this.orderForm.products.splice(index, 1);
                }
              }
            });
          }
        }
        this.isMoving = false;
      },
      getColorClass(colorName) {
        const colorMap = {
          "默认": "color-default",
          "红色": "color-red",
          "粉色": "color-pink",
          "橙色": "color-orange",
          "黄色": "color-yellow",
          "绿色": "color-green",
          "蓝色": "color-blue"
        };
        return colorMap[colorName] || "color-default";
      },
      checkSelectedProduct() {
        const selectedProduct = uni.getStorageSync("selected_product");
        if (selectedProduct) {
          const existingIndex = this.orderForm.products.findIndex((p) => p.id === selectedProduct.id);
          if (existingIndex >= 0) {
            this.orderForm.products[existingIndex].quantity += 1;
            uni.showToast({
              title: "商品数量+1",
              icon: "success"
            });
          } else {
            this.orderForm.products.push(selectedProduct);
            uni.showToast({
              title: "商品添加成功",
              icon: "success"
            });
          }
          uni.removeStorageSync("selected_product");
        }
      }
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "order-add-container" }, [
      vue.createCommentVNode(" 头部导航 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "header-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "×")
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("text", { class: "header-title" }, "新订单")
        ]),
        vue.createElementVNode("view", {
          class: "header-right",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.saveOrder && $options.saveOrder(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "✓")
        ])
      ]),
      vue.createCommentVNode(" 主要内容区域 "),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createCommentVNode(" 客户信息表单 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "客户姓名："),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.orderForm.customerName = $event),
                placeholder: "请输入客户姓名",
                onBlur: _cache[3] || (_cache[3] = (...args) => $options.validateCustomerName && $options.validateCustomerName(...args))
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $data.orderForm.customerName]
            ]),
            vue.createElementVNode("text", {
              class: "customer-select-icon",
              onClick: _cache[4] || (_cache[4] = (...args) => $options.selectCustomer && $options.selectCustomer(...args))
            }, "📋")
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "联系电话："),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.orderForm.customerPhone = $event),
                placeholder: "请输入联系电话",
                type: "number",
                onBlur: _cache[6] || (_cache[6] = (...args) => $options.validatePhone && $options.validatePhone(...args)),
                disabled: ""
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $data.orderForm.customerPhone]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "省市区："),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.orderForm.address = $event),
                placeholder: "请选择省市区",
                disabled: ""
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.orderForm.address]
            ])
          ]),
          vue.createElementVNode("view", {
            class: "form-item color-item",
            onClick: _cache[8] || (_cache[8] = (...args) => $options.selectColor && $options.selectColor(...args))
          }, [
            vue.createElementVNode("text", { class: "form-label" }, "颜色："),
            vue.createElementVNode("view", { class: "color-value" }, [
              vue.createElementVNode("view", { class: "color-display" }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["color-dot", $options.getColorClass($data.orderForm.selectedColor)])
                  },
                  null,
                  2
                  /* CLASS */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "color-text" },
                  vue.toDisplayString($data.orderForm.selectedColor || "默认"),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "arrow-icon" }, ">")
            ])
          ])
        ]),
        vue.createCommentVNode(" 商品选择提示 "),
        vue.createElementVNode("view", { class: "product-hint" }, [
          vue.createElementVNode("text", { class: "hint-text" }, "向左滑动移除商品")
        ]),
        vue.createCommentVNode(" 添加商品按钮 "),
        vue.createElementVNode("view", {
          class: "add-product-btn",
          onClick: _cache[9] || (_cache[9] = (...args) => $options.addProduct && $options.addProduct(...args))
        }, [
          vue.createElementVNode("text", { class: "add-product-text" }, "添加商品")
        ]),
        vue.createCommentVNode(" 商品列表 "),
        $data.orderForm.products.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "product-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.orderForm.products, (product, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "product-item",
                key: index,
                onTouchstart: ($event) => $options.onTouchStart($event, index),
                onTouchmove: ($event) => $options.onTouchMove($event, index),
                onTouchend: ($event) => $options.onTouchEnd($event, index)
              }, [
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
                    { class: "product-spec" },
                    vue.toDisplayString(product.spec),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "product-price-qty" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "product-price" },
                      "¥" + vue.toDisplayString(product.price),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "product-qty" },
                      "x" + vue.toDisplayString(product.quantity),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "product-total" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "product-total-price" },
                    "¥" + vue.toDisplayString((product.price * product.quantity).toFixed(2)),
                    1
                    /* TEXT */
                  )
                ])
              ], 40, ["onTouchstart", "onTouchmove", "onTouchend"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 支付信息 "),
        vue.createElementVNode("view", { class: "info-section" }, [
          vue.createElementVNode("view", {
            class: "info-item",
            onClick: _cache[10] || (_cache[10] = (...args) => $options.selectPaymentMethod && $options.selectPaymentMethod(...args))
          }, [
            vue.createElementVNode("text", { class: "info-label" }, "支付信息："),
            vue.createElementVNode(
              "text",
              { class: "info-value" },
              vue.toDisplayString($data.orderForm.paymentStatus),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "arrow-icon" }, ">")
          ])
        ]),
        vue.createCommentVNode(" 物流信息 "),
        vue.createElementVNode("view", { class: "info-section" }, [
          vue.createElementVNode("view", {
            class: "info-item",
            onClick: _cache[11] || (_cache[11] = (...args) => $options.selectLogistics && $options.selectLogistics(...args))
          }, [
            vue.createElementVNode("text", { class: "info-label" }, "物流信息："),
            vue.createElementVNode(
              "text",
              { class: "info-value" },
              vue.toDisplayString($data.orderForm.logisticsInfo),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "arrow-icon" }, ">")
          ])
        ]),
        vue.createCommentVNode(" 备注 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("view", { class: "form-item remark-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "备注："),
            vue.createElementVNode(
              "text",
              { class: "remark-placeholder" },
              vue.toDisplayString($data.orderForm.remark || "无"),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createCommentVNode(" 底部订单汇总 "),
      vue.createElementVNode("view", { class: "footer" }, [
        vue.createElementVNode("view", { class: "order-summary" }, [
          vue.createElementVNode("view", { class: "summary-row" }, [
            vue.createElementVNode(
              "text",
              { class: "summary-label" },
              "共 " + vue.toDisplayString($options.totalProducts) + "种商品，" + vue.toDisplayString($options.totalQuantity) + "件商品",
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "summary-time" },
              vue.toDisplayString($options.currentTime),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "summary-row" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "+ 运费："),
            vue.createElementVNode(
              "text",
              { class: "summary-value" },
              vue.toDisplayString($data.orderForm.shippingFee),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "summary-row" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "- 优惠："),
            vue.createElementVNode(
              "text",
              { class: "summary-value" },
              vue.toDisplayString($data.orderForm.discount),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "summary-row total-row" }, [
            vue.createElementVNode("text", { class: "summary-label" }, "成交价："),
            vue.createElementVNode(
              "text",
              { class: "summary-total" },
              vue.toDisplayString($options.totalAmount),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "lock-icon" }, "🔒")
          ])
        ])
      ]),
      vue.createCommentVNode(" 选择弹窗 "),
      $data.showModal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "modal-overlay",
        onClick: _cache[15] || (_cache[15] = (...args) => $options.closeModal && $options.closeModal(...args))
      }, [
        vue.createElementVNode("view", {
          class: "modal-content",
          onClick: _cache[14] || (_cache[14] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode(
              "text",
              { class: "modal-title" },
              vue.toDisplayString($data.modalTitle),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.modalOptions, (option, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "modal-option",
                  key: index,
                  onClick: ($event) => $options.selectOption(option)
                }, [
                  vue.createElementVNode("view", { class: "option-content" }, [
                    $data.currentModalType === "color" ? (vue.openBlock(), vue.createElementBlock(
                      "view",
                      {
                        key: 0,
                        class: vue.normalizeClass(["option-color-dot", $options.getColorClass(option.label)])
                      },
                      null,
                      2
                      /* CLASS */
                    )) : vue.createCommentVNode("v-if", true),
                    vue.createElementVNode(
                      "text",
                      { class: "option-text" },
                      vue.toDisplayString(option.label),
                      1
                      /* TEXT */
                    )
                  ])
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode("text", {
              class: "modal-btn cancel",
              onClick: _cache[12] || (_cache[12] = (...args) => $options.closeModal && $options.closeModal(...args))
            }, "取消"),
            vue.createElementVNode("text", {
              class: "modal-btn confirm",
              onClick: _cache[13] || (_cache[13] = (...args) => $options.confirmSelection && $options.confirmSelection(...args))
            }, "完成")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesOrderAdd = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$9], ["__scopeId", "data-v-b824ccab"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/order/add.vue"]]);
  const _sfc_main$8 = {
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
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesProductDetail = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$8], ["__scopeId", "data-v-acf502d9"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/product/detail.vue"]]);
  const _sfc_main$7 = {
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
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesProductAdd = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$7], ["__scopeId", "data-v-53c69cd1"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/product/add.vue"]]);
  const _sfc_main$6 = {
    data() {
      return {
        leftSideActive: 0,
        cateA: "",
        categoryAll: [],
        categoryBCur: [],
        categoryChooseBean: {
          id: null,
          offline_id: this.getOfflineId()
        },
        fromPage: ""
        // 来源页面标识
      };
    },
    onLoad(options) {
      if (options.from) {
        this.fromPage = options.from;
      }
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
          const response = await apiService.getUserCategory(this.categoryChooseBean);
          if (response.code === 1) {
            const arr = response.data;
            if (arr && arr.length > 0) {
              this.processCategoryData(arr);
            } else {
              this.showSetCategoryDialog();
            }
          } else if (response.code === 207) {
            CommonUtils.showError(response.message || "登录状态失效");
            this.gotoLogin();
          } else {
            this.showSetCategoryDialog();
          }
        } catch (error) {
          formatAppLog("error", "at pages/product/product-category.vue:153", "获取分类数据失败:", error);
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
        formatAppLog("log", "at pages/product/product-category.vue:240", "跳转到商品列表:", item, subItem, cateA, category_id);
        uni.navigateTo({
          url: `/pages/product-list/product-list?cate1=${cateA}&cate2=${item}&cate3=${subItem}&category_id=${category_id}&mode=select&from=${this.fromPage}`
        });
      },
      // 返回上一页
      goBack() {
        uni.navigateBack();
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "product-category-container" }, [
      vue.createCommentVNode(" 头部导航 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "header-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "×")
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("text", { class: "header-title" }, "选择商品")
        ]),
        vue.createElementVNode("view", { class: "header-right" }, [
          vue.createCommentVNode(" 可以添加搜索或其他功能 ")
        ])
      ]),
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
      ])
    ]);
  }
  const PagesProductProductCategory = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$6], ["__scopeId", "data-v-eae17a56"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/product/product-category.vue"]]);
  const _sfc_main$5 = {
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
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesCustomerDetail = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$5], ["__scopeId", "data-v-25465ad7"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/customer/detail.vue"]]);
  const _sfc_main$4 = {
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
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesSettingCategorySettingCategory = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$4], ["__scopeId", "data-v-4c694f6e"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/setting-category/setting-category.vue"]]);
  const _sfc_main$3 = {
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
        loadingMore: false,
        mode: "",
        // 页面模式：select表示选择模式
        fromPage: ""
        // 来源页面
      };
    },
    onLoad(options) {
      this.cate1 = options.cate1 || "";
      this.cate2 = options.cate2 || "";
      this.cate3 = options.cate3 || "";
      this.category_id = options.category_id || "";
      this.mode = options.mode || "";
      this.fromPage = options.from || "";
      this.pageTitle = this.cate3 || this.cate2 || "商品列表";
      if (this.mode === "select") {
        this.pageTitle = "选择商品";
      }
    },
    onShow() {
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
      handleCardClick(item) {
        if (this.mode === "select") {
          this.selectProduct(item);
        } else {
          this.gotoDetail(item);
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
      selectProduct(item) {
        uni.showModal({
          title: "添加商品",
          content: `确定要添加"${item.show_name || item.name}"到订单中吗？`,
          success: (res) => {
            if (res.confirm) {
              const productData = {
                id: item.id || item.uuid || "",
                name: item.show_name || item.name || "",
                spec: item.specification || item.model || "",
                price: item.price || "0.00",
                quantity: 1,
                brand: item.brand || "",
                unit: item.unit || "",
                color: item.color || "",
                barCode: item.bar_code || "",
                image: this.getCover(item)
              };
              uni.setStorageSync("selected_product", productData);
              if (this.fromPage === "order") {
                uni.navigateBack({
                  delta: 2
                  // 返回两层，跳过product-category页面
                });
              } else {
                uni.navigateBack();
              }
            }
          }
        });
      },
      addProduct() {
        uni.navigateTo({
          url: `/pages/product/add?cate1=${this.cate1}&cate2=${this.cate2}&cate3=${this.cate3}&category_id=${this.category_id}`
        });
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
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
                onClick: ($event) => $options.handleCardClick(item)
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
                ]),
                vue.createCommentVNode(" 选择模式下显示添加按钮 "),
                $data.mode === "select" ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "add-btn",
                  onClick: vue.withModifiers(($event) => $options.selectProduct(item), ["stop"])
                }, [
                  vue.createElementVNode("text", { class: "add-btn-text" }, "添加")
                ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
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
      vue.createCommentVNode(" 悬浮添加按钮 (非选择模式时显示) "),
      $data.mode !== "select" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "fab-button",
        onClick: _cache[6] || (_cache[6] = (...args) => $options.addProduct && $options.addProduct(...args))
      }, [
        vue.createElementVNode("text", { class: "fab-icon" }, "+")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesProductListProductList = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$3], ["__scopeId", "data-v-4317cb7a"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/product-list/product-list.vue"]]);
  const _sfc_main$2 = {
    data() {
      return {
        searchKeyword: "",
        customerList: [
          {
            id: "uuid1",
            name: "张三",
            phone: "13812345678",
            address: "北京市北京市朝阳区",
            detailAddress: "朝阳区建国门外大街1号",
            description: "VIP客户，购买力强",
            level: "vip",
            levelText: "VIP客户",
            isVip: true,
            orderCount: 15,
            totalAmount: "25680.00",
            regTime: 16725312e5,
            sex: 1,
            age: 35,
            area: "110105",
            pay: 1,
            offlineId: "default",
            accountId: "1"
          },
          {
            id: "uuid2",
            name: "李四",
            phone: "13923456789",
            address: "上海市上海市浦东新区",
            detailAddress: "浦东新区陆家嘴金融中心",
            description: "普通客户",
            level: "regular",
            levelText: "个人买家",
            isVip: false,
            orderCount: 8,
            totalAmount: "12450.00",
            regTime: 16725312e5,
            sex: 2,
            age: 28,
            area: "310115",
            pay: 2,
            offlineId: "default",
            accountId: "1"
          },
          {
            id: "uuid3",
            name: "王五",
            phone: "13734567890",
            address: "广东省广州市天河区",
            detailAddress: "天河区珠江新城",
            description: "VIP客户，长期合作",
            level: "vip",
            levelText: "VIP客户",
            isVip: true,
            orderCount: 22,
            totalAmount: "38920.00",
            regTime: 16725312e5,
            sex: 1,
            age: 42,
            area: "440106",
            pay: 1,
            offlineId: "default",
            accountId: "1"
          }
        ]
      };
    },
    computed: {
      filteredCustomers() {
        if (!this.searchKeyword.trim()) {
          return this.customerList;
        }
        const keyword = this.searchKeyword.toLowerCase();
        return this.customerList.filter((customer) => {
          return customer.name.toLowerCase().includes(keyword) || customer.phone.includes(keyword);
        });
      }
    },
    onLoad(options) {
      this.fromPage = options.from || "order";
    },
    onShow() {
      this.loadCustomerData();
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      addNewCustomer() {
        uni.navigateTo({
          url: "/pages/customer/add"
        });
      },
      selectCustomer(customer) {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage) {
          prevPage.$vm.orderForm.customerName = customer.name;
          prevPage.$vm.orderForm.customerPhone = customer.phone;
          prevPage.$vm.orderForm.address = customer.address || "";
          if (prevPage.$vm.orderForm.customerInfo !== void 0) {
            prevPage.$vm.orderForm.customerInfo = {
              uuid: customer.id,
              name: customer.name,
              tel: customer.phone,
              pre_addr: customer.address,
              addr: customer.detailAddress,
              type: customer.level,
              sex: customer.sex,
              age: customer.age,
              area: customer.area,
              pay: customer.pay,
              offline_id: customer.offlineId
            };
          }
          uni.showToast({
            title: "客户信息已填入",
            icon: "success"
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1e3);
        }
      },
      onSearchInput() {
      },
      clearSearch() {
        this.searchKeyword = "";
      },
      async loadCustomerData() {
        try {
          uni.showLoading({
            title: "加载中..."
          });
          const userInfo = uni.getStorageSync("userInfo");
          const offlineId = userInfo ? userInfo.offline_id : "default";
          const response = await apiService.getCustomerList({
            offline_id: offlineId
          });
          uni.hideLoading();
          if (response && response.code === 1 && response.data) {
            let customers = [];
            response.data.forEach((group) => {
              if (group.detail && Array.isArray(group.detail)) {
                group.detail.forEach((customer) => {
                  customers.push({
                    id: customer.uuid,
                    name: customer.name,
                    phone: customer.tel,
                    address: customer.pre_addr,
                    detailAddress: customer.addr,
                    description: customer.description,
                    level: this.getCustomerLevel(customer.type),
                    levelText: this.getCustomerLevelText(customer.type),
                    isVip: customer.type === 2,
                    orderCount: customer.buycount || 0,
                    totalAmount: (customer.buymoney || 0).toFixed(2),
                    regTime: customer.reg_time,
                    sex: customer.sex,
                    age: customer.age,
                    area: customer.area,
                    pay: customer.pay,
                    offlineId: customer.offline_id,
                    accountId: customer.account_id
                  });
                });
              }
            });
            this.customerList = customers;
            formatAppLog("log", "at pages/customer/customer-select.vue:276", "客户列表加载成功，共", customers.length, "条数据");
          } else {
            this.customerList = [];
            formatAppLog("log", "at pages/customer/customer-select.vue:280", "API获取客户失败或无数据");
            if (response && response.message) {
              uni.showToast({
                title: response.message,
                icon: "none"
              });
            }
          }
        } catch (error) {
          uni.hideLoading();
          formatAppLog("error", "at pages/customer/customer-select.vue:290", "加载客户数据失败:", error);
          uni.showToast({
            title: "加载客户数据失败",
            icon: "none"
          });
        }
      },
      getCustomerLevel(type) {
        const levelMap = {
          1: "regular",
          2: "vip",
          3: "agent",
          4: "wholesaler"
        };
        return levelMap[type] || "regular";
      },
      getCustomerLevelText(type) {
        const levelTextMap = {
          1: "个人买家",
          2: "VIP客户",
          3: "代理商",
          4: "批发商"
        };
        return levelTextMap[type] || "普通客户";
      },
      formatAmount(amount) {
        if (!amount)
          return "0.00";
        const num = parseFloat(amount);
        return num.toLocaleString("zh-CN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "customer-select-container" }, [
      vue.createCommentVNode(" 头部导航 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "header-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "×")
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("text", { class: "header-title" }, "选择客户")
        ]),
        vue.createElementVNode("view", {
          class: "header-right",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.addNewCustomer && $options.addNewCustomer(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "+")
        ])
      ]),
      vue.createCommentVNode(" 搜索栏 "),
      vue.createElementVNode("view", { class: "search-section" }, [
        vue.createElementVNode("view", { class: "search-box" }, [
          vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "search-input",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.searchKeyword = $event),
              placeholder: "搜索客户姓名或电话",
              onInput: _cache[3] || (_cache[3] = (...args) => $options.onSearchInput && $options.onSearchInput(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.searchKeyword]
          ]),
          $data.searchKeyword ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 0,
            class: "search-clear",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.clearSearch && $options.clearSearch(...args))
          }, "×")) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      vue.createCommentVNode(" 客户列表 "),
      $options.filteredCustomers.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "customer-list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($options.filteredCustomers, (customer, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "customer-item",
              key: customer.id,
              onClick: ($event) => $options.selectCustomer(customer)
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
                  customer.address ? (vue.openBlock(), vue.createElementBlock(
                    "text",
                    {
                      key: 0,
                      class: "customer-location"
                    },
                    vue.toDisplayString(customer.address),
                    1
                    /* TEXT */
                  )) : vue.createCommentVNode("v-if", true)
                ]),
                vue.createElementVNode("view", { class: "customer-stats" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "stat-item" },
                    vue.toDisplayString(customer.orderCount) + "个订单",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "stat-item" },
                    "消费¥" + vue.toDisplayString($options.formatAmount(customer.totalAmount)),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "select-indicator" }, [
                vue.createElementVNode("text", { class: "arrow-icon" }, ">")
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 空状态 "),
      $options.filteredCustomers.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "empty-state"
      }, [
        vue.createElementVNode("text", { class: "empty-icon" }, "👥"),
        $data.searchKeyword ? (vue.openBlock(), vue.createElementBlock("text", {
          key: 0,
          class: "empty-text"
        }, "未找到相关客户")) : (vue.openBlock(), vue.createElementBlock("text", {
          key: 1,
          class: "empty-text"
        }, "暂无客户数据")),
        vue.createElementVNode("text", { class: "empty-tip" }, "点击右上角添加新客户"),
        vue.createElementVNode("view", {
          class: "add-customer-btn",
          onClick: _cache[5] || (_cache[5] = (...args) => $options.addNewCustomer && $options.addNewCustomer(...args))
        }, [
          vue.createElementVNode("text", { class: "add-customer-text" }, "添加客户")
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesCustomerCustomerSelect = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2], ["__scopeId", "data-v-9e46147c"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/customer/customer-select.vue"]]);
  const _sfc_main$1 = {
    components: {
      CityPicker
    },
    data() {
      return {
        customerForm: {
          name: "",
          phone: "",
          region: "",
          regionCode: "",
          detailAddress: "",
          customerType: "个人买家",
          customerTypeCode: "1",
          gender: "",
          genderCode: "",
          age: "",
          paymentMethod: "",
          paymentMethodCode: "",
          description: "",
          offlineId: ""
        },
        showModal: false,
        showAddressModal: false,
        showDescriptionModal: false,
        showCityPicker: false,
        modalTitle: "",
        modalOptions: [],
        currentModalType: "",
        selectedOption: null,
        tempAddress: "",
        tempDescription: "",
        cityPickerValue: {
          province: {},
          city: {},
          district: {}
        }
      };
    },
    methods: {
      goBack() {
        if (this.hasChanges()) {
          uni.showModal({
            title: "提示",
            content: "确定要放弃当前编辑的客户信息吗？",
            success: (res) => {
              if (res.confirm) {
                uni.navigateBack();
              }
            }
          });
        } else {
          uni.navigateBack();
        }
      },
      hasChanges() {
        return this.customerForm.name || this.customerForm.phone || this.customerForm.region || this.customerForm.detailAddress || this.customerForm.gender || this.customerForm.age || this.customerForm.paymentMethod || this.customerForm.description;
      },
      async saveCustomer() {
        if (!this.validateForm()) {
          return;
        }
        uni.showLoading({
          title: "保存中..."
        });
        try {
          const offlineId = "customer_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          const apiParams = {
            name: this.customerForm.name,
            tel: this.customerForm.phone,
            area: this.customerForm.regionCode || "110000",
            addr: this.customerForm.detailAddress || "",
            offline_id: offlineId,
            type: this.customerForm.customerTypeCode || "1",
            sex: this.customerForm.genderCode || "0",
            age: this.customerForm.age || "",
            pay: this.customerForm.paymentMethodCode || "",
            description: this.customerForm.description || "",
            pre_addr: this.customerForm.region || ""
          };
          formatAppLog("log", "at pages/customer/add.vue:284", "API参数:", apiParams);
          const response = await apiService.addCustomer(apiParams);
          uni.hideLoading();
          if (response && response.code === 1) {
            uni.showToast({
              title: "客户添加成功",
              icon: "success"
            });
            const pages = getCurrentPages();
            if (pages.length >= 3) {
              const customerSelectPage = pages[pages.length - 2];
              const orderPage = pages[pages.length - 3];
              if (orderPage && orderPage.route.includes("order/add")) {
                orderPage.$vm.orderForm.customerName = this.customerForm.name;
                orderPage.$vm.orderForm.customerPhone = this.customerForm.phone;
                orderPage.$vm.orderForm.address = this.customerForm.region || "";
              }
            }
            setTimeout(() => {
              uni.navigateBack({ delta: 1 });
            }, 1500);
          } else {
            uni.showToast({
              title: response.message || "添加客户失败",
              icon: "none"
            });
          }
        } catch (error) {
          uni.hideLoading();
          uni.showToast({
            title: "保存失败",
            icon: "none"
          });
          formatAppLog("error", "at pages/customer/add.vue:326", "保存客户失败:", error);
        }
      },
      validateForm() {
        if (!this.customerForm.name.trim()) {
          uni.showToast({
            title: "请输入客户姓名",
            icon: "none"
          });
          return false;
        }
        if (!this.customerForm.phone.trim()) {
          uni.showToast({
            title: "请输入联系电话",
            icon: "none"
          });
          return false;
        }
        if (!/^1[3-9]\d{9}$/.test(this.customerForm.phone)) {
          uni.showToast({
            title: "请输入正确的手机号码",
            icon: "none"
          });
          return false;
        }
        if (!this.customerForm.region.trim()) {
          uni.showToast({
            title: "请选择所在地区",
            icon: "none"
          });
          return false;
        }
        return true;
      },
      validateName() {
        if (this.customerForm.name.trim().length < 2) {
          uni.showToast({
            title: "姓名至少2个字符",
            icon: "none"
          });
        }
      },
      validatePhone() {
        if (this.customerForm.phone && !/^1[3-9]\d{9}$/.test(this.customerForm.phone)) {
          uni.showToast({
            title: "请输入正确的手机号码",
            icon: "none"
          });
        }
      },
      selectRegion() {
        this.showCityPicker = true;
      },
      selectCustomerType() {
        this.modalTitle = "客户类型";
        this.modalOptions = [
          { label: "个人买家", value: "1" },
          { label: "企业客户", value: "2" },
          { label: "代理商", value: "3" },
          { label: "批发商", value: "4" }
        ];
        this.currentModalType = "customerType";
        this.showModal = true;
      },
      selectGender() {
        this.modalTitle = "性别";
        this.modalOptions = [
          { label: "男", value: "1" },
          { label: "女", value: "2" },
          { label: "不愿透露", value: "0" }
        ];
        this.currentModalType = "gender";
        this.showModal = true;
      },
      selectPaymentMethod() {
        this.modalTitle = "首选支付方式";
        this.modalOptions = [
          { label: "微信支付", value: "1" },
          { label: "支付宝", value: "2" },
          { label: "现金", value: "3" },
          { label: "银行转账", value: "4" },
          { label: "货到付款", value: "5" }
        ];
        this.currentModalType = "paymentMethod";
        this.showModal = true;
      },
      selectOption(option) {
        this.selectedOption = option;
      },
      confirmSelection() {
        if (!this.selectedOption) {
          this.closeModal();
          return;
        }
        switch (this.currentModalType) {
          case "customerType":
            this.customerForm.customerType = this.selectedOption.label;
            this.customerForm.customerTypeCode = this.selectedOption.value;
            break;
          case "gender":
            this.customerForm.gender = this.selectedOption.label;
            this.customerForm.genderCode = this.selectedOption.value;
            break;
          case "paymentMethod":
            this.customerForm.paymentMethod = this.selectedOption.label;
            this.customerForm.paymentMethodCode = this.selectedOption.value;
            break;
        }
        this.closeModal();
      },
      closeModal() {
        this.showModal = false;
        this.selectedOption = null;
        this.currentModalType = "";
      },
      editDetailAddress() {
        this.tempAddress = this.customerForm.detailAddress;
        this.showAddressModal = true;
      },
      closeAddressModal() {
        this.showAddressModal = false;
        this.tempAddress = "";
      },
      confirmAddress() {
        this.customerForm.detailAddress = this.tempAddress;
        this.closeAddressModal();
      },
      editDescription() {
        this.tempDescription = this.customerForm.description;
        this.showDescriptionModal = true;
      },
      closeDescriptionModal() {
        this.showDescriptionModal = false;
        this.tempDescription = "";
      },
      confirmDescription() {
        this.customerForm.description = this.tempDescription;
        this.closeDescriptionModal();
      },
      // 城市选择器相关方法
      onCityConfirm(result) {
        this.customerForm.region = result.fullAddress;
        this.customerForm.regionCode = result.district.code;
        this.cityPickerValue = {
          province: result.province,
          city: result.city,
          district: result.district
        };
      },
      closeCityPicker() {
        this.showCityPicker = false;
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_CityPicker = vue.resolveComponent("CityPicker");
    return vue.openBlock(), vue.createElementBlock("view", { class: "customer-add-container" }, [
      vue.createCommentVNode(" 头部导航 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", {
          class: "header-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "×")
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("text", { class: "header-title" }, "添加客户")
        ]),
        vue.createElementVNode("view", {
          class: "header-right",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.saveCustomer && $options.saveCustomer(...args))
        }, [
          vue.createElementVNode("text", { class: "header-icon" }, "✓")
        ])
      ]),
      vue.createCommentVNode(" 主要内容区域 "),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createCommentVNode(" 必填内容提示 "),
        vue.createElementVNode("view", { class: "required-section" }, [
          vue.createElementVNode("text", { class: "required-title" }, "必填内容：")
        ]),
        vue.createCommentVNode(" 必填信息表单 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "姓名："),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.customerForm.name = $event),
                placeholder: "请输入客户姓名",
                onBlur: _cache[3] || (_cache[3] = (...args) => $options.validateName && $options.validateName(...args))
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $data.customerForm.name]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "电话："),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.customerForm.phone = $event),
                placeholder: "请输入联系电话",
                type: "number",
                onBlur: _cache[5] || (_cache[5] = (...args) => $options.validatePhone && $options.validatePhone(...args))
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $data.customerForm.phone]
            ])
          ]),
          vue.createElementVNode("view", {
            class: "form-item clickable",
            onClick: _cache[6] || (_cache[6] = (...args) => $options.selectRegion && $options.selectRegion(...args))
          }, [
            vue.createElementVNode("text", { class: "form-label" }, "所在地区："),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["form-value", { placeholder: !$data.customerForm.region }])
              },
              vue.toDisplayString($data.customerForm.region || "请选择省市区"),
              3
              /* TEXT, CLASS */
            ),
            vue.createElementVNode("text", { class: "arrow-icon" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "form-item clickable",
            onClick: _cache[7] || (_cache[7] = (...args) => $options.editDetailAddress && $options.editDetailAddress(...args))
          }, [
            vue.createElementVNode("text", { class: "form-label" }, "详细地址："),
            vue.createElementVNode(
              "text",
              { class: "form-value placeholder" },
              vue.toDisplayString($data.customerForm.detailAddress || "无"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "arrow-icon" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "form-item clickable",
            onClick: _cache[8] || (_cache[8] = (...args) => $options.selectCustomerType && $options.selectCustomerType(...args))
          }, [
            vue.createElementVNode("text", { class: "form-label" }, "客户类型："),
            vue.createElementVNode(
              "text",
              { class: "form-value" },
              vue.toDisplayString($data.customerForm.customerType || "个人买家"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "arrow-icon" }, ">")
          ])
        ]),
        vue.createCommentVNode(" 选填内容提示 "),
        vue.createElementVNode("view", { class: "optional-section" }, [
          vue.createElementVNode("text", { class: "optional-title" }, "选填内容：")
        ]),
        vue.createCommentVNode(" 选填信息表单 "),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("view", {
            class: "form-item clickable",
            onClick: _cache[9] || (_cache[9] = (...args) => $options.selectGender && $options.selectGender(...args))
          }, [
            vue.createElementVNode("text", { class: "form-label" }, "性别："),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["form-value", { placeholder: !$data.customerForm.gender }])
              },
              vue.toDisplayString($data.customerForm.gender || "请选择"),
              3
              /* TEXT, CLASS */
            ),
            vue.createElementVNode("text", { class: "arrow-icon" }, ">")
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "年龄："),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "form-input",
                "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => $data.customerForm.age = $event),
                placeholder: "请输入年龄",
                type: "number"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.customerForm.age]
            ])
          ]),
          vue.createElementVNode("view", {
            class: "form-item clickable",
            onClick: _cache[11] || (_cache[11] = (...args) => $options.selectPaymentMethod && $options.selectPaymentMethod(...args))
          }, [
            vue.createElementVNode("text", { class: "form-label" }, "首选支付方式："),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["form-value", { placeholder: !$data.customerForm.paymentMethod }])
              },
              vue.toDisplayString($data.customerForm.paymentMethod || "请选择"),
              3
              /* TEXT, CLASS */
            ),
            vue.createElementVNode("text", { class: "arrow-icon" }, ">")
          ]),
          vue.createElementVNode("view", {
            class: "form-item description-item clickable",
            onClick: _cache[12] || (_cache[12] = (...args) => $options.editDescription && $options.editDescription(...args))
          }, [
            vue.createElementVNode("text", { class: "form-label" }, "描述："),
            vue.createElementVNode(
              "text",
              { class: "form-value placeholder" },
              vue.toDisplayString($data.customerForm.description || "无"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "arrow-icon" }, ">")
          ])
        ])
      ]),
      vue.createCommentVNode(" 选择弹窗 "),
      $data.showModal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "modal-overlay",
        onClick: _cache[16] || (_cache[16] = (...args) => $options.closeModal && $options.closeModal(...args))
      }, [
        vue.createElementVNode("view", {
          class: "modal-content",
          onClick: _cache[15] || (_cache[15] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode(
              "text",
              { class: "modal-title" },
              vue.toDisplayString($data.modalTitle),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.modalOptions, (option, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: vue.normalizeClass(["modal-option", { selected: $data.selectedOption && $data.selectedOption.value === option.value }]),
                  key: index,
                  onClick: ($event) => $options.selectOption(option)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "option-text" },
                    vue.toDisplayString(option.label),
                    1
                    /* TEXT */
                  ),
                  $data.selectedOption && $data.selectedOption.value === option.value ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "check-icon"
                  }, "✓")) : vue.createCommentVNode("v-if", true)
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode("text", {
              class: "modal-btn cancel",
              onClick: _cache[13] || (_cache[13] = (...args) => $options.closeModal && $options.closeModal(...args))
            }, "取消"),
            vue.createElementVNode("text", {
              class: "modal-btn confirm",
              onClick: _cache[14] || (_cache[14] = (...args) => $options.confirmSelection && $options.confirmSelection(...args))
            }, "完成")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 详细地址编辑弹窗 "),
      $data.showAddressModal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "modal-overlay",
        onClick: _cache[21] || (_cache[21] = (...args) => $options.closeAddressModal && $options.closeAddressModal(...args))
      }, [
        vue.createElementVNode("view", {
          class: "modal-content",
          onClick: _cache[20] || (_cache[20] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode("text", { class: "modal-title" }, "详细地址")
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            vue.withDirectives(vue.createElementVNode(
              "textarea",
              {
                class: "address-textarea",
                "onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => $data.tempAddress = $event),
                placeholder: "请输入详细地址",
                maxlength: "200"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.tempAddress]
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode("text", {
              class: "modal-btn cancel",
              onClick: _cache[18] || (_cache[18] = (...args) => $options.closeAddressModal && $options.closeAddressModal(...args))
            }, "取消"),
            vue.createElementVNode("text", {
              class: "modal-btn confirm",
              onClick: _cache[19] || (_cache[19] = (...args) => $options.confirmAddress && $options.confirmAddress(...args))
            }, "完成")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 描述编辑弹窗 "),
      $data.showDescriptionModal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "modal-overlay",
        onClick: _cache[26] || (_cache[26] = (...args) => $options.closeDescriptionModal && $options.closeDescriptionModal(...args))
      }, [
        vue.createElementVNode("view", {
          class: "modal-content",
          onClick: _cache[25] || (_cache[25] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode("text", { class: "modal-title" }, "客户描述")
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            vue.withDirectives(vue.createElementVNode(
              "textarea",
              {
                class: "description-textarea",
                "onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => $data.tempDescription = $event),
                placeholder: "请输入客户描述信息",
                maxlength: "500"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.tempDescription]
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode("text", {
              class: "modal-btn cancel",
              onClick: _cache[23] || (_cache[23] = (...args) => $options.closeDescriptionModal && $options.closeDescriptionModal(...args))
            }, "取消"),
            vue.createElementVNode("text", {
              class: "modal-btn confirm",
              onClick: _cache[24] || (_cache[24] = (...args) => $options.confirmDescription && $options.confirmDescription(...args))
            }, "完成")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 城市选择器 "),
      vue.createVNode(_component_CityPicker, {
        visible: $data.showCityPicker,
        defaultValue: $data.cityPickerValue,
        onConfirm: $options.onCityConfirm,
        onClose: $options.closeCityPicker
      }, null, 8, ["visible", "defaultValue", "onConfirm", "onClose"])
    ]);
  }
  const PagesCustomerAdd = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__scopeId", "data-v-2c5016b6"], ["__file", "/Users/neil/Documents/CodeRepository/uniapp-x-dgt/pages/customer/add.vue"]]);
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
  __definePage("pages/order/add", PagesOrderAdd);
  __definePage("pages/product/detail", PagesProductDetail);
  __definePage("pages/product/add", PagesProductAdd);
  __definePage("pages/product/product-category", PagesProductProductCategory);
  __definePage("pages/customer/detail", PagesCustomerDetail);
  __definePage("pages/setting-category/setting-category", PagesSettingCategorySettingCategory);
  __definePage("pages/product-list/product-list", PagesProductListProductList);
  __definePage("pages/customer/customer-select", PagesCustomerCustomerSelect);
  __definePage("pages/customer/add", PagesCustomerAdd);
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
