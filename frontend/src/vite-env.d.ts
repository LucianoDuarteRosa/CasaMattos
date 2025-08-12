/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    // mais variáveis de ambiente podem ser adicionadas aqui
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
