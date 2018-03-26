import {Decimal} from "decimal.js";
import fs = require("fs");
import {isNumber, isString} from "util";
import Log from "../Util";
// import {InsightDatasetKind} from "./IInsightFacade";
import InsightFacade from "./InsightFacade";
// import {split} from "ts-node";
export interface IQueryRequest {
    WHERE: {};
    OPTIONS: {};
    TRANSFORMATIONS: {};
}

export default class DoQuery {
    private insight: InsightFacade;
    // private data: any;
    //  private data: any = fs.readFileSync("./test/data/courses", "utf8");
    private array: any;
    // private groupsCount = 0;
//    private courseName: any = {};
    /////////////////////
    // private datasetss: { [id: string]: string };
    /////////////////////
    private insightFacade: InsightFacade;
    private coursekey: any = ["courses_dept", "courses_id"
        , "courses_avg", "courses_instructor"
        , "courses_title" , "courses_pass"
        , "courses_fail" , "courses_audit"
        , "courses_uuid"];
    private courseNkey: any = [
        "courses_avg",  "courses_pass"
        , "courses_fail" , "courses_audit", "courses_year"];
    private courseSkey: any = ["courses_dept", "courses_id"
        , "courses_title", "courses_uuid" , "courses_instructor"];
    private roomkey: any = ["rooms_fullname", "rooms_shortname"
        , "rooms_number", "rooms_name" , "rooms_address" , "rooms_type" , "rooms_furniture" , "rooms_href",
        "rooms_lat" , "rooms_lon" , "rooms_seats"];
    private roomSkey: any = ["rooms_fullname", "rooms_shortname"
        , "rooms_number", "rooms_name" , "rooms_address" , "rooms_type" , "rooms_furniture" , "rooms_href"];
    private roomNkey: any = ["rooms_lat" , "rooms_lon" , "rooms_seats"];
    constructor(facade: InsightFacade) {
        // Log.trace("0.0");
        this.insight = facade;
        // Log.trace("0.1");
        /////////////////////////////////////////////////
        // this.insight.addDataset("courses", this.datasetss["courses"], InsightDatasetKind.Courses);
        ////////////////////////////////////////////////
        // this.data = this.insight.getDataset("courses");
        // Log.trace("0.2");
        // this.array = this.data;
    }
    public query(query: IQueryRequest): Promise<any> {
        // Log.trace("Length:" + this.array.length.toString());
        const that: any = this;
        let id = that.findID(query["WHERE"]);
        if (id === "") {
            id = that.findID_emptyWhere(query);
        }
        that.array = that.insight.getDataset(id);
        const re: any = [];
        return new Promise(function (fulfill, reject) {
            const where = query["WHERE"];
            // for (const d of result) {
            //     Log.trace(d["courses_avg"]);
            // }
            //////////////////////////////
            const   result = that.filter(where);
            const array = that.array;
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
            const options: any = query["OPTIONS"];
            let finalresult: any;
            if ("TRANSFORMATIONS" in query) {
                const trans: any = query["TRANSFORMATIONS"];
                finalresult = that.doTrans(re, trans, options);
            } else {
                finalresult = that.select(re, options);
            }
            if (c === 0) {
                finalresult = [];
            }
            if ("ORDER" in options) {
                const order = options["ORDER"];
                if (typeof order !== "object") {
                    finalresult.sort(function (a: any, b: any) {
                        return a[order] - b[order];
                    });
                } else {
                    const keys = order["keys"];
                    const dir = order["dir"];
                    let upOrDown: number = -1;
                    if (dir === "UP") {
                        upOrDown = 1;
                    }
                    finalresult.sort(that.make_sort_function(keys, upOrDown));
                }
            }
            fulfill(finalresult);
        });
    }
    public doTrans(rawResult: any, trans: any, option: any ): any {
        // Log.trace("HIHIHIHIH");
        const that: any = this;
        let transResult: any = [];
        const finalResult: any = [];
        const group = trans["GROUP"];
        const acc: any[] = [];
        let count = 0;
        const groups: any = [];
        let conter: any = [];
        // let groupsCount = 0;
        const apply = trans["APPLY"];
        const col = option["COLUMNS"];
        const applyKeys = [];
        // const groupLength = group.length;
        // Log.trace("Group: " + group);
        // Log.trace("apply: " + apply);
        // Log.trace("col: " + col);
        // Log.trace("groupLength: " + groupLength);
        // sort the result into group
        transResult = rawResult.sort(that.make_sort_function(group, 1));
        // Log.trace("see the transResult: " + rawResult);
        // Log.trace("split Down:
        // " + transResult.length);
        // transResult = that.doApply(transResult, apply);
        // compute according to Apply
        // Order the result;
        for (const a of apply) {
            applyKeys.push(Object.keys(a)[0]);
        }
        function create_new_group(entry: any ) {
            groups.push({});
            acc.push({});
            for (const i of group) {
                groups[groups.length - 1][i] = entry[i];
            }
            for (const a of apply) {
                // const k = Object.values(a)[0]["SUM"];
                const applyKey = Object.keys(a)[0];
                const applyValue = Object.values(a)[0];
                acc[acc.length - 1][applyKey] = 0;
                if ("AVG" in applyValue) {
                    const k = Object.values(a)[0]["AVG"];
                    const r = +entry[k];
                    acc[acc.length - 1][applyKey] = r;
                } else if ("MIN" in applyValue) {
                    const k = Object.values(a)[0]["MIN"];
                    const r = +entry[k];
                    acc[acc.length - 1][applyKey] = r;
                } else if ("SUM" in applyValue) {
                    const k = Object.values(a)[0]["SUM"];
                    const r = +entry[k];
                    acc[acc.length - 1][applyKey] = r;
                } else if ("MAX" in applyValue) {
                    const k = Object.values(a)[0]["MAX"];
                    const r = +entry[k];
                    acc[acc.length - 1][applyKey] = r;
                } else {
                    conter = [];
                    const k = Object.values(a)[0]["COUNT"];
                    conter.push(entry[k].toString());
                }
            }
            count = 1;
        }
        function last_group() {
            for (const a of apply) {
                const appKey = Object.keys(a)[0];
                const val = Object.values(a)[0];
                if ("AVG" in val) {
                    // Log.trace("AVG IN APPLY");
                    // const aa = new Decimal(1.3);
                    // aa.toNumber();
                    const num = new Decimal(acc[groups.length - 1][appKey]).toNumber();
                    // Log.trace(num.toString());
                    groups[groups.length - 1][appKey] = Number((num / new Decimal(count).toNumber())
                        .toFixed(2));
                } else if ("SUM" in val) {
                    // Log.trace("SUM IN APPLY");
                    groups[groups.length - 1][appKey] = Number((acc[groups.length - 1][appKey]).toFixed(2));
                } else if ("COUNT" in val) {
                    groups[groups.length - 1][appKey] = conter.length;
                    // Log.trace("COUNT IN APPLY");
                } else if ("MIN" in val) {
                    groups[groups.length - 1][appKey] = acc[groups.length - 1][appKey];
                    // Log.trace("MIN IN APPLY");
                } else if ("MAX" in val) {
                    groups[groups.length - 1][appKey] = acc[groups.length - 1][appKey];
                    // Log.trace("MAX IN APPLY");
                }
            }
        }
        // Log.trace("count: " + count);
        // Log.trace("groups: " + groups);
        create_new_group(transResult[0]);
        for (let i = 1; i < transResult.length; i += 1) {
            const entry = transResult[i];
            if (i > 0 && !that.compare(transResult[i - 1], entry, group)) {
                // not in the same group
                // Log.trace("NO!!! NOT SAME GROUP");
                last_group();
                // groups[groupsCount]
                create_new_group(entry);
            } else {
                // in the same group
                count += 1;
                for (const a of apply) {
                    // applyKeys.push(Object.keys(a)[0]);
                    const applyKey = Object.keys(a)[0];
                    const val = Object.values(a)[0];
                    if ("AVG" in val) {
                        // Log.trace("AVG IN APPLY");
                        const k = Object.values(a)[0]["AVG"];
                        const nu: any = +entry[k];
                        acc[groups.length - 1][applyKey] += nu;
                    } else if ("SUM" in val) {
                        const k = Object.values(a)[0]["SUM"];
                        const nu: any = +entry[k];
                        acc[groups.length - 1][applyKey] += nu;
                        // Log.trace("SUM IN APPLY");
                    }  else if ("MAX" in val) {
                        const k = Object.values(a)[0]["MAX"];
                        const num = +entry[k];
                        if ( num > acc[groups.length - 1][applyKey]) {
                            acc[groups.length - 1][applyKey] = num;
                        }
                        // Log.trace("MAX IN APPLY");
                    } else if ("MIN" in val) {
                        const k = Object.values(a)[0]["MIN"];
                        // Log.trace("see the MIN " + entry[k]);
                        const nu: any = +entry[k];
                        if ( nu < acc[groups.length - 1][applyKey]) {
                            acc[groups.length - 1][applyKey] = nu;
                        }
                    } else {
                        const k = Object.values(a)[0]["COUNT"];
                        const c  = entry[k].toString();
                        if ( conter.indexOf(c) === -1) {
                            conter.push(c);
                        }
                    }
                }
            }
            if (i === transResult.length - 1 ) {
                last_group();
            }
        }
        // Log.trace("stop here Let me see");
        for (const r of groups) {
            const o: any = {};
            // for every columns, add key-value to o.
            for (const c of col ) {
                o[c] = r[c];
            }
            finalResult.push(o);
        }
        return finalResult;
    }
    public compare (a: any, b: any, groupKeys: string[]) {
        for (const key of groupKeys) {
            if (a[key] !== b[key]) {
                return false;
            }
        }
        return true;
    }
    // public doApply(transResult: any,  apply: any): any {
    //     const result: any = [];
    //     const applyKeys = [];
    //     const tracker = 0;
    //     for (const a of apply) {
    //         applyKeys.push(Object.keys(a)[0]);
    //         const val = Object.values(a)[0];
    //         if ("AVG" in val) {
    //             Log.trace("AVG IN APPLY");
    //         } else if ("SUM" in val) {
    //             Log.trace("SUM IN APPLY");
    //         } else if ("COUNT" in val) {
    //             Log.trace("COUNT IN APPLY");
    //         } else if ("MIN" in val) {
    //             Log.trace("MIN IN APPLY");
    //         } else if ("MAX" in val) {
    //             Log.trace("MAX IN APPLY");
    //         }
    //     }
    //     Log.trace("APPLY KEYS: " + applyKeys);
    //     return result;
    // }
    public make_sort_function (groupKey: string[], up: number) {
        const that = this;
        return function ( a: any, b: any) {
            for (const i of groupKey) {
                let x: any;
                let y: any;
                if ( that.courseSkey.indexOf(i) !== - 1 || that.roomSkey.indexOf(i) !== -1) {
                    // if the value is a string
                    x = a[i];
                    y = b[i];
                    // Log.trace(x + " " + y);
                } else {
                    // order is Number case
                    x = Number(a[i]);
                    y = Number(b[i]);
                    // Log.trace(x + " " + y);
                }
                if (x < y) {
                    return -1 * up;
                }
                if (x > y) {
                    return up;
                }
                return 0;
            }
        };
    }
    // the return result are grouped
    // public splitGroup(rawResult: any, group: any): any {
    //     Log.trace("HIHIHIHIH");
    //     const result: any = [];
    //     const helper: any = [];
    //     let groupsCount = 0;
    //     const groups: any = [];
    //     const groupLength = group.length;
    //     const groupKey = group[0];
    //     for (let i = 0 ; i < rawResult.length; i++)  {
    //         if (groups.indexOf(rawResult[i][groupKey]) === -1 ) {
    //             groups.push(rawResult[i][groupKey]);
    //             helper[i] = groupsCount;
    //             groupsCount += 1;
    //         } else {
    //             helper[i] = groups.indexOf(rawResult[i][groupKey]);
    //         }
    //     }
    //     // Log.trace("rawResult's length: " + rawResult.length);
    //     // // Log.trace("GROUPS: " + groups);
    //     // // Log.trace("HELPER: " + helper);
    //     // // Log.trace("groupsCount: " + groupsCount);
    //     for (let c = 0; c < groupsCount; c ++) {
    //         for (let r = 0 ; r < rawResult.length; r++) {
    //             if (helper[r] === c) {
    //                 result.push(rawResult[r]);
    //             }
    //         }
    //     }
    //     // Log.trace("Group: " + group);
    //     // Log.trace("apply: " + apply);
    //     // Log.trace("col: " + col);
    //     // Log.trace("groupLength: " + groupLength);
    //     // separate the result into group
    //     // compute according to Apply
    //     // Order the result;
    //     return result;
    // }
    public isValid(query: IQueryRequest): number {
        if (typeof query === "undefined" || query == null || Object.keys(query).length < 0) {
            return 400;
        }
        if (!("WHERE" in query) || !("OPTIONS" in query)) {
            return 400;
        }
        if ("TRANSFORMATIONS" in query) {
            const trans = query["TRANSFORMATIONS"];
            if (!("APPLY" in trans) || !("GROUP" in trans)) {
                return 400;
            }
        }
        const where: any  = query["WHERE"];
        const dataID = this.findID(where);
        if (dataID !== "") {
            if (dataID !== "courses" && dataID !== "rooms") {
                return 400;
            }
            const w = this.condValid(where);
            if ((w !== 200)) {
             return w;
            }
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
        return 200;
    }
    public findID(cond: any): any {
        let dataID = "";
        if ("NOT" in cond) {
            const not  = cond["NOT"];
            dataID = this.findID(not);
        } else if ("AND" in cond) {
            const and = cond["AND"];
            dataID = this.findID(and[0]);
        } else if ("OR" in cond) {
            const or = cond["OR"];
            dataID = this.findID(or[0]);
        } else if ("EQ" in cond) {
            const a = cond["EQ"];
            const key = Object.keys(a)[0];
            const index = key.indexOf("_");
            dataID = key.substring(0 , index);
        } else if ("LT" in cond) {
            const a = cond["LT"];
            const key = Object.keys(a)[0];
            const index = key.indexOf("_");
            dataID = key.substring(0 , index);
        } else if ("GT" in cond) {
            const a = cond["GT"];
            const key = Object.keys(a)[0];
            const index = key.indexOf("_");
            dataID = key.substring(0 , index);
        } else if ("IS" in cond) {
            const a = cond["IS"];
            const key = Object.keys(a)[0];
            const index = key.indexOf("_");
            dataID = key.substring(0 , index);
        }
        return dataID;
    }
    public findID_emptyWhere(query: any ): any {
        let dataID = "";
        let ele = "";
        if ("TRANSFORMATIONS" in query) {
            const trans = query["TRANSFORMATIONS"];
            const group = trans["GROUP"];
            ele = group[0];
        } else {
            const options: any = query["OPTIONS"];
            const col = options["COLUMNS"];
            ele = col[0];
        }
        const index = ele.indexOf("_");
        dataID = ele.substring(0 , index);
        return dataID;
    }
    public isKeyValid(query: IQueryRequest): number {
        let dataID = this.findID(query["WHERE"]);
        if (dataID === "") {
            dataID = this.findID_emptyWhere(query);
        }
        const options: any = query["OPTIONS"];
        const columns = options["COLUMNS"];
        const applyKeys = [];
        if ("TRANSFORMATIONS" in query) {
            const trans: any = query["TRANSFORMATIONS"];
            const group = trans["GROUP"];
            const apply = trans["APPLY"];
            for (const a of apply) {
                if ((Object.keys(a)[0]).indexOf("_") === -1) {
                    if (applyKeys.indexOf(Object.keys(a)[0]) === -1) {
                        applyKeys.push(Object.keys(a)[0]);
                    } else {
                        return 400;
                    }
                } else {
                    return 400;
                }
            }

            if (dataID === "courses") {
                for (const a of apply) {
                    const v  = Object.values(a)[0];
                    const v2 = Object.values(v)[0];
                    if ( "MAX" in v || "MIN" in v || "SUM" in v ||  "AVG" in v) {
                        if (this.courseNkey.indexOf(v2) === -1) {
                            return 400;
                        }
                    } else if ( "COUNT" in v) {
                        if (this.coursekey.indexOf(v2) === -1) {
                            return 400;
                        }
                    } else {
                        return 400;
                    }
                }
                for (const c of columns) {
                    if (group.indexOf(c) === -1 && applyKeys.indexOf(c) === -1) {
                        return 400;
                    }
                }
            } else {
                for (const a of apply) {
                    const v  = Object.values(a)[0];
                    const v2 = Object.values(v)[0];
                    if ( "MAX" in v || "MIN" in v || "SUM" in v ||  "AVG" in v) {
                        if (this.roomNkey.indexOf(v2) === -1) {
                            return 400;
                        }
                    } else if ( "COUNT" in v) {
                        if (this.roomkey.indexOf(v2) === -1) {
                            return 400;
                        }
                    } else {
                        return 400;
                    }
                }
                for (const c of columns) {
                    if (group.indexOf(c) === -1 && applyKeys.indexOf(c) === -1) {
                        return 400;
                    }
                }
            }
        } else {
            if (dataID === "courses") {
                for (const c of columns) {
                    if (this.coursekey.indexOf(c) === -1) {
                        return 400;
                    }
                }
            } else {
                for (const c of columns) {
                    if (this.roomkey.indexOf(c) === -1) {
                        return 400;
                    }
                }
            }
        }
        if ("ORDER" in options) {
            const order = options["ORDER"];
            if ((columns.indexOf(order) === -1)) {
                if (!("keys" in order) || !("dir" in order)) {
                    return 400;
                } else {
                    for (const k of order["keys"]) {
                        if (columns.indexOf(k) === -1 ) {
                            return 400;
                        }
                    }
                }
            }
        }
        // if ((columns.indexOf(order) === -1)) {
        //     Log.trace("order key is wrong");
        //     return 400;
        // }
        return 200;
    }
    public condValid(cond: any ): number {
        const dataID = this.findID(cond);
        if (Object.keys(cond).length === 0 ) {
            return 400;
        } else {
            if ("NOT" in cond) {
                const not = cond["NOT"];
                if (not.length < 1 ) {
                    return 400;
                } else {
                    if ( 400 === this.condValid(not)) {
                        return 400;
                    }
                }
            } else if ("AND" in cond) {
                const and = cond["AND"];
                if (and.length < 1 ) {
                    return 400;
                } else {
                    for (const suband of and ) {
                        if ( 400 === this.condValid(suband)) {
                            return 400;
                        }
                    }
                }
            } else if ("OR" in cond) {
                const or = cond["OR"];
                if (or.length < 1  ) {
                    return 400;
                } else {
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
                    return 400;
                }
                if (dataID === "courses") {
                    if (this.courseNkey.indexOf(Object.keys(a)[0]) === -1) {
                        return 400;
                    }
                } else {
                    if (this.roomNkey.indexOf(Object.keys(a)[0]) === -1) {
                        return 400;
                    }
                }
                const v = Object.values(a)[0];
                if (!(isNumber(v))) {
                    return 400;
                }
            } else if ("LT" in cond) {
                const a = cond["LT"];
                const num = Object.keys(a).length;
                if (num !== 1 ) {
                    return 400;
                }
                if (dataID === "courses") {
                    if (this.courseNkey.indexOf(Object.keys(a)[0]) === -1) {
                        return 400;
                    }
                } else {
                    if (this.roomNkey.indexOf(Object.keys(a)[0]) === -1) {
                        return 400;
                    }
                }
                const v = Object.values(a)[0];
                if (!(isNumber(v))) {
                    return 400;
                }
            } else if ("GT" in cond) {
                const a = cond["GT"];
                const num = Object.keys(a).length;
                if (num !== 1 ) {
                    return 400;
                }
                if (dataID === "courses") {
                    if (this.courseNkey.indexOf(Object.keys(a)[0]) === -1) {
                        return 400;
                    }
                } else {
                    if (this.roomNkey.indexOf(Object.keys(a)[0]) === -1) {
                        return 400;
                    }
                }
                const v = Object.values(a)[0];
                if (!(isNumber(v))) {
                    return 400;
                }
            } else if ("IS" in cond) {
                const a = cond["IS"];
                const num = Object.keys(a).length;
                if (num !== 1 ) {
                    return 400;
                }
                if (dataID === "courses") {
                    if (this.courseSkey.indexOf(Object.keys(a)[0]) === -1) {
                        return 400;
                    }
                } else {
                    if (this.roomSkey.indexOf(Object.keys(a)[0]) === -1) {
                        return 400;
                    }
                }
                const v = Object.values(a)[0];
                if (v === "*") {
                    return 200;
                }
                if (v === "**") {
                    return 200;
                }
                if (!(isString(v)) || !(/^[*]?[^*]+[*]?$/).test(v)) { // regular expression
                    return 400;
                }
            } else {
                return 400;
            }
            return 200;
        }
    }
    public filter(where: any): any {
        const dataID = this.findID(where);
        const arr: any = this.array;
        const ans: any = [];
        if (dataID === "") {
            for (let i = 0; i < arr.length; i++) {
                ans[i] = 1;
            }
        } else {
            for (let i = 0; i < arr.length; i++) {
                ans[i] = 0;
            }
        }
        // Log.trace(arr.length);
        /////////////////////////////
        ////// this.insightFacade = new InsightFacade();
        ///////////////////////////
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
            let v = where["IS"][key];
            let subis = "";
            ///////////////////////////////////////////
            if (v.indexOf("*") !== -1 ) {
                const idx = v.indexOf("*");
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
                        subis = v.substring(0, v.length - 1);
                        const ln = subis.length;
                        for (let i = 0; i < arr.length; i++) {
                            // Log.trace(d[key]);
                            const dataString = arr[i][key];
                            const dataSub = dataString.substring(0, ln);
                            if (dataSub === subis) {
                                // Log.trace("in the data the : " + dataSub);
                                ans[i] = 1;
                            } else {
                                ans[i] = 0;
                            }
                        }
                        break;
                    default:
                        break;
                }
            } else {
                //////////////////////////////////////////
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
            const and = where["AND"];
            const ff = this.filter(and[0]);
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
        // Log.trace(ans);
        return ans;
    }
    public select(result: any, option: any): any {
        // Log.trace("333");
        const col = option["COLUMNS"];
        // Log.trace(col.length);
        const final: any = [];
        for (const r of result) {
            const o: any = {};
            // for every columns, add key-value to o.
            for (const c of col ) {
                o[c] = r[c];
            }
            final.push(o);
        }
        // Log.trace("after sort");
        // Log.trace(Object.keys(final[0])[0]);
        return final;
    }
    // public isROOMcondValid(query: IQueryRequest): number {
    //     if (typeof query === "undefined" || query == null || Object.keys(query).length < 0) {
    //         Log.trace("1");
    //         return 400;
    //     }
    //     if (!("WHERE" in query) || !("OPTIONS" in query)) {
    //         Log.trace("2");
    //         return 400;
    //     }
    //     const where: any  = query["WHERE"];
    //     const w = this.condValid(where);
    //     if ((w !== 200)) {
    //         return w;
    //     }
    //     if ("OPTIONS" in query) {
    //         const options: any  = query["OPTIONS"];
    //         if (!("COLUMNS" in options)) {
    //             return 400;
    //         }
    //     }
    //     const i = this.isKeyValid(query);
    //     if (i !== 200) {
    //         return i;
    //     }
    //     Log.trace("the query is valid");
    //     return 200;
    // }
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
