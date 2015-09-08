Hacker.Dating
=========

## Installation


## Running

#### locally:

meteor

#### server:

meteor deploy --settings settings.json

#### for mongo shell:

meteor mongo

#### IOS

meteor build .bundle --debug --server https://localhost:3000
meteor run ios

## Collections

- Ideas
- Hackathons
- Hearts
- Notifications
- Users
- Comments

## For debugging

Useful 
db.users.find({}, {"profile.login":1})


## Folder structure

- my-app/
-  .iron/
-    config.json
-  bin/
-  build/
-  config/
-    development/
-      env.sh
-      settings.json
-  app/
-    client/
-      js/
-       events.js
-       helpers.js
-       others.js
-      collections/
-      lib/
-      stylesheets/
-      templates/
-       pages/
-    lib/
-      collections/
-      controllers/
-      methods.js
-      routes.js
-    packages/
-    server/
-    private/
-    public/
