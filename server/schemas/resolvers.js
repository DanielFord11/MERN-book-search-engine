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
        throw new Error("Failed to fetch user data. Please try again later.");
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
        throw new Error("Login failed. Please check your credentials and try again.");
      }
    },
    addUser: async (_, args) => {
      try {
        console.log("add user ran");
        console.log("Args received in addUser resolver:", args);
        const user = await User.create(args);
        const token = signToken(user);
        console.log("Token generated:", token);
        return { token, user };
      } catch (error) {
        console.error("Error in addUser resolver:", error);
        throw new Error("Failed to create a new user. Please try again later.");
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
        throw new Error("Failed to save the book. Please try again later.");
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
        throw new Error("Failed to remove the book. Please try again later.");
      }
    },
  },
};

module.exports = resolvers;
