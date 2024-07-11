export interface MTAServerResponse {
    name: string;
    ip: string;
    port: number;
    gamemode: string;
    map: string;
    version: string;
    private: boolean;
    players: number;
    max_players: number;
    rules: MTAServerResponseRule[];
    players_list: MTAServerResponsePlayer[];
}
export interface MTAServerResponseLite {
    name: string;
    ip: string;
    port: number;
    version: string;
    private: boolean;
    players: number;
    max_players: number;
}
export interface MTAServerResponseRule {
    name: string;
    value: string;
}
export interface MTAServerResponsePlayer {
    name: string;
    ping: number;
    score: number;
}
export declare function getServerInfo(ip: string, port: number, timeout?: number): Promise<MTAServerResponse>;
export declare function getServers(): Promise<MTAServerResponseLite[]>;
