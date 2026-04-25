import jwt from "jsonwebtoken";

const createToken = (email) => {
    return jwt.sign(
    {
        person_username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

export { createToken, verifyToken };