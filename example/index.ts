import { MTAServerResponse, getServerInfo } from "./../index.js";

void async function test() {
    const result: MTAServerResponse | false = await getServerInfo(`lime.dayzmta.ru`, 22003);

    if (result == false) {
        console.log(`Error request server info...`)
    } else {
        console.log(result);

        console.log(`Server Name: ${result.name}`);
        console.log(`Gamemode: ${result.gamemode}`);
        console.log(`Map: ${result.map}`);
        console.log(`Version: ${result.version}`);
        console.log(`Is Passworded: ${result.private ? `Yes` : `No`}`);
        console.log(`Players: ${result.players}/${result.max_players}`);
    };    
}();