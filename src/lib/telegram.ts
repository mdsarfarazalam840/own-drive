// Telegram authentication and client management.
// Dynamic imports ensure gram.js only loads client-side.

export class TelegramAuth {
    private client: any | null = null;
    private _apiId: number;
    private _apiHash: string;
    private session: string;

    constructor(apiId: number, apiHash: string, session: string = '') {
        this._apiId = apiId;
        this._apiHash = apiHash;
        this.session = session;
    }

    /** Public getter for API ID — eliminates @ts-ignore casts */
    get apiId(): number {
        return this._apiId;
    }

    /** Public getter for API Hash — eliminates @ts-ignore casts */
    get apiHash(): string {
        return this._apiHash;
    }

    async init(dcId?: number): Promise<any> {
        if (this.client) return this.client;

        const { TelegramClient } = await import('telegram');
        const { StringSession } = await import('telegram/sessions');

        const stringSession = new StringSession(this.session);
        const clientConfig: Record<string, unknown> = {
            connectionRetries: 5,
            useWSS: true, // Use Secure WebSockets
        };

        if (dcId) {
            clientConfig.dcId = dcId; // DIRECT DC CONNECTION
        }

        this.client = new TelegramClient(stringSession, this._apiId, this._apiHash, clientConfig as any);

        await this.client.connect();
        return this.client;
    }

    async sendCode(phoneNumber: string): Promise<any> {
        if (!this.client) await this.init();

        const id = Number(this._apiId);
        if (isNaN(id)) {
            throw new Error('API ID must be a number');
        }

        const { Api } = await import('telegram');

        return this.client?.invoke(
            new Api.auth.SendCode({
                phoneNumber: String(phoneNumber),
                apiId: id,
                apiHash: String(this._apiHash),
                settings: new Api.CodeSettings({
                    allowFlashcall: false,
                    currentNumber: false,
                    allowAppHash: false,
                    allowMissedCall: false,
                    logoutTokens: [],
                }),
            })
        );
    }

    async signIn(phoneNumber: string, phoneCodeHash: string, phoneCode: string): Promise<any> {
        if (!this.client) await this.init();

        const { Api } = await import('telegram');

        return this.client?.invoke(
            new Api.auth.SignIn({
                phoneNumber,
                phoneCodeHash,
                phoneCode,
            })
        );
    }

    async signInWithPassword(password: string): Promise<any> {
        if (!this.client) await this.init();

        const { Api } = await import('telegram');
        const passwordModule = await import('telegram/Password');

        const passwordInfo = await this.client.invoke(
            new Api.account.GetPassword()
        );

        const passwordSrp = await passwordModule.computeCheck(passwordInfo, password);

        return this.client.invoke(
            new Api.auth.CheckPassword({
                password: passwordSrp,
            })
        );
    }

    getClient(): any | null {
        return this.client;
    }

    getSession(): string {
        return this.client?.session.save() as unknown as string;
    }
}
