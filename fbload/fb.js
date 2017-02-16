var accessToken = "";
var postClass = null;
var fillTextCounter = 0;
var pageIndex =0;
var exportList = null;
var likesList = null;
var singleComments = null;
var facebookList = "";
var created = 0;
var headers = null;
commentCount=0;
//var pageArray = new Array();
var userArray = null;
var eS = null;

var singleUpload= false;

function initialize(){
  $(document).ready(function(){

  });
/*  pageArray.push("svparti");
  pageArray.push("hoyre");
  pageArray.push("fremskrittspartiet");*/
  document.getElementById('whenMetadataLoadet').style.display = "block";
  
  checkFacebookStatus();
  loadUsers();
}


function loadUsersPhp(formData){
  $.ajax({
     url: "loadUsers.php", 
     type: 'post',
     data:formData,
     error: function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+ " errorthrown "+ errorThrown);
     },
     success: function(data){
       eS = new ElasticSearch();
       eS.setMainObject(data);
       userArray = eS.getDocs();	
     },
     dataType:"json"
  });  
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
  loadUsersPhp(formData);
}

function startRunning(){
  var i = parseInt(document.getElementById("startFrom").value);
  runBatch(i);
}

function runBatch(index){
  if(singleUpload == true){
    alert("finish news appended "+ created);
    return;
  }
  singleUpload = false;
  if(index ==0){
    created = 0;
  }  
  pageIndex = index;
  document.getElementById("startFrom").value = index;
  if(index >= userArray.length){
    alert("finish news " + created);
    return;
  }
  batchGetMetadata(eS.getSingleFieldFromDoc(userArray[index],"id"));
}

function runSingle(){
  singleUpload = true;
  created = 0;
  var temp;
  var pageId= document.getElementById("singleLoad").value;
  for(temp = 0;temp < userArray.length;temp++){
    if((eS.getSingleFieldFromDoc(userArray[temp],"id"))==pageId){
      pageIndex= temp;
      batchGetMetadata(pageId);
      return;
    }
  }
  alert("id not found");
}

  function clear(){
    document.getElementById('metadataName').innerHTML="";
    document.getElementById('metadataCategory').innerHTML="";
    document.getElementById('metadataDescription').value=""

    document.getElementById("liste2").value="";
    document.getElementById('loading').value ="";
    document.getElementById("loadSheet").value = "";

  }
  

  function batchGetMetadata(pageId){
    clear();
    loadMetadata(metadataClass,pageId,metadataCallback);
  }

  
  function loadMetadata(metadataClass,user,callBack){
	FB.api('/'+user+'?metadata=1&fields=name,category,description,likes,talking_about_count', function(response) {
	  metadataClass.userData = response;
	  metadataClass.userId=response.id;
	  callBack();
	});
  
}


  function metadataCallback(){
    if(metadataClass.hasMetadataError() != ""){
      alert(metadataClass.hasMetadataError());
      return;
    }
    document.getElementById('whenMetadataLoadet').style.display = "block";
//    document.getElementById('whenPostsLoadet').style.display = "none";

    document.getElementById('metadataName').innerHTML= drill(metadataClass.userData,"name");
    document.getElementById('metadataCategory').innerHTML=drill(metadataClass.userData,"category");
    document.getElementById('metadataDescription').value=drill(metadataClass.userData,"description");
    document.getElementById('metadataLikes').innerHTML= drill(metadataClass.userData,"likes");
    document.getElementById('metadataTalkingAboutCount').innerHTML=drill(metadataClass.userData,"talking_about_count");
    allPosts();

  }
  

function drill (p, path) {
    if(this.isEmpty(p))
      return'';
	 a = path.split(".");
	 for (i in a) {
	   var key = a[i];
	   if (p[key] == null)
		 return '';
	   p = p[key];
	 }
	 return p;
  }


function isEmpty (obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

function myLogin(){
 FB.login(function(response) {
//    document.getElementById('felt').value = JSON.stringify(response, null, 2);
     accessToken = response.authResponse.accessToken;
     userId = response.authResponse.userID;
//     document.getElementById('felt').value= accessToken;

 }, {scope: 'user_likes,user_status,user_posts'});
}
   
function checkFacebookStatus(){
  FB.getLoginStatus(function(response) {
  if (response.status === 'connected') {
     accessToken = response.authResponse.accessToken;
     userId = response.authResponse.userID;
    // the user is logged in and has authenticated your
    // app, and response.authResponse supplies
    // the user's ID, a valid access token, a signed
    // request, and the time the access token 
    // and signed request each expire
  } else if (response.status === 'not_authorized') {
     myLogin();
  } else {
     myLogin();
  }
 });

}

function fillTabTextAsync(){
  var list = document.getElementById("liste2");
  list.value = "ID\tTITLE\tSTATUS_TYPE\tSTATUS_FROM\tLINK\tCREATED\tLIKES\tSHARES\tCOMMENTS\tSEE_STATUS\tMESSAGE\r";
  likesList = new Array();
  if(databaseConnection == true)
    document.getElementById('uploadDiv').style.display='block';
  fillAPILikesList(0);
}

function fillAPILikesList(nr){
  if(nr >= postClass.postArray.length){
     fillTabTextOneLine(0);
  }else{
     FB.api("/"+postClass.postArray[nr].id+'/likes?summary=true&accessToken='+accessToken, function(response){
       document.getElementById("loadSheet").value = "Likes nr: " + nr;
       likesList.push(""+postClass.drill(response,"summary.total_count"));
       nr = nr+1;
       fillAPILikesList(nr);
     });
  
  }

}




function getRemote(remote_url) {
	return $.ajax({
		type: "GET",
		url: remote_url,
		async: false
	}).responseText;
 }



function fillTabTextOneLine(nr){
  if(nr >= postClass.postArray.length){
    loadFacebook();
    return;
  }
  fillTextCounter = nr;

  var list = document.getElementById("liste2");
  var post = postClass.postArray[nr];
  document.getElementById("loadSheet").value = ""+nr;
  if(databaseConnection == true)
    list.value +=document.getElementById("Nation").value+"\t";
  list.value +=postClass.getPostId(post)+"\t";
  if(databaseConnection == true)
    list.value +=metadataClass.userData.name+"\t";
  list.value += removeTabsAndNewlines(postClass.getName(post)) + "\t";
  FB.api("/"+post.id+"/?fields=shares,status_type,from,link&accessToken='"+accessToken, function(response){
     list.value += postClass.drill(response,"status_type")+"\t";
     list.value += postClass.drill(response,"from.name")+"\t";
     list.value += postClass.drill(response,"link")+"\t";
     list.value += (postClass.getCreationTime(post).substring(0,10))+"\t";
     list.value += likesList[fillTextCounter]+"\t";
     if(postClass.drill(response,"shares.count") =="")
       list.value +="\t"
     else
       list.value += response.shares.count +"\t";
     FB.api("/"+postClass.getPostId(post)+'/comments?summary=true&accessToken='+accessToken, function(resp){
        list.value += postClass.drill(resp,"summary.total_count")+"\t";
        writeAsyncRestOfLine();
//        getAllComments(resp, new Array(),getReplies);
     });
  });



}

function removeTabsAndNewlines(str){
  str=str.replace(/\t/g,' '); 
  str=str.replace(/\n/g,'<br>'); 
  str=str.replace(/\r/g,'');
  str=str.replace(/"/g,'\'');

  return str;
}


function writeAsyncRestOfLine(){
  var list = document.getElementById("liste2");
  var post = postClass.postArray[fillTextCounter];
  var arr = postClass.getPostId(post).split("_");
  link= "https://www.facebook.com/"+metadataClass.userId+"/posts/"+arr[1];
  list.value += link + "\t";
  var str = postClass.getMessage(post);
  str = removeTabsAndNewlines(str);
  if(databaseConnection == true){
    list.value += str + "\t";
    list.value += metadataClass.getMetadataField("category")+"\t";
    str= postClass.getCommentMessagesFrom(metadataClass.userId,post,metadataClass.userId);
    str=removeTabsAndNewlines(str);
    list.value += str+"\r";
  }else  
    list.value += str + "\r";

  fillTextCounter +=1;
  fillTabTextOneLine(fillTextCounter);
}

function allPosts(){
  var i;
  if(inputDateOK()==false)
    return;
  postClass = new FBPost();
  var timeRegulation = "since="+document.getElementById('fromDate').value+"&";
  if(document.getElementById('toDate').value !="")
    timeRegulation +="until="+document.getElementById('toDate').value+"&";
  var ps= parseInt(document.getElementById("pageSizeSelect").value);  
  FB.api("/"+metadataClass.userId+"/posts?"+timeRegulation,{limit:ps}, function(response) { 
   if(postClass.drill(response,"error.message")!=""){
      alert(JSON.stringify(response,null,2));
      alert('An error occurred - ' + postClass.drill(response,"error.message"));
      return;
   }
   postClass.placeToWriteProgress = 'loading';
   getAllPosts(response,new Array(),finishLoadPost);
   return;
 
  });
}



  function getAllPosts(response,resultArray,finishCallBack){
    var arr = new Array();
    var finish = false;
    var fromDate = document.getElementById('fromDate').value;
    for(var temp = 0; temp < response.data.length;temp++){
        if(postClass.getName(response.data[temp]) == ""){
          if(postClass.getMessage(response.data[temp]) != ""){
            var st = postClass.getMessage(response.data[temp]);
            var length = 0;
            if(st.length > 60){
              length = st.lastIndexOf(" ",60);
              if(length == -1)
                length=60;
            }  
            else
              length = st.length;
            st = st.substring(0,length);
            st=st.replace(/\t/g,' '); 
            st=st.replace(/\n/g,''); 
            st=st.replace(/\r/g,''); 
            response.data[temp].name=st;
          }  
        }  
		if(postClass.getName(response.data[temp]) != ""){
		   if(postClass.getCreationTime(response.data[temp]) < fromDate){
		     finish = true;
		   }  
		   else{  
		     arr.push(response.data[temp]);
		   }  
		}
	}
   if(arr.length > 0 && document.getElementById("ignoreDublets").checked==false){
     var id = arr[arr.length-1].id;
     var res = JSON.parse(getRemote("getCall.php?id="+id));
     if(res.found == true){
       finish=true;
     }
   }
    resultArray = resultArray.concat(arr);
    if(finish==true){
	 	finishCallBack(resultArray);
	 	return;
    }
    if(resultArray.length >= postClass.maximum){
	 	finishCallBack(resultArray);
	 	return;
	} 	
	if(postClass.drill(response, "paging") == "" || postClass.drill(response, "paging.next") == ""){
		finishCallBack(resultArray);
		return;
	}
	if(response.data.length >0)
        document.getElementById('loading').value = postClass.getCreationTime(response.data[0]).substring(0,10) + " ("+resultArray.length+")";

	postClass.getNextAsyncPage(response.paging.next,resultArray,getAllPosts,finishCallBack);
  }


function finishLoadPost(resultArray){
  var toDate = document.getElementById('toDate').value;
  if(toDate != ""){
    var temp = resultArray.length-1;
    while(temp >= 0){
      if(postClass.getCreationTime(resultArray[temp]) > toDate){
        resultArray.splice(temp,1);
      }  
      temp--;  
    }
  }
  postClass.postArray = resultArray;
  document.getElementById('whenPostsLoadet').style.display = "block";
  fillTabTextAsync();
  
}


function inputDateOK(){
  var fromDate = document.getElementById('fromDate').value;
  if(fromDate ==''){
    alert('Startdate has to be filled in');
    return false;
  }
  var arr = fromDate.split("-");
  if(arr.length!=3){
    alert('Date not correct');
    return false;
  }
  if(arr[0].length !=4 || arr[1].length !=2 || arr[2].length !=2){
    alert('Date not correct');
    return false;
  }
  if(isNaN(arr[0]) == true || isNaN(arr[1]) == true || isNaN(arr[2]) == true){
     alert('Date not correct');
     return false;
  }
  return true;
}

//--------------------------------------------HER LOADER VI TABELLEN OP

function loadFacebook(){
  var str = document.getElementById("liste2").value;
  facebookList = str.split("\n");
  headers = facebookList[0].split("\t");
  for(var temp = 0; temp < headers.length;temp++)
    headers[temp] = headers[temp].toLowerCase();
  loadFacebookData(1);   
}



function loadFacebookData(index){
  if(index >= facebookList.length){
     runBatch(pageIndex+1);
     return;
  }
  var l = facebookList[index].split("\t");
  if(l.length < 5 ){
    runBatch(pageIndex+1);
    return;
  }  

  var obj = new Object();
  
  for(var temp =0; temp < l.length;temp++){
    if(headers[temp] == 'created')
      obj.created= l[temp];
    else{  
      if(l[temp] == "")
        l[temp]="?";
      try{
        eval("obj."+headers[temp]+"="+l[temp]);
      }catch(e){
        eval("obj."+headers[temp]+"=\""+l[temp]+"\"");
      }  
    }  
  }  
  obj.pageType = eS.getSingleFieldFromDoc(userArray[pageIndex],"pageType");
  obj.userTagged = eS.getSingleFieldFromDoc(userArray[pageIndex],"userTags");
  document.getElementById('liste2').value = "Index "+ index+ " Title: "+ obj.title;
  var formData = new Object();
  formData.elasticdata = JSON.stringify(obj,null,2);
  formData.id=obj.id;
  putfbPhp(formData,index);
}


function putfbPhp(formData,index){
  $.ajax({
     url: "elasticput.php", 
     type: 'post',
     data:formData,
     error: function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+ " errorthrown "+ errorThrown);
     },
     success: function(data){
       if(data.created == true)
         created++;
       loadFacebookData(index+1);
     },
     dataType:"json"
  });  
}  
