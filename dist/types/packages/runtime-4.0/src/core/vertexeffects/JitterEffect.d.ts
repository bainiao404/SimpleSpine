import type { VertexEffect } from '../VertexEffect';
import type { Skeleton } from '../Skeleton';
import { Color, Vector2 } from '@pixi-spine/base';
/**
 * @public
 */
export declare class JitterEffect implements VertexEffect {
    jitterX: number;
    jitterY: number;
    constructor(jitterX: number, jitterY: number);
    begin(skeleton: Skeleton): void;
    transform(position: Vector2, uv: Vector2, light: Color, dark: Color): void;
    end(): void;
}
