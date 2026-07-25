/**
 * @public
 */
export declare const settings: {
    yDown: boolean;
    /**
     * pixi-spine gives option to not fail at certain parsing errors
     * spine-ts fails here
     */
    FAIL_ON_NON_EXISTING_SKIN: boolean;
    /**
     * past Spine.globalAutoUpdate
     */
    GLOBAL_AUTO_UPDATE: boolean;
    /**
     * past Spine.globalDelayLimit
     */
    GLOBAL_DELAY_LIMIT: number;
};
