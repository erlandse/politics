function FBMetadata(){
  this.userData ="";
  this.userId ="";
/*  this.description = "";
  this.category ="";*/
  
  this.getMetadataField = function(field){
    return this.drill(this.userData,field);
  }

  this.hasMetadataError = function(){
    return this.drill(this.userData,"error.message");
  }

  this.drill=function(p, path) {
	 a = path.split(".");
	 for (i in a) {
	   var key = a[i];
	   if (p[key] == null)
		 return '';
	   p = p[key];
	 }
	 return p;
  }


}


