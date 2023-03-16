import app from './app';

const request = require('supertest')

const req = request(app);

var token = '';


describe('API testing', function (){
    // it('get Register user', function(){
    //     req.post('/register').send({
    //         name: 'test',
    //         email: 'test',
    //         password: '123'
    //     }).expect('Content-Type', /json/).expect(409);
    // });

    
        beforeAll(async ()=>{
            const response = await request('http://localhost:3000').get("/login").send({email: "test", password:'123'});
        token = response.body;
        });
        it('API login', function (){
            req.post('/posts').send({
                email: 'test',
                password: '123'
            }).set('x-access-token', token)
            .expect('Content-Type', /json/)
            .expect(200)
        })
        it('API fetch', function (){
            req.get('/posts').set('x-access-token', token)
            .expect('Content-Type', /json/)
            .expect(200)
        })
        
    });
