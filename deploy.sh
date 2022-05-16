GOOGLE_PROJECT_ID=centering-brook-349906
CLOUD_RUN_SERVICE=data-waras-api-service
INSTANCE_CONNECTION_NAME=centering-brook-349906:asia-southeast2:test1
DB_USER=root
DB_PASS=war140522
DB_NAME=dbwaras1

gcloud builds submit --tag gcr.io/$GOOGLE_PROJECT_ID/$CLOUD_RUN_SERVICE \ --project=$GOOGLE_PROJECT_ID

gcloud run deploy $CLOUD_RUN_SERVICE \
--image gcr.io/$GOOGLE_PROJECT_ID/$CLOUD_RUN_SERVICE \
--add-cloudsql-instances $INSTANCE_CONNECTION_NAME \
--update-env-vars INSTANCE_CONNECTION_NAME=$INSTANCE_CONNECTION_NAME, DB_PASS=$DB_PASS, DB_USER=$DB_USER, DB_NAME=$DB_NAME \
--platform managed \
--region us-central1 \
--allow-unauthenticated \
--project=$GOOGLE_PROJECT_ID
