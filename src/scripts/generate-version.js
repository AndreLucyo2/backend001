const fs = require("fs");
const path = require("path");
const pkg = require("../../package.json"); // sobe dois níveis

// Cria o conteúdo do arquivo version.ts
const content = `export const APP_VERSION = "${pkg.version}";\n`;

// Gera dentro de src/version.ts
fs.writeFileSync(path.join(__dirname, "../version.ts"), content);

console.log("✅ Arquivo version.ts atualizado com versão:", pkg.version);
