const storageRef = firebase.storage().ref();
const provider = new firebase.auth.GoogleAuthProvider();
let current_user = firebase.auth().currentUser;
let signedIn = false;
let image_counter = 0;
let images = [];

let current_image_index = 0;
let image_file_list = new FileList();
let signedIn
let supported_filetypes = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'];

async function uploadImages() {
    loading_gif.hidden = false;

    if (image_upload.files.length === 0) {
        alert("No file chosen!")
        loading_gif.hidden = true;
        return
    }

    let images_flag = true

    for (let i = 0; i < image_upload.files.length; i++) {
        images_flag = await uploadImage(image_upload.files[i]);
    }

    loading_gif.hidden = true;

    if (images_flag === true) {
        alert("Images uploaded successfully! Refresh to view.")
        image_upload.value = null;  // clear selected image(s) from selection
    }
}

async function uploadImage(file) {
    const fileRef = storageRef.child(new Date() + " " + file.name)  // Give files timestamped names

    try {
        await fileRef.put(file)
    } catch (error) {
        if (firebase.auth().currentUser === null) {
            alert("Please sign in to upload images!")
            console.log("Error, attempted image upload while signed out.")
            return false
        } else {
            alert("Error occurred while uploading: " + error)
            throw Error("Unknown error occurred while uploading images: " + error)
        }
    }

    console.log('Image uploaded successfully!');
    return true
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
    try {
        images[index].getDownloadURL().then(url => {
            selected_image.src = url

            selected_image.onload = () => {
                if (next_image.hidden || previous_image.hidden) {
                    next_image.hidden = false;
                    previous_image.hidden = false;
                }
            }

            image_counter_text.innerHTML = (image_counter + 1).toString() + "/" + (images.length).toString()
        });
    } catch (err) {
        console.log("Error setting image to index: " + index);
    }
}

function changeImage(value) {
    image_counter += value

    if (value === 1) {
        if (image_counter > images.length - 1) {  // Next image
            image_counter = 0
        }
    } else if (value === -1) {
        if (image_counter < 0) {
            image_counter = images.length - 1  // Previous image
        }
    } else {
        throw Error("Error attempting to change image.")
    }

    setImage(image_counter)
    console.log("Set image: ", image_counter)
}

function checkFileType(file) {
    let file_ext = getFileExtension(file);
    if (!supported_filetypes.includes(file_ext)) {
        alert("Unsupported file type. This app supports the following image types: " +
            supported_filetypes.toString())
        return false
    }
    return true
}

// Load in images from storage
storageRef.listAll().then(res => {
    images = res.items

    if (images.length !== 0) {
        console.log("All images loaded")
        setImage(0);
    } else {
        console.log("No images found in storage.")
        selected_image.src = default_image_path
    }
});
