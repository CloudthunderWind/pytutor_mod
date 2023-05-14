import axios from "axios";

// 创建axios异步服务
const axiosService = axios.create({
    baseURL: process.env.NOED_ENV === "prod" ? "" : "http://localhost:8081"
})

// 简单请求配置
axiosService.interceptors.request.use((config) => {
    const requestConfig = {
        ...config,
        url: `${config.url}`
    }
    return requestConfig;
});

// 简单响应配置
axiosService.interceptors.response.use((response) => {
    switch (response.status) {
        case 200:
            // 判断数据是否正确返回
            if (response.data) {
                return response.data;
            }
            break;
        case 404:
            return false;
        default:
            alert(response.data);
    }
})

export {
    axiosService as axios
} ;