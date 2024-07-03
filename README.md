# MTA-ASE-Query

Library for send requests to [Multi Theft Auto: San Andreas](https://mtasa.com) servers and get basic info.<br>
Working around ASE protocol ([EYE1](https://github.com/multitheftauto/mtasa-blue/blob/615b9b67c89fb3448f1e7c284146ee0800a3215e/Server/mods/deathmatch/logic/ASE.cpp#L236)).

```ts
interface MTAServerResponse {
    name: string;
    gamemode: string;
    map: string;
    version: string;
    private: boolean;
    players: number;
    max_players: number;
    rules: {
        name: string;
        value: string;
    }[],
    players_list: {
        name: string;
        ping: number;
        score: number;
    }[]
}
```

**[What is a "Rules"?](https://wiki.multitheftauto.com/wiki/SetRuleValue)** (MTA:SA Wiki)<br>
**[What is a "Score"?](https://wiki.multitheftauto.com/wiki/SetPlayerAnnounceValue)** (MTA:SA Wiki)

## Installing:
```bash
npm install @bsnext/mta-ase-query
```

```ts
import { getServerInfo } from "@bsnext/mta-ase-query";
const serverInfo = await getServerInfo(`lime.dayzmta.ru`, 22003);

/*
serverInfo = {
    name: '██ #3 | RU █ [BS] DAYZ ULTIMATE: LIME █ PVP, EASY, LOOT X3',
    gamemode: 'RU ██ DayZ Ultimate 1.5',
    map: 'None',
    version: '1.6',
    private: false,
    players: 1,
    max_players: 80,
    rules: [],
    players_list: [ 
        { name: 'WildDove83', ping: 7, score: 0 } 
    ]
}
*/
```

## Usage:
```ts
getServerInfo(
    serverAdress: string, serverPort: number = 22003, requestTimeout: number = 7500
): Promise<MTAServerResponse>;
```

* **serverAdress** - Server adress, can be IP or Domain.
* **serverPort** - Server port, 22003 by default.
* **requestTimeout** - Timeout for close long-time requests.

## Example:
**Basic example of request.**
```ts
void async function test() {
    const result: MTAServerResponse | false = await getServerInfo(`lime.dayzmta.ru`, 22003);

    console.log(result);

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
```
**Catch the request error.**
```ts
void async function main() {
    try {
        const result: MTAServerResponse = await getServerInfo(`not-existed-server.dayzmta.ru`, 22003);
        console.log(`Server Name: ${result.name}`);
    } catch(e) {
        console.error(e);
    }
}();
```