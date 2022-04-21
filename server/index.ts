import express, { Request, Response } from 'express';
import Docker from 'dockerode';
import cors from 'cors';
import cookieSession from 'cookie-session';

const app = express();
const port = process.env.PORT || 80;
var docker = new Docker();

const passport = require("passport");
require("./passport-setup");

// Connect to DB

// middleware
app.use(cors({
    origin: "*"
}));
app.use(express.json());
app.use(
    cookieSession({
        name: "session",
        keys: ["key1", "key2"],
        domain: ".localtest.me"
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Google login
app.get("/failure", (req, res) => {
    // res.redirect("notlogin");
});
app.get("/success", (req, res) => {
    // res.redirect("/getstarted");
});

app.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: "/success",
        failureRedirect: "/failure",
    })
);

// Logout
app.get("/logout", (req, res) => {
    // @ts-ignore
    req.session = null;
    req.logout();
    // res.redirect("/");
});

function createRoom(roomID) {
    docker.createContainer({
        Image: 'game_server',
        name: roomID,
        HostConfig: {
            NetworkMode: "scooby_frontend",
            AutoRemove: true,
        }
    }).then(container => {
        container.start(async (err, data) => {
            if (err) {
                console.log(err);
                return;
            }

            // update database
        });
    });
}

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
