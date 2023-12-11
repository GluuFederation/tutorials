## Overview

Agama Lab tool helps developers to make a flow for Jans Agama.

Agama Docs : https://docs.jans.io/head/agama/introduction

## Table of Content

- [Overview](#overview)
- [Agama-Lab Online Tool](#agama-lab-online-tool)
- [Install GitHub-App and select Repository](#install-github-app-and-select-repository)
- [Make a Project](#make-a-project)
- [Make a Flow File](#make-a-flow-file)
- [Make a Simple Basic Auth Flow](#make-a-simple-basic-auth-flow)
- [Download Basic Flow](#download-basic-flow)
- [Make a template file](#make-a-template-file)
- [Make a gama file / Release Project](#make-a-gama-file---release-project)
- [Deploy a gama file on Jans](#deploy-a-gama-file-on-jans)
- [Testing using Jans Tent](#testing-using-jans-tent)

## Agama-Lab Online Tool

Use https://cloud.gluu.org/agama-lab online tool to make an agama flow.

Hit the above URL and you will see a page with `Sign in with GitHub` button. Click on it and give access to agama-lab.

![login-page](./assets/login-page.png)

## Install GitHub-App and select Repository

In the next step, You need to install a GitHub App which will allow Agama-Lab to commit and push changes to your repository. Agama-Lab uses your repository to store whole project's data and flow files.

![install-app-select-repo](./assets/install-app-select-repo.png)

While GitHub-App installation it will ask you to choose repository. IF you missed, add repository using GitHub settings `GitHub Settings > Integrations > Applications > agama-lab > Repository Access`.

![select-repo](./assets/select-repo.png)

Use `Select Repository` button to choose repository. Your repository must have at least one Git Commit to proceed. Just making a fresh new repo with README.md will be good. Click on `Create Project` button to proceed next.

![select-repo-button](./assets/select-repo-button.png)

## Make a Project

The first step is to make a Project.

![add-project](./assets/add-project.png)

Navigate to the Project Tree File view to make Agama Flows and `.gama` files.

![project-tree-button](./assets/project-tree-button.png)

## Make a Flow File

- Right Click on the `Code` folder and select New Flow file
  ![new-flow](./assets/new-flow.png)

- Enter Details in Form and click on `Create` button.
  ![flow-details](./assets/flow-details.png)

## Make a Simple Basic Auth Flow

### 1.

![add-call-widget](./assets/add-call-widget.png)

### 2.

![add-call-details-auth](./assets/add-call-details-auth.png)

### 3.

![add-call-cdiutil](./assets/add-call-cdiutil.png)

### 4.

![add-call-cdiutil-details](./assets/add-call-cdiutil-details.png)

### 5.

![add-assign-authresult](./assets/add-assign-authresult.png)

### 6.

![add-assign-authresult-details](./assets/add-assign-authresult-details.png)

### 7.

![add-repeat](./assets/add-repeat.png)

### 8.

![add-repeat-details](./assets/add-repeat-details.png)

### 9.

![add-rrf](./assets/add-rrf.png)

### 10.

![add-rrf-details](./assets/add-rrf-details.png)

### 11.

![add-call-auth-method](./assets/add-call-auth-method.png)

### 12.

![add-call-auth-method-details](./assets/add-call-auth-method-details.png)

### 13.

![add-assign-authresult-uid](./assets/add-assign-authresult-uid.png)

### 14.

![add-assign-authresult-uid-details](./assets/add-assign-authresult-uid-details.png)

### 15.

![add-when](./assets/add-when.png)

### 16.

![add-when-details](./assets/add-when-details.png)

### 17.

![add-success-finish](./assets/add-success-finish.png)

### 18.

![add-success-finish-details](./assets/add-success-finish-details.png)

### 19.

![add-failed-finish](./assets/add-failed-finish.png)

### 20.

![add-failed-finish-details](./assets/add-failed-finish-details.png)

- Save it and you can click on the `Code` button to see the actual flow

![save-flow](./assets/save-flow.png)

- It will look like

![generated-code](./assets/generated-code.png)

```
Flow agama.pw
     Basepath ""
authService = Call io.jans.as.server.service.AuthenticationService#class
cdiUtil = Call io.jans.service.cdi.util.CdiUtil#bean authService
authResult = {}
Repeat 3 times max
     creds = RRF "login.ftlh" authResult
     authResult.success = Call cdiUtil authenticate creds.username creds.password
     authResult.uid = creds.username
     // check auth response
     When authResult.success is true
          it_lfnnw = { success: true, data: { userId: authResult.uid } }
          Finish it_lfnnw
it_dnyli = { success: false, error: "auth failed" }
Finish it_dnyli
```

## Download Basic Flow

If you created the above flow successfully then skip this part. There is an import facility. If you have any existing flow's JSON file then you can directly import and make a flow quickly.

[co.basic.zip](./assets/agama.pw.zip)

Download the above zip, extract it, and import the JSON file:

![import-flow](./assets/import-flow.png)

## Make a template file

The above flow is using `login.ftlh` template file. Let's create it.

- Right-click on the `web` folder and select the new free maker template
  ![Screenshot from 2023-04-13 15-58-41](https://user-images.githubusercontent.com/39133739/231783211-d8917062-5a7c-42de-b34c-020ff6e60f2a.png)

- Select Template and add details. It is up to you to make a beautiful design using UI-Editor.
  ![Projects - View 2023-04-13 16-05-42](https://user-images.githubusercontent.com/39133739/231783067-6abc4b74-cb3d-4558-981a-37346838e14c.png)

- Edit HTML to add existing code. You can make your own.
  ![Projects - View 2023-04-13 16-08-04](https://user-images.githubusercontent.com/39133739/231784108-41cd76ae-c320-4294-b369-ffa36522a4f9.png)

```html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>Jans Agama Basic Auth flow</title>
  </head>
  <body>
    <h2>Welcome</h2>
    <hr />

    [#if !(success!true)]
    <p class="fs-6 text-danger mb-3">${msgs["login.errorMessage"]}</p>
    [/#if]

    <hr />
    <form method="post" enctype="application/x-www-form-urlencoded">
      <div>
        Username:
        <input
          type="text"
          class="form-control"
          name="username"
          id="username"
          value="${uid!}"
          required
        />
      </div>

      <div>
        Password:
        <input
          type="password"
          class="form-control"
          id="password"
          name="password"
        />
      </div>

      <div>
        <input type="submit" class="btn btn-success px-4" value="Login" />
      </div>
    </form>
  </body>
  <style>
    input {
      border: 1px solid #000000;
    }
  </style>
</html>
```

![Projects - View 2023-04-13 16-19-04](https://user-images.githubusercontent.com/39133739/231784303-7cf5c940-ae3a-472b-9a5d-28bdddb858c9.png)
![Projects - View 2023-04-13 16-19-49](https://user-images.githubusercontent.com/39133739/231784788-c701e067-b1ed-4f47-95c1-8807ef6dccdf.png)

_Once you save the file. It will add `[#ftl output_format="HTML"]` which is needed because we are using `[#if...` instead of `<#if...`._

> Notice
> If you want to add code like `<input type="submit" class="btn btn-success px-4" value="${msgs["login.login"]}">` then it will not work instead of add `<input type="submit" class="btn btn-success px-4" value="${msgs['login.login']}"/>`.You need to use a single quote inside a double quote.

![Projects - View 2023-04-13 16-20-47](https://user-images.githubusercontent.com/39133739/231784845-12748cd4-077f-4178-816f-76cc6d6dbb72.png)

## Make a gama file / Release Project

- Right-click on anything in File Tree and select `Release Project`

![Screenshot from 2023-04-13 16-54-02](https://user-images.githubusercontent.com/39133739/231786884-fa9eb129-36b8-4233-bdd4-93e4526a3d30.png)
![Projects - View 2023-04-13 16-54-53](https://user-images.githubusercontent.com/39133739/231787092-f003780a-ade2-45a2-82a0-f479185057d4.png)
![Releases - ADS 2023-04-13 16-55-56](https://user-images.githubusercontent.com/39133739/231787167-8dd6a7d0-e84e-498c-813c-e51ef468c69e.png)
![Release kiran_first 1 0 4 · kdhttps-agama-projects 2023-04-13 16-57-49](https://user-images.githubusercontent.com/39133739/231787228-76c6004e-de4c-40ae-87e3-6762863764d8.png)

## Deploy a gama file on Jans

- Make sure you have enabled Agama and Agama Script on your Jans server. [Check Agama Docs for Details](https://docs.jans.io/head/admin/developer/agama/engine-config/#engine-availability)

- Let's enable it using TUI, Open TUI in your Jans Server

```
# cd /opt/jans/jans-cli
# python3 jans_cli_tui.py
```

- Enable Agama Configuration, In TUI, navigate to `AuthServer > Properties > agamaConfiguration > Enabled [*] > Save`
  ![image](https://user-images.githubusercontent.com/39133739/232745292-ba0d86a6-bf02-4012-98a7-cd3ebba4cbb3.png)

- Enable Agama Script, In TUI, navigate to `Scripts > Search 'agama' > Select script Enabled [*] > Save`
  ![image](https://user-images.githubusercontent.com/39133739/232746143-23f9d95e-a81d-4d63-9cd4-8bdd46840252.png)

- Move your `.gama` file to your Jans server

- Navigate to `Auth Server > Agama > Upload Project`
  ![image](https://user-images.githubusercontent.com/39133739/231790968-3d824690-dd74-4208-bc94-caf5f1d7b667.png)

- Select a file and upload
  ![image](https://user-images.githubusercontent.com/39133739/231791150-2fe3adcb-cfe9-47a8-a2da-621d8a603cd3.png)

- You should see now uploaded project in the list
  ![image](https://user-images.githubusercontent.com/39133739/231791444-78914cfd-d506-4333-afc6-218ce40909e2.png)

_Check your Jans logs for Any Errors_

## Testing using Jans Tent

- Setup Jans-Tent. [Instructions](https://github.com/JanssenProject/jans/tree/main/demos/jans-tent)

- Setup `config.py` as per your need.

- Configuration to run Agama flow

```
ACR_VALUES = "agama"
ADDITIONAL_PARAMS = {
    'agama_flow': 'co.basic'
}
```

- Run Tent
  ![image](https://user-images.githubusercontent.com/39133739/231793396-3b23bef9-2c1a-45f4-abed-15a2ed9a4e98.png)
  ![image](https://user-images.githubusercontent.com/39133739/231793520-a17a0a68-f9ce-4094-aaaf-d9783e514113.png)

- Successfully login
  ![image](https://user-images.githubusercontent.com/39133739/231793764-7a895efb-3bdb-4d0d-9f82-6c7ec25870d6.png)
