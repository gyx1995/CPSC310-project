/**
 * This hooks together all the CampusExplorer methods and binds them to clicks on the submit button in the UI.
 *
 * The sequence is as follows:
 * 1.) Click on submit button in the reference UI
 * 2.) Query object is extracted from UI using global document object (CampusExplorer.buildQuery)
 * 3.) Query object is sent to the POST /query endpoint using global XMLHttpRequest object (CampusExplorer.sendQuery)
 * 4.) Result is rendered in the reference UI by calling CampusExplorer.renderResult with the response from the endpoint as argument
 */
const submit_button =  document.getElementById("submit-button");
submit_button.onclick = function() {
    var query = CampusExplorer.buildQuery();
    CampusExplorer.sendQuery(query).then(function (result){
        // window.alert(result);
        CampusExplorer.renderResult(JSON.parse(result));
    }).catch(function (reason) {
        window.alert("cannot send the query" + reason)
    });
};


// var query  = CampusExplorer.buildQuery();
// try {
//     CampusExplorer.sendQuery(query).then(function (result){
//         CampusExplorer.renderResult(result);
//     }).catch(function (reason) {
//         window.alert("cannot send the query" + reason)
//     });
// }
// catch (err){
//     window.alert("catch :" + err);
// }
