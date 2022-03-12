const webdriver = require('selenium-webdriver')
const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
let driver;


const port = parseInt(process.env.PORT || '3000');
const url = 'http://localhost:'+port + '/admin'

beforeEach(async function () {
    try {
        jest.useFakeTimers('legacy')
        jest.useRealTimers()
        jest.setTimeout(60000);
        driver = new webdriver.Builder().forBrowser('firefox').build();
        driver.get(url);
        await driver.wait(until.elementLocated(By.id('restore')), 10000);
    } catch (ex) {
        // @ts-ignore
        console.log(ex.stack);
    }
})

test('Should_open_admin_page', async () => {
    let currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain(url);
}, 60000);

test('Should_click_reset_for_admin', async () => {
    await driver.findElement(By.id('restore')).click();
    let currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/restore-password');
}, 60000);

test('Should_successful_login', async () => {
    await login(loginSecret, passwordSecret, "teams")

    let currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/start-screen');
}, 60000);

test('Should_go_to_change_password', async () => {
    let restoreLink = await driver.findElement(By.id('restore'));
    restoreLink.click();
    let button = await driver.findElement(By.tagName('button'));
    let input = await driver.findElement(By.tagName('input'));
    let rememberPasswordLink = await driver.findElement(By.id('remember'));

    let currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/restore-password');
    expect(await input.getAttribute("placeholder")).toBe("E-mail")
    expect(await button.getText()).toBe('Отправить');
    expect(await rememberPasswordLink.getAttribute("href")).toContain("/admin");
    expect(await rememberPasswordLink.getText()).toBe("Вспомнил пароль");
}, 60000);

test('Should_go_to_team_creation_by_admin', async () => {
    await login(loginSecret, passwordSecret, "games")

    const teamsTab = await driver.findElement(By.id('teams'));
    teamsTab.click();
    const button = await driver.findElement(By.id('addTeamButton'));
    button.click();
    await driver.wait(until.elementLocated(By.id('teamName')), 5000);

    let teamNameInput = await driver.findElement(By.id('teamName'));
    let captainInput = await driver.findElement(By.id('captain'));
    let saveTeamButton = await driver.findElement(By.css('button[type="Submit"]'));
    let currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/team-creation');
    expect(await teamNameInput.getAttribute("placeholder")).toBe("Название")
    expect(await saveTeamButton.getText()).toBe("Создать");
    expect(await captainInput.getAttribute("value")).toBe("");
}, 60000);

test('Should_go_to_admin_creation', async () => {
    await login(loginSecret, passwordSecret, "games")

    const adminTab = await driver.findElement(By.id('admins'));
    adminTab.click();
    const button = await driver.findElement(By.id('addAdmin'));
    button.click();
    await driver.wait(until.elementLocated(By.id('new-admin-name')), 5000);

    let adminNameInput = await driver.findElement(By.id('new-admin-name'));
    let adminEmailInput = await driver.findElement(By.id('new-admin-email'));
    let saveAdminButton = await driver.findElement(By.id('addAdminButton'));
    expect(await adminNameInput.getAttribute("placeholder")).toBe("Имя");
    expect(await adminEmailInput.getAttribute("placeholder")).toBe("Email*");
}, 60000);

test('Should_go_to_admin_profile', async () => {
    await login(loginSecret, passwordSecret, "games")

    const profile = await driver.findElement(By.id('profile'));
    profile.click();

    await driver.wait(until.elementLocated(By.id('email')), 5000);

    let email = await driver.findElement(By.id('email'));
    let oldPassword = await driver.findElement(By.id('old-password'));
    let newPassword = await driver.findElement(By.id('new-password'));
    let newPasswordRepeat = await driver.findElement(By.id('repeat-new-password'));
    let saveButton = await driver.findElement(By.css('button[type="Submit"]'));
    expect(await email.getText()).toBe(loginSecret);
    expect(await oldPassword.getAttribute("value")).toBe("");
    expect(await newPassword.getAttribute("value")).toBe("");
    expect(await newPasswordRepeat.getAttribute("value")).toBe("");
    expect(await saveButton.getText()).toBe("Сохранить");
}, 60000);

test('Should_admin_logout', async () => {
    await login(loginSecret, passwordSecret, "games")
    let cookie = await driver.manage().getCookie("authorization");
    expect(cookie).not.toBeNull();

    const logout = await driver.findElement(By.css('img[alt="LogOut"]'));
    logout.click();

    let currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain(url);
    cookie = await driver.manage().getCookie("authorization");
    expect(cookie).toBe(null);
}, 60000);

afterEach(async function () {
    await driver.quit();
})

async function login(email:String, password:String, elementId:String) {
    await driver.findElement(By.id('password')).sendKeys(password, Key.ENTER);
    await driver.findElement(By.id('email')).sendKeys(email, Key.ENTER);
    await driver.wait(until.elementLocated(By.id(elementId)), 10000);
}