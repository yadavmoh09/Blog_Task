function isJSON(response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return true;
  } else {
    return false;
  }
}
module.exports = isJSON;
