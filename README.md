# Ferropoly 
This is the game part of the Ferropoly project. For more information see [www.ferropoly.ch](http://www.ferropoly.ch).

## Language policy
The documentation of the project is  in English while the user interface is in German (there are no plans for the support of other
languages).

## Software Repository and Bug tracking

  * [Github Source Repo](https://github.com/ancasicolica/ferropoly-main)
  * [Github Issues](https://github.com/ancasicolica/ferropoly-main/issues), report found bugs here
  * [Github Planning](https://github.com/users/ancasicolica/projects/3)

## Testing
For the test management I use a sponsored licence of [Testiny](https://www.testiny.io/).

![Testify](./common/badge-tested-with-testiny@2x.png)

## Environment Variables 

### General 
 * ``DEBUG``: true or false (default false)
 * ``FERROPOLY_MAIN_PORT``: Port of the main application  
 * ``MAILER_PASS``: Password of the Mail
 * ``MAILER_SENDER``: Sender address
 * ``MAILER_USER``: User for login
 * ``MAILER_HOST``
 * ``MAILER_PORT``: Port, default 465
 * ``FERROPOLY_DEBUG_SECRET``: Used only for debugging routes
 * ``FERROPOLY_GOOGLE_MAPS_API_KEY``: API Key for maps
 * ``FERROPOLY_GOOGLE_GEOCODING_API_KEY``: API Key for geocoding queries
 * ``SENTRY_AUTH_TOKEN`` : Sentry Auth Token for error tracking
 * ``FERROPOLY_SENTRY_VUE_DSN``: Sentry DSN for Vue error tracking
 * ``FERROPOLY_SENTRY_NODE_DSN``: Sentry DSN for Node error tracking
 * ``FERROPOLY_SENTRY_PROJECT``: Sentry environment (e.g. ferropoly-main-preview-vue)

### Credentials for Logins

 * ``FERROPOLY_GOOGLE_CLIENT_ID``
 * ``FERROPOLY_GOOGLE_CLIENT_SECRET``
 * ``FERROPOLY_MICROSOFT_APP_ID``
 * ``FERROPOLY_MICROSOFT_APP_SECRET``

 
## Licence
GPL V3
