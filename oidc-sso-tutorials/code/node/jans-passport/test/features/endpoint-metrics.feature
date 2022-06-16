Feature: OpenMetrics for endpoints

  As a Site Reliability Engineer
  Want to easily pickup on endpoint fails
  So I can keep the service up and respond faster.

  We gonna expose a OpenMetrics endpoint so SRE will be able to
  connect an aggregator such as Prometheus
  # Issue: https://github.com/GluuFederation/gluu-passport/issues/110
  
  Scenario: Endpoint should be available for outside connections
    Given passport server is up and running
    When my aggregator access metrics endpoint
    Then should return me the metrics

  Scenario Outline: Metrics should count how many times endpoint was accessed
    Given passport server is up and running
      And I access an "<endpointUrl>" <number> times
    When my aggregator access metrics endpoint
    Then "<endpointAlias>" count should be <number>

    Examples:
    | endpointUrl                               | number  |  endpointAlias                          |
    | /passport/auth/meta/idp/saml-default      | 3       | /passport/auth/meta/idp/#metadata       |
    | /passport/token                           | 12      | /passport/token                         |
    | /passport/auth/saml/saml-default/callback | 8       | /passport/auth/saml/#provider/callback  |
    | /passport/auth/oidc-default/callback      | 4       | /passport/auth/#provider/callback       |
    | /passport/auth/saml-default/124124slksdla | 9       | /passport/auth/#provider/#token         |
