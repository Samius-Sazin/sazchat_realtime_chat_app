import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    // generate token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });

    // send jwt to cookies
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //ms
        httpOnly: true, // prevent xss attacks cross-site scripting attacks
        sameSite: "strict", //CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development", // true(in production) or false(in development)
    })

    return token;
}