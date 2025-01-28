/* Import types. */
import {TypeCropBoundingBox, TypeZoomGapBoundingBoxFactor} from "../types/types";

/* Crop bounding box. */
export const countryCropBoundingBox: Record<string, TypeCropBoundingBox> = {

    /* Zoom bounding box for France. */
    fr: [
        [-5, 40], /* longitude and latitude min. */
        [10, 52]  /* longitude and latitude max. */
    ],

    /* Zoom bounding box for the Netherlands. */
    nl: [
        [3, 50], /* longitude and latitude min. */
        [8, 54]  /* longitude and latitude max. */
    ],

    /* Zoom bounding box for the United States. */
    us: [
        [-180, 24], /* longitude and latitude min. */
        [-66, 72]  /* longitude and latitude max. */
    ],
}

/* Zoom bounding box gap. */
export const zoomGapBoundingBoxFactor: Record<string, TypeZoomGapBoundingBoxFactor> = {

    /* Zoom bounding box for Andorra. */
    ad: [20., 20.],

    /* Zoom bounding box for Belgium */
    be: [1., 1.],

    /* Zoom bounding box for Czechia */
    cz: [.5, .5],

    /* Zoom bounding box for Liechtenstein. */
    li: [20., 20.],

    /* Zoom bounding box for Luxemburg. */
    lu: [10., 10.],

    /* Zoom bounding box for Monaco. */
    mc: [80., 80.],

    /* Zoom bounding box for the Netherlands. */
    nl: [.4, .4],

    /* Zoom bounding box for San Marino. */
    sm: [40., 40.]
}
