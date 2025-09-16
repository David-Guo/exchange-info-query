/**
 * 数据采集器（Serverless 版本）
 */

const ApiClient = require('./apiClient');
const { setMergedData, getMergedData } = require('./storage');

class DataCollector {
	static async fetchOkxData() {
		try {
			const response = await ApiClient.okxRequest('GET', '/api/v5/asset/currencies');
			if (response.code !== '0') throw new Error(`OKX API Error: ${response.msg}`);
			const tokens = {};
			for (const item of response.data) {
				const symbol = item.ccy;
				const chain = item.chain;
				if (!tokens[symbol]) tokens[symbol] = { symbol, name: item.name || symbol, exchanges: [] };
				let exchange = tokens[symbol].exchanges.find(ex => ex.name === 'OKX');
				if (!exchange) { exchange = { name: 'OKX', chains: [] }; tokens[symbol].exchanges.push(exchange); }
				const chainName = chain.split('-')[0];
				exchange.chains.push({
					chain: chainName,
					deposit_status: item.canDep ? 'open' : 'closed',
					withdraw_status: item.canWd ? 'open' : 'closed',
					contract_address: item.ctAddr || '',
					min_withdraw: item.minWd || '',
					withdraw_fee: item.minFee || ''
				});
			}
			return Object.values(tokens);
		} catch (error) {
			console.error(`Error fetching OKX data: ${error.message}`);
			return [];
		}
	}

	static async fetchBinanceData() {
		try {
			const response = await ApiClient.binanceRequest('GET', '/sapi/v1/capital/config/getall');
			const tokens = {};
			for (const item of response) {
				const symbol = item.coin;
				if (!tokens[symbol]) tokens[symbol] = { symbol, name: item.name || symbol, exchanges: [] };
				const exchange = { name: 'Binance', chains: [] };
				if (item.networkList && item.networkList.length > 0) {
					for (const network of item.networkList) {
						exchange.chains.push({
							chain: network.network,
							deposit_status: network.depositEnable ? 'open' : 'closed',
							withdraw_status: network.withdrawEnable ? 'open' : 'closed',
							contract_address: network.contractAddress || '',
							min_withdraw: network.minWithdrawAmount || '',
							withdraw_fee: network.withdrawFee || ''
						});
					}
				}
				tokens[symbol].exchanges.push(exchange);
			}
			return Object.values(tokens);
		} catch (error) {
			console.error(`Error fetching Binance data: ${error.message}`);
			return [];
		}
	}

	static async fetchBybitData() {
		try {
			const response = await ApiClient.bybitRequest('GET', '/v5/asset/coin/query-info');
			if (response.retCode !== 0) throw new Error(`Bybit API Error: ${response.retMsg}`);
			const tokens = {};
			for (const item of response.result.rows) {
				const symbol = item.coin;
				if (!tokens[symbol]) tokens[symbol] = { symbol, name: item.name || symbol, exchanges: [] };
				const exchange = { name: 'Bybit', chains: [] };
				if (item.chains && item.chains.length > 0) {
					for (const chain of item.chains) {
						exchange.chains.push({
							chain: chain.chain,
							deposit_status: chain.chainDeposit === '1' ? 'open' : 'closed',
							withdraw_status: chain.chainWithdraw === '1' ? 'open' : 'closed',
							contract_address: '',
							min_withdraw: chain.withdrawMin || '',
							withdraw_fee: chain.withdrawFee || ''
						});
					}
				}
				tokens[symbol].exchanges.push(exchange);
			}
			return Object.values(tokens);
		} catch (error) {
			console.error(`Error fetching Bybit data: ${error.message}`);
			return [];
		}
	}

	static async fetchGateData() {
		try {
			const response = await ApiClient.gateRequest('GET', '/api/v4/spot/currencies');
			const tokens = {};
			for (const item of response) {
				const symbol = item.currency;
				if (!tokens[symbol]) tokens[symbol] = { symbol, name: item.name || symbol, exchanges: [] };
				let exchange = tokens[symbol].exchanges.find(ex => ex.name === 'Gate.io');
				if (!exchange) { exchange = { name: 'Gate.io', chains: [] }; tokens[symbol].exchanges.push(exchange); }
				exchange.chains.push({
					chain: item.chain,
					deposit_status: item.deposit_disabled ? 'closed' : 'open',
					withdraw_status: item.withdraw_disabled ? 'closed' : 'open',
					contract_address: '',
					min_withdraw: item.min_withdraw_amount || '',
					withdraw_fee: item.withdraw_fee || ''
				});
			}
			return Object.values(tokens);
		} catch (error) {
			console.error(`Error fetching Gate.io data: ${error.message}`);
			return [];
		}
	}

	static async fetchBitgetData() {
		try {
			const response = await ApiClient.bitgetRequest('GET', '/api/v2/spot/public/coins');
			if (response.code !== '00000') throw new Error(`Bitget API Error: ${response.msg}`);
			const tokens = {};
			for (const item of response.data) {
				const symbol = item.coin;
				if (!tokens[symbol]) tokens[symbol] = { symbol, name: symbol, exchanges: [] };
				const exchange = { name: 'Bitget', chains: [] };
				if (item.chains && item.chains.length > 0) {
					for (const chain of item.chains) {
						exchange.chains.push({
							chain: chain.chain,
							deposit_status: chain.rechargeable === 'true' ? 'open' : 'closed',
							withdraw_status: chain.withdrawable === 'true' ? 'open' : 'closed',
							contract_address: chain.contractAddress || '',
							min_withdraw: chain.minWithdrawAmount || '',
							withdraw_fee: chain.withdrawFee || ''
						});
					}
				}
				tokens[symbol].exchanges.push(exchange);
			}
			return Object.values(tokens);
		} catch (error) {
			console.error(`Error fetching Bitget data: ${error.message}`);
			return [];
		}
	}

	static async mergeAllExchangeData() {
		const [okxTokens, binanceTokens, bybitTokens, gateTokens, bitgetTokens] = await Promise.all([
			this.fetchOkxData(),
			this.fetchBinanceData(),
			this.fetchBybitData(),
			this.fetchGateData(),
			this.fetchBitgetData()
		]);
		const allTokens = {};
		const processExchangeTokens = (tokens) => {
			for (const token of tokens) {
				if (!allTokens[token.symbol]) allTokens[token.symbol] = { symbol: token.symbol, name: token.name, exchanges: [] };
				for (const exchange of token.exchanges) {
					allTokens[token.symbol].exchanges.push(exchange);
				}
			}
		};
		processExchangeTokens(okxTokens);
		processExchangeTokens(binanceTokens);
		processExchangeTokens(bybitTokens);
		processExchangeTokens(gateTokens);
		processExchangeTokens(bitgetTokens);
		return {
			last_update: new Date().toISOString(),
			tokens: Object.values(allTokens)
		};
	}

	static async collectData() {
		try {
			const data = await this.mergeAllExchangeData();
			await setMergedData(data);
			return data;
		} catch (error) {
			console.error(`Error in data collection: ${error.message}`);
			const last = await getMergedData();
			if (last) return last;
			return { last_update: new Date().toISOString(), tokens: [], error: error.message };
		}
	}
}

module.exports = DataCollector;


