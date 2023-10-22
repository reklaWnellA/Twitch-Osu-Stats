
function getNow() {
	return new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
}
  
function logError(err) {
	console.log(`[${getNow()}] ${err}`);
}

module.exports = { getNow, logError };