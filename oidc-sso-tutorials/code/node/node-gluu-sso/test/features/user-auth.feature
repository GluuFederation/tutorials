Feature: User Authentication with Gluu Server

    Check user status, authentication and access resources

    Scenario: User is not login so should not able to see profile details
    When user request for profile
    Then user should get login button "Gluu OIDC SSO Login"

    Scenario: User should redirect after clicking on login button
    When user click on "Gluu OIDC SSO Login" login button
    Then user should get redirected to OP Server

    Scenario: User Authentication and able to see profile details
    When user click on "Gluu OIDC SSO Login" login button, redirect to op and enter credentials "ross" and "Ross@123"
    Then user should get redirected back to website and see profile details with name "ross"
    
    Scenario: Another User Authentication and able to see profile details
    When user click on "Gluu OIDC SSO Login" login button, redirect to op and enter credentials "joey" and "Joey@123"
    Then user should get redirected back to website and see profile details with name "joey"
    
    Scenario: User Authentication with external OpenID Provider Server and should able to see the profile details
    When user click on "Gluu OIDC SSO Login" login button, redirect to authz server, select external op server provider "p2gluu"
    When redirect to external OP, enter credentials "monica" and "Monica@123", and user authentication, username field is "username", passwork is "password" and login button is "loginButton"
    When back to authz server, add and authenticate user
    Then user should get redirected back to website and see profile details with name "monica"

    Scenario: User Authentication with SAML and will be able to see profile details
    When user click on "Gluu SAML SSO Login" login button, redirect to op and enter credentials "virat" and "Virat@123"
    Then user should get redirected back to website and see profile details with name "virat"

    Scenario: User Authentication with external SAML Provider Server and should able to see the profile details
    When user click on "Gluu OIDC SSO Login - INBOUND SAML" login button, redirect to authz server, select external op server provider "p2gluusaml"
    When redirect to external OP, enter credentials "virat" and "Virat@123", and user authentication, username field is "loginForm:username", passwork is "loginForm:password" and login button is "loginForm:loginButton"
    When back to authz server, add and authenticate user
    Then user should get redirected back to website and see profile details with name "virat"

    Scenario: User Authentication with external OpenID Provider Server and auth should fail because email linking is off
              User cannot login with Inbound passport for p2gluu provider
    When user click on "Gluu OIDC SSO Login" login button, redirect to authz server, select external op server provider "p2gluu"
    When redirect to external OP, enter credentials "dhoni" and "Dhoni@123", and user authentication, username field is "username", passwork is "password" and login button is "loginButton"
    Then failed auth, user with email is already exist

    Scenario: User Authentication with external OpenID Provider Server and auth should get success because email linking is on
              User can login with Inbound passport for p2gluu_email_linking provider
    When user click on "Gluu OIDC SSO Login" login button, redirect to authz server, select external op server provider "p2gluu_email_linking"
    When redirect to external OP, enter credentials "dhoni" and "Dhoni@123", and user authentication, username field is "username", passwork is "password" and login button is "loginButton"
    When back to authz server, add and authenticate user
    Then user should get redirected back to website and see profile details with name "dhoni"

    Scenario: Inbound SAML SSO IDP-Initiated authentication, User first login into IDP, IDP authenticate the user 
              and redirected to SP and user will be able to access protected resources
    When user request for first IDP authentication Unsolicited endpoint "https://p2.gluu.org/idp/profile/SAML2/Unsolicited/SSO?providerId=passport_saml_rp"
    When enter credentials "virat" and "Virat@123", and authentication happens
    Then redirected to SP and able to access resources

    Scenario: SAML SSO IDP-Initiated authentication, User first login into IDP, IDP authenticate the user 
              and redirected to SP and user will be able to access protected resources
    When user request for first IDP authentication Unsolicited endpoint "https://p2.gluu.org/idp/profile/SAML2/Unsolicited/SSO?providerId=passport_saml_rp_custom"
    When enter credentials "virat" and "Virat@123", and authentication happens
    Then user should get redirected back to website and see profile details with name "virat"
