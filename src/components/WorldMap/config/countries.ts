/* Import types. */
import {TypeShowBoundingBox} from "../types/types";

/* Crop bounding box. */
export const countryCropBoundingBox: Record<string, TypeShowBoundingBox> = {

    /* Zoom bounding box for france. */
    fr: [
        [-5, 40], /* longitude and latitude min. */
        [10, 52]  /* longitude and latitude max. */
    ],

    /* Zoom bounding box for the United States. */
    us: [
        [-180, 24], /* longitude and latitude min. */
        [-66, 72]  /* longitude and latitude max. */
    ],
}
