import pydata_google_auth
import gspread

SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets'
]

credentials = pydata_google_auth.get_user_credentials(SCOPES, auth_local_webserver=True)
credentials.access_token = credentials.token

gc = gspread.authorize(credentials)

gc.list_spreadsheet_files()