# MTA-ASE-Query

Library for send requests to [Multi Theft Auto: San Andreas](https://mtasa.com) servers and get basic info:

```ts
interface MTAServerResponse {
    name: string;
    gamemode: string;
    map: string;
    version: string;
    private: boolean;
    players: number;
    max_players: number;
}
```

## Installing:
```bash
npm install @bsnext/mta-ase-query
```

```ts
import { getServerInfo } from "@bsnext/mta-ase-query";
const serverInfo = await getServerInfo(`lime.dayzmta.ru`, 22003);
```

## Usage:
```ts
getServerInfo(
    serverAdress: string, serverPort: number = 22003, requestTimeout: number = 7500
): Promise<MTAServerResponse>;
```

* serverAdress - Server adress, can be IP or Domain.
* serverPort - Server port, 22003 by default.
* requestTimeout - Timeout for close long-time requests.

## Example:
**Basic example of request.**
```ts
void async function main() {
    const result: MTAServerResponse = await getServerInfo(`mint.dayzmta.ru`, 22003);

    console.log(`Server Name: ${result.name}`);
    console.log(`Gamemode: ${result.gamemode}`);
    console.log(`Map: ${result.map}`);
    console.log(`Version: ${result.version}`);
    console.log(`Is Passworded: ${result.private ? `Yes` : `No`}`);
    console.log(`Players: ${result.players}/${result.max_players}`);
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