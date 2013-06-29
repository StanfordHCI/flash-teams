<?php render('_header',array('title'=>$title))?>
<script>
(function(d) {
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    ref.parentNode.insertBefore(js, ref);
} (document));

// Init the SDK upon load
window.fbAsyncInit = function() {
    FB.init({
    appId: '518727478188174', // App ID
//        channelUrl: '//' + window.location.hostname + '/channel', // Path to your Channel File
        status: true, // check login status
        cookie: true, // enable cookies to allow the server to access the session
        xfbml: true  // parse XFBML
    });

    // listen for and handle auth.statusChange events
    FB.Event.subscribe('auth.statusChange', function(response) {
        if (response.authResponse) {
            // user has auth'd your app and is logged into Facebook
            FB.api('/me', function(me) {
                if (me.name) {
                    document.getElementById('auth-displayname').innerHTML = me.name;
                    saveUser(me)
//                    updateUserInfo(response);
                }
            })
            document.getElementById('auth-loggedout').style.display = 'none';
            document.getElementById('auth-loggedin').style.display = 'block';
        } else {
            // user has not auth'd your app, or is not logged into Facebook
            document.getElementById('auth-loggedout').style.display = 'block';
            document.getElementById('auth-loggedin').style.display = 'none';
        }
    });
    $("#auth-loginlink").click(function() {
    
     FB.login(function() {}, {scope: 'user_interests,friends_interests'});
        });
    $("#auth-logoutlink").click(function() { FB.logout(function() { window.location.reload(); }); });
}
function updateUserInfo(response) {
    FB.api('/me', function(response) {
        document.getElementById('user-info').innerHTML = '<img src="https://graph.facebook.com/' + response.id + '/picture">' + response.name;
    });
}

function getUserFriends(user) {
    FB.api('/me/friends', function(response) {
        console.log('Got friends: ', response);

        if (!response.error) {
            
           saveFriends(response.data,user)
        }
    });
}
function saveUser(user)
{
    $.post("user.php", { "user": user },
  function(data){
      getUserFriends(user);
  }, "html");
}
function saveFriends(friends,user)
{
    $.post("friend.php", { "friends": friends, "user": user },
  function(data){
   
  }, "html");
}
</script>
<div id="fb-root"></div>
<div data-role="content">
    <div style="margin: 0 auto;text-align: center;">
        <img src="assets/img/logo.png" alt="logo" />
    </div>
    <div id="auth-status">
        <div id="auth-loggedout">
            <a href="#" id="auth-loginlink"> Facebook Connect</a>
        </div>
        <div id="auth-loggedin" style="display: none">
            Hi, <span id="auth-displayname"></span>
                <ul data-role="listview" data-inset="true" data-theme="c" data-dividertheme="b">
                    <li data-role="list-divider">Home</li>
                    <li >
                        <a href="find.php" data-transition="fade">Find</a>
                    </li>
                    <li >
                        <a href="friendrequests.php" data-transition="fade">
                            My Friends
                         <span class="ui-li-count">63</span></a>
                    </li>
                    <li >
                        <a href="location.php" data-transition="fade">  My Location</a>

                    </li>
                </ul>
            <br />
            <br />
        </div>

    </div>
        <p>
        IceBreaker is an app that helps you find people in your location that have friends or interests in common with you. You can see all the people around you that share at least one friend or one interest with you. If you click on one of them, you'll land on the profile page. You can see the detailed list of interests or friends in common, and you can start a chat conversation. If you click on an interest or a friend in common, you'll see a list of all the people in your location that share that particular interest or particular friend.
        </p>
</div>

<?php render('_footer')?>