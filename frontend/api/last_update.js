const { getMergedData } = require('./_lib/storage');

module.exports = async (req, res) => {
	try {
		const data = await getMergedData();
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		return res.status(200).json({ last_update: data?.last_update || null });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};


