import express from "express";
import cors from 'cors';
import http from 'http';
import morgan from 'morgan';
import { initSocketServer } from "./utils/index.js";
import bodyParser from 'body-parser';
import 
{ 
    authRoutes , 
    userRoutes , 
    chatRoutes , 
    chatMessageRoutes , 
    groupRoutes ,
    groupMessageRoutes
} from "./routes/index.js";


const app = express();
const server = http.createServer(app);
initSocketServer(server);

// body-parser configuration

app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());

// static-folder configuration

app.use(express.static("uploads"));

// Header HTTP - CORS configuration

app.use(cors())

// LOGGER HTTP REQUEST configuration

app.use(morgan("dev"));

// Configure Routings

app.use("/api" , authRoutes);
app.use("/api" , userRoutes);
app.use("/api" , chatRoutes);
app.use("/api" , chatMessageRoutes);
app.use("/api" , groupRoutes);
app.use("/api" , groupMessageRoutes);

export { server } ; 