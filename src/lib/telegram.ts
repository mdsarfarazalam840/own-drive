// We use "any" for the client/types to avoid importing the library at the top level
// which breaks Next.js build due to Node.js dependency requirements of gram.js
// that are not polyfilled by default in the edge/server runtime.

export class TelegramAuth {
    private client: any | null = null;
    private apiId: number;
    private apiHash: string;
    private session: string;

    constructor(apiId: number, apiHash: string, session: string = '') {
        this.apiId = apiId;
        this.apiHash = apiHash;
        this.session = session;
    }

    async init() {
        if (this.client) return this.client;

        // Dynamic import to ensure this only runs client-side/runtime
        const { TelegramClient } = await import('telegram');
        const { StringSession } = await import('telegram/sessions');

        const stringSession = new StringSession(this.session);
        this.client = new TelegramClient(stringSession, this.apiId, this.apiHash, {
            connectionRetries: 5,
        });

        await this.client.connect();
        return this.client;
    }

    async sendCode(phoneNumber: string) {
        if (!this.client) await this.init();

        const id = Number(this.apiId);
        if (isNaN(id)) {
            throw new Error("API ID must be a number");
        }

        console.log("Sending code via invoke:", {
            apiId: id,
            apiHash: this.apiHash,
            phoneNumber: phoneNumber
        });

        // Dynamic import for runtime
        const { Api } = await import('telegram');

        // Using low-level invoke to avoid helper issues
        // Api.auth.SendCode params: phone_number, api_id, api_hash, settings
        return this.client?.invoke(
            new Api.auth.SendCode({
                phoneNumber: String(phoneNumber),
                apiId: id,
                apiHash: String(this.apiHash),
                settings: new Api.CodeSettings({
                    allowFlashcall: false,
                    currentNumber: false,
                    allowAppHash: false,
                    allowMissedCall: false,
                    logoutTokens: []
                }),
            })
        );
    }

    async signIn(phoneNumber: string, phoneCodeHash: string, phoneCode: string) {
        if (!this.client) await this.init();

        const { Api } = await import('telegram');

        return this.client?.invoke(
            new Api.auth.SignIn({
                phoneNumber,
                phoneCodeHash,
                phoneCode
            })
        );
    }

    async signInWithPassword(password: string) {
        if (!this.client) await this.init();

        const { Api } = await import('telegram');
        const passwordModule = await import('telegram/Password');

        // 1. Get the current password info (SRP parameters)
        const passwordInfo = await this.client.invoke(
            new Api.account.GetPassword()
        );

        // 2. Compute the SRP hash using the password module's computeCheck function
        const passwordSrp = await passwordModule.computeCheck(passwordInfo, password);

        // 3. Send the check password request with the computed SRP
        return this.client.invoke(
            new Api.auth.CheckPassword({
                password: passwordSrp
            })
        );
    }

    getClient() {
        return this.client;
    }

    getSession() {
        // @ts-ignore
        return this.client?.session.save() as unknown as string;
    }
}
