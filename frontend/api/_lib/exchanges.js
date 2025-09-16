/**
 * 交易所配置（Serverless 版本）
 */

module.exports = {
	exchangeConfig: {
		okx: { name: 'OKX', baseUrl: 'https://www.okx.com', apiPath: '/api/v5/asset/currencies', requiresAuth: true },
		binance: { name: 'Binance', baseUrl: 'https://api.binance.com', apiPath: '/sapi/v1/capital/config/getall', requiresAuth: true },
		bybit: { name: 'Bybit', baseUrl: 'https://api.bybit.com', apiPath: '/v5/asset/coin/query-info', requiresAuth: true },
		gate: { name: 'Gate.io', baseUrl: 'https://api.gateio.ws', apiPath: '/api/v4/spot/currencies', requiresAuth: true },
		bitget: { name: 'Bitget', baseUrl: 'https://api.bitget.com', apiPath: '/api/v2/spot/public/coins', requiresAuth: true }
	},
	refreshConfig: { interval: '5 * * * *', timeout: 15000 }
};


