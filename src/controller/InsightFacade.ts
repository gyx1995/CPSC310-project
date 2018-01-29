import fs = require("fs");
import JSZip = require("jszip");
import Log from "../Util";
import {Icourses} from "./courses";
import {Idatasets} from "./dataset";
import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightResponse} from "./IInsightFacade";

/**
 * This is the main programmatic entry point for the project.
 */

export default class InsightFacade implements IInsightFacade {

       private dataset: Idatasets = {};
    // private dataset: Icourses = {};

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<InsightResponse> {
        const p = unzip(content, id);
       // Log.trace("here");
        if (p) {
            return Promise.resolve({code: 204, body: null});
        }
        return Promise.reject({code: 400, body: null});
    }

    public removeDataset(id: string): Promise<InsightResponse> {
            Log.trace("start remove");
            deleteArray(id);
            Log.trace("array cleared");
            return new Promise (function (resolve, reject) {
                Log.trace("promise");
                fs.unlink("./test/data/" + id, (err) => {
                    if (err) {
                        reject({code: 404, body: null});
                        Log.trace("data no found");
                    } else {
                        resolve({code: 204, body: null});
                        Log.trace("delete successfully");
                    }
               });
           });
    }

    public performQuery(query: any): Promise <InsightResponse> {
        return Promise.reject({code: -1, body: null});
    }

    public listDatasets(): Promise<InsightResponse> {
        return Promise.reject({code: -1, body: null});
    }
}

function deleteArray(id: string) {
    delete this.dataset[id];
}

function unzip(content: string, id: string): Promise<boolean> {
    const myZip = new JSZip();
    let jsonFile: any;
    return myZip.loadAsync(content, {base64: true})
        .then(function (zip: JSZip) {
            // Log.trace(zip.toString());
            const parray = Array() as any[];
            const array = Array() as any[];
            zip.forEach(function (path, file) {
                const p = file.async("text")
                    .then(function (fileData) {
                        // Log.trace(path);
                       // Log.trace(fileData);
                        try {
                            jsonFile = JSON.parse(fileData);
                            // Log.trace(jsonFile);
                            // Log.trace(jsonFile.result.toString().split(",");
                            for (const element of jsonFile.result) {
                                const c: Icourses = {courses_dept : "", courses_id : "",
                                    courses_avg : 0, courses_instructor : "",
                                    courses_title : "", courses_pass : 0, courses_fail : 0,
                                    courses_audit : 0, courses_uuid : "" };
                                c.courses_dept = element["Subject"];
                                c.courses_id = element["Course"];
                                c.courses_avg = element["Avg"];
                                c.courses_instructor = element["Professor"];
                                c.courses_title = element["Title"];
                                c.courses_pass = element["Pass"];
                                c.courses_fail = element["Fail"];
                                c.courses_audit = element["Audit"];
                                c.courses_uuid = element["id"];
                                if (c.courses_dept !== undefined &&
                                    c.courses_id !== undefined &&
                                    c.courses_avg !== undefined &&
                                    c.courses_instructor !== undefined &&
                                    c.courses_title !== undefined &&
                                    c.courses_pass !== undefined &&
                                    c.courses_fail !== undefined &&
                                    c.courses_audit !== undefined &&
                                    c.courses_uuid !== undefined) {
                                    array.push(c);
                                }
                            }
                        } catch (err) {
                            Log.trace(err);
                            return false;
                            }
                    });
                parray.push(p);
            });
            Promise.all(parray)
                .then(function () {
                if (fs.existsSync("./test/data/" + id)) {
                    Log.trace("exitst");
                    return false;
                }
                Log.trace("start writing");
                Log.trace(array.length.toString());
                fs.writeFileSync("./test/data/" + id , JSON.stringify(array));
                this.dataset[id] = array;
                Log.trace(this.dataset.length);
                Log.trace("file wrote");
                return true;
            }).catch(function (err: Error) {
                Log.error(err.message);
                return false;
            });
            return true;
        })
        .catch(function (err: Error) {
            Log.trace("invalid zip file format");
            return false;
        });
}
