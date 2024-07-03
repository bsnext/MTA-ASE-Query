export declare interface MTAServerResponse {
    name: string;
    gamemode: string;
    map: string;
    version: string;
    private: boolean;
    players: number;
    max_players: number;
}
export declare function getServerInfo(ip: string, port: number, timeout?: number): Promise<MTAServerResponse>;
