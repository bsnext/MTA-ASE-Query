# MTA-ASE-Query

Library for send requests to [Multi Theft Auto: San Andreas](https://mtasa.com) servers and get basic info.<br>
Working around ASE protocol ([EYE1](https://github.com/multitheftauto/mtasa-blue/blob/615b9b67c89fb3448f1e7c284146ee0800a3215e/Server/mods/deathmatch/logic/ASE.cpp#L236)).

Also, possible request all servers info with "partially" fields from [those API](https://mtasa.com/api).

```ts
// These objects is returned by getServerInfo()
interface MTAServerResponse {
    name: string;
    ip: string;
    port: number;
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

// These objects is returned by getServers()
interface MTAServerResponseLite {
    name: string;
    ip: string;
    port: number;
    version: string;
    private: boolean;
    players: number;
    max_players: number;
}
```

**[What is a "Rules"?](https://wiki.multitheftauto.com/wiki/SetRuleValue)** (MTA:SA Wiki)<br>
**[What is a "Score"?](https://wiki.multitheftauto.com/wiki/SetPlayerAnnounceValue)** (MTA:SA Wiki)

## Installing:
```bash
npm install @bsnext/mta-ase-query
```

## API:
```ts
getServerInfo(
    serverAdress: string, serverPort: number = 22003, requestTimeout: number = 7500
): Promise<MTAServerResponse>;

// serverAdress - Server adress, can be IP or Domain.
// serverPort - Server port, 22003 by default.
// requestTimeout - Timeout for close long-time requests.
```

```ts
getServers(): Promise<MTAServerResponseLite>;
```

## Usage:
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

```ts
import { getServers } from "@bsnext/mta-ase-query";
const allServersInfo = await getServers();

/*
allServersInfo = [
    ...,
    {
        name: '██ #3 | RU █ [BS] DAYZ ULTIMATE: LIME █ PVP, EASY, LOOT X3',
        version: '1.6',
        private: false,
        players: 4,
        max_players: 80,
    },
    {
        name: '██ #4 | EU █ [BS] DAYZ ULTIMATE: MINT █ PVP, EASY, LOOT X3',
        version: '1.6',
        private: false,
        players: 16,
        max_players: 80,
    },
    ...
]
*/
```

## Example:
**Basic example of request.**
```ts
const result: MTAServerResponse = await getServerInfo(`lime.dayzmta.ru`, 22003);

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
```

**Catch the request error.**
```ts
try {
    const result: MTAServerResponse = await getServerInfo(`not-existed-server.dayzmta.ru`, 22003);
    console.log(`Server Name: ${result.name}`);
} catch(e) {
    console.error(e);
}
```

**Request all servers info, and filter by name.**
```ts
const result: MTAServerResponseLite[] = await getServers();

const filteredResult = result.filter(
    function (value) {
        return value.name.search(`DAYZ ULTIMATE`) > -1;
    }
);

for (const serverInfo of filteredResult) {
    console.log(`----------------`);
    console.log(`Server Name: ${serverInfo.name}`);
    console.log(`Version: ${serverInfo.version}`);
    console.log(`Is Passworded: ${serverInfo.private ? `Yes` : `No`}`);
    console.log(`Players: ${serverInfo.players}/${serverInfo.max_players}`);
}
```