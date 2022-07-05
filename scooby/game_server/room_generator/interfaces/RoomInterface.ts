import DoorInterface from "./DoorInterface";
import EnemyInterface from "./EnemyInterface";
import RoomColliderInterface from "./RoomColliderInterface";
import TileInterface from "./TileInterface";
import WallInterface from "./WallInterface";

export default interface LevelInterface {
    id: string;
    tiles: TileInterface[];
    walls: WallInterface[];
    doors: DoorInterface[];
    roomCollider: RoomColliderInterface[];
    enemies: EnemyInterface[];
    roomType: string;
};