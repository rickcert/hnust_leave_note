import request from '@/utils/request'

export function postData(data) {
    return request({
        url: '/newapi/new.php',
        method: 'post',
        data: data
    })
}
