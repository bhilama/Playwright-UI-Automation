import { Page, Locator } from "@playwright/test";

export abstract class BasePage{

    protected readonly page: Page;

    constructor(page:Page){
        this.page = page;
    }

    //Wait for element to be visible and click on it.
    protected async clickElement(locator: Locator){
        await locator.waitFor({state: 'visible'});
        await locator.click();
    }

    //Clears input field and type in value.
    protected async typeInElement(locator: Locator, value: string){
        await locator.clear();
        await locator.fill(value);
    }
}