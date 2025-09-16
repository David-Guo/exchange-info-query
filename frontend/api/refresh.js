const DataCollector = require('./_lib/dataCollector');

module.exports = async (req, res) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method Not Allowed' });
	}
	try {
		const data = await DataCollector.collectData();
		return res.status(200).json({ success: true, last_update: data.last_update });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ success: false, error: 'Failed to refresh data' });
	}
};


