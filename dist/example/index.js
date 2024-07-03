"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
void async function test() {
    const result = await (0, index_1.getServerInfo)(`lime.dayzmta.ru`, 22003);
    console.log(result);
    console.log(`Server Name: ${result.name}`);
    console.log(`Gamemode: ${result.gamemode}`);
    console.log(`Map: ${result.map}`);
    console.log(`Version: ${result.version}`);
    console.log(`Is Passworded: ${result.private ? `Yes` : `No`}`);
    console.log(`Players: ${result.players}/${result.max_players}`);
}();
//# sourceMappingURL=index.js.map