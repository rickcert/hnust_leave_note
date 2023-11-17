import axios from 'axios'
// const baseURL = "http://10.152.74.149:5173"
const baseURL = "https://hnust.rick.icu/new"
// 创建axios实例
const service = axios.create({
    // 请求路由
    baseURL: baseURL,
    // 请求超时时间
    timeout: 20000,
})
export default service
