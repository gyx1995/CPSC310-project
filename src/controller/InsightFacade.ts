import JSZip = require("jszip");
import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightResponse} from "./IInsightFacade";

/**
 * This is the main programmatic entry point for the project.
 */
export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<InsightResponse> {
        const p = unzip(content);
       // Log.trace("here");
        if (p) {
            return Promise.resolve({code: 204, body: null});
        }
        return Promise.reject({code: 404, body: null});
    }

    public removeDataset(id: string): Promise<InsightResponse> {
        return Promise.reject({code: -1, body: null});
    }

    public performQuery(query: any): Promise <InsightResponse> {
        return Promise.reject({code: -1, body: null});
    }

    public listDatasets(): Promise<InsightResponse> {
        return Promise.reject({code: -1, body: null});
    }
}

function unzip(content: string): Promise<boolean> {
    const myZip = new JSZip();
    let jsonFile: any;
    const list: string[] = [] ;
    return myZip.loadAsync(content, {base64: true})
        .then(function (zip: JSZip) {
            // Log.trace(zip.toString());
            zip.forEach(function (path, file) {
                file.async("text")
                    .then(function (fileData) {
                        // Log.trace(path);
                       // Log.trace(fileData);
                        try {
                            jsonFile = JSON.parse(fileData);
                            // Log.trace(jsonFile);
                            // Log.trace(jsonFile.result.toString().split(",");
                        } catch (err) {
                            // Log.trace(path);
                            throw err;
                        }
                        // jsonFile.async("text")
                        //     .then(function () {
                        //        // Log.trace(jsonFile.result["Title"]);
                        //     });
                        // if (jsonFile !== undefined && jsonFile.result === undefined) {
                        //     Log.trace("valid JSON but no results");
                        //     throw {message: "invalid dataset"};
                        // }
                        // if (jsonFile !== undefined) {
                        //     list.push("courses_title:");
                        //     list.push(jsonFile.Title);
                        // }
                    });
                // Log.trace(jsonFile.result);
                // Log.trace(path);
            });
            return true;
        })
        .catch(function (err: Error) {
            Log.trace("invalid zip file format");
            return false;
        });
}
