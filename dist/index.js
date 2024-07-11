"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServers = exports.getServerInfo = void 0;
const dgram = require("node:dgram");
const https = require("node:https");
const node_buffer_1 = require("node:buffer");
const socketRequestTag = node_buffer_1.Buffer.from(`s`);
const socketResponseTag = node_buffer_1.Buffer.from(`EYE1`);
const socketResponseGame = node_buffer_1.Buffer.from(`mta`);
const endServerInfoSuffix = node_buffer_1.Buffer.from([0x01]);
const startPlayerInfoPrefix = node_buffer_1.Buffer.from([0x00 | 0x01 | 0x02 | 0x04 | 0x08 | 0x16 | 0x32]);
const socketTimeout = 7500;
const utf8Decoder = new TextDecoder('utf-8');
const fixEncodedText = function (str) {
    const bytes = new Uint8Array([...str].map(char => char.charCodeAt(0)));
    return utf8Decoder.decode(bytes);
};
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
            let rules = [];
            let players_list = [];
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
                rules.push({
                    name: ruleName,
                    value: ruleValue
                });
            }
            index += 1;
            while (startPlayerInfoPrefix.equals(receiveData.subarray(index, (index += 1)))) {
                dataLength = receiveData.subarray(index, index += 1).readUint8();
                let playerName = receiveData.subarray(index, (index += (dataLength - 1))).toString('utf-8');
                index += 1;
                index += 1;
                dataLength = receiveData.subarray(index, index += 1).readUint8();
                let playerScore = receiveData.subarray(index, (index += (dataLength - 1))).toString('utf-8');
                dataLength = receiveData.subarray(index, index += 1).readUint8();
                let playerPing = receiveData.subarray(index, (index += (dataLength - 1))).toString('utf-8');
                index += 1;
                players_list.push({
                    name: playerName,
                    ping: parseInt(playerPing) || 0,
                    score: parseInt(playerScore) || 0
                });
            }
            let returnTable = {
                ip: ip,
                port: port,
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
function getServers() {
    return new Promise(async function (resolve, reject) {
        https.get(`https://mtasa.com/api/`, function (socket) {
            let receiveDataStr = ``;
            socket.on(`data`, function (chunk) {
                receiveDataStr += chunk;
            });
            socket.on(`end`, function () {
                try {
                    const unfilteredServers = JSON.parse(receiveDataStr);
                    const filteredServers = [];
                    for (let i = 0; i < unfilteredServers.length; i++) {
                        const serverInfo = unfilteredServers[i];
                        filteredServers.push({
                            ip: serverInfo.ip,
                            max_players: serverInfo.maxplayers,
                            name: fixEncodedText(serverInfo.name),
                            players: serverInfo.players,
                            port: serverInfo.port,
                            version: serverInfo.version,
                            private: serverInfo.password === 1
                        });
                    }
                    resolve(filteredServers);
                }
                catch (e) {
                    return reject(`Error parsing servers list`);
                }
            });
        }).on(`error`, function () {
            return reject(`Error request servers list`);
        });
    });
}
exports.getServers = getServers;
//# sourceMappingURL=index.js.map