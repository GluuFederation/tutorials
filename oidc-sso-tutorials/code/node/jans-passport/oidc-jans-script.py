# Janssen Project software is available under the Apache 2.0 License (2004). See http://www.apache.org/licenses/ for full text.
# Copyright (c) 2020, Janssen Project
#
# Inbound OAuth and OpenID Connect authentication Passport Script for Janssen
#
# Author: Kiran Mali
# 
from io.jans.as.common.model.common import User
from io.jans.as.model.common import WebKeyStorage
from io.jans.as.model.configuration import AppConfiguration
from io.jans.as.model.crypto import CryptoProviderFactory
from io.jans.as.model.jwt import Jwt, JwtClaimName
from io.jans.as.model.util import Base64Util
from io.jans.as.server.service import AppInitializer, AuthenticationService
from io.jans.as.common.service.common import UserService, EncryptionService
from io.jans.as.server.service.net import HttpService
from io.jans.as.server.security import Identity
from io.jans.as.server.util import ServerUtil
from io.jans.orm import PersistenceEntryManager
from io.jans.as.persistence.model.configuration import GluuConfiguration
from io.jans.model.custom.script.type.auth import PersonAuthenticationType
from io.jans.service.cdi.util import CdiUtil
from io.jans.util import StringHelper

from io.jans.jsf2.service import FacesService
from jakarta.faces.application import FacesMessage
from jakarta.faces.context import FacesContext
from java.util import ArrayList, Arrays, Collections, UUID

import json
import sys
import datetime
import urllib

class PersonAuthentication(PersonAuthenticationType):
    def __init__(self, currentTimeMillis):
        self.currentTimeMillis = currentTimeMillis

    def init(self, customScript, configurationAttributes):
        print "OIDC: Initialization"

        # read config from oidc_creds_file
        oidc_creds_file = configurationAttributes.get("oidc_creds_file").getValue2()
        f = open(oidc_creds_file, 'r')
        try:
            creds = json.loads(f.read())
            print creds
        except:
            print "OIDC: Initialization. Failed to load creds from file:", oidc_creds_file
            print "Exception: ", sys.exc_info()[1]
            return False
        finally:
            f.close()

        self.op_server = str(creds["op_server"])
        self.client_id = str(creds["client_id"])
        self.client_secret = str(creds["client_secret"])
        self.authorization_uri = str(creds["authorization_uri"])
        self.token_uri = str(creds["token_uri"])
        self.userinfo_uri = str(creds["userinfo_uri"])
        self.redirect_uri = str(creds["redirect_uri"])
        self.scope = str(creds["scope"]) 

        print "OIDC: Initialized successfully"
        return True

    def destroy(self, configurationAttributes):
        print "OIDC: destroy called"
        return True

    def getApiVersion(self):
        return 11
        
    def getAuthenticationMethodClaims(self, requestParameters):
        return None
        
    def isValidAuthenticationMethod(self, usageType, configurationAttributes):
        return True

    def getAlternativeAuthenticationMethod(self, usageType, configurationAttributes):
        return None

    def authenticate(self, configurationAttributes, requestParameters, step):
        print "OIDC: authenticate called for step %s" % str(step)
        identity = CdiUtil.bean(Identity)
        if step == 1:
            externalOIDCState = ServerUtil.getFirstValue(requestParameters, "state")
            currentSessionOIDCState = identity.getWorkingParameter("state")

            print "OIDC: state verification"
            print "OIDC: current OIDC state: %s, state return by external OP: %s" % (currentSessionOIDCState, externalOIDCState)
            if currentSessionOIDCState != externalOIDCState:
                print "OIDC: authentication failed, Failed to match state"
                return False
            
            print "OIDC: Get Access Token"
            oidcCode = ServerUtil.getFirstValue(requestParameters, "code")
            httpService = CdiUtil.bean(HttpService)
            httpclient = httpService.getHttpsClient()
            tokenRequestData = urllib.urlencode({ 
                "code" : oidcCode, 
                "grant_type" : "authorization_code", 
                "redirect_uri": self.redirect_uri, 
                "client_id": self.client_id, 
                "client_secret": self.client_secret 
                })
                
            tokenRequestHeaders = { "Content-type" : "application/x-www-form-urlencoded", "Accept" : "application/json" }

            resultResponse = httpService.executePost(httpclient, self.token_uri, None, tokenRequestHeaders, tokenRequestData)
            httpResponse = resultResponse.getHttpResponse()
            print "OIDC: token response status code: %s" % httpResponse.getStatusLine().getStatusCode()

            responseBytes = httpService.getResponseContent(httpResponse)
            responseString = httpService.convertEntityToString(responseBytes)
            tokenResponse = json.loads(responseString)

            print "OIDC: perform id token check"
            idToken = tokenResponse["id_token"]
            jwtIdToken = Jwt.parse(idToken)

            print "OIDC: Check id token nonce"
            idTokenNonce = jwtIdToken.getClaims().getClaimAsString("nonce")
            currentSessionOIDCNonce = identity.getWorkingParameter("nonce")
            if idTokenNonce != currentSessionOIDCNonce:
                print "OIDC: Failed to match id token nonce"
                return False
                
            print "OIDC: Check id token aud"
            idTokenAud = jwtIdToken.getClaims().getClaimAsString("aud")
            if idTokenAud != self.client_id:
                print "OIDC: Failed to match id token aud"
                return False
            
            print "OIDC: Check id token expiration"
            idTokenExp = float(jwtIdToken.getClaims().getClaimAsString("exp"))
            expDate = datetime.datetime.fromtimestamp(idTokenExp)
            hasExpired = expDate < datetime.datetime.now()
            if hasExpired:
                print "OIDC: Expired ID token"
                return False

            print "OIDC: Add user"
            userId = jwtIdToken.getClaims().getClaimAsString("sub")
            userService = CdiUtil.bean(UserService)
            foundUser = userService.getUserByAttribute("jansExtUid", "oidc:"+userId)

            print foundUser
            if foundUser is None:
                foundUser = User()
                foundUser.setAttribute("jansExtUid", "oidc:"+userId)
                foundUser.setAttribute("jansEmail", jwtIdToken.getClaims().getClaimAsString("email"))
                foundUser.setAttribute(self.getLocalPrimaryKey(), userId)
                userService = CdiUtil.bean(UserService)
                userService.addUser(foundUser, True)
                foundUser = self.findUserByUserId(userId)
                print foundUser

            print "OIDC: Successfully authenticated"

        authenticationService = CdiUtil.bean(AuthenticationService)
        loggedIn = authenticationService.authenticate(userId)
        print loggedIn
        return loggedIn

    def findUserByUserId(self, userId):
        userService = CdiUtil.bean(UserService)
        return userService.getUserByAttribute("jansExtUid", "oidc:"+userId)

    def getLocalPrimaryKey(self):
        entryManager = CdiUtil.bean(PersistenceEntryManager)
        config = GluuConfiguration()
        config = entryManager.find(config.getClass(), "ou=configuration,o=jans")
        # Pick (one) attribute where user id is stored (e.g. uid/mail)
        # primaryKey is the primary key on the backend AD / LDAP Server
        # localPrimaryKey is the primary key on Janssen. This attr value has been mapped with the primary key attr of the backend AD / LDAP when configuring cache refresh
        uid_attr = config.getIdpAuthn().get(0).getConfig().findValue("localPrimaryKey").asText()
        print "OIDC: init. uid attribute is '%s'" % uid_attr
        return

    def prepareForStep(self, configurationAttributes, requestParameters, step):
        print "OIDC: prepareForStep called for step %s"  % str(step)
        if step == 1:
            # redirect to external OIDC server
            state = UUID.randomUUID().toString()
            nonce = UUID.randomUUID().toString()

            redirect_url_elements = [self.authorization_uri, 
            "?response_type=code",
            "&client_id=", self.client_id,
            "&scope=", self.scope,
            "&state=", state,
            "&nonce=", nonce,
            "&redirect_uri=", self.redirect_uri]
            redirect_url = "".join(redirect_url_elements)
            
            identity = CdiUtil.bean(Identity)
            identity.setWorkingParameter("state", state)
            identity.setWorkingParameter("nonce", nonce)

            facesService = CdiUtil.bean(FacesService)
            facesService.redirectToExternalURL(redirect_url)

        return True

    def getExtraParametersForStep(self, configurationAttributes, step):
        print "OIDC: getExtraParametersForStep called for step %s" % str(step)
        return Arrays.asList("state", "nonce")

    def getCountAuthenticationSteps(self, configurationAttributes):
        print "OIDC: getCountAuthenticationSteps called"
        return 1 

    def getPageForStep(self, configurationAttributes, step):
        print "OIDC: getPageForStep called for step %s" % str(step)

    def getNextStep(self, configurationAttributes, requestParameters, step):
        print "OIDC: getNextStep called for step %s" % str(step)
        return step

    def getLogoutExternalUrl(self, configurationAttributes, requestParameters):
        print "OIDC: Get external logout URL call"
        return None

    def logout(self, configurationAttributes, requestParameters):
        return True
