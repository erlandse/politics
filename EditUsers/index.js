var eS;

function initialize(){

  $(document).ready(function(){
   // do jQuery
  });
  loadUsers();
}

function putPhp(formData){
  $.ajax({
     url: "putpost.php", 
     type: 'post',
     data:formData,
     error: function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+ " errorthrown "+ errorThrown);
     },
     success: function(data){
       refresh();
     },
     dataType:"json"
  });  
}  

function refreshPhp(){
  $.ajax({
     url: "refresh.php", 
     type: 'post',
     data:"",
     error: function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+ " errorthrown "+ errorThrown);
     },
     success: function(data){
       loadUsers();
     },
     dataType:"json"
  });  
}  



function deletePhp(formData){
  $.ajax({
     url: "delete.php", 
     type: 'post',
     data:formData,
     error: function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+ " errorthrown "+ errorThrown);
     },
     success: function(data){
       refresh();
     },
     dataType:"json"
  });  
}  


function getPhp(formData,callBack){
  $.ajax({
     url: "get.php", 
     type: 'post',
     data:formData,
     error: function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+ " errorthrown "+ errorThrown);
     },
     success: function(data){
       callBack(data);
     },
     dataType:"json"
  });
}  


function postPhp(formData,callBack){
  $.ajax({
     url: "post.php", 
     type: 'post',
     data:formData,
     error: function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+ " errorthrown "+ errorThrown);
     },
     success: function(data){
       callBack(data);
     },
     dataType:"json"
  });  
}  


function setUpDataObject(){
  var obj = new Object();
  obj.id= document.getElementById("userid").value.toLowerCase();
  obj.pageType=document.getElementById("selectTypeOfUser").value
  obj.userTags = document.getElementById("userTags").value;
  obj.twitterAccount = document.getElementById("twitterAccount").value;
  return obj;

}

function save(){
  var obj = setUpDataObject();
  formData = new Object();
  formData.elasticdata =  JSON.stringify(obj,null,2);
  formData.resturl = document.getElementById("userid").value.toLowerCase();
  putPhp(formData); 

}


function newPage(){
  var obj = setUpDataObject();
  formData = new Object();
  formData.elasticdata =  JSON.stringify(obj,null,2);
  formData.resturl = document.getElementById("userid").value.toLowerCase()+"/_create";
  putPhp(formData); 
}


function fillUsers(data){
  removeAllOptions("selectUsers");
  eS = new ElasticSearch();
  eS.setMainObject(data);
  var docs = eS.getDocs();
  sel = document.getElementById("selectUsers");
  for(var temp = 0; temp < eS.numFound;temp++){
   addOption(sel,eS.getSingleFieldFromDoc(docs[temp],"id"),eS.getSingleFieldFromDoc(docs[temp],"id"));
  }
  
}


function loadUsers(){
  formData= new Object();
  var es = new Object();
  es.size=1000;
  var sortDef = JSON.parse("[]");
  sortDef.push(JSON.parse("{\"id\":{\"order\":\"asc\"}}"));
  es.sort = sortDef;
  formData.elasticdata=JSON.stringify(es,null,2);
  formData.resturl = "_search";
  postPhp(formData,fillUsers);
}

function fillFields(){
  var docs = eS.getDocs();
  var index = document.getElementById("selectUsers").selectedIndex;
  if(index==-1)
    return;
  var doc = docs[index];
  document.getElementById('userid').value = eS.getSingleFieldFromDoc(doc,"id");
  document.getElementById('selectTypeOfUser').value = eS.getSingleFieldFromDoc(doc,"pageType");
  document.getElementById('userTags').value = eS.getSingleFieldFromDoc(doc,"userTags");
  document.getElementById('twitterAccount').value = eS.getSingleFieldFromDoc(doc,"twitterAccount");

}

function refresh(){
  refreshPhp();
}

function deleteUser(){
  if(document.getElementById("selectUsers").selectedIndex == -1)
    return;
  formData = new Object();
  formData.resturl = document.getElementById("selectUsers").value;
  deletePhp(formData);
}  

function copyPhp(index){
  var docs = eS.getDocs();
  var formData;
  if(index >= docs.length){
    alert("Finish");
    return;
  }
  formData = new Object();
  formData.elasticdata =  JSON.stringify(docs[index]._source,null,2);
  formData.resturl = docs[index]._source.id;
  $.ajax({
     url: "newindexput.php", 
     type: 'post',
     data:formData,
     error: function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+ " errorthrown "+ errorThrown);
     },
     success: function(data){
       copyPhp(index+1);

     },
     dataType:"json"
  });  
}  
