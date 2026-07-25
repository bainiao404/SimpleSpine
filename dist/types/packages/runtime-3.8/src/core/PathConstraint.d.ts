import { PathAttachment } from "./attachments";
import { Updatable } from "./Updatable";
import { PathConstraintData } from "./PathConstraintData";
import { Bone } from "./Bone";
import { Slot } from "./Slot";
import { Skeleton } from "./Skeleton";
/**
 * @public
 */
export declare class PathConstraint implements Updatable {
    static NONE: number;
    static BEFORE: number;
    static AFTER: number;
    static epsilon: number;
    data: PathConstraintData;
    bones: Array<Bone>;
    target: Slot;
    position: number;
    spacing: number;
    rotateMix: number;
    translateMix: number;
    spaces: number[];
    positions: number[];
    world: number[];
    curves: number[];
    lengths: number[];
    segments: number[];
    active: boolean;
    constructor(data: PathConstraintData, skeleton: Skeleton);
    isActive(): boolean;
    apply(): void;
    update(): void;
    computeWorldPositions(path: PathAttachment, spacesCount: number, tangents: boolean, percentPosition: boolean, percentSpacing: boolean): number[];
    addBeforePosition(p: number, temp: Array<number>, i: number, out: Array<number>, o: number): void;
    addAfterPosition(p: number, temp: Array<number>, i: number, out: Array<number>, o: number): void;
    addCurvePosition(p: number, x1: number, y1: number, cx1: number, cy1: number, cx2: number, cy2: number, x2: number, y2: number, out: Array<number>, o: number, tangents: boolean): void;
}
