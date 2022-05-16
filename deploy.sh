GOOGLE_PROJECT_ID=db-capstone-waras
CLOUD_RUN_SERVICE=data-waras-api-service
INSTANCE_CONNECTION_NAME=db-capstone-waras:asia-southeast2:waras-sql
DB_USER=root
DB_PASS=war140522
DB_NAME=dbwaras

gcloud builds submit --tag gcr.io/$GOOGLE_PROJECT_ID/$CLOUD_RUN_SERVICE \ --project=$GOOGLE_PROJECT_ID

gcloud run deploy $CLOUD_RUN_SERVICE \
--image gcr.io/$GOOGLE_PROJECT_ID/$CLOUD_RUN_SERVICE \
--add-cloudsql-instances $INSTANCE_CONNECTION_NAME \
--update-env-vars INSTANCE_CONNECTION_NAME=$INSTANCE_CONNECTION_NAME, DB_PASS=$DB_PASS, DB_USER=$DB_USER, DB_NAME=$DB_NAME \
--platform managed \
--region asia-southeast2 \
--allow-unauthenticated \
--project=$GOOGLE_PROJECT_ID
