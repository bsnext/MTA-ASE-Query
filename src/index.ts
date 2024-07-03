
import * as dgram from "node:dgram";
import { Buffer } from "node:buffer";

////////////////////////////////

const socketRequestTag: Buffer = Buffer.from(`s`);
const socketResponseTag: Buffer = Buffer.from(`EYE1`);
const socketResponseGame: Buffer = Buffer.from(`mta`);

const endServerInfoSuffix: Buffer = Buffer.from([0x01]);
const startPlayerInfoPrefix: Buffer = Buffer.from([0x00 | 0x01 | 0x02 | 0x04 | 0x08 | 0x16 | 0x32]);

const socketTimeout: number = 7500;

////////////////////////////////

export declare interface MTAServerResponse {
    name: string;
    gamemode: string;
    map: string;
    version: string;
    private: boolean;
    players: number;
    max_players: number;
    rules: MTAServerResponseRule[];
    players_list: MTAServerResponsePlayer[];
}

export declare interface MTAServerResponseRule {
    name: string;
    value: string;
}

export declare interface MTAServerResponsePlayer {
    name: string;
    ping: number;
    score: number;
}

////////////////////////////////

export function getServerInfo(ip: string, port: number, timeout: number = socketTimeout): Promise<MTAServerResponse> {
    return new Promise(
        function (resolve, reject) {
            if ((port < 1) || (port > 65412)) { // 65535 - 123
                reject(`Invalid port, should be > 0 and < 65413`);
                return;
            }

            let client = dgram.createSocket(`udp4`);

            let messageListener = function (receiveData: Buffer): void {
                endListenerTask();

                let index: number = 0;
                let receiveTag: Buffer = receiveData.subarray(index, index += 4);

                if (!socketResponseTag.equals(receiveTag)) {
                    reject(`Invalid query tag in response`);
                    return;
                }

                let dataLength: number, data: string;

                let info: Array<string> = [];
                let rules: MTAServerResponseRule[] = [];
                let players_list: MTAServerResponsePlayer[] = [];

                dataLength = receiveData.subarray(index, index += 1).readUint8();
                let game = receiveData.subarray(index, (index += (dataLength - 1)));

                if (!socketResponseGame.equals(game)) {
                    reject(`Invalid game in response`);
                    return;
                }

                for (let i = 0; i < 8; i++) {
                    dataLength = receiveData.subarray(index, index += 1).readUint8();
                    data = receiveData.subarray(index, (index += (dataLength - 1))).toString(`utf-8`);
                    info[i] = data;
                }

                while (!endServerInfoSuffix.equals(receiveData.subarray(index, (index + 1)))) {
                    dataLength = receiveData.subarray(index, index += 1).readUint8();
                    let ruleName = receiveData.subarray(index, (index += (dataLength - 1))).toString('utf-8');

                    dataLength = receiveData.subarray(index, index += 1).readUint8();
                    let ruleValue = receiveData.subarray(index, (index += (dataLength - 1))).toString('utf-8');

                    rules.push(
                        {
                            name: ruleName,
                            value: ruleValue
                        }
                    );
                }

                index += 1;

                while (startPlayerInfoPrefix.equals(receiveData.subarray(index, (index += 1)))) {
                    dataLength = receiveData.subarray(index, index += 1).readUint8();
                    let playerName = receiveData.subarray(index, (index += (dataLength - 1))).toString('utf-8');

                    // Next parameters skipped because:
                    // https://github.com/multitheftauto/mtasa-blue/blob/615b9b67c89fb3448f1e7c284146ee0800a3215e/Server/mods/deathmatch/logic/ASE.cpp#L236

                    index += 1; // Skip (Team)
                    index += 1; // Skip (Skin)

                    dataLength = receiveData.subarray(index, index += 1).readUint8();
                    let playerScore = receiveData.subarray(index, (index += (dataLength - 1))).toString('utf-8');

                    dataLength = receiveData.subarray(index, index += 1).readUint8();
                    let playerPing = receiveData.subarray(index, (index += (dataLength - 1))).toString('utf-8');

                    index += 1; // Skip (Time)

                    players_list.push(
                        {
                            name: playerName,
                            ping: parseInt(playerPing) || 0,
                            score: parseInt(playerScore) || 0
                        }
                    );
                }

                let returnTable: MTAServerResponse = {
                    name: info[1],
                    gamemode: info[2],
                    map: info[3],
                    version: info[4],
                    private: info[5] === `1`,
                    players: parseInt(info[6]) || 0,
                    max_players: parseInt(info[7]) || 0,
                    rules: rules,
                    players_list: players_list
                };

                resolve(returnTable);
            };

            let errorListener = function (): void {
                endListenerTask();
                reject(`Socket error`);
            };

            let timeoutErrorListener = function (): void {
                endListenerTask();
                reject(`Request is timed out`);
            };

            let endListenerTask = function (): void {
                client.close();
                client.removeListener(`message`, messageListener);
                client.removeListener(`error`, errorListener);
                client.unref();

                stopTimeoutInterval();
            };

            let timeoutInterval: NodeJS.Timeout | undefined;
            let stopTimeoutInterval = function (): void {
                if (!timeoutInterval) {
                    return;
                }

                clearTimeout(timeoutInterval);
                timeoutInterval = undefined;
            };

            client.connect(port + 123, ip,
                function () {
                    timeoutInterval = setTimeout(timeoutErrorListener, timeout);

                    try {
                        client.send(socketRequestTag);
                    } catch (e) {
                        errorListener();
                    }
                }
            );

            client.on(`message`, messageListener);
            client.on(`error`, errorListener);
        }
    );
}