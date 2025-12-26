import { BasePage } from './base.page';
import { Page, Locator} from '@playwright/test';

export class DashboardPage extends BasePage{
    private readonly header: Locator;

    constructor(page:Page){
        super(page);
        this.header = page.getByRole('heading', {name: 'Dashboard'});
    }

    get dashboardHeader(){
        return this.header;
    }
}