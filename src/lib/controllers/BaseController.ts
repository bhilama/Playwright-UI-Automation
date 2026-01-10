import { APIRequestContext, APIResponse } from "@playwright/test";
import fs from 'fs';
import path from "path";

export class BaseController {

    protected request: APIRequestContext;

    constructor(request: APIRequestContext){
        this.request = request;
    }

    //Returns authorization header as Key-value pair for subsequent request.
    private getHeaders(): {[key:string]: string}{
        try{
            const authPath = path.resolve(process.cwd(), '.auth/user.json')

            //Read contents as raw text and convert back to JavaScript Object.
            const auth = JSON.parse(fs.readFileSync(authPath, 'utf-8'));

            //Look for the tag with name accessToken and get its value
            const token = auth.origins[0].localStorage.find((i:any) => i.name === 'accessToken').value;
            
            //Required header object.
            return{
                'Authorization': `Bearer ${token}`,                
            };
        }catch(e){
            console.error("BaseController could not read token:", e);
            return {}; // Return empty; config defaults will still be used
        }
    }

    //POST request.
    async post(endPoint: string, payload: object): Promise<APIResponse> {
        //Get complete URL for logging
        const fullUrlForLog = `${process.env.API_BASE_URL || ''}${endPoint}`;
        console.log(`[DEBUG] Attempting POST to: ${fullUrlForLog}`);

        const response = await this.request.post(endPoint, {data: payload, headers: this.getHeaders()});
        await this.logDetails(endPoint, 'POST', response);
        return response;
    }

    //GET request.
    async get(endPoint: string): Promise<APIResponse>{
        //Get complete URL for logging
        const fullUrlForLog = `${process.env.API_BASE_URL || ''}${endPoint}`;
        console.log(`[DEBUG] Attempting GET to: ${fullUrlForLog}`);

        const response = await this.request.get(endPoint, {headers: this.getHeaders()});
        await this.logDetails(endPoint, 'GET', response);
        return response;
    }

    //DELETE request.
    async delete(endPoint: string): Promise<APIResponse>{
        const response = await this.request.delete(endPoint);
        await this.logDetails(endPoint, 'DELETE', response);
        return response;
    }

    //Log if response has error.
    private async logDetails(url: string, method: string, response: APIResponse){
        console.log(`API Request | ${method} -> ${url}`);

        if(!response.ok()){
            console.error(`[ERROR] Status: ${response.status()} ${response.statusText()}`);
            //Log error body if available.
            try{
                const errRespBody = await response.json();
                console.error(`[ERROR BODY]: `, JSON.stringify(errRespBody, null, 2));
            }catch(e){
                console.error(`[ERROR BODY]: Could not parse the JSON reposne.`);
            }
        }
    }
}