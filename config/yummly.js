export default {
    baseUrl: 'http://api.yummly.com/v1/api',
    queryParams: {
        _app_id: process.env.CS307_YUMMLY_ID,
        _app_key: process.env.CS307_YUMMLY_KEY
    }
}
