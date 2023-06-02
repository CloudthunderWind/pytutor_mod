import {axios} from '@/util/request';

const traceAPI = "/trace";

export function getTraceAPI() {
    return axios({
        url: `${traceAPI}/getTrace`,
        method: "GET"
    });
}

export function runCodeAndGetTraceAPI(code) {
    return axios({
        url: `${traceAPI}/runCodeAndGetTrace`,
        method: "POST",
        data: code
    });
}