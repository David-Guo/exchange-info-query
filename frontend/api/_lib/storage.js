// 存储适配（支持 Upstash Redis 和本地文件备份）
// 说明：在 Vercel 项目中通过 Upstash 集成来提供 Redis 服务

const fs = require('fs').promises;

let redis = null;
let useRedis = false;

// 尝试初始化 Upstash Redis
try {
	// 检查 Upstash 环境变量
	if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
		const { Redis } = require('@upstash/redis');
		redis = new Redis({
			url: process.env.UPSTASH_REDIS_REST_URL,
			token: process.env.UPSTASH_REDIS_REST_TOKEN,
		});
		useRedis = true;
		console.log('Using Upstash Redis storage');
	} else {
		console.log('Upstash Redis credentials not found, using file system storage');
	}
} catch (error) {
	console.log('Upstash Redis not available, using file system storage:', error.message);
}

const MERGED_KEY = 'exchange:merged';
const DATA_FILE_PATH = '/tmp/exchange_data.json';

async function getMergedData() {
	if (useRedis && redis) {
		try {
			const data = await redis.get(MERGED_KEY);
			return data || await getFileData(); // 如果 Redis 没有数据，尝试从文件读取
		} catch (error) {
			console.error(`Redis get error: ${error.message}`);
			// 回退到文件系统
			return getFileData();
		}
	}
	return getFileData();
}

async function setMergedData(data) {
	let success = false;
	
	if (useRedis && redis) {
		try {
			await redis.set(MERGED_KEY, data);
			success = true;
			console.log('Data saved to Upstash Redis');
		} catch (error) {
			console.error(`Redis set error: ${error.message}`);
		}
	}
	
	// 总是尝试保存到文件作为备份
	const fileSuccess = await setFileData(data);
	
	return success || fileSuccess;
}

// 文件系统存储方法（备份机制）
async function getFileData() {
	try {
		const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
		return JSON.parse(data);
	} catch (error) {
		console.log('No file data found or error reading file');
		return null;
	}
}

async function setFileData(data) {
	try {
		await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data), 'utf8');
		console.log('Data saved to file system');
		return true;
	} catch (error) {
		console.error(`File write error: ${error.message}`);
		return false;
	}
}

module.exports = {
	getMergedData,
	setMergedData,
};


