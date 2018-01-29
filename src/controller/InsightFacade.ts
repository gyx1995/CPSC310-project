import JSZip = require("jszip");
import DoQuery from "../controller/DoQuery";
import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightResponse} from "./IInsightFacade";

/**
 * This is the main programmatic entry point for the project.
 */
export default class InsightFacade implements IInsightFacade {
    private static doQuery = new DoQuery();
    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<InsightResponse> {
       //  const p = unzip(content);
       // // Log.trace("here");
       //  if (p) {
       //      return Promise.resolve({code: 204, body: null});
       //  }
        return Promise.reject({code: 404, body: null});
    }

    public removeDataset(id: string): Promise<InsightResponse> {
        return Promise.reject({code: -1, body: null});
    }

    public performQuery(query: any): Promise <InsightResponse> {
        // return new Promise(function (fulfill, reject) {
        //     try {
        //         const isValid = InsightFacade.doQurey.isValid(query);
        //
        //         if (isValid === true) {
        //             InsightFacade.doQurey.query(query)
        //                  .then(function(result) {
        //                 fulfill({code: 200, body: result});
        //             }).catch(function (err)  {
        //                 Log.trace("in InsightFacade: ");
        //                 if (err) {Log.trace(err); }
        //                 if ("missing" in err) {
        //                     reject({code: 424, body: { error: err}});
        //                 } else {
        //                     reject({code: 400, body: {error: "invalid query"}});
        //                 }
        //             });
        //
        //         } else {
        //             reject({code:400, body:{error: "invalid query'"}});
        //         }
        //     } catch (err) {
        //         Log.error("RouteHandler::postQuery(..) - ERROR: " + err);
        //         reject({code:403, body:{error: err.message}});
        //     }
        // });
        return new Promise(function (fulfill, reject) {
            try {const isValid = InsightFacade.doQuery.isValid(query);
                 if (isValid === 200) {
                    Log.trace("valid");
                 } else {
                     if (isValid === 400) {
                    reject({code: 400, body: {error: "invalid query"}});
                     } else {
                         reject({code: 402, body: {error: "invalid query"}});
                     }
                 }
            } catch (err) {
                Log.error("Query - ERROR: " + err);
                reject({code: 403, body: {error: err.message}});
            }
    });
    }

    public listDatasets(): Promise<InsightResponse> {
        return Promise.reject({code: -1, body: null});
    }
}

// function unzip(content: string): Promise<boolean> {
//     const myZip = new JSZip();
//     let jsonFile: any;
//     const list: string[] = [] ;
//     return myZip.loadAsync(content, {base64: true})
//         .then(function (zip: JSZip) {
//             // Log.trace(zip.toString());
//             zip.forEach(function (path, file) {
//                 file.async("text")
//                     .then(function (fileData) {
//                         // Log.trace(path);
//                        // Log.trace(fileData);
//                         try {
//                             jsonFile = JSON.parse(fileData);
//                             const re = jsonFile["result"];
//                             for ( const element of re) {
//                                 const title = element["Title"];
//                                 list.push("title:");
//                                 list.push(title);
//                                 Log.trace(list);
//                             }
//                             // Log.trace(jsonFile.result.toString().split(",");
//                         } catch (err) {
//                             // Log.trace(path);
//                             throw err;
//                         }
//                         // jsonFile.async("text")
//                         //     .then(function () {
//                         //        // Log.trace(jsonFile.result["Title"]);
//                         //     });
//                         // if (jsonFile !== undefined && jsonFile.result === undefined) {
//                         //     Log.trace("valid JSON but no results");
//                         //     throw {message: "invalid dataset"};
//                         // }
//                         // if (jsonFile !== undefined) {
//                         //     list.push("courses_title:");
//                         //     list.push(jsonFile.Title);
//                         // }
//                     });
//                 // Log.trace(jsonFile.result);
//                 // Log.trace(path);
//             });
//             return true;
//         })
//         .catch(function (err: Error) {
//             Log.trace("invalid zip file format");
//             return false;
//         });
// }
