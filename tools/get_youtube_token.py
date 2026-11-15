"""Run ONCE on your own PC to connect your YouTube channel.

1. Put the client_secret_....json you downloaded from Google Cloud next to this file
   and rename it to client_secret.json
2. In PowerShell:
     python -m pip install google-auth-oauthlib
     python get_youtube_token.py
3. A browser opens: log in with the Google account that owns your channel and allow access.
4. The script prints three values. Copy each into GitHub:
   repo -> Settings -> Secrets and variables -> Actions -> New repository secret
     YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN
   Never paste them into a chat or commit them to the repo.
"""
from google_auth_oauthlib.flow import InstalledAppFlow

flow = InstalledAppFlow.from_client_secrets_file("client_secret.json", scopes=["https://www.googleapis.com/auth/youtube.upload"])
creds = flow.run_local_server(port=0, access_type="offline", prompt="consent")
print("\nCopy these three values into GitHub Actions secrets:\n")
print("YT_CLIENT_ID     =", creds.client_id)
print("YT_CLIENT_SECRET =", creds.client_secret)
print("YT_REFRESH_TOKEN =", creds.refresh_token)
