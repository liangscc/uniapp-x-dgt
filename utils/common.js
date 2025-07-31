// 全局工具类
export default class CommonUtils {

  // 格式化日期
  static formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return ''

    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    const second = String(d.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hour)
      .replace('mm', minute)
      .replace('ss', second)
  }

  // 格式化金额
  static formatMoney(amount, currency = '¥') {
    if (amount === null || amount === undefined) return '0.00'
    return currency + parseFloat(amount).toFixed(2)
  }

  // 格式化文件大小
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 防抖函数
  static debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // 节流函数
  static throttle(func, limit) {
    let inThrottle
    return function () {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // 深拷贝
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(item => this.deepClone(item))
    if (typeof obj === 'object') {
      const clonedObj = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key])
        }
      }
      return clonedObj
    }
  }

  // 生成随机ID
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 验证手机号
  static validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  // 验证邮箱
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 验证身份证号
  static validateIdCard(idCard) {
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return idCardRegex.test(idCard)
  }

  // 获取状态颜色
  static getStatusColor(status) {
    const statusColors = {
      'success': '#52c41a',
      'warning': '#fa8c16',
      'error': '#ff4d4f',
      'info': '#1890ff',
      'processing': '#1890ff',
      'default': '#d9d9d9'
    }
    return statusColors[status] || statusColors.default
  }

  // 获取状态文本
  static getStatusText(status) {
    const statusTexts = {
      'pending': '待处理',
      'processing': '处理中',
      'completed': '已完成',
      'cancelled': '已取消',
      'failed': '失败',
      'success': '成功',
      'warning': '警告',
      'error': '错误'
    }
    return statusTexts[status] || status
  }

  // 显示加载提示
  static showLoading(title = '加载中...') {
    uni.showLoading({
      title: title,
      mask: true
    })
  }

  // 隐藏加载提示
  static hideLoading() {
    uni.hideLoading()
  }

  // 显示成功提示
  static showSuccess(message, duration = 2000) {
    uni.showToast({
      title: message,
      icon: 'success',
      duration: duration
    })
  }

  // 显示错误提示
  static showError(message, duration = 2000) {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: duration
    })
  }

  // 显示确认对话框
  static showConfirm(content, title = '提示') {
    return new Promise((resolve) => {
      uni.showModal({
        title: title,
        content: content,
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })
  }

  // 显示操作菜单
  static showActionSheet(itemList) {
    return new Promise((resolve) => {
      uni.showActionSheet({
        itemList: itemList,
        success: (res) => {
          resolve(res.tapIndex)
        },
        fail: () => {
          resolve(-1)
        }
      })
    })
  }

  // 复制到剪贴板
  static copyToClipboard(text) {
    uni.setClipboardData({
      data: text,
      success: () => {
        this.showSuccess('复制成功')
      },
      fail: () => {
        this.showError('复制失败')
      }
    })
  }

  // 获取系统信息
  static getSystemInfo() {
    return new Promise((resolve) => {
      uni.getSystemInfo({
        success: (res) => {
          resolve(res)
        },
        fail: () => {
          resolve(null)
        }
      })
    })
  }

  // 检查网络状态
  static checkNetworkStatus() {
    return new Promise((resolve) => {
      uni.getNetworkType({
        success: (res) => {
          resolve(res.networkType !== 'none')
        },
        fail: () => {
          resolve(false)
        }
      })
    })
  }

  // 拨打电话
  static makePhoneCall(phoneNumber) {
    uni.makePhoneCall({
      phoneNumber: phoneNumber,
      fail: () => {
        this.showError('拨打电话失败')
      }
    })
  }

  // 发送短信
  static sendSms(phoneNumber, content) {
    // 注意：某些平台可能不支持发送短信功能
    uni.showToast({
      title: '请手动发送短信',
      icon: 'none'
    })
  }

  // 保存图片到相册
  static saveImageToPhotosAlbum(filePath) {
    return new Promise((resolve, reject) => {
      uni.saveImageToPhotosAlbum({
        filePath: filePath,
        success: () => {
          this.showSuccess('保存成功')
          resolve(true)
        },
        fail: () => {
          this.showError('保存失败')
          reject(false)
        }
      })
    })
  }

  // 选择图片
  static chooseImage(count = 1, sizeType = ['original', 'compressed']) {
    return new Promise((resolve, reject) => {
      uni.chooseImage({
        count: count,
        sizeType: sizeType,
        success: (res) => {
          resolve(res.tempFilePaths)
        },
        fail: () => {
          reject('选择图片失败')
        }
      })
    })
  }

  // 选择文件
  static chooseFile() {
    return new Promise((resolve, reject) => {
      // #ifdef H5
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '*/*'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          resolve([file])
        } else {
          reject('选择文件失败')
        }
      }
      input.click()
      // #endif

      // #ifndef H5
      uni.chooseFile({
        success: (res) => {
          resolve(res.tempFiles)
        },
        fail: () => {
          reject('选择文件失败')
        }
      })
      // #endif
    })
  }

  // 获取当前位置
  static getLocation() {
    return new Promise((resolve, reject) => {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          resolve(res)
        },
        fail: () => {
          reject('获取位置失败')
        }
      })
    })
  }

  // 打开地图
  static openLocation(latitude, longitude, name = '', address = '') {
    uni.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: name,
      address: address,
      fail: () => {
        this.showError('打开地图失败')
      }
    })
  }

  // 设置导航栏标题
  static setNavigationBarTitle(title) {
    uni.setNavigationBarTitle({
      title: title
    })
  }

  // 设置导航栏颜色
  static setNavigationBarColor(frontColor, backgroundColor) {
    uni.setNavigationBarColor({
      frontColor: frontColor,
      backgroundColor: backgroundColor
    })
  }

  // 页面跳转
  static navigateTo(url, params = {}) {
    const query = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')

    const fullUrl = query ? `${url}?${query}` : url

    uni.navigateTo({
      url: fullUrl,
      fail: () => {
        this.showError('页面跳转失败')
      }
    })
  }

  // 重定向页面
  static redirectTo(url, params = {}) {
    const query = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')

    const fullUrl = query ? `${url}?${query}` : url

    uni.redirectTo({
      url: fullUrl,
      fail: () => {
        this.showError('页面跳转失败')
      }
    })
  }

  // 返回上一页
  static navigateBack(delta = 1) {
    uni.navigateBack({
      delta: delta,
      fail: () => {
        this.showError('返回失败')
      }
    })
  }

  // 重启应用
  static reLaunch(url) {
    uni.reLaunch({
      url: url,
      fail: () => {
        this.showError('重启失败')
      }
    })
  }

  // 切换Tab
  static switchTab(url) {
    uni.switchTab({
      url: url,
      fail: () => {
        this.showError('切换失败')
      }
    })
  }
} 