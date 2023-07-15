declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            URL: string;
            PORT: string;
        }
    }
}

export { }