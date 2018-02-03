import {Icourses} from "./courses";
import {InsightDatasetKind} from "./IInsightFacade";

export interface Idataset {
    kind: InsightDatasetKind;
    content: Icourses[];
}

export interface Idatasets {
    [id: string]: Idataset;
}
