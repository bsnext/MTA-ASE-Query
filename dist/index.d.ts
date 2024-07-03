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
export declare function getServerInfo(ip: string, port: number, timeout?: number): Promise<MTAServerResponse>;
