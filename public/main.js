const storageRef = firebase.storage().ref();
const provider = new firebase.auth.GoogleAuthProvider();
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;  // bytes

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

function signInOut() {
    if (!signedIn) { // If signed out, sign in
        firebase.auth().signInWithPopup(provider).then(() => {
            signedIn = true
            sign_in.innerHTML = "Sign Out";
            console.log("Signed in successfully")
        }).catch(error => {
            alert("There was an error signing you in." + error)
        });
    } else { // If signed in, sign out
        firebase.auth().signOut().then(() => {
            firebase.auth().currentUser = null;
            signedIn = false
            sign_in.innerHTML = "Sign In";
            console.log("Signed out successfully")
        }).catch(error => {
            alert("There was an error signing you out: " + error)
        });
    }
}

function setImage(index) {
    try {
        image_upload.files[index].getDownloadURL().then(url => {
            selected_image.src = url

            selected_image.onload = () => {  // Show 'Next' and 'Previous' buttons if there is more than one image
                if ((next_image.hidden || previous_image.hidden) && (image_file_list.length > 1)) {
                    next_image.hidden = false;
                    previous_image.hidden = false;
                }
            }

            // Update image counter
            image_counter_text.innerHTML = (current_image_index + 1).toString() + "/" +
                (image_file_list.length).toString()
        });
    } catch (error) {
        throw Error("Error setting image to index " + index + ": " + error);
    }
}

function changeImage(value) {
    current_image_index += value

    if ((value === 1) && (current_image_index > image_file_list.length - 1)) {
        // Loop back to beginning when clicking 'Next' on last item
        current_image_index = 0
    } else if ((value === -1) && (current_image_index < 0)) {
        // Loop back to end when clicking 'Previous' on first item
        current_image_index = image_file_list.length - 1
    } else {
        throw Error("Error attempting to change image.")
    }

    setImage(current_image_index)
    console.log("Successfully set image at index: ", current_image_index)
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
    image_file_list = res.items

    if (image_file_list.length !== 0) {
        console.log("All images loaded")
        setImage(0);
    } else {
        console.log("No images found in storage.")
        selected_image.src = default_image_path
    }
});

// Check if user is signed in on page load
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        sign_in.innerHTML = "Sign Out"
        signedIn = true;
    } else {
        sign_in.innerHTML = "Sign In"
        signedIn = false;
    }
})
