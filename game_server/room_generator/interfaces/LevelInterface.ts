import Room from "../class/Room";
import DoorInterface from "./DoorInterface";
import RoomColliderInterface from "./RoomColliderInterface";
import TileInterface from "./TileInterface";
import WallInterface from "./WallInterface";

export default interface LevelInterface {
    tiles: TileInterface[];
    walls: WallInterface[];
    doors: DoorInterface[];
    levelDesign: Room[][];
    roomCollider: RoomColliderInterface[];
};