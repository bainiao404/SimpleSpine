import type { IAnimationState, IAnimationStateData } from './core/IAnimation';
import type { ISkeleton, ISkeletonData } from './core/ISkeleton';
import type { SpineBase } from './SpineBase';
/**
 * Make a class that extends from this interface to create your own debug renderer.
 * @public
 */
export interface ISpineDebugRenderer {
    /**
     * This will be called every frame, after the spine has been updated.
     */
    renderDebug(spine: SpineBase<ISkeleton, ISkeletonData, IAnimationState, IAnimationStateData>): void;
    /**
     *  This is called when the `spine.debug` object is set to null or when the spine is destroyed.
     */
    unregisterSpine(spine: SpineBase<ISkeleton, ISkeletonData, IAnimationState, IAnimationStateData>): void;
    /**
     * This is called when the `spine.debug` object is set to a new instance of a debug renderer.
     */
    registerSpine(spine: SpineBase<ISkeleton, ISkeletonData, IAnimationState, IAnimationStateData>): void;
}
/**
 * This is a debug renderer that uses PixiJS Graphics under the hood.
 * @public
 */
export declare class SpineDebugRenderer implements ISpineDebugRenderer {
    private registeredSpines;
    drawDebug: boolean;
    drawMeshHull: boolean;
    drawMeshTriangles: boolean;
    drawBones: boolean;
    drawPaths: boolean;
    drawBoundingBoxes: boolean;
    drawClipping: boolean;
    drawRegionAttachments: boolean;
    lineWidth: number;
    regionAttachmentsColor: number;
    meshHullColor: number;
    meshTrianglesColor: number;
    clippingPolygonColor: number;
    boundingBoxesRectColor: number;
    boundingBoxesPolygonColor: number;
    boundingBoxesCircleColor: number;
    pathsCurveColor: number;
    pathsLineColor: number;
    skeletonXYColor: number;
    bonesColor: number;
    /**
     * The debug is attached by force to each spine object. So we need to create it inside the spine when we get the first update
     */
    registerSpine(spine: SpineBase<ISkeleton, ISkeletonData, IAnimationState, IAnimationStateData>): void;
    renderDebug(spine: SpineBase<ISkeleton, ISkeletonData, IAnimationState, IAnimationStateData>): void;
    private drawBonesFunc;
    private drawRegionAttachmentsFunc;
    private drawMeshHullAndMeshTriangles;
    private drawClippingFunc;
    private drawBoundingBoxesFunc;
    private drawPathsFunc;
    unregisterSpine(spine: SpineBase<ISkeleton, ISkeletonData, IAnimationState, IAnimationStateData>): void;
}
