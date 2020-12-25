const storageRef = firebase.storage().ref();
const provider = new firebase.auth.GoogleAuthProvider();
let current_user = firebase.auth().currentUser;
let signedIn = false;
let image_counter = 0;
let images = [];

function uploadImage() {
    const file = document.getElementById('image_upload').files[0];

    if (!file) {
        alert("No file chosen!")
        return
    }

    const fileRef = storageRef.child(file.name)

    fileRef.put(file).then(snapshot => {
        alert('Image uploaded successfully!');
    }).catch(error => {
        if (!current_user) {
            alert("Please sign in to upload images!")
        } else {
            alert("Error occurred while uploading: " + error)
        }
    });
}

function getFileExtension(file) {
    return file.name.split('.').pop()
}

function signIn() {
    if (!signedIn) {
        firebase.auth().signInWithPopup(provider).then(function(result) {
            var token = result.credential.accessToken;
            var user = result.user;
            signedIn = true
            document.getElementById('sign-in').innerHTML = "Sign Out";
            alert("Signed in successfully")
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
            alert("There was an error signing you in. Please contact the developer of this crude web app immediately.")
        });
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

function setImage(index) {
    images[index].getDownloadURL().then(url => {
        document.getElementById("selected_image").src = url
    });
}

function nextImage() {
    setImage(image_counter)
    image_counter++

    if (image_counter > images.length - 1) {
        image_counter = 0
    }
}

storageRef.listAll().then(res => {
    images = res.items
    setImage(0)
    console.log("Finished loading images")
});

