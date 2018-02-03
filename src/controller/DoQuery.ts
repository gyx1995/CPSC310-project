import fs = require("fs");
import {isNumber, isString} from "util";
import Log from "../Util";
import InsightFacade from "./InsightFacade";
export interface IQueryRequest {
    WHERE: {};
    OPTIONS: {};
}

export default class DoQuery {
    private insight: InsightFacade;
    private data: any;
   //  private data: any = fs.readFileSync("./test/data/courses", "utf8");
    private array: any;
//    private courseName: any = {};
    private insightFacade: InsightFacade;
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
    constructor(facade: InsightFacade) {
        Log.trace("0.0");
        this.insight = facade;
        Log.trace("0.1");
        this.data = this.insight.getDataset("courses");
        Log.trace("0.2");
        this.array = this.data;
    }
    public isValid(query: IQueryRequest): number {
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

    public isKeyValid(query: IQueryRequest): number {
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
    public condValid(cond: any ): number {
        if (Object.keys(cond).length === 0 ) {
            Log.trace("1");
            return 400;
        } else {
            if ("NOT" in cond) {
                const not = cond["NOT"];
                if (not.length === 1 ) {
                    Log.trace("notNOCondFalse");
                    return 400;
                } else {
                    Log.trace("check not");
                    this.condValid(not);
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
                        this.condValid(suband);
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
                        this.condValid(subor);
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
    public filter(where: any): any {
        const arr = this.array;
        const ans: any = [];
        for (let i = 0; i < arr.length; i++) {
            ans[i] = 0;
        }
        Log.trace(arr.length);
        this.insightFacade = new InsightFacade();
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
            const key = Object.keys(where["IS"])[0];
            const v = where["IS"][key];
            Log.trace(v);
            for (let i = 0; i < arr.length; i ++) {
                // Log.trace(d[key]);
                if (arr[i][key] === v) {
                    ans[i] = 1;
                } else {
                    ans[i] = 0;
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
        return ans;
    }
    public select(result: any, option: any): Promise<any> {
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
            const order = option["ORDER"];
            final.sort(function (a: any, b: any) {
                return a[order] - b[order];
            });
            Log.trace("after sort");
            Log.trace(Object.keys(final[0])[0]);
            fulfill(final);
        });
    }

    public query(query: IQueryRequest): Promise<any> {
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
            let c = 0;
            for (let i = 0; i < that.array.length; i++) {
                if (result[i] === 1 ) {
                    c += 1;
                }
            }
            for (let i = 0; i < that.array.length; i++) {
                if (result[i] === 1) {
                    re.push(that.array[i]);
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
}
