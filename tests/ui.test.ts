const webdriver = require('selenium-webdriver')
const { Builder, By, Key, until } = require('selenium-webdriver');
let driver;

const documentInitialised = () =>
    driver.executeScript('return initialised');

beforeEach(async function () {
    try {
        driver = await new webdriver.Builder().forBrowser('chrome').build();
        await driver.manage().window().setSize(1600, 900);
        driver.get('https://ownchgk.herokuapp.com');
        await driver.wait(until.elementLocated(By.id('restore')), 10000);
    } catch (ex) {
        console.log(ex.stack);
    }
})

test('Should_open_page', async () => {
    let url = await driver.getCurrentUrl();
    expect(url).toContain('https://ownchgk.herokuapp.com');
});

test('Should_click_reset', async () => {
    await driver.findElement(By.id('restore')).click();
    let url = await driver.getCurrentUrl();
    expect(url).toBe('https://ownchgk.herokuapp.com/restore-password');
});

test('Should_enter_email', async () => {
    let passwordInput = await driver.findElement(By.id('password'));
    passwordInput.sendKeys('210810', Key.ENTER);
    await driver.findElement(By.id('email')).sendKeys('olja_sr@mail.ru', Key.ENTER);
    await driver.wait(until.elementLocated(By.id('teams')), 10000);
    let url = await driver.getCurrentUrl();
    expect(url).toBe('https://ownchgk.herokuapp.com/start-screen');
}, 60000);

afterEach(async function () {
    await driver.quit();
})