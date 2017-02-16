  var metadataClass = null;
  var databaseConnection = false;



  window.fbAsyncInit = function() {
    FB.init({
      appId      : '531055057068610',
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session      
      xfbml      : true,
      version    : 'v2.5'
    });
   document.getElementById('whenMetadataLoadet').style.display = "none";
   metadataClass = new FBMetadata();
   clear();
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
