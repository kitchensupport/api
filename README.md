# api [![Circle CI](https://circleci.com/gh/kitchensupport/api/tree/master.svg?style=svg)](https://circleci.com/gh/kitchensupport/api/tree/master)
Backend API for Kitchen Support

## API Details
Our API uses HTTP verbs to convey meaning. `GET` requests are used for pure information retrieval, while `POST` requests are used for creating new information.

Every request except for initial login and account creation requests will need to pass along a valid API token with the key `token`. These tokens are returned by the account creation and login processes. Additionally, every request will eventually need an `app_secret`, which validates that your app is allowed to use our service.

## API Reference
### Accounts
#### The account object
All requests relating to accounts will have a response in this form.

```json
{
    "user": {
        "id": 1,
        "email": "user@example.com",
        "token": "5478a2d9-0a18-48f6-8f8c82fb3cc3",
        "created": 1386247539
    },
    "status": "success"
}
```

#### Create an account
**Definition**
```
POST https://api.kitchen.support/accounts/create
```

**Arguments**
- Basic authentication
    - `email`: A valid email address.
    - `password`: A password matching our security rules (which are currently nonexistent).
- Authentication with facebook (**UNIMPLEMENTED**)
    - `facebook_token`: A valid [facebook access token](https://developers.facebook.com/docs/facebook-login/access-tokens/), with profile and email permissions. We use these permissions to fill out the user's KitchenSupport account profile.

#### Log into an account
**Definition**
```
POST https://api.kitchen.support/accounts/login
```

**Arguments**
- Basic authentication
    - `email`: A valid email address.
    - `password`: A password matching our security rules (which are currently nonexistent).
- Authentication with facebook (**UNIMPLEMENTED**)
    - `facebook_token`: A valid [facebook access token](https://developers.facebook.com/docs/facebook-login/access-tokens/), with profile and email permissions. We use these permissions to fill out the user's KitchenSupport account profile.

#### Retrieve an account
**Definition**
```
GET https://api.kitchen.support/account
```

**Arguments**
- `token`: A valid API token corresponding to tha account being requested.
