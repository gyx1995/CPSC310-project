/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */
CampusExplorer.buildQuery = function() {
    let query = {};
    // TODO: implement!
    // console.log("CampusExplorer.buildQuery not implemented yet.");
    const className = document.getElementsByClassName("nav-item tab active");
    // console.log(" classname "+ className[0].textContent);
    let id ="";
    if ( className[0].textContent === "Courses"){
        id = "courses_";
    } else {
        id = "rooms_";
    }
    /////form conditions group
    var final_cond = form_where(id);
    // window.alert(JSON.stringify(final_cond));
    // find all the colum key;
    var array_columns = form_column(id);
    // window.alert(JSON.stringify(array_columns));
    // find all the order key
    var order_keys = form_order(id);
    // window.alert(JSON.stringify(order_keys));
    // find all group keys
    var group_keys = form_group(id);
    // window.alert(JSON.stringify(group_keys));
    // find the transformation
    var trans_re = form_trans(id);
    // window.alert(JSON.stringify(trans_re));
    // get the order direction
    var control = 0;
    if (id === "rooms_"){
        control = 1;
    }
    var dir = document.getElementsByClassName("control descending")[control]
        .getElementsByTagName("input")[0];
    query["WHERE"] = final_cond;
    query["OPTIONS"] = {};
    query["OPTIONS"]["COLUMNS"] = array_columns;
    if (order_keys.length >= 1) {
        query["OPTIONS"]["ORDER"] = {};
        if (dir.checked) {
            query["OPTIONS"]["ORDER"]["dir"] = "Down";
        } else {
            query["OPTIONS"]["ORDER"]["dir"] = "UP";
        }
        query["OPTIONS"]["ORDER"]["keys"] = order_keys;
    }
    if (trans_re.length >= 1) {
        query["TRANSFORMATIONS"] = {};
        query["TRANSFORMATIONS"]["GROUP"] = group_keys;
        query["TRANSFORMATIONS"]["APPLY"] = trans_re;
    }
    // CampusExplorer.sendQuery(query);
    // window.alert(JSON.stringify(query));
    return query;
};
function form_trans(id){
    var control = 0;
    if (id === "rooms_"){
        control = 1;
    }
    var apply_array = [];
    var trans_elements = document.getElementsByClassName("transformations-container")[control].getElementsByClassName('control-group transformation');
    // window.alert(trans_elements.length);
    for (var tran of trans_elements){
        var term = tran.getElementsByClassName("control term")[0].getElementsByTagName("input")[0].value;
        var trans_operators = tran.getElementsByClassName("control operators")[0].getElementsByTagName("select")[0];
        var operator = trans_operators.options[trans_operators.selectedIndex].textContent.trim().toUpperCase();
        var trans_key_field = tran.getElementsByClassName("control fields")[0].getElementsByTagName("select")[0];
        var trans_key = trans_key_field.options[trans_key_field.selectedIndex].value.trim().toLowerCase();
        var a = {};
        a[term] = {};
        a[term][operator] = id + trans_key;
        apply_array.push(a);
    }
    return apply_array;
}
function form_group(id){
    var control = 0;
    if (id === "rooms_"){
        control = 1;
    }
    var group_array =[];
    var columns = document.getElementsByClassName("form-group groups")[control]
        .getElementsByClassName("control field");
    // window.alert(columns.length);
    for (let c of columns){
        if (c.getElementsByTagName("input")[0].checked){
            var v = c.getElementsByTagName("input")[0].getAttribute("data-key");
            // window.alert(id + v.trim());
            group_array.push(id + v.trim());
        }
    }
    return group_array;
}
function form_order(id){
    var keys = ["dept", "id"
        , "avg", "instructor"
        , "title" , "pass"
        , "fail" , "audit"
        , "uuid", "fullname", "shortname"
        , "number", "name" , "address" , "type" , "furniture" , "href",
            "lat" , "lon" , "seats"];
    var control = 0;
    if (id === "rooms_"){
        control = 1;
    }
    var re = [];
    var order_keys = document.getElementsByClassName("form-group order")[control]
        .getElementsByTagName("option");
    // window.alert(order_keys.length);
    for (var k of order_keys){
        if (k.selected){
            // window.alert(id + k.value.trim().toLowerCase());
            var newkey = k.value.trim().toLowerCase();
            if (keys.includes(newkey)) {
                re.push(id + newkey);
            }
            else {
                re.push(newkey);
            }
        }
    }
   return re;
}
function form_where(id) {
    const Nkey= [
        "courses_avg",  "courses_pass"
        , "courses_fail" , "courses_audit", "courses_year","rooms_lat" , "rooms_lon" , "rooms_seats"];
    var control = 0;
    if (id === "rooms_"){
        control = 1;
    }
    let Con = -1;
    let conditions_type = document.getElementsByClassName("control-group condition-type")[0].getElementsByTagName('input');
    for (var i = 0; i < conditions_type.length; i++) {
        if (conditions_type[i].checked) {
            Con = i;
        }
    }
    var count = 0;
    var cond_array = [];
    var condition_element = document.getElementsByClassName("conditions-container")[control].getElementsByClassName('control-group condition');
    for (var c of condition_element) {
        count ++;
        var control_not = c.getElementsByClassName("control not")[0].getElementsByTagName("input")[0].checked;
        var control_fields = c.getElementsByClassName("control fields")[0].getElementsByTagName("select")[0];
        var key = control_fields.options[control_fields.selectedIndex].value.trim().toLowerCase();
        var control_operators = c.getElementsByClassName("control operators")[0].getElementsByTagName("select")[0];
        var operator = control_operators.options[control_operators.selectedIndex].textContent.trim().toUpperCase();
        var control_term = c.getElementsByClassName("control term")[0].getElementsByTagName("input")[0].value.trim();
        var cond_obj = {};
        cond_obj[operator] = {};
        var id_key = id + key;
        if (Nkey.includes(id_key)){
            cond_obj[operator][id + key] =  Number(control_term);
        } else {
            cond_obj[operator][id + key] = control_term;
        }
        if (control_not) {
            cond_obj = {"NOT": cond_obj};
        }
        cond_array.push(cond_obj);
    }
    var final_cond = {};
    if (count > 1) {
        if (Con === 0) {
            final_cond["AND"] = cond_array;
        } else if (Con === 1) {
            final_cond["OR"] = cond_array;
        } else {
            var help = {"AND": cond_array};
            final_cond["NOT"] = help;
        }
    } else {
        if (Con === 2){
            final_cond["NOT"] = cond_array[0];
        } else {
            final_cond = cond_array[0];
        }
    }
    if (count === 0){
        final_cond = {};
    }
    return final_cond;
}
function form_column(id){
    var control = 0;
    if (id === "rooms_"){
        control = 1;
    }
    var column_array =[];
    var columns = document.getElementsByClassName("form-group columns")[control]
        .getElementsByClassName("control field");
    var added_columns = document.getElementsByClassName("form-group columns")[control]
        .getElementsByClassName("control transformation");
        // window.alert("see" + added_columns);
    for (let c of added_columns){
        if (c.getElementsByTagName("input")[0].checked){
            var v = c.getElementsByTagName("input")[0].getAttribute("data-key");
            // window.alert(id + v.trim());
            column_array.push(v.trim());
        }
    }
    for (let c of columns){
         if (c.getElementsByTagName("input")[0].checked){
             var v = c.getElementsByTagName("input")[0].getAttribute("data-key");
             // window.alert(id + v.trim());
             column_array.push(id + v.trim());
         }
    }
    // window.alert(column_array);
    return column_array;
}
