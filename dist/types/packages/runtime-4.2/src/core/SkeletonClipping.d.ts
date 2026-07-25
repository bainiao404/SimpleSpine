import { ClippingAttachment } from './attachments';
import { Slot } from './Slot.js';
import { Color, NumberArrayLike } from '@pixi-spine/base';
/**
 * @public
 */
export declare class SkeletonClipping {
    private triangulator;
    private clippingPolygon;
    private clipOutput;
    clippedVertices: number[];
    clippedUVs: number[];
    clippedTriangles: number[];
    private scratch;
    private clipAttachment;
    private clippingPolygons;
    clipStart(slot: Slot, clip: ClippingAttachment): number;
    clipEndWithSlot(slot: Slot): void;
    clipEnd(): void;
    isClipping(): boolean;
    /**
     * @deprecated Use clipTriangles without verticesLength parameter. Mark for removal in 4.3.
     */
    clipTriangles(vertices: NumberArrayLike, verticesLength: number, triangles: NumberArrayLike, trianglesLength: number): void;
    /**
     * @deprecated Use clipTriangles without verticesLength parameter. Mark for removal in 4.3.
     */
    clipTriangles(vertices: NumberArrayLike, verticesLength: number, triangles: NumberArrayLike, trianglesLength: number, uvs: NumberArrayLike, light: Color, dark: Color, twoColor: boolean): void;
    clipTriangles(vertices: NumberArrayLike, triangles: NumberArrayLike, trianglesLength: number): void;
    clipTriangles(vertices: NumberArrayLike, triangles: NumberArrayLike, trianglesLength: number, uvs: NumberArrayLike, light: Color, dark: Color, twoColor: boolean): void;
    private clipTrianglesNoRender;
    private clipTrianglesRender;
    clipTrianglesUnpacked(vertices: NumberArrayLike, triangles: NumberArrayLike, trianglesLength: number, uvs: NumberArrayLike): void;
    /** Clips the input triangle against the convex, clockwise clipping area. If the triangle lies entirely within the clipping
     * area, false is returned. The clipping area must duplicate the first vertex at the end of the vertices list. */
    clip(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, clippingArea: Array<number>, output: Array<number>): boolean;
    static makeClockwise(polygon: NumberArrayLike): void;
}
