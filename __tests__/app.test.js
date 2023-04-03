import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app.js'
import seedDB from '../db/seeds.js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE_URL)
})

beforeEach(async () => {
  await seedDB()
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('userModels', () => {
  describe('GET: /api/users', () => {
    test('GET: 200 with array of all users', () => {
      return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body: { users } }) => {
          users.forEach(user => {
            expect(user).toHaveProperty('username', expect.any(String))
            expect(user).toHaveProperty('firebase_id', expect.any(String))
            expect(user).toHaveProperty('name', expect.any(String))
            expect(user).toHaveProperty('claimed_books', expect.any(Array))
          })
        })
    })
  })
  describe('GET: /api/users/:id', () => {
    test('GET: 200 with individual user ', () => {
      return request(app)
        .get('/api/users/642548555b3c0d0478ba585d')
        .expect(200)
        .then(({ body: { user } }) => {
          expect(user.username).toBe('Marquis69')
          expect(user.firebase_id).toBe('02d1fad1-1022-4e88-93c8-e0fcc0874306')
          expect(user.name).toBe('Roger Monahan')
          expect(user.claimed_books).toEqual([
            {
              title:
                'Proposals for establishing ... a Joint Stock Tontine Company ... for the purpose of ascertaining the principles of agricultural improvement, etc. L.P.',
              author: 'John SINCLAIR (Right Hon. Sir)',
              genre: 'Action',
              thumbnail:
                'http://books.google.com/books/content?id=bPQCzE1eTbcC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api'
            }
          ])
        })
    })
    test('GET: 404 when request not found', () => {
      return request(app)
        .get('/api/users/742548555b3c0d0478ba585e')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('User Not Found')
        })
    })
    test('GET: 400 when invalid user id', () => {
      return request(app)
        .get('/api/users/notAnId')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('_id field should be a ObjectId')
        })
    })
  })
  describe('POST: /api/users', () => {
    test('POST: 201 ', () => {
      return request(app)
        .post('/api/users')
        .send({
          username: 'TestUser1',
          firebase_id: '12eef1f2-d9ec-4aab-88b9-68528940ca0',
          name: 'Test User Has Name'
        })
        .expect(201)
        .then(({ body: { user } }) => {
          expect(user).toMatchObject({
            username: 'TestUser1',
            firebase_id: '12eef1f2-d9ec-4aab-88b9-68528940ca0',
            name: 'Test User Has Name'
          })
        })
    })
    test('POST: 201 ignores extra keys', () => {
      return request(app)
        .post('/api/users')
        .send({
          username: 'TestUser1',
          firebase_id: '12eef1f2-d9ec-4aab-88b9-68528940ca0',
          name: 'Test User Has Name',
          claimed_books: ['book1', 'book2']
        })
        .expect(201)
        .then(({ body: { user } }) => {
          expect(user).toMatchObject({
            username: 'TestUser1',
            firebase_id: '12eef1f2-d9ec-4aab-88b9-68528940ca0',
            name: 'Test User Has Name'
          })
        })
    })
    test('POST: 400 missing key', () => {
      return request(app)
        .post('/api/users')
        .send({
          username: 'TestUser1',
          firebase_id: '12eef1f2-d9ec-4aab-88b9-68528940ca0'
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('name is a required field')
        })
    })
    test('POST: 400 invalid field type', () => {
      return request(app)
        .post('/api/users')
        .send({
          username: ['TestUser1'],
          firebase_id: '12eef1f2-d9ec-4aab-88b9-68528940ca0',
          name: 'Test User Has Name',
          claimed_books: ['book1', 'book2']
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('username field should be a string')
        })
    })
  })
})

describe('bookModels', () => {
  describe('GET: /api/books', () => {
    test('GET: 200 with array of all books', () => {
      return request(app)
        .get('/api/books')
        .expect(200)
        .then(({ body: { books } }) => {
          books.forEach(book => {
            expect(book).toHaveProperty('title', expect.any(String))
            expect(book).toHaveProperty('author', expect.any(String))
            expect(book).toHaveProperty('genre', expect.any(String))
            expect(book).toHaveProperty('posted_by', expect.any(String))
            expect(book).toHaveProperty('location', expect.any(Object))
            expect(book.location).toHaveProperty('type', expect.any(String))
            expect(book.location).toHaveProperty(
              'coordinates',
              expect.any(Array)
            )
            expect(book).toHaveProperty(
              'location_description',
              expect.any(String)
            )
          })
        })
    })
  })
  describe('GET: /api/books/:id', () => {
    test('200 with one book object', () => {
      return request(app)
        .get('/api/books/6425407dba5e321df2803b39')
        .expect(200)
        .then(({ body: { book } }) => {
          expect(book).toHaveProperty('title', 'Minnie the Moocher')
          expect(book).toHaveProperty('author', 'Tyler Marks')
          expect(book).toHaveProperty('genre', 'March')
          expect(book).toHaveProperty('posted_by', 'Pam Howell')
          expect(book).toHaveProperty('location', {
            type: 'Point',
            coordinates: [-1.6137, 53.8435]
          })
          expect(book).toHaveProperty(
            'location_description',
            "copying the program won't do anything, we need to index the mobile USB system!"
          )
        })
    })
    test('404 non-existent book', () => {
      return request(app)
        .get('/api/books/5425407dba5e321df2803b39')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('Book not found.')
        })
    })
    test('400 invalid book id', () => {
      return request(app)
        .get('/api/books/notABook')
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('_id field should be a ObjectId')
        })
    })
  })
  describe('POST: /api/books', () => {
    test('POST: 201 returns new book', () => {
      return request(app)
        .post('/api/books')
        .send({
          title: 'Minnie the Moocher 2',
          author: 'Tyler Marks',
          genre: 'March',
          posted_by: 'Pam Howell',
          location: {
            type: 'Point',
            coordinates: ['-1.6137', '52.8435']
          },
          location_description:
            "copying the program won't do anything, we need to index the mobile USB system!"
        })
        .expect(201)
        .then(({ body: { book } }) => {
          expect(book).toMatchObject({
            _id: expect.any(String),
            title: 'Minnie the Moocher 2',
            author: 'Tyler Marks',
            genre: 'March',
            posted_by: 'Pam Howell',
            location: {
              type: 'Point',
              coordinates: [-1.6137, 52.8435]
            }
          })
        })
    })
    test('POST: 201 returns new book', () => {
      return request(app)
        .post('/api/books')
        .send({
          title: 'Minnie the Moocher 2',
          author: 'Tyler Marks',
          genre: 'March',
          posted_by: 'Pam Howell',
          extra_key: 'test',
          location: {
            type: 'Point',
            coordinates: ['-1.6137', '52.8435']
          },
          location_description:
            "copying the program won't do anything, we need to index the mobile USB system!"
        })
        .expect(201)
        .then(({ body: { book } }) => {
          expect(book).toMatchObject({
            _id: expect.any(String),
            title: 'Minnie the Moocher 2',
            author: 'Tyler Marks',
            genre: 'March',
            posted_by: 'Pam Howell',
            location: {
              type: 'Point',
              coordinates: [-1.6137, 52.8435]
            }
          })
        })
    })
    test('POST: 400 missing key', () => {
      return request(app)
        .post('/api/books')
        .send({
          author: 'Tyler Marks',
          genre: 'March',
          posted_by: 'Pam Howell',
          location: {
            type: 'Point',
            coordinates: ['-1.6137', '52.8435']
          },
          location_description:
            "copying the program won't do anything, we need to index the mobile USB system!"
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('title is a required field')
        })
    })
    test('POST: 400 invalid field type', () => {
      return request(app)
        .post('/api/books')
        .send({
          title: 'Minnie the Moocher 2',
          author: 'Tyler Marks',
          genre: 'March',
          posted_by: 'Pam Howell',
          location: {
            type: 'Point',
            coordinates: 'coordinates'
          },
          location_description:
            "copying the program won't do anything, we need to index the mobile USB system!"
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('coordinates.0 field should be a [Number]')
        })
      })
  })
  describe.only('PATCH: /api/books/:id', () => {
    test('201 returns updated book', () => {
      return request(app)
        .patch('/api/books/6425407dba5e321df2803b39')
        .send({"title": "Minnie the Moocher 3",
          "author": "Tyler Marks 3",
          "genre": "March 3",
          "posted_by": "Pam Howell 3"})
        .expect(201)
        .then(({ body: { book }}) => {
          expect(book).toHaveProperty('title', 'Minnie the Moocher 3')
          expect(book).toHaveProperty('author', 'Tyler Marks 3')
          expect(book).toHaveProperty('genre', 'March 3')
          expect(book).toHaveProperty('posted_by', 'Pam Howell 3')
          expect(book).toHaveProperty('location', {
            type: 'Point',
            coordinates: [-1.6137, 53.8435]
          })
          expect(book).toHaveProperty(
            'location_description',
            "copying the program won't do anything, we need to index the mobile USB system!"
          )
        })
    })
    test('201 ignores new properties', () => {
      return request(app)
        .patch('/api/books/6425407dba5e321df2803b39')
        .send({"title": "Minnie the Moocher 3",
          "author": "Tyler Marks 3",
          "genre": "March 3",
          "posted_by": "Pam Howell 3",
          "page_count": "20000"})
        .expect(201)
        .then(({ body: { book }}) => {
          expect(book).toHaveProperty('title', 'Minnie the Moocher 3')
          expect(book).toHaveProperty('author', 'Tyler Marks 3')
          expect(book).toHaveProperty('genre', 'March 3')
          expect(book).toHaveProperty('posted_by', 'Pam Howell 3')
          expect(book).toHaveProperty('location', {
            type: 'Point',
            coordinates: [-1.6137, 53.8435]
          })
          expect(book).toHaveProperty(
            'location_description',
            "copying the program won't do anything, we need to index the mobile USB system!"
          )
          expect(book).not.toHaveProperty('page_count', '20000')
        })
    })
    test('201 returns updated book when one property provided', () => {
      return request(app)
        .patch('/api/books/6425407dba5e321df2803b39')
        .send({"title": "Minnie the Moocher 3"})
        .expect(201)
        .then(({ body: { book }}) => {
          expect(book).toHaveProperty('title', 'Minnie the Moocher 3')
          expect(book).toHaveProperty('author', 'Tyler Marks')
          expect(book).toHaveProperty('genre', 'March')
          expect(book).toHaveProperty('posted_by', 'Pam Howell')
          expect(book).toHaveProperty('location', {
            type: 'Point',
            coordinates: [-1.6137, 53.8435]
          })
          expect(book).toHaveProperty(
            'location_description',
            "copying the program won't do anything, we need to index the mobile USB system!"
          )
        })
    })
    test('404 non-existent book', () => {
      return request(app)
        .patch('/api/books/5425407dba5e321df2803b39')
        .send({"title": "Minnie the Moocher 3"})
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('Book not found')
        })
    })
    test('400 invalid book id', () => {
      return request(app)
        .patch('/api/books/notABook')
        .send({"title": "Minnie the Moocher 3"})
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('_id field should be a ObjectId')
        })
    })
  })
})

