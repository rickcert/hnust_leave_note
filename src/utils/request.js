import axios from 'axios'

const baseURL = import.meta.env.VITE_BACK_URL
// 创建axios实例
const service = axios.create({
    // 请求路由
    baseURL: baseURL,
    // 请求超时时间
    timeout: 20000,
})
export default service
