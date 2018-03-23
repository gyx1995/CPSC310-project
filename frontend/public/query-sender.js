/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */
CampusExplorer.sendQuery = function(query) {
    return new Promise(function(fulfill, reject) {
        //console.log("CampusExplorer.sendQuery not implemented yet.");
        let httpRequest = new XMLHttpRequest();
        httpRequest.onload = function() {
            if (this.readyState === 4) {
                if (this.status === 200){
                    fulfill(this.responseText);
                } else {
                    reject(this.responseText);
                }
            }
        };
        httpRequest.open('POST','http://localhost:4321/query');
        httpRequest.send(JSON.stringify(query));
    });
};
