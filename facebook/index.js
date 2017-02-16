var start =0;
var pageSize=10;
var baseURL;
var wholeUrl;
var solr = null;
var pageOwner ="";
var statusType ="";
var pageType ="";
var country_source ="";
var wheelInstance;
var esResponse = null;

function initialize(){
  $(document).ready(function(){
   // do jQuery
  });
  getUrl();
  start=0;
  document.getElementById('paginating').value='10';
  document.getElementById('sortselect').selectedIndex = 4;
  makeSolrSearch(lookup());
}


function lookup(){
  var isQuery=false;
  var query = new Object();
  var boolFilter = JSON.parse("{\"must\" :[],\"should\":[],\"must_not\":[]}");
  var filtered = new Object();
  var filter = new Object();
  query.filtered = filtered;
  filtered.filter= filter;
  filter.bool = boolFilter;
  if(document.getElementById("freetext").value != ""){
    isQuery=true;
    var arr = document.getElementById("freetext").value.split(";");
    for(var temp = 0;temp <arr.length;temp++){
       if(arr[temp].trim().length >0){
         var match_phrase = JSON.parse("{\"match_phrase\":{\"message\":\"" +arr[temp].trim() +"\"}}");
         boolFilter.must.push(match_phrase);
       }  
    }
  }
  if(document.getElementById("tagText").value != ""){
    isQuery=true;
    var arr = document.getElementById("tagText").value.split(";");
    for(var temp = 0;temp <arr.length;temp++){
       if(arr[temp].trim().length >0){
         var match_phrase = JSON.parse("{\"match_phrase\":{\"userTagged\":\"" +arr[temp].trim() +"\"}}");
         boolFilter.must.push(match_phrase);
       }  
    }
  }
  statusType = document.getElementById('statusType').value;
  if(statusType !=""){
    isQuery=true;
    str = "{ \"term\" : {\"status_type\" :\""+statusType+"\"}}";
    boolFilter.must.push(JSON.parse(str));
  }
  pageOwner = document.getElementById('pageOwner').value;
  if(pageOwner != ""){
    isQuery=true;
    str = "{ \"term\" : {\"status_from\" :\""+pageOwner+"\"}}";
    boolFilter.must.push(JSON.parse(str));
  }
  pageType = document.getElementById('pageType').value;
  if(pageType != ""){
    isQuery=true;
    str = "{ \"term\" : {\"pageType\" :\""+pageType+"\"}}";
    boolFilter.must.push(JSON.parse(str));
  }
  if(document.getElementById("fromDate").value != "" || document.getElementById("toDate").value != ""){
    isQuery = true;
    var dateFilter = JSON.parse("{\"range\": {\"created\":{}}}");
    if(document.getElementById("fromDate").value != "")
      dateFilter.range.created.gte = document.getElementById("fromDate").value;
    if(document.getElementById("toDate").value != "")
      dateFilter.range.created.lte = document.getElementById("toDate").value;
    dateFilter.range.created.format= "yyyy-MM-dd";
    boolFilter.must.push(dateFilter);
  }
  return isQuery==false?null:query;
}


function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

function setToZero(){
  document.getElementById('pageOwner').value="";
  document.getElementById('pageType').value="";
  document.getElementById('statusType').value="";
  document.getElementById('freetext').value="";
  document.getElementById('tagText').value="";
  document.getElementById('sortselect').selectedIndex=4;
  document.getElementById('paginating').value="10";
  document.getElementById('fromDate').value="";
  document.getElementById('toDate').value="";
  start=0;
  makeSolrSearch(lookup());


}


function initSearch(){
  start=0;
  pageSize= parseInt(document.getElementById("paginating").value,10);
  makeSolrSearch(lookup());

}

function setSort(){
  var sortDef = JSON.parse("[]");
  if(document.getElementById("sortselect").value != "")
    sortDef.push (JSON.parse(document.getElementById("sortselect").value));
  return  sortDef;
    
}
/*
  var preSpan ="<span style='color:red'>";
  var postSpan = "</span>";  
*/

function setHighlight(){
  var str=  "{\"pre_tags\":[\"<span style='color:blue'>\"],\"post_tags\":[\"</span>\"],\"fields\" : { \"message\" : {\"fragment_size\" : 10000, \"number_of_fragments\" : 1}}}";
  var b = JSON.parse(str);
  return JSON.parse(str);
}

function makeSolrSearch(q){
  so = new Object();
  if(q != null){
    so.query = q;
  }
  if(document.getElementById("freetext").value != "")
    so.highlight = setHighlight();
  so.sort = setSort();
  so.from= start;
  so.size=pageSize;
  var aggs = new Object();
  so.aggs = aggs;
  so.aggs.page = JSON.parse("{\"terms\":{\"field\": \"status_from\",\"size\":0}}");
  so.aggs.statustype = JSON.parse("{\"terms\":{\"field\": \"status_type\",\"size\":0}}");
  so.aggs.pageType = JSON.parse("{\"terms\":{\"field\": \"pageType\",\"size\":0}}");
  if(document.getElementById("pageType").value != null){
    so.aggs.userTags = JSON.parse("{\"terms\":{\"field\": \"userTagged\", \"order\":{\"_term\": \"asc\"},\"size\":0}}");
  }
  if(q != null)
    so.query =q;
  alert(JSON.stringify(so,null,2));  
  formData = new Object();
  formData.elasticdata = JSON.stringify(so,null,2);

  $.ajax({
     url: "elasticpost.php", 
     type: 'post',
     data:formData,
     error: function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+ " errorthrown "+ errorThrown);
     },
     success: function(data){
       esResponse = new ElasticSearch();
       esResponse.setMainObject(data);
       fillPortal();
     },
     dataType:"json"
  });  

}


function getUrl(){
  var lok = location.href;
  var pos = lok.indexOf("?");
  if(pos != -1)
	  lok=lok.substring(0,pos+1);
  else{
    lok += "?";
  }
  baseURL=lok;
  wholeUrl = location.href;
}

function appendTag(){
  document.getElementById("tagText").value = document.getElementById("tagText").value+document.getElementById("tagSelect").value+ ";";
  initSearch();
}

function fillPortal(){
  document.getElementById("bla").innerHTML = nextAndPreviousButtons();
  document.getElementById("testtable").innerHTML = "<table class='tableClass'>"+getResultList(document.getElementById('hideBodyText').checked)+"</table>";

  removeAllOptions("pageOwner");
  var selBox = document.getElementById("pageOwner");
  var arr = esResponse.getFacetFieldWithFacetName("page");
  addOption(selBox,"Choose","");
  for (var temp = 0;temp < arr.length;temp++){
    var bucket = arr[temp];
    addOption(selBox,bucket.key +" ("+bucket.doc_count+")",bucket.key);
  }
  selBox.value=pageOwner;

  removeAllOptions("statusType");
  selBox = document.getElementById("statusType");
  var arr = esResponse.getFacetFieldWithFacetName("statustype");
  addOption(selBox,"Choose","");
  for (var temp = 0;temp < arr.length;temp++){
    var bucket = arr[temp];
    addOption(selBox,bucket.key +" ("+bucket.doc_count+")",bucket.key);
  }
  selBox.value=statusType;


  removeAllOptions("pageType");
  selBox = document.getElementById("pageType");
  var arr = esResponse.getFacetFieldWithFacetName("pageType");
  addOption(selBox,"Choose","");
  for (var temp = 0;temp < arr.length;temp++){
    var bucket = arr[temp];
    addOption(selBox,bucket.key +" ("+bucket.doc_count+")",bucket.key);
  }
  selBox.value=pageType;


  removeAllOptions("tagSelect");
  if(pageType != ""){
    document.getElementById("tagSelect").style.visibility = "visible";  
    selBox = document.getElementById("tagSelect");
    var arr = esResponse.getFacetFieldWithFacetName("userTags");
    addOption(selBox,"Choose","");
    for (var temp = 0;temp < arr.length;temp++){
      var bucket = arr[temp];
      addOption(selBox,bucket.key +" ("+bucket.doc_count+")",bucket.key);
    }
  
 }else
   document.getElementById("tagSelect").style.visibility = "hidden";
}
function isNextPage(){
  if((start+pageSize)<esResponse.getDocCount())
    return true;
}

function isPrevPage(){
  if(start>0)
    return true;
}

function exportRows(){
  document.getElementById("resultatvisning").style.display='none';
  document.getElementById("exportDiv").style.display='block';
  var docs = esResponse.getDocs();
  var list = document.getElementById("liste");
//  list.value = "COUNTRY\tID\tPAGE\tTITLE\tSTATUS_TYPE\tSTATUS_FROM\tLINK\tCREATED\tLIKES\tSHARES\tCOMMENT_PAGE\tCOMMENT_AUTHOR\tCOMMENT_ALL\tSEE_STATUS\tMESSAGE\r";
  list.value ="Owner\tDate\tTitle\tLikes\tShares\tComments\tPost\tLink\r";

  var listContent = "";
  for(var temp =0; temp < docs.length;temp++){
    listContent+=esResponse.getSingleFieldFromDoc(docs[temp],"status_from")+"\t";
    listContent+=esResponse.getSingleFieldFromDoc(docs[temp],"title")+"\t";
    listContent+=esResponse.getSingleFieldFromDoc(docs[temp],"status_type")+"\t";
    listContent+=esResponse.getSingleFieldFromDoc(docs[temp],"status_from")+"\t";
    listContent+=esResponse.getSingleFieldFromDoc(docs[temp],"link")+"\t";
    listContent+=esResponse.getSingleFieldFromDoc(docs[temp],"created")+"\t";
    listContent+=esResponse.getSingleFieldFromDoc(docs[temp],"likes")+"\t";
    listContent+=esResponse.getSingleFieldFromDoc(docs[temp],"shares")+"\t";
    listContent+=esResponse.getSingleFieldFromDoc(docs[temp],"comments")+"\t";
    listContent+=esResponse.getSingleFieldFromDoc(docs[temp],"see_status")+"\t";
    listContent+=esResponse.getSingleFieldFromDoc(docs[temp],"message")+"\r";
  }
  list.value += listContent;
  alert(docs.length + " rows exported");
}

//page_comments


function exportComments(){
  document.getElementById("resultatvisning").style.display='none';
  document.getElementById("exportDiv").style.display='block';
  var docs = solr.getDocs();
  var list = document.getElementById("liste");
  list.value = "";
  var listContent = "";
  for(var temp =0; temp < docs.length;temp++){
    if(solr.getSingleFieldFromDoc(docs[temp],"page_comments") !=""){
      listContent+=solr.getSingleFieldFromDoc(docs[temp],"page_comments").replace(/<hr>/g,"<hr>\r");
    }  
  }
  list.value += listContent;
  alert(docs.length + " rows of comments exported");
}


function backToResultList(){
 document.getElementById("resultatvisning").style.display='block';
 document.getElementById("exportDiv").style.display='none';
}

function nextAndPreviousButtons(){
  var form2 = "";
  form2 = "<form method='get' name='moveForm' accept-charset='UTF-8'>";
  form2 +=  "<table width='100%' style='margin-left: 50px;text-align: left;' border='0' cellpadding='2' cellspacing='2'>";
  form2 += "<tr><td colspan='1' style='text-align: left; height: 40px'>";
  if(isNextPage()||isPrevPage()){
     if(isPrevPage()){
      var s = start-pageSize; 
      form2 += "<input type='button' class='forrige_neste' value='Previous' ";
      form2 += " onclick='move("+s+")'/> ";
     }
     if(isNextPage()){
       var s = start+pageSize; 
       form2 += "<input type='button' class='forrige_neste' value='Next' ";
       form2 += " onclick='move("+s+")'/>";
     }
     form2 += " "+  getCountLabel();
  }
  form2 +="&nbsp;&nbsp;<input type='button' class='forrige_neste' value='Export' onclick='exportRows()'/></td></tr></table></form>";
  return form2;
}

function move(newStart){
  start=newStart;
  makeSolrSearch(lookup());
}


function getCountLabel(){
   var countLabel = ""
   if(esResponse.getDocCount() >0){
     if(start == 0)
       countLabel = "1";
     else
       countLabel=start;
     countLabel += "-";
     if(isNextPage())
       countLabel +=(start+pageSize);
     else
       countLabel += esResponse.getDocCount();
     countLabel += " of " + esResponse.getDocCount();
   }else{
     countLabel = "0 posts - search again"; 
   }
   return countLabel;  
}

function getInternetExplorerVersion()
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
{
  var rv = -1; // Return value assumes failure.
  if (navigator.appName == 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
  }
  return rv;
}

function changeBodyTextInResultList(){
  document.getElementById("testtable").innerHTML = "<table class='tableClass'>"+getResultList(document.getElementById('hideBodyText').checked)+"</table>";

}

function getResultList(hideText){
  var resultCode="";
  var docs = esResponse.getDocs();

  var pos;
  var preSpan ="<span style='color:red'>";
  var postSpan = "</span>";  
  resultCode +="<tr class='trResult'><th class='thResult'>Owner/date</th><th class='thResult'>Title/Type</th><th class='thResult'>Likes</th><th class='thResult'>Shares</th><th class='thResult'>Comments</th><th class='thResult'>Body text</th><th class='thResult'>Post/Link</th></tr>";
  var index = document.getElementById('sortselect').selectedIndex;
  for(var temp=0;temp<docs.length;temp++){
    if(index != 5 && index != 6)
      resultCode +="<td class='tdBorder'>"+ esResponse.getSingleFieldFromDoc(docs[temp],"status_from")+"<br>"+esResponse.getSingleFieldFromDoc(docs[temp],"created")+postSpan + "</td>";
    else  
      resultCode +="<td class='tdBorder'>"+ esResponse.getSingleFieldFromDoc(docs[temp],"status_from")+"<br>"+preSpan + esResponse.getSingleFieldFromDoc(docs[temp],"created")+postSpan +"</td>";

    resultCode +="<td class='tdBorder'>"+ esResponse.getSingleFieldFromDoc(docs[temp],"title")+"<br>("+ esResponse.getSingleFieldFromDoc(docs[temp],"status_type") +")</td>";
    if(index!=1)
      resultCode +="<td class='tdBorder'>"+ esResponse.getSingleFieldFromDoc(docs[temp],"likes")+"</td>";
    else
      resultCode +="<td class='tdBorder'>"+ preSpan+esResponse.getSingleFieldFromDoc(docs[temp],"likes")+postSpan+"</td>";
    if(index!=2)
      resultCode +="<td class='tdBorder'>"+ esResponse.getSingleFieldFromDoc(docs[temp],"shares")+"</td>";
    else  
      resultCode +="<td class='tdBorder'>"+ preSpan + esResponse.getSingleFieldFromDoc(docs[temp],"shares")+postSpan+"</td>";
    if(index!=3)
      resultCode +="<td class='tdBorder'>"+ esResponse.getSingleFieldFromDoc(docs[temp],"comments")+postSpan+"</td>";
    else
      resultCode +="<td class='tdBorder'>"+ preSpan + esResponse.getSingleFieldFromDoc(docs[temp],"comments")+postSpan+"</td>";
    if(hideText==true){
       resultCode +="<td class='tdBorder'></td>";
    }else{
		if(document.getElementById("freetext").value=="")
		  resultCode +="<td class='tdBorder'>"+ esResponse.getSingleFieldFromDoc(docs[temp],"message")+"</td>";
		else{ 
			resultCode +="<td class='tdBorder'>"+ esResponse.getHighlightFieldFromDoc(docs[temp],"message")+"</td>";
	
		}  
    }
    resultCode +="<td class='tdBorder'><a target='_blank' href='"+ esResponse.getSingleFieldFromDoc(docs[temp],"see_status")+"'>Post</a>";
    if(esResponse.getSingleFieldFromDoc(docs[temp],"link") !="" && esResponse.getSingleFieldFromDoc(docs[temp],"link") != esResponse.getSingleFieldFromDoc(docs[temp],"see_status"))
      resultCode +="<br><a target='_blank' href='"+ esResponse.getSingleFieldFromDoc(docs[temp],"link")+"'>Link</a>";
    resultCode +="</td>";
    resultCode +="</tr>";
  }  

  if(temp > 0){
       var i = temp % 5;
       for(var t = 0; t < i;t++)
          resultCode += "<td></td>";
       resultCode += "</tr>";
  }
  return resultCode;
}



function resize() {
}

