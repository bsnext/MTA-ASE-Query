
import * as dgram from "dgram";
import { Buffer } from "buffer";

////////////////////////////////

const socketRequestTag: Buffer = Buffer.from(`s`);
const socketResponseTag: Buffer = Buffer.from(`EYE1`);
const socketResponseGame: Buffer = Buffer.from(`mta`);

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

                let returnTable: MTAServerResponse = {
                    name: info[1],
                    gamemode: info[2],
                    map: info[3],
                    version: info[4],
                    private: info[5] === `1`,
                    players: parseInt(info[6]),
                    max_players: parseInt(info[7])
                }

                resolve(returnTable);
            }

            let errorListener = function (): void {
                endListenerTask();
                reject(`Socket error`);
            }

            let timeoutErrorListener = function (): void {
                endListenerTask();
                reject(`Request is timed out`);
            }

            let endListenerTask = function (): void {
                client.close();
                client.removeListener(`message`, messageListener);
                client.removeListener(`error`, errorListener);
                client.unref();

                stopTimeoutInterval();
            }

            let timeoutInterval: NodeJS.Timeout | undefined;
            let stopTimeoutInterval = function (): void {
                if (!timeoutInterval) {
                    return;
                }

                clearTimeout(timeoutInterval);
                timeoutInterval = undefined;
            }            

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