/**
 * @public
 */
export declare enum SPINE_VERSION {
    UNKNOWN = 0,
    VER37 = 37,
    VER38 = 38,
    VER40 = 40,
    VER41 = 41,
    VER42 = 42
}
/**
 * @public
 */
export declare function detectSpineVersion(version: string): SPINE_VERSION;
