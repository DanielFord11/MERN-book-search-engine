// import user model
const { User } = require('../models');
// import sign token function from auth
const { signToken } = require('../utils/auth');
console.log("user-controller");

module.exports = {
  // get a single user by either their id or their username
  async getSingleUser({ user = null, params }, res) {
    try {
      const foundUser = await User.findOne({
        $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
      });

      if (!foundUser) {
        return res.status(400).json({ message: 'Cannot find a user with this id or username!' });
      }

      res.json(foundUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  // create a user, sign a token, and send it back
  async createUser({ body }, res) {
    try {
      const user = await User.create(body);

      if (!user) {
        return res.status(400).json({ message: 'Something went wrong while creating the user!' });
      }
      const token = signToken(user);
      res.json({ token, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  // login a user, sign a token, and send it back
  async login({ body }, res) {
    try {
      const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });

      if (!user) {
        return res.status(400).json({ message: "User not found!" });
      }

      const correctPw = await user.isCorrectPassword(body.password);

      if (!correctPw) {
        return res.status(400).json({ message: 'Incorrect password!' });
      }
      const token = signToken(user);
      res.json({ token, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  // save a book to a user's `savedBooks` field by adding it to the set
  async saveBook({ user, body }, res) {
    try {
      console.log(user);
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { savedBooks: body } },
        { new: true, runValidators: true }
      );
      return res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  // remove a book from `savedBooks`
  async deleteBook({ user, params }, res) {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: params.bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found with this id!" });
      }
      return res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
};
