// 存储适配（Vercel KV）
// 说明：在 Vercel 项目中启用 KV，并配置环境变量后即可使用

const { kv } = require('@vercel/kv');

const MERGED_KEY = 'exchange:merged';

async function getMergedData() {
	try {
		const data = await kv.get(MERGED_KEY);
		return data || null;
	} catch (error) {
		console.error(`KV get error: ${error.message}`);
		return null;
	}
}

async function setMergedData(data) {
	try {
		await kv.set(MERGED_KEY, data);
		return true;
	} catch (error) {
		console.error(`KV set error: ${error.message}`);
		return false;
	}
}

module.exports = {
	getMergedData,
	setMergedData,
};


