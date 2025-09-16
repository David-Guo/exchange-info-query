const DataCollector = require('../_lib/dataCollector');

module.exports = async (req, res) => {
	try {
		const data = await DataCollector.collectData();
		return res.status(200).json({ success: true, last_update: data.last_update });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ success: false, error: 'Failed to collect data' });
	}
};


