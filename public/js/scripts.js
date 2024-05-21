let media_location = [];
document.getElementById("MultipleFile").addEventListener("change", (e) => {
  media_location = e.target.files;
  console.log(media_location);
});

async function onSubmitTheForm(e) {
  e.preventDefault();
  const formData = new FormData();
  const postForm = document.getElementById("postForm");

  // Ensure TinyMCE content is updated in the textarea
  try {
    tinymce.triggerSave();
  } catch (error) {
    console.log("tinymce error", error);
  }
  let pageType = "";
  for (let i = 0; i < postForm.elements.length; i++) {
    const element = postForm.elements[i];
    if (element.name === "username") {
      console.log("Page Type is signUP");
      pageType = "SignUp";
    }
    if (element.type !== "file") {
      formData.append(element.name, element.value);
    }
  }

  for (let i = 0; i < media_location.length; i++) {
    formData.append("media_location", media_location[i]);
  }

  try {
    let result;
    if (pageType === "SignUp") {
      console.log("Excecute signUP");
      result = await axios.post("/auth/register/", formData, {
        headers: { "content-type": "multipart/form-data" },
      });
    } else {
      result = await axios.post("/post/", formData, {
        headers: { "content-type": "multipart/form-data" },
      });
    }
    if (result.status === 201) {
      alert("Data has been posted successfully!!");
      window.location.reload();
    }
  } catch (error) {
    console.error("There was an error uploading the file!", error);
  }
}

document.getElementById("postForm").addEventListener("submit", onSubmitTheForm);

function addTags() {
  const tagInput = document.getElementById("articleTags");
  const tags = tagInput.value.split(",").map((tag) => tag.trim());
  const tagList = document.getElementById("tagList");

  tagList.innerHTML = ""; // Clear previous tags
  let tagsValue = "";
  tags.forEach((tag) => {
    if (tag !== "") {
      const tagElement = document.createElement("button");
      tagElement.classList = "btn tag-button";
      tagElement.disabled = true;
      tagElement.textContent = "#" + tag;
      tagsValue += "#" + tag + " ";
      tagList.appendChild(tagElement);
    }
  });

  tagInput.value = tagsValue.trim(); // Set input field to the tags string
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    document.getElementById("location").innerText =
      "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  getAddress(latitude, longitude);
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}

function getAddress(latitude, longitude) {
  const apiKey = "73c084f55941443688822746eaaee84f";
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.status.code === 200 && data.results.length > 0) {
        const address = data.results[0].formatted;
        document.getElementById("location").value = address;
      } else {
        alert(
          "Geocode was not successful for the following reason: " +
            data.status.message
        );
      }
    })
    .catch((error) => console.error("Error:", error));
}
