# oxAuth is available under the MIT License (2008). See http://opensource.org/licenses/MIT for full text.
# Copyright (c) 2017, Gluu
#
# Author: 
#

from org.gluu.service.cdi.util import CdiUtil
from org.gluu.oxauth.security import Identity
from org.gluu.model.custom.script.type.authz import ConsentGatheringType
from org.gluu.util import StringHelper
from org.gluu.oxauth.service import UserService
from org.gluu.oxauth.service import ClientService

import java
import random

class ConsentGathering(ConsentGatheringType):

    def __init__(self, currentTimeMillis):
        self.currentTimeMillis = currentTimeMillis

    def init(self, customScript, configurationAttributes):
        print "Consent-Gathering. Initializing ..."
        print "Consent-Gathering. Initialized successfully"

        return True

    def destroy(self, configurationAttributes):
        print "Consent-Gathering. Destroying ..."
        print "Consent-Gathering. Destroyed successfully"

        return True

    def getAuthenticationMethodClaims(self, requestParameters):
        return None

    def getApiVersion(self):
        return 11

    # Main consent-gather method. Must return True (if gathering performed successfully) or False (if fail).
    # All user entered values can be access via Map<String, String> context.getPageAttributes()
    def authorize(self, step, context): # context is reference of org.gluu.oxauth.service.external.context.ConsentGatheringContext
        print "Consent-Gathering. Authorizing..."

        if step == 1:
            allowButton = context.getRequestParameters().get("authorizeForm:allowButton")
            if (allowButton != None) and (len(allowButton) > 0):
                print "Consent-Gathering. Getting Userinfo"
                user = context.getUser()
                if user:
                    print "Consent-Gathering. user: " + user.toString()
                    userService = context.getUserService()
                    print "Consent-Gathering. displayName: " + userService.getCustomAttribute(user, "displayName").getValue()
                    
                    client = context.getClient()
                    print "Consent-Gathering. client: " + client.toString()
                    print "Consent-Gathering. client inum: " + client.getClientId()
                else:
                    print "Consent-Gathering. user: is null"

                print "Consent-Gathering. Authorization success for step 1"
                return True

            print "Consent-Gathering. Authorization declined for step 1"

        return False

    def getNextStep(self, step, context):
        return -1

    def prepareForStep(self, step, context):
        if not context.isAuthenticated():
            print "User is not authenticated. Aborting authorization flow ..."
            return False

        return True

    def getStepsCount(self, context):
        return 1

    def getPageForStep(self, step, context):
        if step == 1:
            return "/authz/authorize.xhtml"

        return ""
