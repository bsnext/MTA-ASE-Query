"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerInfo = void 0;
const dgram = require("dgram");
const buffer_1 = require("buffer");
const socketRequestTag = buffer_1.Buffer.from(`s`);
const socketResponseTag = `EYE1`;
const socketResponseGame = `mta`;
const socketTimeout = 7500;
;
let ord = function (char) {
    let ch = char.charCodeAt(0);
    if (ch > 0xFF) {
        ch -= 0x350;
    }
    ;
    return ch;
};
function getServerInfo(ip, port) {
    return new Promise(function (resolve, reject) {
        if ((port < 1) || (port > 65535)) {
            resolve(false);
            return;
        }
        ;
        let client = dgram.createSocket('udp4');
        let messageListener = function (receiveData) {
            endListenerTask();
            let index = 0;
            let receiveTag = receiveData.subarray(index, index += 4).toString('utf-8');
            if (receiveTag != socketResponseTag) {
                resolve(false);
                return;
            }
            ;
            let dataLength, data;
            let info = [];
            for (let i = 0; i < 9; i++) {
                dataLength = ord(receiveData.subarray(index, index += 1).toString('utf-8'));
                data = receiveData.subarray(index, (index += (dataLength - 1))).toString('utf-8');
                info[i] = data;
            }
            ;
            let returnTable = {
                name: info[2],
                gamemode: info[3],
                map: info[4],
                version: info[5],
                private: info[6] == `1`,
                players: parseInt(info[7]),
                max_players: parseInt(info[8])
            };
            if (info[0] != socketResponseGame) {
                resolve(false);
                return;
            }
            ;
            resolve(returnTable);
        };
        let errorListener = function () {
            endListenerTask();
            resolve(false);
        };
        let endListenerTask = function () {
            client.close();
            client.removeListener('message', messageListener);
            client.removeListener('error', errorListener);
            stopTimeoutInterval();
        };
        let timeoutInterval;
        let stopTimeoutInterval = function () {
            if (!timeoutInterval) {
                return;
            }
            ;
            clearTimeout(timeoutInterval);
            timeoutInterval = undefined;
        };
        client.connect(port + 123, ip, function () {
            timeoutInterval = setTimeout(errorListener, socketTimeout);
            try {
                client.send(socketRequestTag, function () {
                    client.on('message', messageListener);
                });
            }
            catch (e) {
                errorListener();
            }
            ;
        });
        client.on('error', errorListener);
    });
}
exports.getServerInfo = getServerInfo;
;
//# sourceMappingURL=index.js.map