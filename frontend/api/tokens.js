const { getMergedData } = require('./_lib/storage');

module.exports = async (req, res) => {
	try {
		const data = await getMergedData();
		const tokens = (data?.tokens || []).map(t => ({ symbol: t.symbol, name: t.name }));
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		return res.status(200).json(tokens);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};


