/**
 * TypeScript declaration file to include proj4 in Typescript
 */
declare module 'proj4' {
    import { TypePoint } from "./types";

    type TemplateCoordinates = TypePoint | [number, number, number] | [number, number, number, number];

    interface ProjectionDefinition {
        title?: string;
        projName?: string;
        ellps?: string;
        datum?: string;
        a?: number;
        b?: number;
        rf?: number;
        lat0?: number;
        lat1?: number;
        lat2?: number;
        lat_ts?: number;
        lon0?: number;
        alpha?: number;
        k0?: number;
        x0?: number;
        y0?: number;
        long0?: number;
        long1?: number;
        long2?: number;
        lat0?: number;
        datum_params?: number[];
        to_meter?: number;
        from_greenwich?: number;
        units?: string;
        datumCode?: string;
        axis?: string;
    }

    interface WGS84 {
        forward(coordinates: TemplateCoordinates): TemplateCoordinates;
        inverse(coordinates: TemplateCoordinates): TemplateCoordinates;
    }

    interface Proj4 {
        (fromProjection: string | ProjectionDefinition, toProjection?: string | ProjectionDefinition, coordinates?: TemplateCoordinates): TemplateCoordinates;
        Proj: (srsCode: string | ProjectionDefinition) => void;
        WGS84: WGS84;
        defaultDatum: string;
        transform: (source: ProjectionDefinition, dest: ProjectionDefinition, point: TemplateCoordinates) => TemplateCoordinates;
        mgrs: any;
        version: string;
        convert(proj4326: string, proj3857: string, coords: TypePoint): TypePoint;
    }

    const proj4: Proj4;
    export default proj4;
}