var CLIENT_ID = '527471489694-b8dd7qjjc16rn2eks7299el2l5metk8j.apps.googleusercontent.com';
var SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/drive.install'];
folderIds = [];
overallFolder = ["0B6l5YPiF_QFBUUNvNWxyZXJaRGM", "https://docs.google.com/a/stanford.edu/folderview?id=0B6l5YPiF_QFBUUNvNWxyZXJaRGM&usp=drivesdk"];

/**
 * Called when the client library is loaded.
 */
function handleClientLoad() {
  // gapi.load("auth:client,drive-realtime,drive-share", callback);
  checkAuth();
}

/**
 * Check if the current user has authorized the application.
 */
function checkAuth() {
  gapi.auth.authorize(
      {'client_id': CLIENT_ID, 'scope': SCOPES.join(' '), 'immediate': true},
      handleAuthResult2);
}

/**
 * Called when authorization server replies.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult2(authResult) {
  console.log("I get called");
  if (authResult) {
    console.log("Authorized!");
    // Access token has been successfully retrieved, requests can be sent to the API
  } else {
    console.log("we need to authorize");
    // No access token could be retrieved, force the authorization flow.
    gapi.auth.authorize(
        {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false},
        handleAuthResult2);
  }
}

/* File-picker javascript files*/
function onAuthApiLoad() {
  gapi.auth.authorize(
    {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true},
    handleAuthResult);
}

function onApiLoad(){
      gapi.load('auth', {'callback': onAuthApiLoad});
      gapi.load('picker');
}

var oauthToken;
function handleAuthResult(authResult){
  if (authResult && !authResult.error){
    oauthToken = authResult.access_token;
    createPicker();
  }
}

function createPicker(){
  var docUpload = new google.picker.DocsUploadView();
  var picker = new google.picker.PickerBuilder()
    .addView(docUpload)
    .setOAuthToken(oauthToken)
    .setDeveloperKey('AIzaSyAgrd2gp5F3KdfCH_KfN88FLR1sVEfMJfQ')
    .setCallback(pickerCallback)
    .build()
  picker.setVisible(true);
}

function pickerCallback(data){
  if (data.action == google.picker.Action.PICKED){
    alert('URL: ' + data.docs[0].url);
  }
}


function createNewFolder(eventName, JSONId){
   console.log(eventName);
   console.log(folderIds);
   gapi.client.load('drive', 'v2', function() {

   if (flashTeamsJSON.folder){
       console.log("This one", flashTeamsJSON.folder);
       var request = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'POST',
        'body':{
            "title" : eventName,
            "mimeType" : "application/vnd.google-apps.folder",
            "description" : "Shared Folder",
            "parents": [{"id": flashTeamsJSON.folder[0]}]
         }
      });
    }
     else{
      console.log("Nope, this one");
      var request = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'POST',
        'body':{
            "title" : eventName,
            "mimeType" : "application/vnd.google-apps.folder",
            "description" : "Overall Shared Folder"
         }
      });
     }

      resp = request.execute(function(resp) { 
        var folderArray = [resp.id, resp.alternateLink];
        if (!flashTeamsJSON.folder){
          console.log("overall ", folderArray);
          insertPermission(folderArray[0], "me", "anyone", "writer");
          console.log("preFolder", flashTeamsJSON.folder);
          flashTeamsJSON.folder = folderArray;
          console.log("postFolder", flashTeamsJSON.folder);
        }
        else{
          flashTeamsJSON["events"][JSONId].gdrive = folderArray;
          console.log(folderIds);
          console.log("adding gdrive");
          console.log(flashTeamsJSON["events"][JSONId]);
          folderIds.push(folderArray);
        }
        return resp; 
      });
   });
}

function addAllFolders(){
  for (var i = 0; i<flashTeamsJSON["events"].length; i++){
    createNewFolder(flashTeamsJSON["events"][i].title + flashTeamsJSON["events"][i].id, i);
  }
}

function createNewFile(eventName) {

    gapi.client.load('drive', 'v2', function() {

       var request = gapi.client.request({
        'path': '/drive/v2/files',
        'method': 'POST',
        'body':{
            "title" : eventName + ".gdoc",
            "mimeType" : "application/vnd.google-apps.document",
            "description" : "Shared Doc"//,
            // "parents": [{"id": "0B6l5YPiF_QFBUWtPaEgyOWZmOUk"}]
         }
     });

      request.execute(function(resp) { console.log(resp); });
   });
}

function deleteFile(fileId){
  gapi.client.load('drive', 'v2', function(){
    var request = gapi.client.drive.files.delete({
      'fileId': fileId
    });
    request.execute(function(resp) { });
  });
}


function insertPermission(fileId, value, type, role) {
  gapi.client.load('drive', 'v2', function() {
    var body = {
      'value': value,
      'type': type,
      'role': role,
      'withLink': true
    };
    var request = gapi.client.drive.permissions.insert({
      'fileId': fileId,
      'resource': body
    });
    request.execute(function(resp) { console.log(resp)});
  });
}
