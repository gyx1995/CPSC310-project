import Log from "../Util";
import http = require("http");

export interface IGeoResponse {
    lat?: number;
    lon?: number;
    error?: string;
}

export default class DatasetHelper {

    public findDoc(doc: any, tagName: string, attrName: any, attrValue: any): any {
        if (this.compareDoc(doc, tagName, attrName, attrValue)) {
            return doc;
        }
        if ("childNodes" in doc) {
            for (const child of doc.childNodes) {
                const x: any = this.findDoc(child, tagName, attrName, attrValue);
                if (x != null) {
                    return x;
                }
            }
        }
        return null;
    }

    public compareDoc (doc: any, tagName: string, attrName: any, attrValue: any): boolean {
        try {
            if (doc.tagName === tagName) {
                if (attrName != null) {
                    for (const a of doc.attrs) {
                        if (a.name === attrName && a.value === attrValue) {
                            return true;
                        }
                    }
                    return false;
                }
                // Log.trace("Yes");
                return true;
            }
            return false;
        } catch (err) {
           //  Log.trace("compare failed" + err);
            return false;
        }
    }

     public getLatLon (address: string): Promise<IGeoResponse> {
        return new Promise(function (resolve, reject) {
            const prefix = "http://skaha.cs.ubc.ca:11316/api/v1/team84/";
            const url: string = address.replace(" ", "%20");
            const u = prefix + url;
            // Log.trace(u);

            http.get(u, function (res) {
                // Log.trace("hi");
                if (res.statusCode !== 200) {
                    reject("Web Request Failed");
                }
                // parse the result to JSON
                res.setEncoding("utf8");
                let rowData = "";
                res.on("data", (chunk: any) => rowData += chunk);
                res.on("end", () => {
                    try {
                        // Log.trace("hi0");
                        const parseData: IGeoResponse = JSON.parse(rowData);
                        if ("error" in parseData) {
                            // Log.trace("hi1");
                            reject(parseData);
                        } else {
                            // Log.trace("hi2");
                            // Log.trace(parseData["lat"].toString());
                            resolve(parseData);
                        }
                    } catch (e) {
                        // Log.trace("hi3");
                        reject(e);
                    }
                });
            }).on("error", function (e: any) {
                reject(e);
            });
        });
    }
}
