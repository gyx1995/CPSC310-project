import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");

import chaiHttp = require("chai-http");
import { expect } from "chai";
import Log from "../src/Util";
import TestUtil from "./TestUtil";

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;

    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        server.start();
        // TODO: start server here once and handle errors properly
    });

    after(function () {
        // TODO: stop server here once!
        server.stop();
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
    });

    afterEach(function () {
        // server.stop();
        // might want to add some process logging here to keep track of what"s going on
    });

    // TODO: read your courses and rooms datasets here once!
    it("Get list of datasets", function () {
        try {
            return chai.request("http://localhost:4321")
                .get("/datasets")
                .then(function (res: any) {
                    // some logging here please!
                    Log.trace(res.code);
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err: Error) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.trace(err.toString());
            expect.fail();
        }
    });
    // Hint on how to test PUT requests
    it("PUT test for courses dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .attach("body", "./test/data/courses.zip", "courses.zip")
                .then(function (res: any) {
                    expect(res.status).to.be.equal(204);
                })
                .catch(function (err: Error) {
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.trace(err.toString());
            expect.fail();
        }
    });
    it("POST a simple query", function () {
        try {
            return chai.request("http://localhost:4321")
                .post("/query")
                // .set("content-type", "application/x-www-form-urlencoded")
                .send("{\n" +
                    "\t\"WHERE\": {\n" +
                    "        \"GT\": { \"courses_avg\": 70 }\n" +
                    "\t},\n" +
                    "\t\"OPTIONS\": {\n" +
                    "\t\t\"COLUMNS\": [\"courses_title\", \"overallAvg\"]\n" +
                    "\t},\n" +
                    "\t\"TRANSFORMATIONS\": {\n" +
                    "\t\t\"GROUP\": [\"courses_title\"],\n" +
                    "\t\t\"APPLY\": [{\n" +
                    "\t\t\t\"overallAvg\": {\n" +
                    "\t\t\t\t\"AVG\": \"courses_avg\"\n" +
                    "\t\t\t}\n" +
                    "\t\t}]\n" +
                    "\t}\n" +
                    "}")
                .then(function (res: any) {
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err: Error) {
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.trace(err.toString());
            expect.fail();
        }
    });
    it("Delete test for courses dataset", function () {
        try {
            return chai.request("http://localhost:4321")
                .del("/dataset/courses")
                .then(function (res: any) {
                    expect(res.status).to.be.equal(204);
                })
                .catch(function (err: Error) {
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.trace(err.toString());
            expect.fail();
        }
    });
    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
