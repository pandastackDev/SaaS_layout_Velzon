/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_DEFAULTAUTH: string
  readonly VITE_APP_APIKEY: string
  readonly VITE_APP_AUTHDOMAIN: string
  readonly VITE_APP_DATABASEURL: string
  readonly VITE_APP_PROJECTID: string
  readonly VITE_APP_STORAGEBUCKET: string
  readonly VITE_APP_MESSAGINGSENDERID: string
  readonly VITE_APP_APPID: string
  readonly VITE_APP_MEASUREMENTID: string
  readonly VITE_API_URL: string
  // Add more environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
