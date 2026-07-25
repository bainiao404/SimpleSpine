import { NumberArrayLike } from '@pixi-spine/base';
/**
 * @public
 * */
export declare class Triangulator {
    private convexPolygons;
    private convexPolygonsIndices;
    private indicesArray;
    private isConcaveArray;
    private triangles;
    private polygonPool;
    private polygonIndicesPool;
    triangulate(verticesArray: NumberArrayLike): Array<number>;
    decompose(verticesArray: Array<number>, triangles: Array<number>): Array<Array<number>>;
    private static isConcave;
    private static positiveArea;
    private static winding;
}
