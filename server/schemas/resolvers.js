const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const throwError = (message) => {
  throw new AuthenticationError(message);
};

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) {
        throwError("Not logged in");
      }
      const userData = await User.findById(user._id).select("-__v -password");
      return userData;
    },
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user || !(await user.isCorrectPassword(password))) {
        throwError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
    addUser: async (_, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (_, { input }, { user }) => {
      if (!user) {
        throwError("You need to be logged in!");
      }
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { savedBooks: input } },
        { new: true, runValidators: true }
      );
      return updatedUser;
    },
    removeBook: async (_, { bookId }, { user }) => {
      if (!user) {
        throwError("You need to be logged in!");
      }
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $pull: { savedBooks: { bookId: bookId } } },
        { new: true }
      );
      return updatedUser;
    },
  },
};

module.exports = resolvers;
