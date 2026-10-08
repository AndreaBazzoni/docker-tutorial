// List of available profile pictures. Pictures are loaded from public/images directory by the server.
let pictures = [];
// Picture displayed in the profile view.
let current = 0;
// Picture selected in the edit view.
let selected = 0;
// Current user ID, default to 1. Updated when a different profile is selected from the dropdown.
let currentUserId = 1;


// Values shown when a profile does not exist in the database.
const emptyProfile = { name: "-", email: "-", interests: "-", picture: null };


// Show a profile in the profile view.
function showProfile(profile) {
  document.querySelector("#name").textContent = profile.name;
  document.querySelector("#email").textContent = profile.email;
  document.querySelector("#interests").textContent = profile.interests;
  const index = pictures.indexOf(profile.picture);
  current = index === -1 ? 0 : index;
  if (pictures.length > 0) {
    document.querySelector("#picture").src = pictures[current];
  }
}


// Create the dropdown options, one for each available profile.
function buildProfileOptions(maxProfiles) {
  const select = document.querySelector("#user-select");
  select.innerHTML = "";
  for (let i = 1; i <= maxProfiles; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = "Profile " + i;
    select.appendChild(option);
  }
  select.value = currentUserId;
}


// Read the profile of the given user from the server.
async function loadProfile(userid) {
  try {
    const response = await fetch(`/get-profile?userid=${userid}`);
    if (!response.ok) {
      throw new Error("Server error: " + response.status);
    }
    const profile = await response.json();
    // If the profile does not exist yet, show placeholder values.
    showProfile(profile && profile.name ? profile : emptyProfile);
  }
  catch (err) {
    console.error("Could not load the profile: ", err);
    alert("Could not load the profile: " + err.message);
  }
}


// During loading: first the list of pictures, then profile 1.
async function init() {
  try {
    // Number of profiles available, defined on the server.
    const configResponse = await fetch("/config");
    const config = await configResponse.json();
    buildProfileOptions(config.maxProfiles);
  }
  catch (err) {
    console.error("Could not load the configuration: ", err);
  }

  try {
    const response = await fetch("/pictures");
    pictures = await response.json();
    if (pictures.length === 0) {
      alert("No profile pictures available. Please add some images to the 'public/images' directory.");
    }
  }
  catch (err) {
    console.error("Could not load the pictures:", err);
  }
  await loadProfile(currentUserId);
}


// Change profile from the dropdown menu.
function changeUser() {
  currentUserId = Number(document.querySelector("#user-select").value);
  loadProfile(currentUserId);
}


// Change the picture in the edit view.
function changePicture(step) {
  if (pictures.length === 0) return;
  selected = (selected + step + pictures.length) % pictures.length;
  document.querySelector("#edit-picture").src = pictures[selected];
}


// Show the edit view for the current profile.
function editProfile() {
  // Hide the profile view and show the edit view.
  document.querySelector(".container").style.display = "none";
  document.querySelector(".container-edit").style.display = "block";
  // Populate the input fields with the current profile information.
  document.querySelector("#input-name").value = document.querySelector("#name").textContent;
  document.querySelector("#input-email").value = document.querySelector("#email").textContent;
  document.querySelector("#input-interests").value = document.querySelector("#interests").textContent;
  // Show which profile is being edited, using the text of the selected option.
  document.querySelector("#edit-user-select").textContent = document.querySelector("#user-select").selectedOptions[0].text;
  // Set the selected picture to the current picture.
  selected = current;
  if (pictures.length > 0) {
    document.querySelector("#edit-picture").src = pictures[selected];
  }
}


// Save the profile to the server.
async function saveProfile() {
  const profile = {
    userid: currentUserId,
    name: document.querySelector("#input-name").value,
    email: document.querySelector("#input-email").value,
    interests: document.querySelector("#input-interests").value,
    picture: pictures[selected]
  };

  try {
    const response = await fetch("/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    if (!response.ok) {
      throw new Error("Server error " + response.status);
    }
    // Update the page with the data confirmed by the server.
    showProfile(await response.json());
    // Hide the edit view and show the profile view.
    document.querySelector(".container").style.display = "block";
    document.querySelector(".container-edit").style.display = "none";
  }
  catch (err) {
    console.error("Could not save the profile: ", err);
    alert("Could not save the profile: " + err.message);
  }
}


// Load pictures and profile when the page is ready.
// The init function is called at the end of this script to start the loading process.
init();
