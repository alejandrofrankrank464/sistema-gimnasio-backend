const path = require("path");
const { spawn } = require("child_process");

const strapiMain = path.join(
	__dirname,
	"node_modules",
	"@strapi",
	"strapi",
	"bin",
	"strapi.js"
);

const child = spawn(
	process.execPath, // Node embebido de Electron
	[strapiMain, "start"],
	{
		cwd: __dirname,
		stdio: "inherit",
	}
);

child.on("exit", (code) => {
	console.log("Strapi exited:", code);
});
