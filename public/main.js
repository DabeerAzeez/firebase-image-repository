const storageRef = firebase.storage().ref();
var provider = new firebase.auth.GoogleAuthProvider();
var signedIn = false

function uploadImage() {
    const file = document.getElementById('image_upload').files[0];
    const fileRef = storageRef.child(file.name)

    fileRef.put(file).then(snapshot => {
        console.log('Image uploaded!');
    }).catch(error => {
        alert("Error occurred while uploading, please ensure you are signed in." + "\n\n" + error)
    });
}

function signIn() {
    if (!signedIn) {
        firebase.auth().signInWithPopup(provider).then(function(result) {
            var token = result.credential.accessToken;
            var user = result.user;
            signedIn = true
            document.getElementById('sign-in').innerHTML = "Sign Out";
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
            alert("There was an error signing you in. Please contact the developer of this crude web app immediately.")
        });

        alert("Signed in successfully")
    } else {
        firebase.auth().signOut().then(function() {
            signedIn = false
            document.getElementById('sign-in').innerHTML = "Sign In";
            console.log("Signed out successfully")
        }).catch(function(error) {
            alert("There was an error signing you out. Please contact the developer of this crude web app immediately.")
        });
    }

}