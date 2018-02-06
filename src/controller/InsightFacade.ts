import fs = require("fs");
import JSZip = require("jszip");
import {isNumber, isString} from "util";
import DoQuery from "../controller/DoQuery";
import Log from "../Util";
import {Icourses} from "./courses";
import {Idatasets} from "./datasets";
// import {publicDecrypt} from "crypto";
// import TestUtil from "../../test/TestUtil";
// import {expect} from "chai";
import {IQueryRequest} from "./DoQuery";
import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightResponse} from "./IInsightFacade";

/**
 * This is the main programmatic entry point for the project.
 */
export default class InsightFacade implements IInsightFacade {
    // private static doQuery = new DoQuery();
    // private dataset: Idataset = {};
    private datasets: Idatasets;
    private coursekey: any = ["courses_dept", "courses_id"
        , "courses_avg", "courses_instructor"
        , "courses_title" , "courses_pass"
        , "courses_fail" , "courses_audit"
        , "courses_uuid"];
    private courseNkey: any = [
        "courses_avg",  "courses_pass"
        , "courses_fail" , "courses_audit"];
    private courseSkey: any = ["courses_dept", "courses_id"
        , "courses_title", "courses_uuid" , "courses_instructor"];

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
            fs.unlink("./test/unzipData/" + id + ".json", (err) => {
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

    public performQuery(query: any): Promise<InsightResponse> {
        Log.trace("0");
        ////////////////
        // this.loadData();
        ///////////////
        /////////////////////////
        // const doQuery = new DoQuery(this);
        const that = this;
        ////////////////////////
        Log.trace("1");
        return new Promise(function (fulfill, reject) {
            try {
                Log.trace("2");
                const isValid = that.isValid(query);
                Log.trace("3");
                if (isValid === 200) {
                    Log.trace("4");
                    that.query(query).then(function (result) {
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
                if (num > 0) {
                    ld.push({id: iddd, kind: kinddd, numRows: num});
                }
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
                        if (fs.existsSync("./test/unzipData/" + id)) {
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
                            that.datasets[id] = {kind: InsightDatasetKind.Courses, content: []};
                            Log.trace(id);
                            if (fs.existsSync("./test/unzipData")) {
                                Log.trace("UNZIP");
                                fs.writeFileSync("./test/unzipData/" + id + ".json", JSON.stringify(array));
                            } else {
                                Log.trace("unzip else");
                                fs.mkdirSync("./test/unzipData/");
                                fs.writeFileSync("./test/unzipData/" + id + ".json", JSON.stringify(array));
                            }
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
    ///////////////////////////////////////
    private query(query: IQueryRequest): Promise<any> {
        // Log.trace("Length:" + this.array.length.toString());
        const that: any = this;
        const re: any = [];
        return new Promise(function (fulfill, reject) {
            const where = query["WHERE"];
            // for (const d of result) {
            //     Log.trace(d["courses_avg"]);
            // }
            //////////////////////////////
            const result: any = that.filter(where);
            const array = that.getDataset("courses");
            let c = 0;
            for (let i = 0; i < array.length; i++) {
                if (result[i] === 1 ) {
                    c += 1;
                }
            }
            for (let i = 0; i < array.length; i++) {
                if (result[i] === 1) {
                    re.push(array[i]);
                }
            }
            // for (let i = 0; i < arr.length; i++) {
            //     if (ans[i]) {
            //         re.push(arr[i]);
            //     }
            // }
            Log.trace("after filter and select start");
            const options: any = query["OPTIONS"];
            let finalresult: any = that.select(re, options);
            Log.trace("after select");
            if (c === 0) {
                finalresult = [];
            }
            fulfill(finalresult);
            ///////////////////////////
            // that.filter(where).then(function (result: any) {
            //     Log.trace("filter done");
            //     that.select(result, query["OPTIONS"])
            //         .then(function (result2: any ) {
            //         Log.trace(result2.length.toString());
            //         fulfill(result2);
            //     }).catch(function (err2: any ) {
            //         Log.trace("555");
            //         reject(err2);
            //     });
            // }).catch(function (err: any) {
            //     reject(err);
            // });
        });
    }
    private isValid(query: IQueryRequest): number {
        if (typeof query === "undefined" || query == null || Object.keys(query).length < 0) {
            Log.trace("1");
            return 400;
        }
        if (!("WHERE" in query) || !("OPTIONS" in query)) {
            Log.trace("2");
            return 400;
        }
        const where: any  = query["WHERE"];
        const w = this.condValid(where);
        if ((w !== 200)) {
            return w;
        }
        if ("OPTIONS" in query) {
            const options: any  = query["OPTIONS"];
            if (!("COLUMNS" in options)) {
                return 400;
            }
        }
        const i = this.isKeyValid(query);
        if (i !== 200) {
            return i;
        }
        Log.trace("the query is valid");
        return 200;
    }

    private isKeyValid(query: IQueryRequest): number {
        const options: any = query["OPTIONS"];
        const columns = options["COLUMNS"];
        const order = options["ORDER"];
        Log.trace(order);
        for (const c of columns) {
            if (this.coursekey.indexOf(c) === -1) {
                Log.trace("fals1");
                return 400;
            }
        }
        if ((columns.indexOf(order) === -1)) {
            Log.trace("order key is wrong");
            return 400;
        }
        return 200;
    }
    private condValid(cond: any ): number {
        if (Object.keys(cond).length === 0 ) {
            Log.trace("1");
            return 400;
        } else {
            if ("NOT" in cond) {
                const not = cond["NOT"];
                if (not.length < 1 ) {
                    Log.trace("notNOCondFalse");
                    return 400;
                } else {
                    Log.trace("check not");
                    if ( 400 === this.condValid(not)) {
                        return 400;
                    }
                    Log.trace("check not finished");
                }
            } else if ("AND" in cond) {
                const and = cond["AND"];
                if (and.length < 1 ) {
                    Log.trace("andNOCondFalse");
                    return 400;
                } else {
                    Log.trace("check and");
                    for (const suband of and ) {
                        if ( 400 === this.condValid(suband)) {
                            return 400;
                        }
                    }
                }
            } else if ("OR" in cond) {
                const or = cond["OR"];
                if (or.length < 1  ) {
                    Log.trace("orNOCondFalse");
                    return 400;
                } else {
                    Log.trace("check OR");
                    for (const subor of or) {
                        if ( 400 === this.condValid(subor)) {
                            return 400;
                        }
                    }
                }
            } else if ("EQ" in cond) {
                const a = cond["EQ"];
                const num = Object.keys(a).length;
                if (num !== 1 ) {
                    Log.trace("EQNOCondFalse");
                    return 400;
                }
                if (this.courseNkey.indexOf(Object.keys(a)[0]) === -1) {
                    Log.trace("EQWrongKeyCondFalse");
                    return 400;
                }
                const v = Object.values(a)[0];
                if (!(isNumber(v))) {
                    Log.trace("the value of EQ is not a number");
                    return 400;
                }
            } else if ("LT" in cond) {
                const a = cond["LT"];
                const num = Object.keys(a).length;
                if (num !== 1 ) {
                    Log.trace("LTNOCondFalse");
                    return 400;
                }
                if (this.courseNkey.indexOf(Object.keys(a)[0]) === -1) {
                    Log.trace("LTWrongKeyCondFalse");
                    return 400;
                }
                const v = Object.values(a)[0];
                if (!(isNumber(v))) {
                    Log.trace("the value of LT is not a number");
                    return 400;
                }
            } else if ("GT" in cond) {
                const a = cond["GT"];
                const num = Object.keys(a).length;
                if (num !== 1 ) {
                    Log.trace("GTNOCondFalse");
                    return 400;
                }
                if (this.courseNkey.indexOf(Object.keys(a)[0]) === -1) {
                    Log.trace("GTWrongKeyCondFalse");
                    return 400;
                }
                const v = Object.values(a)[0];
                if (!(isNumber(v))) {
                    Log.trace("the value of GT is not a number");
                    return 400;
                }
            } else if ("IS" in cond) {
                const a = cond["IS"];
                const num = Object.keys(a).length;
                if (num !== 1 ) {
                    Log.trace("ISNOCondFalse");
                    return 400;
                }
                if (this.courseSkey.indexOf(Object.keys(a)[0]) === -1) {
                    Log.trace("ISWrongKeyCondFalse");
                    return 400;
                }
                const v = Object.values(a)[0];
                if (v === "*") {
                    return 200;
                }
                if (!(isString(v)) || !(/^[*]?[^*]+[*]?$/).test(v)) { // regular expression
                    Log.trace("the value of IS is not a string");
                    return 400;
                }
            } else {
                Log.trace("invalid LOG in WHERE");
                return 400;
            }
            return 200;
        }
    }
    private filter(where: any): any {
        const arr: any = this.getDataset("courses");
        const ans: any = [];
        for (let i = 0; i < arr.length; i++) {
            ans[i] = 0;
        }
        // Log.trace(arr.length);
        /////////////////////////////
        ////// this.insightFacade = new InsightFacade();
        ///////////////////////////
        Log.trace("111");
        if ("GT" in where) {
            const key = Object.keys(where["GT"])[0];
            const v = where["GT"][key];
            // for (const d of arr) {
            //     // Log.trace(d[key]);
            //     if (d[key] > v) {
            //         re.push(d);
            //     }
            // }
            for (let i = 0; i < arr.length; i ++) {
                // Log.trace(d[key]);
                if (arr[i][key] > v) {
                    ans[i] = 1;
                } else {
                    ans[i] = 0;
                }
            }
            // for (let i = 0; i < arr.length; i++) {
            //     if (ans[i]) {
            //         re.push(arr[i]);
            //     }
            // }
        }
        if ("LT" in where) {
            const key = Object.keys(where["LT"])[0];
            const v = where["LT"][key];
            // for (const d of arr) {
            //     // Log.trace(d[key]);
            //     if (d[key] < v) {
            //         re.push(d);
            //     }
            // }
            for (let i = 0; i < arr.length; i ++) {
                // Log.trace(d[key]);
                if (arr[i][key] < v) {
                    ans[i] = 1;
                } else {
                    ans[i] = 0;
                }
            }
        }
        if ("EQ" in where) {
            const key = Object.keys(where["EQ"])[0];
            const v = where["EQ"][key];
            // for (const d of arr) {
            //     // Log.trace(d[key]);
            //     if (d[key] === v) {
            //         re.push(d);
            //     }
            // }
            for (let i = 0; i < arr.length; i ++) {
                // Log.trace(d[key]);
                if (arr[i][key] === v) {
                    ans[i] = 1;
                } else {
                    ans[i] = 0;
                }
            }
        }
        if ("IS" in where) {
            Log.trace("in IS");
            const key = Object.keys(where["IS"])[0];
            let v = where["IS"][key];
            let subis = "";
            ///////////////////////////////////////////
            if (v.indexOf("*") !== -1 ) {
                Log.trace("yes, there is a *!!!!!!!!!!!!!!!");
                const idx = v.indexOf("*");
                Log.trace(idx);
                switch (idx) {
                    case 0:
                        if (v.length === 1 ) {
                            for (let i = 0; i < arr.length; i++) {
                                // Log.trace(d[key]);
                                ans[i] = 1;
                            }
                        } else {
                            const sub = v.substring(1, v.length);
                            // Log.trace("it is in the first one");
                            if (sub.indexOf("*") !== -1) {
                                subis = v.substring(1, v.length - 1);
                                // Log.trace("have two *:" + subis);
                                v = subis;
                                for (let i = 0; i < arr.length; i++) {
                                    // Log.trace(d[key]);
                                    if (arr[i][key].indexOf(v) !== -1 ) {
                                        ans[i] = 1;
                                    } else {
                                        ans[i] = 0;
                                    }
                                }
                            } else {
                                // Log.trace("have one *: " + sub);
                                const l = sub.length;
                                for (let i = 0; i < arr.length; i++) {
                                    // Log.trace(d[key]);
                                    const dataString = arr[i][key];
                                    const dataSub = dataString.substring(dataString.length - l, dataString.length);
                                    if (dataSub === sub) {
                                        // Log.trace("in the data the : " + dataSub);
                                        ans[i] = 1;
                                    } else {
                                        ans[i] = 0;
                                    }
                                }
                            }
                        }
                        break;
                    case v.length - 1:
                        Log.trace("it is in the last one");
                        subis = v.substring(0, v.length - 1);
                        Log.trace("it isn in the last place: " + subis);
                        const ln = subis.length;
                        for (let i = 0; i < arr.length; i++) {
                            // Log.trace(d[key]);
                            const dataString = arr[i][key];
                            const dataSub = dataString.substring(0, ln);
                            if (dataSub === subis) {
                                Log.trace("in the data the : " + dataSub);
                                ans[i] = 1;
                            } else {
                                ans[i] = 0;
                            }
                        }
                        break;
                    default:
                        Log.trace("it is in the  middle --- error");
                        break;
                }
            } else {
                //////////////////////////////////////////
                Log.trace(v);
                for (let i = 0; i < arr.length; i++) {
                    // Log.trace(d[key]);
                    if (arr[i][key] === v) {
                        ans[i] = 1;
                    } else {
                        ans[i] = 0;
                    }
                }
            }
        }
        if ("OR" in where) {
            // Log.trace("in or");
            const or = where["OR"];
            // Log.trace(or.length + " length");
            const ff: any = this.filter(or[0]);
            Log.trace(ff.length + " length");
            for (const o of or) {
                const rf: any = this.filter(o);
                // Log.trace(rf.length + " rf length");
                for (let i = 0; i < ff.length; i++) {
                    if (rf[i] === 1) {
                        ff[i] = 1;
                    }
                }
            }
            for (let i = 0; i < ff.length; i++) {
                ans[i] = ff[i];
            }
        }
        if ("AND" in where) {
            Log.trace("in and");
            const and = where["AND"];
            Log.trace(and.length + "and  length");
            const ff = this.filter(and[0]);
            Log.trace(ff.length + " ff length");
            for (const o of and) {
                const rf: any = this.filter(o);
                // Log.trace(rf.length + " rf length");
                for (let i = 0; i < ff.length; i++) {
                    if (rf[i] === 0) {
                        ff[i] = 0;
                    }
                }
            }
            for (let i = 0; i < ff.length; i++) {
                ans[i] = ff[i];
            }
            // for (let n = 1; n < and.length ; n++) {
            //     const nf = this.filter(and[n]);
            //     for (let e = 0; e < ff.length ; e++) {
            //         if (nf.indexOf(ff[e]) === -1) {
            //             Log.trace("for loop start");
            //             const i = ff.indexOf(ff[e]);
            //             ff.splice(i, 1);
            //             e = e - 1;
            //             Log.trace("for loop start2");
            //         }
            //     }
            // }
            // Log.trace("for loop done");
            // Log.trace(ff.length + " rf length");
            // for (const i of ff) {
            //         re.push(i);
            // }
        }
        if ("NOT" in where) {
            Log.trace("in NOT");
            const not = where["NOT"];
            const rf = this.filter(not);
            for (let i = 0; i < rf.length; i++) {
                if (rf[i] === 1) {
                    ans[i] = 0;
                } else {
                    ans[i] = 1;
                }
            }
        }
        // Log.trace(key);
        // const data: any[] = this.insightFacade.getDataset("courses");
        // Log.trace(re.length);
        // for (const d of re) {
        //     Log.trace(d[key]);
        // }
        Log.trace("inside filter done");
        // Log.trace(ans);
        return ans;
    }
    private select(result: any, option: any): Promise<any> {
        Log.trace("333");
        return new Promise(function (fulfill, reject) {
            const col = option["COLUMNS"];
            Log.trace(col.length);

            const final: any = [];
            for (const r of result) {
                const o: any = {};
                // for every columns, add key-value to o.
                for (const c of col ) {
                    o[c] = r[c];
                }
                final.push(o);
            }
            Log.trace(final[0]["courses_avg"]);
            if ("ORDER" in option) {
                const order = option["ORDER"];
                final.sort(function (a: any, b: any) {
                    return a[order] - b[order];
                });
            }
            Log.trace("after sort");
            Log.trace(Object.keys(final[0])[0]);
            fulfill(final);
        });
    }
    // private loadData() {
    //     const datasetsToQuery: { [id: string]: string } = {
    //         courses: "./test/data/courses.zip",
    //     };
    //     try {
    //         const loadDatasetPromises: Array<Promise<Buffer>> = [];
    //         for (const [id, path] of Object.entries(datasetsToQuery)) {
    //             loadDatasetPromises.push(TestUtil.readFileAsync(path));
    //         }
    //         const loadedDatasets = (Promise.all(loadDatasetPromises)).map((buf, i) => {
    //             return {[Object.keys(datasetsToQuery)[i]]: buf.toString("base64")};
    //         });
    //         expect(loadedDatasets).to.have.length.greaterThan(0);
    //
    //         const responsePromises: Array<Promise<InsightResponse>> = [];
    //         const datasets: { [id: string]: string } = Object.assign({}, ...loadedDatasets);
    //         for (const [id, content] of Object.entries(datasets)) {
    //             responsePromises.push(insightFacade.addDataset(id, content, InsightDatasetKind.Courses));
    //         }
    //     }
    // }
}
