"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
void async function test() {
    const result = await (0, index_1.getServerInfo)(`lime.dayzmta.ru`, 22003);
    console.log(`Server Name: ${result.name}`);
    console.log(`Gamemode: ${result.gamemode}`);
    console.log(`Map: ${result.map}`);
    console.log(`Version: ${result.version}`);
    console.log(`Is Passworded: ${result.private ? `Yes` : `No`}`);
    console.log(`Players: ${result.players}/${result.max_players}`);
    if (result.rules.length > 0) {
        console.log(`Rules:`);
        for (const rule of result.rules) {
            console.log(`- ${rule.name}: ${rule.value}`);
        }
    }
    if (result.players_list.length > 0) {
        console.log(`Players List:`);
        for (const player of result.players_list) {
            console.log(`- ${player.name}: ${player.score} (${player.ping} ms)`);
        }
    }
}();
//# sourceMappingURL=getServerInfo.js.map