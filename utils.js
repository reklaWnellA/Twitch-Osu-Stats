const getNow = () =>
	new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");

const log = (msg) =>
	console.log(`[${getNow()}] ${msg}`);

module.exports = log;