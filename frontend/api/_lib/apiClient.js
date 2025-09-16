/**
 * API客户端（Serverless 版本）
 * 处理各交易所API请求，包括认证、签名生成等
 */

const axios = require('axios');
const crypto = require('crypto');

class ApiClient {
	static async okxRequest(method, path, params = {}) {
		try {
			const apiKey = process.env.OKX_API_KEY;
			const apiSecret = process.env.OKX_API_SECRET;
			const passphrase = process.env.OKX_API_PASSPHRASE;
			const projectId = process.env.OKX_API_PROJECT;

			if (!apiKey || !apiSecret || !passphrase) {
				console.warn('OKX API credentials not found, using public endpoint');
			}

			const timestamp = new Date().toISOString();
			let requestPath = path;
			let signString = timestamp + method + requestPath;
			if (Object.keys(params).length > 0 && method === 'GET') {
				const queryString = new URLSearchParams(params).toString();
				signString += '?' + queryString;
			}

			const signature = crypto
				.createHmac('sha256', apiSecret || '')
				.update(signString)
				.digest('base64');

			const headers = {
				'Content-Type': 'application/json',
				'OK-ACCESS-KEY': apiKey || '',
				'OK-ACCESS-SIGN': signature,
				'OK-ACCESS-TIMESTAMP': timestamp,
				'OK-ACCESS-PASSPHRASE': passphrase || ''
			};
			if (projectId) headers['OK-ACCESS-PROJECT'] = projectId;

			const config = {
				method,
				url: `https://www.okx.com${path}`,
				headers,
				timeout: parseInt(process.env.API_TIMEOUT || 15000)
			};
			if (method === 'GET' && Object.keys(params).length > 0) config.params = params;
			else if (Object.keys(params).length > 0) config.data = params;

			const response = await axios(config);
			return response.data;
		} catch (error) {
			console.error(`OKX API Error: ${error.message}`);
			throw error;
		}
	}

	static async binanceRequest(method, path, params = {}) {
		try {
			const apiKey = process.env.BINANCE_API_KEY;
			const apiSecret = process.env.BINANCE_API_SECRET;
			if (!apiKey || !apiSecret) console.warn('Binance API credentials not found, using public endpoint');

			params.timestamp = Date.now();
			const queryString = new URLSearchParams(params).toString();
			const signature = crypto
				.createHmac('sha256', apiSecret || '')
				.update(queryString)
				.digest('hex');
			params.signature = signature;

			const headers = { 'X-MBX-APIKEY': apiKey || '' };
			const config = {
				method,
				url: `https://api.binance.com${path}`,
				headers,
				timeout: parseInt(process.env.API_TIMEOUT || 15000)
			};
			if (method === 'GET') config.params = params; else config.data = params;

			const response = await axios(config);
			return response.data;
		} catch (error) {
			console.error(`Binance API Error: ${error.message}`);
			throw error;
		}
	}

	static async bybitRequest(method, path, params = {}) {
		try {
			const apiKey = process.env.BYBIT_API_KEY;
			const apiSecret = process.env.BYBIT_API_SECRET;
			if (!apiKey || !apiSecret) console.warn('Bybit API credentials not found, using public endpoint');

			const timestamp = Date.now().toString();
			const recvWindow = '5000';
			let paramStr = '';
			if (Object.keys(params).length > 0) {
				const sortedParams = Object.keys(params).sort().reduce((result, key) => { result[key] = params[key]; return result; }, {});
				paramStr = Object.entries(sortedParams).map(([key, value]) => `${key}=${value}`).join('&');
			}
			const signString = timestamp + (apiKey || '') + recvWindow + paramStr;
			const signature = crypto.createHmac('sha256', apiSecret || '').update(signString).digest('hex');

			const headers = {
				'X-BAPI-API-KEY': apiKey || '',
				'X-BAPI-SIGN': signature,
				'X-BAPI-TIMESTAMP': timestamp,
				'X-BAPI-RECV-WINDOW': recvWindow,
				'Content-Type': 'application/json'
			};
			const config = {
				method,
				url: `https://api.bybit.com${path}`,
				headers,
				timeout: parseInt(process.env.API_TIMEOUT || 15000)
			};
			if (method === 'GET' && Object.keys(params).length > 0) config.params = params; else if (Object.keys(params).length > 0) config.data = params;

			const response = await axios(config);
			return response.data;
		} catch (error) {
			console.error(`Bybit API Error: ${error.message}`);
			throw error;
		}
	}

	static async gateRequest(method, path, params = {}) {
		try {
			const apiKey = process.env.GATE_API_KEY;
			const apiSecret = process.env.GATE_API_SECRET;
			if (!apiKey || !apiSecret) console.warn('Gate.io API credentials not found, using public endpoint');

			const timestamp = Math.floor(Date.now() / 1000).toString();
			let queryString = '';
			if (method === 'GET' && Object.keys(params).length > 0) queryString = new URLSearchParams(params).toString();
			let body = '';
			if (method !== 'GET' && Object.keys(params).length > 0) body = JSON.stringify(params);
			const signString = `${method}\n${path}\n${queryString}\n${body}\n${timestamp}`;
			const signature = crypto.createHmac('sha512', apiSecret || '').update(signString).digest('hex');

			const headers = {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'KEY': apiKey || '',
				'SIGN': signature,
				'Timestamp': timestamp
			};
			const config = {
				method,
				url: `https://api.gateio.ws${path}`,
				headers,
				timeout: parseInt(process.env.API_TIMEOUT || 15000)
			};
			if (method === 'GET' && Object.keys(params).length > 0) config.params = params; else if (Object.keys(params).length > 0) config.data = params;

			const response = await axios(config);
			return response.data;
		} catch (error) {
			console.error(`Gate.io API Error: ${error.message}`);
			throw error;
		}
	}

	static async bitgetRequest(method, path, params = {}) {
		try {
			const apiKey = process.env.BITGET_API_KEY;
			const apiSecret = process.env.BITGET_API_SECRET;
			const passphrase = process.env.BITGET_API_PASSPHRASE;
			if (!apiKey || !apiSecret || !passphrase) console.warn('Bitget API credentials not found, using public endpoint');

			const timestamp = Date.now().toString();
			let body = '';
			if (Object.keys(params).length > 0) body = JSON.stringify(params);
			const signString = timestamp + method + path + body;
			const signature = crypto.createHmac('sha256', apiSecret || '').update(signString).digest('base64');

			const headers = {
				'ACCESS-KEY': apiKey || '',
				'ACCESS-SIGN': signature,
				'ACCESS-TIMESTAMP': timestamp,
				'ACCESS-PASSPHRASE': passphrase || '',
				'Content-Type': 'application/json'
			};
			const config = {
				method,
				url: `https://api.bitget.com${path}`,
				headers,
				timeout: parseInt(process.env.API_TIMEOUT || 15000)
			};
			if (method === 'GET' && Object.keys(params).length > 0) config.params = params; else if (Object.keys(params).length > 0) config.data = params;

			const response = await axios(config);
			return response.data;
		} catch (error) {
			console.error(`Bitget API Error: ${error.message}`);
			throw error;
		}
	}
}

module.exports = ApiClient;


