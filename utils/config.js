// API配置文件
const config = {
  // 开发环境配置
  development: {
    baseUrl: 'http://localhost:8080/dgt-core',
    timeout: 10000
  },

  // 生产环境配置
  production: {
    baseUrl: 'https://your-production-domain.com/dgt-core',
    timeout: 15000
  },

  // 测试环境配置
  test: {
    baseUrl: 'https://your-test-domain.com/dgt-core',
    timeout: 10000
  }
};

// 获取当前环境配置
export function getConfig() {
  // 这里可以根据实际需求判断环境
  // 可以通过环境变量、编译时配置等方式判断
  const env = process.env.NODE_ENV || 'development';
  return config[env];
}

// 导出配置对象
export { config }; 