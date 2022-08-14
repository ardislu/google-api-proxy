function getApiService() {
  const propertyStore = PropertiesService.getScriptProperties();
  // PropertiesService screws up newline characters, use the regex to fix it. Ref: https://github.com/googleworkspace/apps-script-oauth2/issues/122#issuecomment-507436277
  const privateKey = (propertyStore.getProperty('SERVICE_ACCOUNT_PRIVATE_KEY') ?? '').replace(/\\n/g, '\n');
  const clientEmail = propertyStore.getProperty('SERVICE_ACCOUNT_CLIENT_EMAIL') ?? '';

  return OAuth2.createService('api')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(privateKey)
    .setIssuer(clientEmail)
    .setPropertyStore(propertyStore)
    .setCache(CacheService.getScriptCache())
    .setLock(LockService.getScriptLock())
    .setScope(['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/documents.readonly']);
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
