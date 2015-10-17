# api [![Circle CI](https://circleci.com/gh/kitchensupport/api/tree/master.svg?style=svg)](https://circleci.com/gh/kitchensupport/api/tree/master)
Backend API for Kitchen Support

## API Details
Our API uses HTTP verbs to convey meaning. `GET` requests are used for pure information retrieval, while `POST` requests are used for creating new information.

Every request except for initial login and account creation requests will need to pass along a valid API token with the key `token`. These tokens are returned by the account creation and login processes. Additionally, every request will eventually need an `app_secret`, which validates that your app is allowed to use our service.

## API Reference
### Accounts
#### The account object
All requests relating to accounts will have a response in this form unless otherwise noted.

```json
{
  "status": "success",
  "user": {
    "id": 1,
    "email": "jackpeterhorton@gmail.com",
    "facebook_token": null,
    "api_token": "35531950-8156-4c51",
    "created_at": "2015-10-17T00:52:32.665Z",
    "updated_at": "2015-10-17T00:52:32.665Z"
  }
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

#### Request a password reset token
**Definition**
```
POST http://api.kitchen.support/accounts/reset/request
```

**Arguments**
- `email`: the email address of the user requesting a password reset. An email is sent to the user containing instructions on how to update their password.

**Return**
- *Success*: a 200 status code
- *Failure*: a 401 status code if the email was invalid, or a 500 status code if the email was unable to send.

#### Confirm a password reset
**Definition**
```
POST http://api.kitchen.support/accounts/reset/confirm
```

**Arguments**
- `reset_token`: The reset token that was emailed to the user. Must be less than 30 minutes old.
- `password`: The new password to be set for the user.

**Return**
- *Success*: a 200 status code
- *Failure*: a 401 status code if the email or reset token was invalid, or a 500 status code for other internal errors.
