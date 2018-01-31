import fs = require("fs");
import {isNumber, isString} from "util";
import Log from "../Util";
import InsightFacade from "./InsightFacade";
export interface IQueryRequest {
    WHERE: {};
    OPTIONS: {};
}

export default class DoQuery {
    // private datasets: Datasets = null;
    // private data: any = fs.readFileSync("./test/data/courses", "utf8");
    // private array = JSON.parse(this.data);
//    private courseName: any = {};
    private insightFacade: InsightFacade;
    private coursekey: any = ["courses_dept", "courses_id"
                            , "courses_avg", "courses_instructor"
                            , "courses_title" , "courses_pass"
                            , "courses_fail" , "courses_audit"
                            , "courses_uuid"];
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
        if (columns.indexOf(order) === -1) {
            Log.trace("false");
            return 400;
        }
        return 200;
    }
    public condValid(cond: any ): number {
        if (cond.empty) {
            Log.trace("1");
            return 400;
        } else {
            if ("AND" in cond) {
                const and = cond["AND"];
                if (and.length === 0 ) {
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
                if (or.length === 0 ) {
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
                if (this.coursekey.indexOf(Object.keys(a)[0]) === -1) {
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
                if (this.coursekey.indexOf(Object.keys(a)[0]) === -1) {
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
                if (this.coursekey.indexOf(Object.keys(a)[0]) === -1) {
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
                if (this.coursekey.indexOf(Object.keys(a)[0]) === -1) {
                    Log.trace("ISWrongKeyCondFalse");
                    return 400;
                }
                const v = Object.values(a)[0];
                if (!(isString(v))) {
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
        const data: any = fs.readFileSync("./test/data/courses", "utf8");
        const arr = JSON.parse(data);
        Log.trace(arr.length);
        this.insightFacade = new InsightFacade();
        Log.trace("111");
        const re: any = [];
        const key = Object.keys(where["GT"])[0];
        const v = where["GT"][key];
        Log.trace(key);
        // const data: any[] = this.insightFacade.getDataset("courses");
        Log.trace(arr.length.toString());
        for (const d of arr) {
            // Log.trace(d[key]);
            if (d[key] > v) {
                re.push(d);
            }
        }
        // Log.trace(re.length);
        // for (const d of re) {
        //     Log.trace(d[key]);
        // }
        Log.trace("inside filter done");
        return re;
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
        const that: any = this;
        return new Promise(function (fulfill, reject) {
            const where = query["WHERE"];
            // for (const d of result) {
            //     Log.trace(d["courses_avg"]);
            // }
            //////////////////////////////
            const result: any = that.filter(where);
            Log.trace("after filter and select start");
            const options: any = query["OPTIONS"];
            Log.trace(options["COLUMNS"][1]);
            const finalresult: any = that.select(result, options);
            Log.trace("after select");
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
