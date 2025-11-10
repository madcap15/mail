#!/bin/bash
# initializer/init.sh

# Wait for the mailserver API to be available
echo "Waiting for mailserver API..."
until curl -s -o /dev/null -w "%{http_code}" "http://mail_server:9090/api/v1/users" -H "X-API-Key: ${POSTFIX_REST_SERVER_API_KEY}"; do
  echo "Mailserver API not ready, sleeping..."
  sleep 5
done

echo "Mailserver API is ready."

# Check if the initial user already exists
USER_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" "http://mail_server:9090/api/v1/users/${POSTFIX_REST_SERVER_INITIAL_USER}" -H "X-API-Key: ${POSTFIX_REST_SERVER_API_KEY}")

if [ "$USER_EXISTS" -eq 200 ]; then
  echo "Initial user '${POSTFIX_REST_SERVER_INITIAL_USER}' already exists. Nothing to do."
  exit 0
else
  echo "Initial user '${POSTFIX_REST_SERVER_INITIAL_USER}' not found. Creating it..."
  
  # Create the user
  CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "http://mail_server:9090/api/v1/users" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: ${POSTFIX_REST_SERVER_API_KEY}" \
    -d "{\"username\": \"${POSTFIX_REST_SERVER_INITIAL_USER}\", \"password\": \"${POSTFIX_REST_SERVER_INITIAL_PASSWORD}\"}")
  
  HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -n1)
  BODY=$(echo "$CREATE_RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" -eq 201 ]; then
    echo "Successfully created initial user '${POSTFIX_REST_SERVER_INITIAL_USER}'."
    exit 0
  else
    echo "Error creating initial user. API responded with code ${HTTP_CODE}."
    echo "Response body: ${BODY}"
    exit 1
  fi
fi
