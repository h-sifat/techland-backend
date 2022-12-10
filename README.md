# TechLand Backend

The backend of my e-commerce webapp techland where you can buy fake computer
components. This was my submission for MongoDB Atlas Hackathon 2022.

## Techstack

- Node.js
- Express.js
- MongoDB

## Features

- [x] list products

  - [x] pagination
  - [x] filter by price range
  - [x] sort by price
  - [x] filter by brands
  - [x] filter by category
  - [x] find similar
  - [ ] filter by features (e.g., RAM capacity >= 16GB)

- [x] search products

  - [ ] search within a category
  - [ ] search within a brand
  - [x] pagination
  - [x] sort by price
  - [x] autocompletion

- [ ] users

  - [ ] sign up
  - [ ] login
  - [ ] reset password
  - [ ] place order
    - [ ] payment handling
  - [ ] post question
  - [ ] post review

- [ ] employees

  - [ ] sign up
  - [ ] login
  - [ ] reset password
  - [ ] answer users' questions
  - [ ] manage orders
  - [ ] manage users

- [ ] products

  - [ ] add
    - [ ] upload images
  - [ ] edit
  - [ ] update
  - [ ] delete

- [ ] notifications
- [ ] logging

## Development

```bash
# build
npm run build

# start in cluster mode
npm start

# start a single process (run build before starting)
npm run start:single

# test
npm test

# test in watch mode
npm run test:watch

# test coverage
npm run test:coverage
```
