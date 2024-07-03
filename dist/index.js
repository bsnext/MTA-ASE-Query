"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerInfo = void 0;
const dgram = require("dgram");
const buffer_1 = require("buffer");
const socketRequestTag = buffer_1.Buffer.from(`s`);
const socketResponseTag = buffer_1.Buffer.from(`EYE1`);
const socketResponseGame = buffer_1.Buffer.from(`mta`);
const socketTimeout = 7500;
function getServerInfo(ip, port, timeout = socketTimeout) {
    return new Promise(function (resolve, reject) {
        if ((port < 1) || (port > 65412)) {
            reject(`Invalid port, should be > 0 and < 65413`);
            return;
        }
        let client = dgram.createSocket(`udp4`);
        let messageListener = function (receiveData) {
            endListenerTask();
            let index = 0;
            let receiveTag = receiveData.subarray(index, index += 4);
            if (!socketResponseTag.equals(receiveTag)) {
                reject(`Invalid query tag in response`);
                return;
            }
            let dataLength, data;
            let info = [];
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
            let returnTable = {
                name: info[1],
                gamemode: info[2],
                map: info[3],
                version: info[4],
                private: info[5] === `1`,
                players: parseInt(info[6]),
                max_players: parseInt(info[7])
            };
            resolve(returnTable);
        };
        let errorListener = function () {
            endListenerTask();
            reject(`Socket error`);
        };
        let timeoutErrorListener = function () {
            endListenerTask();
            reject(`Request is timed out`);
        };
        let endListenerTask = function () {
            client.close();
            client.removeListener(`message`, messageListener);
            client.removeListener(`error`, errorListener);
            client.unref();
            stopTimeoutInterval();
        };
        let timeoutInterval;
        let stopTimeoutInterval = function () {
            if (!timeoutInterval) {
                return;
            }
            clearTimeout(timeoutInterval);
            timeoutInterval = undefined;
        };
        client.connect(port + 123, ip, function () {
            timeoutInterval = setTimeout(timeoutErrorListener, timeout);
            try {
                client.send(socketRequestTag);
            }
            catch (e) {
                errorListener();
            }
        });
        client.on(`message`, messageListener);
        client.on(`error`, errorListener);
    });
}
exports.getServerInfo = getServerInfo;
//# sourceMappingURL=index.js.map