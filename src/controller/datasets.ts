import {Icourses} from "./courses";
import {InsightDatasetKind} from "./IInsightFacade";

export interface Idatasets {
    kind: InsightDatasetKind;
    content: Icourses[];
}
