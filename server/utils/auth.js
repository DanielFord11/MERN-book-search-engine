// Set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

console.log("Auth attempted");

module.exports = {
  // Function for our authenticated routes
  authMiddleware: function (req, res, next) {
    console.log("Auth middleware ran");
    // Log the entire headers object to check its structure
    console.log('Request Headers:', req.headers);
    console.log(req.url)
    console.log(req.method)

    // Exclude the authentication check for the user creation endpoint
    if (req.url === '/graphql' && req.method === 'POST') {
      console.log('Skipping authentication for user creation');
      return next();
    }

    // Allows the token to be sent via req.query or headers
    let token = req.query.token || (req.headers && req.headers.authorization);

    // Extract the token from the "Bearer <token>" format
    if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Log the extracted token to check if it's available
    console.log('Extracted Token:', token);

    if (!token) {
      console.log('No token found!');
      return res.status(400).json({ message: 'You have no token!' });
    }

    try {
      console.log('Token:', token); // Check the token value
      // Perform authentication checks for other routes
      // ...
    } catch (err) {
      console.error('Invalid token:', err); // Log the error for debugging purposes
      return res.status(401).json({ message: 'Invalid token!' }); // Send the appropriate error response
    }
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
