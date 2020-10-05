/* eslint-disable no-empty */
const assert = require('assert')
const {
  After, When, Then, setDefaultTimeout
} = require('cucumber')
const {
  Builder, By, until, Capabilities, Capability
} = require('selenium-webdriver')
const { expect } = require('chai')

require('../../../index')

setDefaultTimeout(20000)

When('user request for profile', async () => {
  this.driver = new Builder()
    .forBrowser('chrome')
    .build()

  await this.driver.get('http://localhost:4200')

  await this.driver.findElement(By.linkText('Profile')).click()
})

Then('user should get login button {string}', async (button) => {
  await this.driver.sleep(1000)
  const loginButton = await this.driver.wait(until.elementLocated(By.linkText(button)), 5000)
  assert(loginButton)
})

When('user click on {string} login button', async (button) => {
  const capabilities = Capabilities.chrome()
  capabilities.set(Capability.ACCEPT_INSECURE_TLS_CERTS, true)

  this.driver = new Builder()
    .withCapabilities(capabilities)
    .forBrowser('chrome')
    .build()

  await this.driver.get('http://localhost:4200')

  await this.driver.findElement(By.linkText('Profile')).click()
  await this.driver.sleep(1000)
  await this.driver.wait(until.elementLocated(By.linkText(button)), 10000).click()
})

Then('user should get redirected to OP Server', async () => {
  const loginButton = await this.driver.wait(until.elementLocated(By.id('loginForm:loginButton')), 10000)
  assert(loginButton)
})

When('user click on {string} login button, redirect to op and enter credentials {string} and {string}', async (button, name, password) => {
  const capabilities = Capabilities.chrome()
  capabilities.set(Capability.ACCEPT_INSECURE_TLS_CERTS, true)

  this.driver = new Builder()
    .withCapabilities(capabilities)
    .forBrowser('chrome')
    .build()

  await this.driver.get('http://localhost:4200')

  await this.driver.findElement(By.linkText('Profile')).click()
  await this.driver.sleep(1000)
  await this.driver.wait(until.elementLocated(By.linkText(button)), 10000).click()

  // Now we are at OP side
  await this.driver.sleep(1000)
  await this.driver.wait(until.elementLocated(By.id('loginForm:username')), 10000).sendKeys(name)
  await this.driver.findElement(By.id('loginForm:password')).sendKeys(password)
  await this.driver.findElement(By.id('loginForm:loginButton')).click()

  // user allow for details, optional process for already auth user
  try {
    const scopeAllowButton = await this.driver.findElement(By.id('authorizeForm:allowButton'))
    if (scopeAllowButton) {
      await scopeAllowButton.click()
    }
    // eslint-disable-next-line no-empty
  } catch (_) {

  }
})

Then('user should get redirected back to website and see profile details with name {string}', async (name) => {
  await this.driver.sleep(1000)
  const userName = await this.driver.findElement(By.id('username'))
  expect(await userName.getText()).to.match(new RegExp(name))
})

When('user click on {string} login button, redirect to authz server, select external op server provider {string}', async (button, providerName) => {
  const capabilities = Capabilities.chrome()
  capabilities.set(Capability.ACCEPT_INSECURE_TLS_CERTS, true)

  this.driver = new Builder()
    .withCapabilities(capabilities)
    .forBrowser('chrome')
    .build()

  await this.driver.get('http://localhost:4200')

  await this.driver.findElement(By.linkText('Profile')).click()
  await this.driver.sleep(1000)
  await this.driver.wait(until.elementLocated(By.linkText(button)), 10000).click()

  // Now we are at authz(OP) server
  await this.driver.wait(until.elementLocated(By.xpath(`//img[@alt="${providerName}"]`)), 10000).click()
})

When('redirect to external OP, enter credentials {string} and {string}, and user authentication, username field is {string}, passwork is {string} and login button is {string}', async (username, password, usernameField, passwordField, loginButton) => {
  // Now we are at external OP side
  await this.driver.sleep(1000)
  await this.driver.wait(until.elementLocated(By.id(usernameField)), 10000).sendKeys(username)
  await this.driver.findElement(By.id(passwordField)).sendKeys(password)
  await this.driver.findElement(By.id(loginButton)).click()

  // user allow for details, optional process for already auth user
  try {
    const scopeAllowButton = await this.driver.findElement(By.id('authorizeForm:allowButton'))
    if (scopeAllowButton) {
      await scopeAllowButton.click()
    }
  } catch (_) {

  }
})

When('back to authz server, add and authenticate user', async () => {
  // Now we are at authz server,
  // which get code from url(sent by external op), get token and get userinfo from external op
  // user allow for details, optional process for already auth user

  try {
    const scopeAllowButton = await this.driver.findElement(By.id('authorizeForm:allowButton'))
    await scopeAllowButton.click()
  } catch (_) {
    await new Promise((resolve) => resolve())
  }
})

Then('failed auth, user with email is already exist', async () => {
  const message = await this.driver.findElement(By.css('.errormsg'))
  expect(await message.getText()).to.match(new RegExp('Email value corresponds to an already existing account'))
})

When('user request for first IDP authentication Unsolicited endpoint {string}', async (IDPUnsolicitedEndpointWithRequest) => {
  const capabilities = Capabilities.chrome()
  capabilities.set(Capability.ACCEPT_INSECURE_TLS_CERTS, true)

  this.driver = new Builder()
    .withCapabilities(capabilities)
    .forBrowser('chrome')
    .build()

  await this.driver.get(IDPUnsolicitedEndpointWithRequest)
})

When('enter credentials {string} and {string}, and authentication happens', async (username, password) => {
  // Now we are at IDP Login page
  try {
    await this.driver.sleep(1000)
    await this.driver.wait(until.elementLocated(By.id('username')), 10000).sendKeys(username)
    await this.driver.findElement(By.id('password')).sendKeys(password)
    await this.driver.findElement(By.id('loginButton')).click()
  } catch (e) {
    console.log(`error on ${await this.driver.getCurrentUrl()} -->`, e)
    this.driver.takeScreenshot().then(
      (image, err) => {
        require('fs').writeFile(`${new Date().getTime()}_error.png`, image, 'base64', (err) => {
          console.log('Failed to save screenshot', err)
        })
      }
    )
  }
})

Then('redirected to SP and able to access resources', async () => {
  // Now we are at SP
  try {
    const textOnRelayStatePage = await this.driver.findElement(By.tagName('body')).getText()
    expect(textOnRelayStatePage).to.match(new RegExp('If you are seeing this message, no relayState cookie was found. No final redirect could be made.'))
  } catch (e) {
    console.log(`error on ${await this.driver.getCurrentUrl()} -->`, e)
    this.driver.takeScreenshot().then(
      (image, err) => {
        require('fs').writeFile(`${new Date().getTime()}_error.png`, image, 'base64', (err) => {
          console.log('Failed to save screenshot', err)
        })
      }
    )
  }
})

After(async () => {
  await this.driver.close()
})
