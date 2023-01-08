
import * as dgram from "dgram";
import { Buffer } from "buffer";

////////////////////////////////

const socketRequestTag: Buffer = Buffer.from(`s`);
const socketResponseTag: string = `EYE1`;
const socketResponseGame: string = `mta`;

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

let ord = function (char: string): number {
    let ch: number = char.charCodeAt(0);

    if (ch > 0xFF) {
        ch -= 0x350;
    }

    return ch;
}

export function getServerInfo(ip: string, port: number): Promise<MTAServerResponse | false> {
    return new Promise(
        function (resolve, reject) {
            if ((port < 1) || (port > 65535)) {
                resolve(false);
                return;
            }

            let client = dgram.createSocket(`udp4`);

            let messageListener = function (receiveData): void {
                endListenerTask();

                let index: number = 0;
                let receiveTag: string = receiveData.subarray(index, index += 4).toString(`utf-8`);

                if (receiveTag != socketResponseTag) {
                    resolve(false);
                    return;
                }

                let dataLength: number, data: string;
                let info: Array<string> = [];

                for (let i = 0; i < 9; i++) {
                    dataLength = ord(receiveData.subarray(index, index += 1).toString(`utf-8`));
                    data = receiveData.subarray(index, (index += (dataLength - 1))).toString(`utf-8`);
                    info[i] = data;
                }

                let returnTable: MTAServerResponse = {
                    name: info[2],
                    gamemode: info[3],
                    map: info[4],
                    version: info[5],
                    private: info[6] == `1`,
                    players: parseInt(info[7]),
                    max_players: parseInt(info[8])
                }

                if (info[0] != socketResponseGame) {
                    resolve(false);
                    return;
                }

                resolve(returnTable);
            }

            let errorListener = function (): void {
                endListenerTask();
                resolve(false);
            }

            let endListenerTask = function (): void {
                client.close();

                client.removeListener(`message`, messageListener);
                client.removeListener(`error`, errorListener);

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
                    timeoutInterval = setTimeout(errorListener, socketTimeout);

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