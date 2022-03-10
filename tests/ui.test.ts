const webdriver = require('selenium-webdriver')
const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
let driver;

const port = parseInt(process.env.PORT || '3000');
const url = 'http://localhost:'+port

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

test('Should_open_page', async () => {
    let url = await driver.getCurrentUrl();
    expect(url).toContain('localhost');
}, 60000);

test('Should_click_reset', async () => {
    await driver.findElement(By.id('restore')).click();
    let url = await driver.getCurrentUrl();
    expect(url).toContain('/restore-password');
}, 60000);

test('Should_successful_login', async () => {
    await login("qi@ru.ru", "12345", "teams")

    let url = await driver.getCurrentUrl();
    expect(url).toContain('/start-screen');
}, 60000);

test('Should_go_to_change_password', async () => {
    let restoreLink = await driver.findElement(By.id('restore'));
    restoreLink.click();
    let button = await driver.findElement(By.tagName('button'));
    let input = await driver.findElement(By.tagName('input'));
    let rememberPasswordLink = await driver.findElement(By.id('remember'));

    let url = await driver.getCurrentUrl();
    expect(url).toContain('/restore-password');
    expect(await input.getAttribute("placeholder")).toBe("E-mail")
    expect(await button.getText()).toBe('Отправить');
    expect(await rememberPasswordLink.getAttribute("href")).toContain("/auth");
    expect(await rememberPasswordLink.getText()).toBe("Вспомнил пароль");
}, 60000);

test('Should_go_to_team_creation', async () => {
    await login("qi@ru.ru", "12345", "teams")

    let button = await driver.findElement(By.id('addTeamButton'));
    button.click();
    await driver.wait(until.elementLocated(By.id('teamName')), 5000);

    let teamNameInput = await driver.findElement(By.id('teamName'));
    let captainInput = await driver.findElement(By.id('captain'));
    let saveTeamButton = await driver.findElement(By.tagName('button'));
    let url = await driver.getCurrentUrl();
    expect(url).toContain('/team-creation');
    expect(await teamNameInput.getAttribute("placeholder")).toBe("Название")
    expect(await saveTeamButton.getText()).toBe("Создать");
    expect(await captainInput.getAttribute("value")).toBe("qi@ru.ru");
}, 60000);

test('test which fail', async () => {
    let a = await fetch('/teams/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json',
            'Cookie': 'authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAzLCJlbWFpbCI6InFpQHJ1LnJ1Iiwicm9sZXMiOiJ1c2VyIiwidGVhbUlkIjpudWxsLCJnYW1lSWQiOm51bGwsIm5hbWUiOm51bGwsImlhdCI6MTY0Njg1ODU4NywiZXhwIjoxNjQ2OTQ0OTg3fQ.1kBFkQIqzuoU5qCDG1YV8AgWRZ2T3vupdazkohitucA'
        },
    }).then(res => {
        if (res.status === 200) {
            console.log(true);
        } else {
            console.log(false);
        }
    });
    console.log(a);
})

afterEach(async function () {
    await driver.quit();
})

async function login(email:String, password:String, elementId:String) {
    await driver.findElement(By.id('password')).sendKeys(password, Key.ENTER);
    await driver.findElement(By.id('email')).sendKeys(email, Key.ENTER);
    await driver.wait(until.elementLocated(By.id(elementId)), 10000);
}