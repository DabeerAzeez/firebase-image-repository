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

    fileRef.put(file).then(() => {
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
        firebase.auth().signInWithPopup(provider).then(result => {
            const token = result.credential.accessToken;
            const user = result.user;
            signedIn = true
            document.getElementById('sign-in').innerHTML = "Sign Out";
            alert("Signed in successfully")
        }).catch(() => {
            alert("There was an error signing you in. Please contact the developer of this crude web app immediately.")
        });
    } else {
        firebase.auth().signOut().then(function() {
            signedIn = false
            document.getElementById('sign-in').innerHTML = "Sign In";
            console.log("Signed out successfully")
        }).catch(err => {
            alert("There was an error signing you out: " + err)
        });
    }
}

function setImage(index) {
    images[index].getDownloadURL().then(url => {
        selected_image.src = url

        selected_image.onload = () => {
            if (next_image.hidden) {
                next_image.hidden = false;
            }
        }
    });
}

function nextImage() {
    setImage(image_counter)
    image_counter++

    if (image_counter > images.length - 1) {
        image_counter = 0
    }

    console.log("Set image: ", image_counter)
}

storageRef.listAll().then(res => {
    images = res.items
    console.log("All images loaded")
    setImage(0)
});
