"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
void async function test() {
    const result = await (0, __1.getServers)();
    const filteredResult = result.filter(function (value) {
        return value.name.search(`DAYZ ULTIMATE`) > -1;
    });
    for (const serverInfo of filteredResult) {
        console.log(`----------------`);
        console.log(`Server Name: ${serverInfo.name}`);
        console.log(`Version: ${serverInfo.version}`);
        console.log(`Is Passworded: ${serverInfo.private ? `Yes` : `No`}`);
        console.log(`Players: ${serverInfo.players}/${serverInfo.max_players}`);
    }
}();
//# sourceMappingURL=getServers.js.map