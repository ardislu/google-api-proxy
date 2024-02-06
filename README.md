# google-api-proxy

[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)

> [!IMPORTANT]<br>
> **Update March 2022**: Google Apps Script web apps which use libraries can have cold start times that last several seconds ([reference](https://developers.google.com/apps-script/guides/libraries)). For this reason, it's not a good idea to use this code for production websites. For production use, you should re-implement the `OAuth2` library's logic using native [GAS APIs](https://developers.google.com/apps-script/reference/utilities/utilities), or use a different service.

It's not possible to anonymously query Google APIs, even if the underlying document (e.g. a Google Doc) is publicly available through the normal frontend. This Google Apps Script (GAS) project is a proxy server to allow anonymous access to Google APIs.

## Requirements
- [Node.js](https://nodejs.org/)
- [git](https://git-scm.com/)

## Create a service account to restrict which documents this web app can query

Google APIs require OAuth 2.0 authorization from a Google account. If you authorize this GAS project to query APIs with your own Google account's authorization, then anyone can anonymously query any document that you have access to (even those that aren't publicly shared). Create a service account for this web app to limit which documents this web app can query.

1. Open an existing Google Cloud Platform (GCP) project or create a new one in the [GCP console](https://console.cloud.google.com/).

2. Go to your GCP project's [IAM & Admin > Service Accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts).

3. Create a new service account.

4. Create a new JSON service account key for this service account.

## Share documents with your service account

This web app can only access documents that the service account can access. Share documents (like Google Sheets or Google Docs) with your service account exactly like you'd share documents with a real user.

1. Open a Google Sheet or Google Doc file.

2. Press Share.

3. Add the service account's email.

## Deploy the GAS project

1. Clone this repo.
```
git clone https://github.com/ardislu/google-api-proxy.git
```

2. Install project dependencies.
```
npm i
```

3. Authorize `clasp` (see [clasp documentation](https://developers.google.com/apps-script/guides/clasp) for more information).
```
npm run clasp login
```

4. Create a new GAS project.
```
npm run clasp create --title "google-api-proxy" --type webapp
```

5. Push `Code.ts` and `appsscript.json` to the GAS project.
```
npm run clasp push
```
When prompted, overwrite the manifest file (`appsscript.json`).
```
? Manifest file has been updated. Do you want to push and overwrite? (y/N) y
```

## Configure the GAS project

1. Open the GAS project.
```
npm run clasp open
```

2. In the GAS editor, create the following [Google Apps Script properties](https://developers.google.com/apps-script/guides/properties) (environment variables) under `Project Settings > Script Properties`:
```
SERVICE_ACCOUNT_PRIVATE_KEY: {{ private_key from the service account key JSON file }}
SERVICE_ACCOUNT_CLIENT_EMAIL: {{ client_email from the service account key JSON file }}
```

3. Press the `Run` button on the `doGet` function to execute the script for the first time. Note: this will return an error because no parameter is passed; this is expected.

4. On first execution, Google will ask you to review the permissions for this web app. Click `Review permissions`. 

5. An OAuth 2.0 authorization dialog will appear to give this web app authorization to execute its code using your Google account's authorization. Login to your Google Account to allow the access. You might need to click `Advanced` to show the option to proceed.

6. Allow this web app to execute its code using your Google account's authorization.

Note: although the script itself is being executed using your account's authorization (i.e. the code has the same access as your Google account), the actual authorization that's being passed to the Google APIs is the service account's authorization.

## Deploy the web app

This will publish the web app and allow anyone to query documents anonymously using the service account's authorization.
```
npm run clasp deploy
```

## Usage

1. Get the web app URL from `Deploy > Manage deployments > Web app > URL`. It should look like this:
```
https://script.google.com/macros/s/{scriptId}/exec
```

2. Pass any Google API web queries as a query string to this web app URL. Examples:

Get values from the range "B3:D" on a Google Sheet 
```
https://script.google.com/macros/s/{scriptId}/exec?https://sheets.googleapis.com/v4/spreadsheets/{sheetId}/values/B3:D
```

Get content from a Google Doc
```
https://script.google.com/macros/s/{scriptId}/exec?https://docs.googleapis.com/v1/documents/{docId}
```

## Set OAuth permission scopes

The project currently has OAuth permission scopes set for read-only Google Sheets and Google Docs access. Modify the `.setScope` function in `Code.ts` to add scopes for other Google APIs.
