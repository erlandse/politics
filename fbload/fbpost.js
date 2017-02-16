function FBPost(){
  this.maximum = 5000;
  this.postArray = null;
  this.commentArray = null;
  this.tempArray = new Array();
  placeToWriteProgress = null;
  this.replyCommentArray=new Array();

  this.setMaximum= function(nr){
   this.maximum = nr;
 }


  this.getNextPage = function(url){
	  var formData = JSON.parse("{}");
	  formData.url=url;
	  var result=this.postRemote("FacebookNext2.php",formData);
	  return JSON.parse(result);
 }


 this.getRemote = function(remote_url) {
	return $.ajax({
		type: "GET",
		url: remote_url,
		async: false
	}).responseText;
 }

 this.postRemote = function(remote_url,formData) {
	return $.ajax({
		type: "POST",
		url: remote_url,
		data:formData,
		async: false
	}).responseText;
 }


 this.getPostId = function(post){
   return post.id;
 }
/*
 this.getStatusType=function(post){
   return post.status_type;
 }
*/
 this.getCreationTime=function(post){
   return post.created_time;
 }

 this.getLikesCount = function(post,accessToken,callBack){
      if(this.drill(post,"likes")==""){
       writeFromLikeCount("0");
     }
     FB.api("/"+post.id+'/likes?summary=true&accessToken='+accessToken, function(response){
       callBack(response.summary.total_count);
     });

  }
/*
  this.getPostLink=function(post){
   return this.drill(post,"link");
  }

  this.getShares=function (post){
     if(this.drill(post,"shares")=="")
       return 0;
     return  post.shares.count;
     
  }
*/
  this.getMessage = function(post){
     if(this.drill(post,"message")=="")
       return "";
     return post.message;  
  }

/*
  this.getMessageLink= function(post){
    if(this.drill(post,"actions")=="")
      return "";
    var arr = post.actions;
    return arr[0].link;
  }
*/
  this.getName=function(post){
     if(this.drill(post,"name")=="")
       return "";
     return post.name;  
  }

  this.getPostFromPostId=function(arr,postId){
    for(var temp =0;temp < arr.length;temp++)
      if(this.getPostId(arr[temp])==postId)
        return arr[temp];
    return null;    
  }

  this.getFromName=function(post){
    return this.drill(post,"from.name");
  }

  this.getFromId=function(post){
    return this.drill(post,"from.id"); 
  }
//------------------ henter comments

  this.getAllComments=function(response){
    var resultArray = new Array();
    while(response != null){
      if(response.data.length==0)
        break;
      resultArray = resultArray.concat(response.data);
      if(this.drill(response, "paging") == "" || this.drill(response, "paging.next") == "")
        break;
      response = this.getNextPage(response.paging.next);
    }
    return resultArray;
  }

  this.setCommentArray=function(post){
    this.commentArray = this.getAllComments(post.comments);
  }





 this.setRepliesToComments= function(pageId){
   this.replyCommentArray=new Array();
   for(var temp = 0; temp < this.commentArray.length;temp++){
	   var url ="https://graph.facebook.com/"+ pageId+"_"+this.commentArray[temp].id+"/comments?";  
  	   var arr = JSON.parse(this.getRemote(url));
  	   this.replyCommentArray.push(arr);
   }   
 }


  this.getCommentsCountFrom=function(id,post,pageId){
	var cnt = 0;
	if(id !=null){
	  for(var temp = 0; temp < this.commentArray.length;temp++){
  		if(this.commentArray[temp].from.id == id)
		   cnt++;
        var arr = this.replyCommentArray[temp];
		if(this.isEmpty(arr.data))
		  continue;
		for(var i =0;i<arr.data.length;i++){
		  if(arr.data[i].from.id==id)
		     cnt++;
		}
     }		
   }else
	  cnt = this.commentArray.length;
	return cnt;
 }


  this.getCommentMessagesFrom=function(id,post,pageId){
	var cnt = 0;
	var result ="";
	if(id !=null){
	  for(var temp = 0; temp < this.commentArray.length;temp++){
  		if(this.commentArray[temp].from.id == id){
		   cnt++;
		   result += this.commentArray[temp].message + "<hr>";
		}   
        var arr = this.replyCommentArray[temp];
		if(this.isEmpty(arr.data))
		  continue;
		for(var i =0;i<arr.data.length;i++){
		  if(arr.data[i].from.id==id){
		     cnt++;
		     result += arr.data[i].message + "<hr>";
		  }   
		}
     }		
   }
   return result;
 }


  this.drill=function(p, path) {
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

  this.isEmpty = function(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

 this.postRemote = function(remote_url,formData) {
	return $.ajax({
		type: "POST",
		url: remote_url,
		data:formData,
		async: false
	}).responseText;
 }

/*
  this.getNextAsyncPage = function(url,resultArray,callBackFunction,finishCallBack){
	   if(url==null || url=="")
		 return null;
	   var formData= JSON.parse("{}");
	   formData.url=url;
	   $.ajax({
		 url: "FacebookNext2.php?", 
		 type: 'post',
		 data:formData,
		 error: function(XMLHttpRequest, textStatus, errorThrown){
		   alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+ " errorthrown "+ errorThrown);
		 },
		 success: function(result){
		   callBackFunction(result,resultArray,finishCallBack);
		},
		dataType:"json"
	  });
  }
*/


 this.getNextAsyncPage = function(url,resultArray,callBackFunction,finishCallBack){
	   if(url==null || url=="")
		 return null;
	   var formData= JSON.parse("{}");
	   formData.url=url;
	   $.ajax({
		 url: url, 
		 type: 'post',
		 timeout: 120000,
		 error: function(XMLHttpRequest, textStatus, errorThrown){
		   alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+ " errorthrown "+ errorThrown);
		 },
		 success: function(result){
		   document.getElementById('felt').value = JSON.stringify(result,null,2);
		   callBackFunction(result,resultArray,finishCallBack);
		},
		dataType:"jsonp"
	  });
	  
  }




}