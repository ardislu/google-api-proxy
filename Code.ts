const PROPERTY_STORE = PropertiesService.getScriptProperties();
// PropertiesService screws up newline characters, use the regex to fix it. Ref: https://github.com/googleworkspace/apps-script-oauth2/issues/122#issuecomment-507436277
const PRIVATE_KEY = PROPERTY_STORE.getProperty('SERVICE_ACCOUNT_PRIVATE_KEY').replace(/\\n/g, '\n');
const CLIENT_EMAIL = PROPERTY_STORE.getProperty('SERVICE_ACCOUNT_CLIENT_EMAIL');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/documents.readonly'];

function getApiService() {
  return OAuth2.createService('api')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(PRIVATE_KEY)
    .setIssuer(CLIENT_EMAIL)
    .setPropertyStore(PROPERTY_STORE)
    .setCache(CacheService.getScriptCache())
    .setLock(LockService.getScriptLock())
    .setScope(SCOPES);
}

function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  const request = e.queryString;
  const params = {
    headers: {
      "Authorization": `Bearer ${getApiService().getAccessToken()}`
    }
  };
  const response = UrlFetchApp.fetch(request, params);

  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.append(response.getContentText());

  return output;
}
