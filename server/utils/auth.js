const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

console.log("Auth attempted");

module.exports = {
  // function for our authenticated routes
  authMiddleware: function (req, res, next) {
    // allows token to be sent via  req.query or headers
    let token = req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
        token = token.split(' ').pop().trim();
    }

    if (!token) {
        console.log('No token found!');
        return res.status(400).json({ message: 'You have no token!' });
    }

    // verify token and get user data out of it
    try {
        console.log('Token:', token); // Check the token value
        const { data } = jwt.verify(token, secret, { maxAge: expiration });
        console.log('Decoded data:', data); // Check the decoded data
        req.user = data;
        console.log('Authentication successful for user:', data.username); // Log successful authentication
        next(); // send to next endpoint
    } catch (err) {
        console.error('Invalid token:', err); // Log the error for debugging purposes
        return res.status(401).json({ message: 'Invalid token!' }); // Send appropriate error response
    }
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
