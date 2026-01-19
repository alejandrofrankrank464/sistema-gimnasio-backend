const { spawn } = require("child_process");
const path = require("path");

const strapiCLI = path.join(__dirname, "node_modules", ".bin", "strapi");

const strapiProcess = spawn(strapiCLI, ["start"], {
	cwd: __dirname,
	stdio: "inherit",
	shell: true, // Necesario en Windows para .cmd
});

strapiProcess.on("exit", (code) => {
	console.log(`Strapi se cerró con código ${code}`);
});
