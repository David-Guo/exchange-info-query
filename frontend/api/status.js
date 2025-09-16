const { getMergedData } = require('./_lib/storage');

module.exports = async (req, res) => {
	try {
		const { symbol } = req.query || {};
		if (!symbol) return res.status(400).json({ error: 'Symbol parameter is required' });
		const data = await getMergedData();
		const token = (data?.tokens || []).find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
		if (!token) return res.status(404).json({ error: 'Token not found' });
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		return res.status(200).json({
			symbol: token.symbol,
			name: token.name,
			exchanges: token.exchanges,
			last_update: data?.last_update || null
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};


