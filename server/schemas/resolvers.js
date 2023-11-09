const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const throwError = (message) => {
  throw new AuthenticationError(message);
};

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      try {
        if (!user) {
          throwError("Not logged in");
        }
        const userData = await User.findById(user._id).select("-__v -password");
        return userData;
      } catch (error) {
        console.error("Error in me resolver:", error);
        throw error;
      }
    },
  },

  Mutation: {
    login: async (_, { email, password }) => {
      try {
        const user = await User.findOne({ email });

        if (!user || !(await user.isCorrectPassword(password))) {
          throwError("Incorrect credentials");
        }

        const token = signToken(user);
        return { token, user };
      } catch (error) {
        console.error("Error in login resolver:", error);
        throw error;
      }
    },
    addUser: async (_, args) => {
      try {
        const user = await User.create(args);
        const token = signToken(user);
        return { token, user };
      } catch (error) {
        console.error("Error in addUser resolver:", error);
        throw error;
      }
    },
    saveBook: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throwError("You need to be logged in!");
        }
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (error) {
        console.error("Error in saveBook resolver:", error);
        throw error;
      }
    },
    removeBook: async (_, { bookId }, { user }) => {
      try {
        if (!user) {
          throwError("You need to be logged in!");
        }
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
        return updatedUser;
      } catch (error) {
        console.error("Error in removeBook resolver:", error);
        throw error;
      }
    },
  },
};

module.exports = resolvers;
