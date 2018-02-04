import fs = require("fs");
import JSZip = require("jszip");
import DoQuery from "../controller/DoQuery";
import Log from "../Util";
import {Icourses} from "./courses";
import {Idatasets} from "./datasets";
import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightResponse} from "./IInsightFacade";

/**
 * This is the main programmatic entry point for the project.
 */
export default class InsightFacade implements IInsightFacade {
    // private static doQuery = new DoQuery();
    // private dataset: Idataset = {};
    private datasets: Idatasets;

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
        this.datasets = {};
        this.datasets["A"] = {kind: InsightDatasetKind.Courses, content: []};
    }
    public getDataset(id: string): any {
        // const that = this;
        const that = this;
        Log.trace("1000");
        Log.trace(that.datasets["courses"].content[0].courses_title);
        Log.trace("hi");
        return that.datasets[id].content;
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<InsightResponse> {
        const that = this;
        return new Promise<InsightResponse>((resolve, reject) => {
            that.unzip(content, id).then((ok) => {
                if (ok) {
                    // Log.trace("1");
                    resolve({code: 204, body: {result: ""}});
                } else {
                    // Log.trace("2");
                    reject({code: 400, body: {error: "my text"}});
                }
            });
        });
    }
    public removeDataset(id: string): Promise<InsightResponse> {
        Log.trace("start remove");
        this.deleteArray(id);
        Log.trace("array cleared");
        return new Promise(function (resolve, reject) {
            Log.trace("promise");
            fs.unlink("./test/data/" + id, (err) => {
                if (err) {
                    reject({code: 404, body: {result: ""}});
                    Log.trace("data no found");
                } else {
                    resolve({code: 204, body: {error: "my text"}});
                    Log.trace("delete successfully");
                }
            });
        });
    }
    public performQuery(query: any): Promise <InsightResponse> {
        Log.trace("0");
        const doQuery = new DoQuery(this.getDataset("courses"));
        Log.trace("1");
        return new Promise(function (fulfill, reject) {
            try {
                Log.trace("2");
                const isValid = doQuery.isValid(query);
                Log.trace("3");
                if (isValid === 200) {
                    Log.trace("4");
                    doQuery.query(query).then(function (result) {
                        Log.trace("valid");
                        fulfill({code: 200, body: {result}});
                    }).catch(function (err) {
                         reject({code: 400, body: {error: err}});
                     });
                 } else {
                    Log.trace("5");
                    Log.trace(" else invalid");
                    reject({code: 400, body: {error: "invalid 400 query"}});
                 }
            } catch (err) {
                Log.error("Query - ERROR: " + err);
                reject({code: 400, body: {error: err.message}});
            }
            // reject({code: 400, body: {error: ""}});
        });
    }

    public listDatasets(): Promise<InsightResponse> {
        const that = this;
        return new Promise<InsightResponse>(function (resolve, reject) {
            const ld: InsightDataset[] = new Array();
            for (const key of Object.keys(that.datasets)) {
                const iddd: string = key;
                const kinddd: InsightDatasetKind = that.datasets[key].kind;
                const num: number = that.datasets[key].content.length;
                ld.push({id: iddd, kind: kinddd , numRows: num});
            }
            resolve({code: 200, body: {result: ld}});
        });
    }

    private deleteArray(id: string) {
        delete this.datasets[id];
    }
    private unzip(content: string, id: string): Promise<boolean> {
        const that = this;
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
                                    const c: Icourses = {
                                        courses_dept: "", courses_id: "",
                                        courses_avg: 0, courses_instructor: "",
                                        courses_title: "", courses_pass: 0, courses_fail: 0,
                                        courses_audit: 0, courses_uuid: "",
                                    };
                                    c.courses_dept = element["Subject"];
                                    c.courses_id = element["Course"];
                                    c.courses_avg = element["Avg"];
                                    c.courses_instructor = element["Professor"];
                                    c.courses_title = element["Title"];
                                    c.courses_pass = element["Pass"];
                                    c.courses_fail = element["Fail"];
                                    c.courses_audit = element["Audit"];
                                    c.courses_uuid = element["id"].toString();
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
                                if (array.length === 0) {
                                    return false;
                                }
                            } catch (err) {
                                Log.trace(err);
                                return false;
                            }
                        });
                    parray.push(p);
                });
                return Promise.all(parray)
                    .then(function () {
                        if (fs.existsSync("./test/data/" + id)) {
                            // Log.trace("exist");
                            return false;
                        }
                        Log.trace("start writing");
                        Log.trace(array.length.toString());
                        const exists = that.datasets[id] !== undefined ? true : false;
                        if (exists === true) {
                            Log.trace("exist in datasets");
                            return false;
                        } else {
                            that.datasets[id] = {kind : InsightDatasetKind.Courses, content : []};
                            Log.trace(id);
                            fs.writeFileSync("./test/data/" + id, JSON.stringify(array));
                            that.datasets[id].content = array;
                            Log.trace(that.datasets["courses"].content[0].courses_title);
                            Log.trace("file wrote");
                            return true;
                        }
                    }).catch(function (err: Error) {
                        Log.error(err.message);
                        return false;
                    });
                // return true;
            })
            .catch(function (err: Error) {
                Log.trace("invalid zip file format");
                return false;
            });
    }
}
