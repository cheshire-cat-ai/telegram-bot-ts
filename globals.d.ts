declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            URL: string;
            PORT: string;
            AUTH_KEY: string;
        }
    }
}

export { }