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
  "email": "jackpeterhorton@gmail.com",
  "id": 1,
  "facebook_token": null,
  "api_token": "35531950-8156-4c51-9939-719acdfaf458",
  "created_at": "2015-10-17T00:52:32.665Z",
  "updated_at": "2015-11-29T18:27:33.337Z",
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
  "id": 376,
  "rating": 4,
  "flavors": {
    "sour": 0.16666666666666666,
    "meaty": 0.5,
    "salty": 0.8333333333333334,
    "sweet": 0.16666666666666666,
    "bitter": 0.6666666666666666,
    "piquant": 0
  },
  "attributes": {
    "course": [
      "Breakfast and Brunch"
    ]
  },
  "recipeName": "Easy Veggie Breakfast Burritos",
  "ingredients": [
    "butter",
    "flour tortillas",
    "cheddar cheese",
    "veggies"
  ],
  "smallImageUrls": [
    "https://lh3.googleusercontent.com/OC7kODAIOY-mtPSSrfIjaUjnkq0ksR_1SLVKnZYh2_o5XzBCyLvce7yWRRgG3HkIG4DqTDlTlcWTObpkob93GA=s90"
  ],
  "imageUrlsBySize": {
    "90": "https://lh3.googleusercontent.com/AQ9MlzMbDvhjXSPY7BXR4jPO0ohYi0YWoxf4sXKk333lGS0_aH8Q_dkhI-Erp_5C8I3Hpk1tRVczNLcIWspD0A=s90-c"
  },
  "sourceDisplayName": "The Parent Spot",
  "totalTimeInSeconds": 900,
  "yummly_id": "Easy-Veggie-Breakfast-Burritos-1365839",
  "likes": 0,
  "favorites": 2,
  "completions": 2,
  "liked": null,
  "favorited": false,
  "completed": false,
  "status": "success"
}
```

#### Personalized recipes
All routes that return recipe objects can have an `api_token` provided. If it is a valid API token, the `liked`, `favorited`, and `completed` fields will be valid for each recipe object – that is, if the user has liked recipe 376, `liked` will be `true` for recipe 376 when it is returned

#### Get the recipe stream
**Definition**
```
GET http://api.kitchen.support/stream
```

**Arguments**
- `limit`: The number of recipes to return, `30` by default.
- `offset`: The offset in the list to return. Similar to the idea of "paging". *Note* - the recipe stream is, as it stands today, completely non-deterministic without `forceNew` set. So, while offset is technically implemented even when `forceNew` is `false`, it only has a meaningful effect when used in conjunction with `forceNew`. `0` by default.
- `forceNew`: If `forceNew` is set to `true`, the API will call out to Yummly first to get relevant recipes, cache them, and then return the result. This call takes significantly longer with `forceNew` set, and as such it's use is discouraged except to build out the database.

**Return**: Returns an array of recipe objects.

#### Get a single recipe
**Definition**
```
GET http://api.kitchen.support/recipe
```

**Arguments**
- `id`: the `id` of a given recipe.
- `yummly_id`: the `yummly_id` of a given recipe.
- *Note*: `id` will take precedence over `yummly_id`, as only one is ever used.

#### Search for a recipe
**Definition**
```
GET http://api.kitchen.support/recipes/search/:searchTerm
```

**Arguments**
- `searchTerm`: Any term to search the Yummly API for.
- `limit`: the number of recipes to return, `30` by default.
- `offset`: the offset of recipes to return, similar to the concept of "paging". `0` by default.
- `forceNew`: If `forceNew` is set to `true`, the API will call out to Yummly first to get the day's featured recipes, cache them, and then return the result. This call takes significantly longer with `forceNew` set, and as such it's use is discouraged except to build out the database.

### Liking, favoriting, and completing recipes
Likes, favorites, and completions all act similarly. The API semantics for each are the same, and the respective paths are `/likes`, `/favorites`, `/completed`

#### Get all liked/favorited/completed recipes
**Definition**
```
GET http://api.kitchen.support/favorites
```

**Arguments**
- `api_token`: A valid API token.
- `limit`: the number of recipes to return, `30` by default.
- `offset`: the offset of recipes to return, similar to the concept of "paging". `0` by default.
- `value`: (*Optional*) the value of the relationship to be retrieved, defaults to `true` (otherwise can be `false`).

#### Like/favorite/complete a recipe
**Definition**
```
POST http://api.kitchen.support/:action
```

**Arguments**
- `api_token`: A valid API token.
- `recipe_id`: The `id` of the recipe being liked/favorited/completed.

#### Unlike/unfavorite/un-complete a recipe
**Definition**
```
DELETE http://api.kitchen.support/:action
```

**Arguments**
- `api_token`: A valid API token.
- `recipe_id`: The `id` of the recipe being unliked/unfavorited/un-completed.

### Ingredients
#### Getting all ingredients
**Definition**
```
GET http://api.kitchen.support/ingredients
```

**Arguments**
- `limit`: the number of ingredients to return, `30` by default.
- `offset`: the offset of ingredients to return, similar to the concept of "paging". `0` by default.

#### Search ingredients
**Definition**
```
GET http://api.kitchen.support/ingredients/:searchTerm
```

**Arguments**
- `limit`: the number of ingredients to return, `30` by default.
- `offset`: the offset of ingredients to return, similar to the concept of "paging". `0` by default.

### Pantry
#### Get a user's pantry
**Definition**
```
GET http://api.kitchen.support/pantry
```

**Arguments**
- `api_token`: A valid API token.
- `limit`: the number of ingredients to return, `30` by default.
- `offset`: the offset of ingredients to return, similar to the concept of "paging". `0` by default.

#### Add an item to the user's pantry
**Definition**
```
POST http://api.kitchen.support/pantry
```

**Arguments**
- `api_token`: A valid API token.
- `ingredient_id`: the ID of the ingredient being added.

#### Remove an item from the user's pantry
**Definition**
```
DELETE http://api.kitchen.support/pantry
```

**Arguments**
- `api_token`: A valid API token.
- `ingredient_id`: the ID of the ingredient being removed.
