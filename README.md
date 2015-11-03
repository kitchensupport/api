# api [![Circle CI](https://circleci.com/gh/kitchensupport/api/tree/master.svg?style=svg)](https://circleci.com/gh/kitchensupport/api/tree/master)
Backend API for Kitchen Support

## API Details
Our API uses HTTP verbs to convey meaning.
- `GET` requests are used for pure information retrieval.
- `POST` requests are used for creating new information.
- `PUT` requests are used for updating existing information.
- `DELETE` requests are used for removing information.

No other methods are supported.

## API Reference
### Accounts
#### The account object
All requests relating to accounts will have a response in this form unless otherwise noted.

```json
{
  "status": "success",
  "user": {
    "id": 1,
    "email": "test@kitchen.support",
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
- `api_token`: A valid API token corresponding to the account being requested.

#### Request a password reset token
**Definition**
```
POST http://api.kitchen.support/accounts/reset/request
```

**Arguments**
- `email`: the email address of the user requesting a password reset. An email is sent to the user containing instructions on how to update their password.


#### Confirm a password reset
**Definition**
```
POST http://api.kitchen.support/accounts/reset/confirm
```

**Arguments**
- `reset_token`: The reset token that was emailed to the user. Must be less than 30 minutes old.
- `password`: The new password to be set for the user.

### Recipes
#### The recipe object
```json
{
    "status": "success",
    "recipe": {
        "id": 3,
        "data": {
            "rating": 3,
            "flavors": {
                "sour": 0.5,
                "meaty": 0,
                "salty": 0,
                "sweet": 0.8333333333333334,
                "bitter": 0,
                "piquant": 0
            },
            "attributes": {
                "course": []
            },
            "recipeName": "Home Remedies Against Bronchitis, Cough and Lung Problems!",
            "ingredients": [
                "purple onion",
                "sugar",
                "lemon",
                "water",
                "honey"
            ],
            "smallImageUrls": [
                "https://lh3.googleusercontent.com/HO_Wkrz3TvqHuNZlxsB4SflVkR5yIyJF20_mAVhnUfIyN0-Jn4wB2bEf2SjekjZvS6M2q3v6IKPfevKcYFG88A=s90"
            ],
            "imageUrlsBySize": {
                "90": "https://lh3.googleusercontent.com/xw77XWwOrxFUTnJOUj02URIKfhU_ULzeylcLCJXngX8Wu7b461u4iPl9y4JozTsGR9vsb-Cz98WmZL-3qgu83g=s90-c"
            },
            "sourceDisplayName": "Healthy Food Team",
            "totalTimeInSeconds": 2400,
            "yummly_id": "Home-Remedies-Against-Bronchitis_-Cough-and-Lung-Problems_-1357174"
        }
    }
}
```

#### Get the recipe stream
**Definition**
```
GET http://api.kitchen.support/stream
```

**Arguments**
- `page`: the integer page number, where each page returns 30 results. [**UNIMPLEMENTED**]

**Return**: Returns an array of recipe objects.

#### Get a single recipe
**Definition**
```
GET http://api.kitchen.support/recipe/:yummlyId
```

**Arguments**
- `yummlyId`: the `yummly_id` (*not* the `id`) of a given recipe.

#### Search for a recipe
**Definition**
```
GET http://api.kitchen.support/recipes/search/:searchTerm
```

**Arguments**
- `searchTerm`: Any term to search the Yummly API for.

### Liking recipes
#### Get a user's liked recipes
**Definition**
```
GET http://api.kitchen.support/likes
```

**Arguments**
- `api_token`: A valid API token.

#### Like a recipe
**Definition**
```
POST http://api.kitchen.support/likes
```

**Arguments**
- `api_token`: A valid API token.
- `recipe_id`: The `id` of the recipe being liked.

#### Stop liking a recipe
**Definition**
```
DELETE http://api.kitchen.support/likes
```

**Arguments**
- `api_token`: A valid API token.
- `recipe_id`: The `id` of the recipe being un-liked.
