import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import {authorize} from './src/middleware/auth';
import loggingController from './src/controllers/logging';
import {routes as authRouter} from './src/controllers/auth';

const app = express();

// middleware
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'short' : 'dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// controllers
app.use(authRouter());

app.get('/', loggingController);
app.get('/protected', authorize(), (req, res) => {
    res.status(200);
    res.send(req.user);
});

app.use((err, req, res, next) => {
    console.log(err);
    next(err);
});

export default app;
