/*
    Perform authentication once, save the resulting state (the token) to a file, 
    then reuse that state across all other tests to avoid logging in repeatedly
*/

import { test as setup} from '@playwright/test';
import { TokenManager } from './TokenManager';
import * as fs from 'fs';

//Stores the authentication state.
const authFile = '.auth/user.json';

//This block runs before actual test suite runs through global setup in Playwright.config file
setup(`Authenticate with client credentials`, async ({request}) => {
    //Get Bearer token.
    const token= await TokenManager.getBearerToken(request);

    //A fail-fast check to verify if the token is empty.
    if(!token){
        throw new Error(`Failed to retrieve Bearer token.Verify Client ID and Secret.`);
    }
    
    //Local storage of token which can be referred by each test without requesting token
    const authState = {
        origins: [
            {
                origin: process.env.API_BASE_URL!,
                localStorage: [
                    {name: 'accessToken', value: token}
                ]
            }
        ]
    };

    //Verify if .auth dir exists if not create it
    if(!fs.existsSync('.auth')) fs.mkdirSync('.auth');

    //Convert JacaScript object (authState) to string and store in file.
    fs.writeFileSync(authFile, JSON.stringify(authState));
})