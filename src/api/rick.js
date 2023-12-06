import request from '@/utils/request'

export function postData(data) {
    return request({
        url: '/new.php',
        method: 'post',
        data: data
    })
}
