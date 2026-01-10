import { APIRequestContext } from "@playwright/test";

export class TokenManager{

    //This function returns Bearer token.
    static async getBearerToken(request: APIRequestContext): Promise<string> {
        //OAuth2 requires credentials to be sent as Base64 encoding format.
        const auth = Buffer.from(`${process.env.CLIENT_ID!}:${process.env.CLIENT_SECRET!}`).toString('base64');
        const response = await request.post(process.env.API_AUTH_URL!, {
            headers:{
                'Authorization': `Basic ${auth}`, //Sets authorization header to Basic.
            },
            form: {
                grant_type: 'client_credentials',
            },
        });

        //Throw error if HTTP Status code is NOT between 200-299
        if(!response.ok()){
            throw new Error(`Failed to get token: ${response.statusText()}`);
        }

        const body = await response.json();
        return body.access_token;
    }
}